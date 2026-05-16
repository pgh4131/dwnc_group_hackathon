import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import { homepageCopy } from "../data/homepage.js";
import { getCurrentSession, getAccountType, subscribeToAuthChanges } from "../services/auth.js";
import { fetchStudentMissions } from "../services/missions.js";

const studentHeaderCopy = {
  ...homepageCopy,
  navigation: [],
  authenticatedNavigation: [],
  headerActions: [],
};

const missionStatusMeta = {
  in_progress: { label: "진행 중", tone: "success" },
  review: { label: "검토 중", tone: "warning" },
  completed: { label: "완료", tone: "muted" },
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      const { session } = await getCurrentSession();
      if (!session || !isMounted) { setLoading(false); return; }
      // TODO: resolve club_id from student profile
      const clubId = 1;
      const { missions: data } = await fetchStudentMissions(clubId);
      if (isMounted) {
        setMissions(data);
        setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  const dashboardStats = useMemo(() => {
    const total = missions.length || 1;
    const activeCount = missions.filter((m) => m.status !== "completed").length;
    const completedCount = missions.filter((m) => m.status === "completed").length;
    const avgProgress = Math.round(missions.reduce((sum, m) => sum + (m.overallProgress || 0), 0) / total);
    return { avgProgress, activeCount, completedCount };
  }, [missions]);

  const uniqueCompanyCount = new Set(missions.map((m) => m.companyName)).size;

  function openMission(missionId) {
    navigate(`/dashboard/student/mission/${missionId}`);
  }

  return (
    <div className="dashboard-page student-dashboard-page">
      <div className="dashboard-header-shell">
        <Header copy={studentHeaderCopy} isAuthenticated={false} />
      </div>

      <main className="section-wrap dashboard-main student-dashboard-main">
        <h1 className="dashboard-page-title">나의 미션</h1>
        <p className="dashboard-page-sub">참여 중인 캠페인 목록</p>

        {loading ? (
          <div className="dashboard-card" style={{ textAlign: 'center', padding: '48px' }}>
            <p className="dashboard-lead">데이터를 불러오는 중입니다...</p>
          </div>
        ) : missions.length === 0 ? (
          <div className="dashboard-card" style={{ textAlign: 'center', padding: '48px' }}>
            <p className="dashboard-lead">아직 참여 중인 미션이 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="dashboard-metric-grid">
              <div className="company-metric-card company-metric-card--neutral">
                <p className="company-metric-label">진행 중인 미션 수</p>
                <p className="company-metric-value">{dashboardStats.activeCount}</p>
                <p className="company-metric-desc">{uniqueCompanyCount}개 스타트업 협업</p>
              </div>
              <div className="company-metric-card company-metric-card--neutral">
                <p className="company-metric-label">완료된 미션 수</p>
                <p className="company-metric-value">{dashboardStats.completedCount}</p>
                <p className="company-metric-desc">승인 완료 기준</p>
              </div>
              <div className="company-metric-card company-metric-card--neutral">
                <p className="company-metric-label">전체 평균 진행률</p>
                <p className="company-metric-value">{dashboardStats.avgProgress}%</p>
                <p className="company-metric-desc">KPI + 기업 승인 반영</p>
              </div>
            </div>

            <div className="student-mission-overview-list">
              {missions.map((mission) => {
                const status = missionStatusMeta[mission.status] ?? missionStatusMeta.in_progress;
                return (
                  <article key={mission.id} className="student-mission-overview-card" role="button" tabIndex={0}
                    onClick={() => openMission(mission.id)}
                    onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openMission(mission.id); } }}>
                    <div className="student-company-avatar" aria-hidden>
                      {(mission.companyName || '').slice(0, 2)}
                    </div>
                    <div className="student-mission-overview-body">
                      <div className="student-mission-overview-top">
                        <span>{mission.companyName} · {mission.companyIndustry}</span>
                        <span className={`student-status-badge student-status-badge--${status.tone}`}>{status.label}</span>
                      </div>
                      <h2>{mission.title}</h2>
                      <p>{mission.period}</p>
                      <div className="student-progress-label">
                        <span>전체 진행률</span>
                        <strong>{mission.overallProgress}%</strong>
                      </div>
                      <div className="student-progress-track student-progress-track--overall">
                        <span style={{ width: `${mission.overallProgress}%` }} />
                      </div>
                    </div>
                    <span className="student-mission-arrow" aria-hidden>›</span>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
