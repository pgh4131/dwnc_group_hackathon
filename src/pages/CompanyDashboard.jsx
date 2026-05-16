import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import { homepageCopy } from "../data/homepage.js";
import {
  clubColors,
  statusLabel,
  companies,
  clubs,
  DEFAULT_COMPANY_ID,
  getLeaderboardForCompany,
} from "../data/dashboardData";

function averageMissionPct(rows) {
  const pcts = rows.flatMap((c) => (c.missions ?? []).map((m) => m.pct));
  if (!pcts.length) return 0;
  return Math.round(pcts.reduce((s, p) => s + p, 0) / pcts.length);
}

function pickTopBottomByScore(rows) {
  if (!rows.length) return { top: null, bottom: null };
  const sorted = [...rows].sort((a, b) => b.score - a.score);
  return { top: sorted[0], bottom: sorted[sorted.length - 1] };
}

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const company = companies.find((c) => c.company_id === DEFAULT_COMPANY_ID);
  const avgPct = averageMissionPct(clubs);
  const { top, bottom } = pickTopBottomByScore(clubs);
  const leaderboard = getLeaderboardForCompany(DEFAULT_COMPANY_ID);

  function goClub(clubId) {
    navigate(`/dashboard/company/club/${clubId}`);
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header-shell">
        <Header copy={homepageCopy} isAuthenticated={false} />
      </div>

      <main className="section-wrap dashboard-main">
        <div className="dashboard-page-title-row">
          <h1 className="dashboard-page-title dashboard-page-title--inline">기업 대시보드</h1>
          <Link to="/company/posts/new" className="company-page-post-btn">
            + 공고 등록하기
          </Link>
        </div>
        <p className="dashboard-page-sub">
          {company?.name ?? "기업"} · 매칭된 동아리 미션·지표 ({company?.industry})
        </p>

        <div className="dashboard-metric-grid">
          <div className="company-metric-card company-metric-card--neutral">
            <p className="company-metric-label">참여 동아리 수</p>
            <p className="company-metric-value">{clubs.length}</p>
            <p className="company-metric-desc">활성 캠페인</p>
          </div>

          <div className="company-metric-card company-metric-card--neutral">
            <p className="company-metric-label">전체 평균 진행률</p>
            <p className="company-metric-value">{avgPct}%</p>
            <p className="company-metric-desc">전체 미션 평균</p>
          </div>

          {top ? (
            <div
              role="button"
              tabIndex={0}
              className="company-metric-card company-metric-card--top"
              onClick={() => goClub(top.club_id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  goClub(top.club_id);
                }
              }}
            >
              <p className="company-metric-label">성과 1위 동아리</p>
              <p className="company-metric-value">{top.name}</p>
              <p className="company-metric-sub">{top.score}점</p>
            </div>
          ) : (
            <div className="company-metric-card company-metric-card--neutral">
              <p className="company-metric-label">성과 1위 동아리</p>
              <p className="company-metric-value">—</p>
            </div>
          )}

          {bottom ? (
            <div
              role="button"
              tabIndex={0}
              className="company-metric-card company-metric-card--bottom"
              onClick={() => goClub(bottom.club_id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  goClub(bottom.club_id);
                }
              }}
            >
              <p className="company-metric-label">성과 꼴찌 동아리</p>
              <p className="company-metric-value">{bottom.name}</p>
              <p className="company-metric-sub">{bottom.score}점</p>
            </div>
          ) : (
            <div className="company-metric-card company-metric-card--neutral">
              <p className="company-metric-label">성과 꼴찌 동아리</p>
              <p className="company-metric-value">—</p>
            </div>
          )}
        </div>

        <div className="dashboard-card company-leaderboard-card">
          <p className="dashboard-section-label">동아리 순위 (Leaderboard)</p>
          <p className="dashboard-lead">진행률(바이럴 스코어) 기준 · 전주 대비 순위 변동(목업)</p>
          <div className="leaderboard-list">
            {leaderboard.map((row) => {
              const col = clubColors[row.club_id] ?? { line: "#64748b", bg: "#f1f5f9", text: "#334155" };
              return (
                <div
                  key={row.club_id}
                  role="button"
                  tabIndex={0}
                  className="leaderboard-row"
                  onClick={() => navigate(`/dashboard/company/club/${row.club_id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/dashboard/company/club/${row.club_id}`);
                    }
                  }}
                >
                  <span className="leaderboard-rank">{row.rank}</span>
                  <span className={`leaderboard-delta ${row.rankDelta > 0 ? "leaderboard-delta--up" : row.rankDelta < 0 ? "leaderboard-delta--down" : "leaderboard-delta--flat"}`}>
                    {row.rankDelta > 0 ? "▲" : row.rankDelta < 0 ? "▼" : "—"}
                  </span>
                  <div className="leaderboard-bar-track">
                    <div className="leaderboard-bar-fill" style={{ width: `${row.score}%`, background: col.line }} />
                  </div>
                  <div className="leaderboard-meta">
                    <span className="leaderboard-name">{row.name}</span>
                    <span className="leaderboard-score">{row.score}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="dashboard-card">
          <p className="dashboard-section-label">매칭 동아리 · 미션 요약</p>
          {clubs.map((row) => {
            const col = clubColors[row.club_id];
            const pill = statusLabel[row.status];
            return (
              <div
                key={row.club_id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/dashboard/company/club/${row.club_id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/dashboard/company/club/${row.club_id}`);
                  }
                }}
                className="dashboard-row-click"
              >
                <div className="dashboard-avatar" style={{ background: col.bg, color: col.text }}>
                  {row.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="dashboard-row-title">{row.name}</div>
                  <div className="dashboard-row-meta">
                    미션 #{row.mission_id} · {row.mission}
                  </div>
                </div>
                <div className="dashboard-row-score" style={{ color: col.text }}>
                  진행 {row.score}%
                </div>
                <span className="dashboard-pill" style={{ background: pill.bg, color: pill.color }}>
                  {pill.label}
                </span>
                <span className="dashboard-chevron" aria-hidden>
                  ›
                </span>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
