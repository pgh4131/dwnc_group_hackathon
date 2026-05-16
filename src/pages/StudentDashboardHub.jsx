import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import { homepageCopy } from '../data/homepage.js';
import { getAccountType, getCurrentSession, subscribeToAuthChanges } from '../services/auth.js';
import {
  buildStudentProjectSummaries,
  fetchStudentMissionsForCurrentUser,
} from '../services/missions.js';
import { getMyStudentApplications } from '../services/studentApplicationStorage.js';
import {
  getStudentClubProfile,
  saveStudentClubProfile,
} from '../services/studentClubProfileStorage.js';

const studentHeaderCopy = {
  ...homepageCopy,
  navigation: [],
  authenticatedNavigation: [],
  headerActions: [],
};

const applicationStatusMeta = {
  pending: { label: '검토 중', tone: 'warning', description: '기업이 지원서를 검토하고 있습니다.' },
  accepted: { label: '선택됨', tone: 'success', description: '기업이 이 지원서를 선택했습니다.' },
  rejected: { label: '미선택', tone: 'muted', description: '이번 프로젝트에는 선택되지 않았습니다.' },
};

const missionStatusMeta = {
  in_progress: { label: '진행 중', tone: 'success' },
  review: { label: '검토 중', tone: 'warning' },
  completed: { label: '완료', tone: 'muted' },
};

const formatDate = (value) => {
  if (!value) return '접수일 미정';

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
};

const emptyClubForm = {
  clubName: '',
  university: '',
  owner: '',
  description: '',
};

