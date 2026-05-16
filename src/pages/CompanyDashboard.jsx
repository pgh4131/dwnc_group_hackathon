import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import { homepageCopy } from "../data/homepage.js";
import { getCurrentSession, getAccountType, signOut, subscribeToAuthChanges } from "../services/auth.js";
import { fetchCompanyByOwner, fetchMatchedClubs, getLeaderboard } from "../services/companies.js";
import { getMyCampaignPosts } from "../services/campaignPostStorage.js";

function getColor(idx) {
  const palette = [
    { bg: "#eef2ff", text: "#4f46e5", line: "#2563eb" },
    { bg: "#f8fafc", text: "#2563eb", line: "#4f46e5" },
    { bg: "#f0fdf4", text: "#16a34a", line: "#22c55e" },
    { bg: "#fff7ed", text: "#ea580c", line: "#f97316" },
  ];
  return palette[idx % palette.length];
}

const statusLabel = {
  in_progress: { label: "진행 중", bg: "#eef2ff", color: "#4f46e5" },
  pending_review: { label: "검토 중", bg: "#f8fafc", color: "#64748b" },
  scheduled: { label: "예정", bg: "#f8fafc", color: "#64748b" },
  completed: { label: "완료", bg: "#f8fafc", color: "#334155" },
};

const postStatusLabel = {
  open: { label: "모집 중", bg: "#dcfce7", color: "#16a34a" },
  closed: { label: "마감", bg: "#f1f5f9", color: "#64748b" },
};

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
  const [session, setSession] = useState(null);
  const [accountType, setAccountType] = useState(null);
  const [company, setCompany] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [dashboardError, setDashboardError] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadSession() {
      try {
        const result = await getCurrentSession();
        const nextAccountType = await getAccountType(result.session);
        if (isMounted) {
          setSession(result.session);
          setAccountType(nextAccountType);
        }
      } catch (error) {
        console.error('Failed to load dashboard session:', error);
        if (isMounted) {
          setDashboardError('로그인 정보를 확인하지 못했습니다.');
        }
      } finally {
        if (isMounted) {
          setAuthReady(true);
        }
      }
    }
    loadSession();
    const unsubscribe = subscribeToAuthChanges(async (nextSession) => {
      setSession(nextSession);
      setAccountType(await getAccountType(nextSession));
      setAuthReady(true);
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!authReady) return;

    if (!session) {
      setCompany(null);
      setPosts([]);
      setClubs([]);
      setLeaderboard([]);
      setDashboardError('스타트업 대시보드는 로그인 후 이용할 수 있습니다.');
      setLoading(false);
      return;
    }

    if (accountType && accountType !== 'startup') {
      setCompany(null);
      setPosts([]);
      setClubs([]);
      setLeaderboard([]);
      setDashboardError(homepageCopy.auth.startupOnlyMessage);
      setLoading(false);
      return;
    }

    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setDashboardError('');

      try {
        const { company: comp, error: companyError } = await fetchCompanyByOwner();
        if (!isMounted) return;
        setCompany(comp);

        if (companyError && companyError !== '로그인 필요') {
          console.warn('Company dashboard company load warning:', companyError);
        }

        // 공고 목록은 기업 프로필 생성 여부와 무관하게 항상 로드한다.
        const myPosts = await getMyCampaignPosts();
        if (isMounted) setPosts(myPosts);

        if (comp) {
          const { clubs: matchedClubs, error: clubsError } = await fetchMatchedClubs(comp.company_id);
          if (clubsError) {
            console.warn('Company dashboard matched clubs warning:', clubsError);
          }
          if (isMounted) setClubs(matchedClubs);
          const lb = await getLeaderboard(comp.company_id);
          if (isMounted) setLeaderboard(lb);
        } else {
          if (isMounted) {
            setClubs([]);
            setLeaderboard([]);
          }
        }
      } catch (error) {
        console.error('Failed to load company dashboard:', error);
        if (isMounted) {
          setDashboardError('대시보드 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [authReady, session, accountType]);

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

  const avgPct = averageMissionPct(clubs);
  const { top, bottom } = pickTopBottomByScore(clubs);

  function goClub(clubId) {
    navigate(`/dashboard/company/club/${clubId}`);
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header-shell">
        <Header 
          copy={companyHeaderCopy} 
          isAuthenticated={Boolean(session)} 
          userEmail={session?.user?.email}
          accountType={accountType}
          onLogoutClick={handleLogout}
          hideDashboardButton={true}
        />
      </div>

      <main className="section-wrap dashboard-main">
        <div className="dashboard-page-title-row">
          <h1 className="dashboard-page-title dashboard-page-title--inline">기업 대시보드</h1>
          <Link to="/company/posts/new" className="company-page-post-btn">
            + 공고 등록하기
          </Link>
        </div>
        <p className="dashboard-page-sub">
          {company?.name ?? "기업"} · 매칭된 동아리 미션·지표 ({company?.industry ?? ""})
        </p>

        {loading ? (
          <div className="dashboard-card" style={{ textAlign: 'center', padding: '48px' }}>
            <p className="dashboard-lead">데이터를 불러오는 중입니다...</p>
          </div>
        ) : (
          <>
            {dashboardError ? (
              <div className="dashboard-card" style={{ textAlign: 'center', padding: '32px' }}>
                <p className="dashboard-lead">{dashboardError}</p>
              </div>
            ) : null}

            {!session || (accountType && accountType !== 'startup') ? null : (
            <>
            {/* ────── 모집 중인 공고 ────── */}
            <div className="dashboard-card">
              <p className="dashboard-section-label">모집 공고</p>
              {posts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px' }}>
                  <p className="dashboard-lead">아직 등록된 공고가 없습니다.</p>
                  <Link to="/company/posts/new" className="company-page-post-btn" style={{ marginTop: 12, display: 'inline-block' }}>
                    + 첫 공고 등록하기
                  </Link>
                </div>
              ) : (
                <div className="post-card-list">
                  {posts.map((post) => {
                    const info = post.project_info || {};
                    const compInfo = post.company_info || {};
                    const reward = post.reward_and_condition || {};
                    const pill = postStatusLabel[post.status] || postStatusLabel.open;
                    return (
                      <div key={post.id} className="post-card">
                        <div className="post-card-header">
                          <div>
                            <span className="post-card-company">{compInfo.companyName || '기업'}</span>
                            <span className="dashboard-pill" style={{ background: pill.bg, color: pill.color, marginLeft: 8 }}>
                              {pill.label}
                            </span>
                          </div>
                          <span className="post-card-date">
                            {new Date(post.created_at).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                        <h3 className="post-card-title">{info.title || '제목 없음'}</h3>
                        <p className="post-card-meta">
                          {info.period ? `기간: ${info.period}` : ''} 
                          {reward.recruitCount ? ` · 모집: ${reward.recruitCount}팀` : ''}
                        </p>
                        <div className="post-card-actions">
                          <button
                            type="button"
                            className="button button-secondary"
                            onClick={() => navigate(`/dashboard/company/post/${post.id}/applications`)}
                          >
                            지원서 보기
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ────── 진행 중인 프로젝트 (매칭 동아리) ────── */}
            <div className="dashboard-card">
              <p className="dashboard-section-label">진행 중인 프로젝트</p>
              {clubs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px' }}>
                  <p className="dashboard-lead">아직 매칭된 동아리가 없습니다. 공고에서 지원서를 확인하고 동아리를 선택해보세요.</p>
                </div>
              ) : (
                <>
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
                      <div role="button" tabIndex={0} className="company-metric-card company-metric-card--top"
                        onClick={() => goClub(top.club_id)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goClub(top.club_id); } }}>
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
                    {bottom && clubs.length > 1 ? (
                      <div role="button" tabIndex={0} className="company-metric-card company-metric-card--bottom"
                        onClick={() => goClub(bottom.club_id)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goClub(bottom.club_id); } }}>
                        <p className="company-metric-label">성과 꼴찌 동아리</p>
                        <p className="company-metric-value">{bottom.name}</p>
                        <p className="company-metric-sub">{bottom.score}점</p>
                      </div>
                    ) : null}
                  </div>

                  {leaderboard.length > 0 && (
                    <div className="dashboard-card company-leaderboard-card" style={{ marginTop: 16, boxShadow: 'none', border: '1px solid var(--color-border)' }}>
                      <p className="dashboard-section-label">동아리 순위 (Leaderboard)</p>
                      <p className="dashboard-lead">진행률(바이럴 스코어) 기준</p>
                      <div className="leaderboard-list">
                        {leaderboard.map((row, idx) => {
                          const col = getColor(idx);
                          return (
                            <div key={row.club_id} role="button" tabIndex={0} className="leaderboard-row"
                              onClick={() => navigate(`/dashboard/company/club/${row.club_id}`)}
                              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(`/dashboard/company/club/${row.club_id}`); } }}>
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
                  )}

                  <div style={{ marginTop: 16 }}>
                    {clubs.map((row, idx) => {
                      const col = getColor(idx);
                      const pill = statusLabel[row.status] || statusLabel.in_progress;
                      return (
                        <div key={row.club_id} role="button" tabIndex={0}
                          onClick={() => navigate(`/dashboard/company/club/${row.club_id}`)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(`/dashboard/company/club/${row.club_id}`); } }}
                          className="dashboard-row-click">
                          <div className="dashboard-avatar" style={{ background: col.bg, color: col.text }}>{row.initials}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="dashboard-row-title">{row.name}</div>
                            <div className="dashboard-row-meta">미션 #{row.mission_id} · {row.mission}</div>
                          </div>
                          <div className="dashboard-row-score" style={{ color: col.text }}>진행 {row.score}%</div>
                          <span className="dashboard-pill" style={{ background: pill.bg, color: pill.color }}>{pill.label}</span>
                          <span className="dashboard-chevron" aria-hidden>›</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
            </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
