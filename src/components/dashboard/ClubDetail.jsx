import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../Header.jsx";
import { homepageCopy } from "../../data/homepage.js";
import { getCurrentSession, getAccountType, signOut, subscribeToAuthChanges } from "../../services/auth.js";
import { fetchCompanyByOwner, fetchClubDashboardBundle } from "../../services/companies.js";
import { assignMissionToMatch } from "../../services/missions.js";
import MetricCharts from "./MetricCharts";
import SolutionPanel from "./SolutionPanel";

const LAYOUT_BREAKPOINT_PX = 768;

const statusLabel = {
  in_progress: { label: "진행 중", bg: "#eef2ff", color: "#4f46e5" },
  pending_review: { label: "검토 중", bg: "#f8fafc", color: "#64748b" },
  scheduled: { label: "예정", bg: "#f8fafc", color: "#64748b" },
  completed: { label: "완료", bg: "#f8fafc", color: "#334155" },
};

function getColor(clubId) {
  const palette = [
    { bg: "#eef2ff", text: "#4f46e5", line: "#2563eb" },
    { bg: "#f8fafc", text: "#2563eb", line: "#4f46e5" },
    { bg: "#f0fdf4", text: "#16a34a", line: "#22c55e" },
    { bg: "#fff7ed", text: "#ea580c", line: "#f97316" },
  ];
  return palette[(clubId || 0) % palette.length];
}