export default function StudentDashboardHub() {
  const [clubInfo, setClubInfo] = useState(null);
  const [isEditingClub, setIsEditingClub] = useState(false);
  const [session, setSession] = useState(null);
  const [accountType, setAccountType] = useState(null);
  const [applications, setApplications] = useState([]);
  const [missions, setMissions] = useState([]);
  const [isApplicationLoading, setIsApplicationLoading] = useState(true);
  const [isMissionLoading, setIsMissionLoading] = useState(true);
  const [applicationError, setApplicationError] = useState('');
  const [missionError, setMissionError] = useState('');

  const [clubForm, setClubForm] = useState(emptyClubForm);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const result = await getCurrentSession();
      const nextAccountType = await getAccountType(result.session);

      if (isMounted) {
        setSession(result.session);
        setAccountType(nextAccountType);
        const nextClubInfo = getStudentClubProfile(result.session);
        setClubInfo(nextClubInfo);
        setClubForm(nextClubInfo || emptyClubForm);
      }
    }

    loadSession();
    const unsubscribe = subscribeToAuthChanges(async (nextSession) => {
      setSession(nextSession);
      setAccountType(await getAccountType(nextSession));
      const nextClubInfo = getStudentClubProfile(nextSession);
      setClubInfo(nextClubInfo);
      setClubForm(nextClubInfo || emptyClubForm);
      setIsEditingClub(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadApplications() {
      if (!session) {
        setApplications([]);
        setMissions([]);
        setApplicationError('로그인 후 지원 현황을 확인할 수 있습니다.');
        setMissionError('로그인 후 진행 중인 프로젝트를 확인할 수 있습니다.');
        setIsApplicationLoading(false);
        setIsMissionLoading(false);
        return;
      }

      setIsApplicationLoading(true);
      setIsMissionLoading(true);
      const { applications: nextApplications, error } = await getMyStudentApplications({ session });
      const { missions: nextMissions, error: nextMissionError } = await fetchStudentMissionsForCurrentUser({ session });

      if (isMounted) {
        setApplications(nextApplications);
        setMissions(nextMissions);
        setApplicationError(error || '');
        setMissionError(nextMissionError || '');
        setIsApplicationLoading(false);
        setIsMissionLoading(false);
      }
    }

    loadApplications();

    return () => {
      isMounted = false;
    };
  }, [session]);

  const projectSummaries = useMemo(() => buildStudentProjectSummaries(missions), [missions]);

  const missionStats = useMemo(() => {
    const total = projectSummaries.length || 1;
    const activeCount = projectSummaries.filter((project) => project.status !== 'completed').length;
    const completedCount = projectSummaries.filter((project) => project.status === 'completed').length;
    const avgProgress = Math.round(
      projectSummaries.reduce((sum, project) => sum + (project.overallProgress || 0), 0) / total,
    );

    return { activeCount, completedCount, avgProgress };
  }, [projectSummaries]);

  const handleClubSubmit = (e) => {
    e.preventDefault();
    const savedProfile = saveStudentClubProfile(clubForm, session);
    setClubInfo(savedProfile);
    setClubForm(savedProfile);
    setIsEditingClub(false);
  };

  const startEditing = () => {
    setClubForm(clubInfo || emptyClubForm);
    setIsEditingClub(true);
  };

  return (
    <div className="app-shell">
      <Header
        copy={studentHeaderCopy}
        isAuthenticated={Boolean(session)}
        userEmail={session?.user?.email}
        accountType={accountType}
      />
      <main className="section-wrap section-spacing">
        <div className="hub-grid">
          
          <section className="hub-panel club-info-panel">
            <div className="hub-panel-header">
              <h2>동아리 정보</h2>
              {clubInfo && !isEditingClub && (
                <button type="button" className="button button-secondary" onClick={startEditing}>정보 수정</button>
              )}
            </div>

            {!clubInfo || isEditingClub ? (
              <form className="club-info-form" onSubmit={handleClubSubmit}>
                <div className="form-group">
                  <label>동아리/학회명</label>
                  <input required value={clubForm.clubName} onChange={e => setClubForm({...clubForm, clubName: e.target.value})} placeholder="예: 연세대 마케팅학회 PRISM" />
                </div>
                <div className="form-group">
                  <label>소속 대학</label>
                  <input required value={clubForm.university} onChange={e => setClubForm({...clubForm, university: e.target.value})} placeholder="예: 연세대" />
                </div>
                <div className="form-group">
                  <label>대표자 이름</label>
                  <input required value={clubForm.owner} onChange={e => setClubForm({...clubForm, owner: e.target.value})} placeholder="예: 김민서" />
                </div>
                <div className="form-group">
                  <label>동아리/학회 소개</label>
                  <textarea required value={clubForm.description} onChange={e => setClubForm({...clubForm, description: e.target.value})} placeholder="어떤 활동을 주로 하는지, 규모와 성격 등을 간단히 적어주세요." rows="3" />
                </div>
                <div className="form-actions">
                  <button type="submit" className="button button-primary">
                    {clubInfo ? '수정 완료' : '정보 등록하기'}
                  </button>
                  {clubInfo && isEditingClub && (
                    <button type="button" className="button button-secondary" onClick={() => setIsEditingClub(false)}>취소</button>
                  )}
                </div>
              </form>
            ) : (
              <div className="club-info-view">
                <div className="info-item">
                  <span>동아리/학회명</span>
                  <strong>{clubInfo.clubName}</strong>
                </div>
                <div className="info-item">
                  <span>소속 대학</span>
                  <strong>{clubInfo.university}</strong>
                </div>
                <div className="info-item">
                  <span>대표자 이름</span>
                  <strong>{clubInfo.owner}</strong>
                </div>
                <div className="info-item">
                  <span>동아리/학회 소개</span>
                  <p style={{ margin: 0, color: 'var(--slate-900)', fontSize: '15px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{clubInfo.description}</p>
                </div>
              </div>
            )}
          </section>

          <section className="hub-panel hub-shortcuts-panel" aria-labelledby="hub-shortcuts-title">
            <div className="hub-panel-header">
              <h2 id="hub-shortcuts-title">빠른 이동</h2>
            </div>
            <div className="hub-shortcuts">
              <Link className="button button-secondary" to="/projects">
                새 공고 둘러보기
              </Link>
            </div>
          </section>

          <section className="hub-panel applications-panel" aria-labelledby="hub-applications-title">
            <div className="hub-panel-header">
              <h2 id="hub-applications-title">내 지원 현황</h2>
              <Link className="button button-secondary" to="/projects">
                공고 더 보기
              </Link>
            </div>

            {isApplicationLoading ? (
              <div className="hub-empty-state">지원 내역을 불러오는 중입니다.</div>
            ) : applicationError ? (
              <div className="hub-empty-state">{applicationError}</div>
            ) : applications.length === 0 ? (
              <div className="hub-empty-state">아직 지원한 공고가 없습니다.</div>
            ) : (
              <div className="application-status-list">
                {applications.map((application) => {
                  const project = application.project || {};
                  const status = applicationStatusMeta[application.status] || applicationStatusMeta.pending;

                  return (
                    <article key={application.id} className="application-status-card">
                      <div className="application-status-top">
                        <span className="hub-project-company">{project.startupName || '스타트업'}</span>
                        <span className={`student-status-badge student-status-badge--${status.tone}`}>
                          {status.label}
                        </span>
                      </div>
                      <h3>{project.title || '연결된 공고 정보 없음'}</h3>
                      <p>{status.description}</p>
                      <div className="application-status-bottom">
                        <span>{formatDate(application.createdAt)}</span>
                        {project.id ? (
                          <Link to={`/projects/${project.id}`}>
                            공고 보기
                          </Link>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section className="hub-panel projects-panel">
            <div className="hub-panel-header">
              <h2>진행 중인 프로젝트</h2>
            </div>

            {isMissionLoading ? (
              <div className="hub-empty-state">진행 중인 프로젝트를 불러오는 중입니다.</div>
            ) : missionError ? (
              <div className="hub-empty-state">{missionError}</div>
            ) : projectSummaries.length === 0 ? (
              <div className="hub-empty-state">
                기업이 선택한 지원서 또는 전달한 미션이 아직 없습니다. 선택되면 이 영역에 프로젝트가 표시됩니다.
              </div>
            ) : (
              <>
                <div className="dashboard-metric-grid hub-project-metrics">
                  <div className="company-metric-card company-metric-card--neutral">
                    <p className="company-metric-label">진행 중</p>
                    <p className="company-metric-value">{missionStats.activeCount}</p>
                    <p className="company-metric-desc">활성 협업 프로젝트</p>
                  </div>
                  <div className="company-metric-card company-metric-card--neutral">
                    <p className="company-metric-label">완료</p>
                    <p className="company-metric-value">{missionStats.completedCount}</p>
                    <p className="company-metric-desc">완료된 프로젝트</p>
                  </div>
                  <div className="company-metric-card company-metric-card--neutral">
                    <p className="company-metric-label">평균 진행률</p>
                    <p className="company-metric-value">{missionStats.avgProgress}%</p>
                    <p className="company-metric-desc">KPI + 승인 반영</p>
                  </div>
                </div>

                <div className="student-mission-overview-list hub-mission-list">
                  {projectSummaries.map((project) => {
                    const status = missionStatusMeta[project.status] ?? missionStatusMeta.in_progress;

                    return (
                      <Link
                        key={project.id}
                        to={`/dashboard/student/project/${project.match_id ?? project.detailMissionId}`}
                        className="student-mission-overview-card hub-mission-card"
                      >
                        <div className="student-company-avatar" aria-hidden>
                          {(project.companyName || '').slice(0, 2)}
                        </div>
                        <div className="student-mission-overview-body">
                          <div className="student-mission-overview-top">
                            <span>{project.companyName} · {project.companyIndustry}</span>
                            <span className={`student-status-badge student-status-badge--${status.tone}`}>{status.label}</span>
                          </div>
                          <h2>{project.title}</h2>
                          <p>{project.latestMissionTitle} · 미션 {project.missionCount}개</p>
                          <div className="student-progress-label">
                            <span>전체 진행률</span>
                            <strong>{project.overallProgress}%</strong>
                          </div>
                          <div className="student-progress-track student-progress-track--overall">
                            <span style={{ width: `${project.overallProgress}%` }} />
                          </div>
                        </div>
                        <span className="student-mission-arrow" aria-hidden>›</span>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}
