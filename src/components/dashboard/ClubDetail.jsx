import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../Header.jsx";
import { homepageCopy } from "../../data/homepage.js";
import {
  clubColors,
  statusLabel,
  getClubDashboardBundle,
  DEFAULT_COMPANY_ID,
} from "../../data/dashboardData";
import MetricCharts from "./MetricCharts";
import SolutionPanel from "./SolutionPanel";

const LAYOUT_BREAKPOINT_PX = 768;

export default function ClubDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const bundle = getClubDashboardBundle(Number(id), DEFAULT_COMPANY_ID);

  const [isNarrow, setIsNarrow] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= LAYOUT_BREAKPOINT_PX : false,
  );

  useEffect(() => {
    function onResize() {
      setIsNarrow(window.innerWidth <= LAYOUT_BREAKPOINT_PX);
    }
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (!bundle) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header-shell">
          <Header copy={homepageCopy} isAuthenticated={false} />
        </div>
        <main className="section-wrap dashboard-main dashboard-body-muted">동아리를 찾을 수 없습니다.</main>
      </div>
    );
  }

  const { club, statusKey, missionTitle, missionDescription, objectiveKpi, timeline } = bundle;
  const col = clubColors[club.club_id];
  const status = statusLabel[statusKey];

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: isNarrow ? "1fr" : "1fr 1fr",
    gap: 24,
    alignItems: "start",
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header-shell">
        <Header copy={homepageCopy} isAuthenticated={false} />
      </div>

      <main className="section-wrap dashboard-main">
        <button type="button" className="dashboard-back" onClick={() => navigate("/dashboard/company")}>
          ← 목록으로
        </button>

        <div className="dashboard-club-heading">
          <div
            className="dashboard-avatar dashboard-avatar--lg"
            style={{
              background: col.bg,
              color: col.text,
            }}
          >
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

            {timeline.length > 0 ? (
              <div style={{ marginTop: 16 }}>
                <p className="dashboard-section-label dashboard-section-label--tight">
                  프로젝트 일정 흐름 (Timeline)
                </p>
                <div className="mission-timeline-h" role="list">
                  {timeline.map((ev) => (
                    <button
                      key={ev.timeline_id}
                      type="button"
                      className="mission-timeline-node"
                      title={ev.description || ev.event_name}
                    >
                      <span className="mission-timeline-dot" aria-hidden />
                      <span className="mission-timeline-date">{ev.event_date}</span>
                      <span className="mission-timeline-name">{ev.event_name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div style={{ marginTop: 16 }}>
              <p className="dashboard-section-label dashboard-section-label--tight">
                산출물·진행 (mission_deliverables / mission_progress)
              </p>
              {bundle.missions.map((m) => {
                const delayed = !m.done && m.pct > 0 && m.pct < 45;
                return (
                  <div
                    key={m.id}
                    className={`dashboard-mission-row ${delayed ? "dashboard-mission-row--delayed" : ""}`}
                  >
                  <div className={`dashboard-checkbox ${m.done ? "dashboard-checkbox--done" : ""}`} aria-hidden>
                    {m.done ? "✓" : ""}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="dashboard-mission-name">{m.name}</div>
                    <div className="dashboard-progress-track">
                      <div
                        className="dashboard-progress-fill"
                        style={{ width: `${m.pct}%`, background: col.line }}
                      />
                    </div>
                  </div>
                  <span className="dashboard-mission-pct">{m.pct}%</span>
                </div>
                );
              })}
            </div>
          </div>
        </div>

        <SolutionPanel missionId={bundle.mission.mission_id} solutions={bundle.solutions} initialNotices={bundle.notices} />
      </main>
    </div>
  );
}