export default function ClubDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isNarrow, setIsNarrow] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= LAYOUT_BREAKPOINT_PX : false,
  );

  const [session, setSession] = useState(null);
  const [accountType, setAccountType] = useState(null);
  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignedMissions, setAssignedMissions] = useState([]);

  useEffect(() => {
    function onResize() {
      setIsNarrow(window.innerWidth <= LAYOUT_BREAKPOINT_PX);
    }
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadSession() {
      const result = await getCurrentSession();
      if (isMounted) {
        setSession(result.session);
        setAccountType(await getAccountType(result.session));
      }
    }
    loadSession();
    const unsubscribe = subscribeToAuthChanges(async (nextSession) => {
      setSession(nextSession);
      setAccountType(await getAccountType(nextSession));
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) return;
    let isMounted = true;
    async function loadBundle() {
      const { company } = await fetchCompanyByOwner();
      if (!isMounted || !company) { setLoading(false); return; }
      const data = await fetchClubDashboardBundle(Number(id), company.company_id);
      if (isMounted) {
        setBundle(data);
        setAssignedMissions(data?.missions || []);
        setLoading(false);
      }
    }
    loadBundle();
    return () => { isMounted = false; };
  }, [session, id]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out.', error);
    } finally {
      setSession(null);
      setAccountType(null);
      navigate('/');
    }
  };

  const companyHeaderCopy = {
    ...homepageCopy,
    headerActions: homepageCopy.headerActions.filter(action => action.type !== 'startup')
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header-shell">
          <Header copy={companyHeaderCopy} isAuthenticated={Boolean(session)} userEmail={session?.user?.email}
            accountType={accountType} onLogoutClick={handleLogout} hideDashboardButton={true} />
        </div>
        <main className="section-wrap dashboard-main" style={{ textAlign: 'center', padding: '48px' }}>
          <p className="dashboard-lead">데이터를 불러오는 중입니다...</p>
        </main>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header-shell">
          <Header copy={companyHeaderCopy} isAuthenticated={Boolean(session)} userEmail={session?.user?.email}
            accountType={accountType} onLogoutClick={handleLogout} />
        </div>
        <main className="section-wrap dashboard-main dashboard-body-muted">동아리를 찾을 수 없습니다.</main>
      </div>
    );
  }

  const { club, statusKey, missionTitle, missionDescription, objectiveKpi } = bundle;
  const col = getColor(club.club_id);
  const status = statusLabel[statusKey] || statusLabel.in_progress;

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: isNarrow ? "1fr" : "1fr 1fr",
    gap: 24,
    alignItems: "start",
  };

  const timelineSteps = (bundle.timeline || []).map((t) => ({
    id: t.timeline_id,
    status: t.event_name,
    statusKey: "active",
    period: t.event_date,
    title: t.event_name,
    description: t.description || "",
  }));

  return (
    <div className="dashboard-page">
      <div className="dashboard-header-shell">
        <Header copy={companyHeaderCopy} isAuthenticated={Boolean(session)} userEmail={session?.user?.email}
          accountType={accountType} onLogoutClick={handleLogout} hideDashboardButton={true} />
      </div>

      <main className="section-wrap dashboard-main">
        <button type="button" className="dashboard-back" onClick={() => navigate("/dashboard/company")}>
          ← 목록으로
        </button>

        <div className="dashboard-club-heading">
          <div className="dashboard-avatar dashboard-avatar--lg" style={{ background: col.bg, color: col.text }}>
            {club.initials}
          </div>
          <div style={{ flex: 1 }}>
            <div className="dashboard-club-name">{club.name}</div>
            <div className="dashboard-club-uni">{club.university}</div>
          </div>
          <span className="dashboard-pill" style={{ background: status.bg, color: status.color }}>
            {status.label}
          </span>
        </div>

        <div style={gridStyle}>
          <div className="dashboard-card">
            <p className="dashboard-section-label">마케팅 지표 (mission_metrics)</p>
            <MetricCharts chartRows={bundle.chartRows} scoreData={bundle.viralVsPeerChart} score={bundle.score} />
          </div>

          <div className="dashboard-card">
            <p className="dashboard-section-label">미션 (missions)</p>
            <div className="dashboard-mission-chip" style={{ background: col.bg, borderColor: "var(--color-border)" }}>
              <span className="dashboard-mission-text" style={{ color: col.text }}>
                {missionTitle}
              </span>
            </div>
            <p className="dashboard-lead" style={{ marginTop: 12 }}>
              {missionDescription}
            </p>
            {objectiveKpi ? (
              <p className="dashboard-input-label" style={{ marginTop: 8 }}>
                목표 KPI: {objectiveKpi}
              </p>
            ) : null}

            {timelineSteps.length > 0 && (
              <div className="mission-timeline-section">
                <p className="dashboard-section-label dashboard-section-label--tight">
                  프로젝트 일정 흐름 (Timeline)
                </p>
                <ol className="mission-timeline-v" aria-label="프로젝트 일정 흐름">
                  {timelineSteps.map((step) => (
                    <li key={step.id} className="mission-timeline-item">
                      <span className="mission-timeline-dot" aria-hidden />
                      <div className="mission-timeline-content">
                        <div className="mission-timeline-meta">
                          <span className={`mission-timeline-status mission-timeline-status--${step.statusKey}`}>
                            {step.status}
                          </span>
                          <span className="mission-timeline-date">{step.period}</span>
                        </div>
                        <h3 className="mission-timeline-name">{step.title}</h3>
                        <p className="mission-timeline-desc">{step.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div style={{ marginTop: 16 }}>
              <p className="dashboard-section-label dashboard-section-label--tight">
                산출물·진행 (mission_deliverables / mission_progress)
              </p>
              {assignedMissions.length === 0 ? (
                <p className="dashboard-lead" style={{ marginTop: 12 }}>아직 등록된 미션이 없습니다.</p>
              ) : (
                assignedMissions.map((m) => {
                  const delayed = !m.done && m.pct > 0 && m.pct < 45;
                  return (
                    <div key={m.id} className={`dashboard-mission-row ${delayed ? "dashboard-mission-row--delayed" : ""}`}>
                    <div className={`dashboard-checkbox ${m.done ? "dashboard-checkbox--done" : ""}`} aria-hidden>
                      {m.done ? "✓" : ""}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="dashboard-mission-name">{m.name}</div>
                      <div className="dashboard-progress-track">
                        <div className="dashboard-progress-fill" style={{ width: `${m.pct}%`, background: col.line }} />
                      </div>
                    </div>
                    <span className="dashboard-mission-pct">{m.pct}%</span>
                  </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <SolutionPanel 
          missionId={bundle.mission.mission_id} 
          solutions={bundle.solutions} 
          initialNotices={bundle.notices} 
          onAssign={async (form) => {
            const { mission, error } = await assignMissionToMatch({
              matchId: bundle.match.match_id,
              clubId: club.club_id,
              title: form.title,
              description: form.description,
              deadline: form.deadline,
              delayBuffer: form.delayBuffer,
              targetMetric: form.targetMetric,
            });

            if (error) {
              throw new Error(error);
            }

            setAssignedMissions(prev => [...prev, {
              id: mission.mission_id,
              name: mission.mission_name || form.title || "제목 없는 미션",
              pct: 0,
              done: false
            }]);
          }}
        />
      </main>
    </div>
  );
}
