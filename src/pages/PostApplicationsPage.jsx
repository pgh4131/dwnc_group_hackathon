import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import { homepageCopy } from "../data/homepage.js";
import { getCurrentSession, getAccountType, signOut, subscribeToAuthChanges } from "../services/auth.js";
import { fetchCompanyByOwner, fetchApplicationsForPost, acceptApplication } from "../services/companies.js";
import { getCampaignPostById } from "../services/campaignPostStorage.js";

const appStatusLabel = {
  pending: { label: "대기 중", bg: "#fef9c3", color: "#a16207" },
  accepted: { label: "선택됨", bg: "#dcfce7", color: "#16a34a" },
  rejected: { label: "미선택", bg: "#f1f5f9", color: "#64748b" },
};

export default function PostApplicationsPage() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [accountType, setAccountType] = useState(null);
  const [company, setCompany] = useState(null);
  const [post, setPost] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

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
    return () => { isMounted = false; unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!session) return;
    let isMounted = true;
    async function loadData() {
      const { company: comp } = await fetchCompanyByOwner();
      const postData = await getCampaignPostById(postId);
      const { applications: apps } = await fetchApplicationsForPost(postId);
      if (isMounted) {
        setCompany(comp);
        setPost(postData);
        setApplications(apps);
        setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [session, postId]);

  const handleLogout = async () => {
    await signOut();
    setSession(null);
    setAccountType(null);
    navigate('/');
  };

  const handleAccept = async (application) => {
    setProcessingId(application.id);
    const { error } = await acceptApplication(company?.company_id, application, post);
    if (error) {
      alert(`선택 실패: ${error}`);
      setProcessingId(null);
      return;
    }
    setApplications(prev =>
      prev.map(a => a.id === application.id ? { ...a, status: 'accepted' } : a)
    );
    setProcessingId(null);
    navigate('/dashboard/company');
  };

  const companyHeaderCopy = {
    ...homepageCopy,
    headerActions: homepageCopy.headerActions.filter(action => action.type !== 'startup')
  };

  const projectTitle = post?.project_info?.title || '공고';

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
        <button type="button" className="dashboard-back" onClick={() => navigate("/dashboard/company")}>
          ← 대시보드로
        </button>

        <h1 className="dashboard-page-title">지원서 목록</h1>
        <p className="dashboard-page-sub">{projectTitle} · 접수된 지원서</p>

        {loading ? (
          <div className="dashboard-card" style={{ textAlign: 'center', padding: '48px' }}>
            <p className="dashboard-lead">데이터를 불러오는 중입니다...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="dashboard-card" style={{ textAlign: 'center', padding: '48px' }}>
            <p className="dashboard-lead">아직 접수된 지원서가 없습니다.</p>
          </div>
        ) : (
          <div className="applications-grid">
            {applications.map((app) => {
              const club = app.club_info || {};
              const rep = app.representative || {};
              const profile = app.profile || {};
              const motivation = app.motivation || {};
              const statusMeta = appStatusLabel[app.status] || appStatusLabel.pending;
              const isAccepted = app.status === 'accepted';
              const isProcessing = processingId === app.id;

              return (
                <article key={app.id} className="application-card">
                  <div className="application-card-header">
                    <div className="application-card-avatar">
                      {(club.officialName || '동').slice(0, 2)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 className="application-card-name">{club.officialName || '동아리명 미입력'}</h3>
                      <p className="application-card-uni">{club.school || '소속 미입력'} · {club.organizationType || ''}</p>
                    </div>
                    <span className="dashboard-pill" style={{ background: statusMeta.bg, color: statusMeta.color }}>
                      {statusMeta.label}
                    </span>
                  </div>

                  <div className="application-card-body">
                    <div className="application-info-row">
                      <span className="application-info-label">대표자</span>
                      <span>{rep.name || '미입력'} · {rep.email || ''}</span>
                    </div>
                    <div className="application-info-row">
                      <span className="application-info-label">인원</span>
                      <span>총 {club.totalMembers || 0}명 (활동 {club.activeMembers || 0}명)</span>
                    </div>
                    {profile.introduction && (
                      <div className="application-info-row application-info-row--block">
                        <span className="application-info-label">소개</span>
                        <p className="application-intro-text">{profile.introduction}</p>
                      </div>
                    )}
                    {motivation.reason && (
                      <div className="application-info-row application-info-row--block">
                        <span className="application-info-label">지원 동기</span>
                        <p className="application-intro-text">{motivation.reason}</p>
                      </div>
                    )}
                  </div>

                  <div className="application-card-actions">
                    {isAccepted ? (
                      <span className="application-accepted-badge">✓ 프로젝트에 추가됨</span>
                    ) : (
                      <button
                        type="button"
                        className="button button-primary"
                        onClick={() => handleAccept(app)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? '처리 중...' : '선택하기'}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
