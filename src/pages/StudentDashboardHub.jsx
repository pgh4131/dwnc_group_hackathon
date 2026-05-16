import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import { homepageCopy } from '../data/homepage.js';
import { getAccountType, getCurrentSession, subscribeToAuthChanges } from '../services/auth.js';
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

const formatDate = (value) => {
  if (!value) return '접수일 미정';

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
};

export default function StudentDashboardHub() {
  const [clubInfo, setClubInfo] = useState(() => getStudentClubProfile());
  const [isEditingClub, setIsEditingClub] = useState(false);
  const [session, setSession] = useState(null);
  const [accountType, setAccountType] = useState(null);
  const [applications, setApplications] = useState([]);
  const [isApplicationLoading, setIsApplicationLoading] = useState(true);
  const [applicationError, setApplicationError] = useState('');

  const [clubForm, setClubForm] = useState(() => getStudentClubProfile() || {
    clubName: '',
    university: '',
    owner: '',
    description: '',
  });

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const result = await getCurrentSession();
      const nextAccountType = await getAccountType(result.session);

      if (isMounted) {
        setSession(result.session);
        setAccountType(nextAccountType);
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
    let isMounted = true;

    async function loadApplications() {
      if (!session) {
        setApplications([]);
        setApplicationError('로그인 후 지원 현황을 확인할 수 있습니다.');
        setIsApplicationLoading(false);
        return;
      }

      setIsApplicationLoading(true);
      const { applications: nextApplications, error } = await getMyStudentApplications({ session });

      if (isMounted) {
        setApplications(nextApplications);
        setApplicationError(error || '');
        setIsApplicationLoading(false);
      }
    }

    loadApplications();

    return () => {
      isMounted = false;
    };
  }, [session]);

  const acceptedApplications = useMemo(
    () => applications.filter((application) => application.status === 'accepted'),
    [applications],
  );

  const handleClubSubmit = (e) => {
    e.preventDefault();
    const savedProfile = saveStudentClubProfile(clubForm);
    setClubInfo(savedProfile);
    setClubForm(savedProfile);
    setIsEditingClub(false);
  };

  const startEditing = () => {
    setClubForm(clubInfo);
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
              <Link className="button button-primary" to="/dashboard/student/missions">
                나의 미션 전체 보기
              </Link>
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

          {clubInfo ? (
            <section className="hub-panel projects-panel">
              <div className="hub-panel-header">
                <h2>진행 중인 프로젝트</h2>
                {acceptedApplications.length > 0 ? (
                  <Link className="button button-secondary" to="/dashboard/student/missions">
                    미션 목록
                  </Link>
                ) : null}
              </div>
              
              {acceptedApplications.length === 0 ? (
                <div className="hub-empty-state">
                  기업이 선택한 지원서가 아직 없습니다. 선택되면 이 영역에 프로젝트가 표시됩니다.
                </div>
              ) : (
                <div className="hub-project-list">
                  {acceptedApplications.map((application) => {
                    const project = application.project || {};

                    return (
                      <Link key={application.id} to="/dashboard/student/missions" className="hub-project-card">
                        <div className="hub-project-top">
                          <span className="hub-project-company">{project.startupName || '스타트업'}</span>
                          <span className="status-pill status-신규">선택됨</span>
                        </div>
                        <h3>{project.title || '선택된 프로젝트'}</h3>
                        <div className="hub-project-bottom">
                          <span>{project.period || '활동 기간 협의'}</span>
                          <span className="hub-project-arrow">미션 보기 →</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          ) : (
            <section className="hub-panel projects-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '300px', backgroundColor: 'var(--slate-50)', borderStyle: 'dashed' }}>
              <span style={{ fontSize: '32px', marginBottom: '16px' }}>🔒</span>
              <h2 style={{ fontSize: '20px', color: 'var(--slate-900)', marginBottom: '8px' }}>프로젝트 목록이 잠겨있습니다</h2>
              <p style={{ color: 'var(--slate-500)', fontSize: '15px' }}>위에서 동아리/학회 정보를 먼저 등록하셔야<br/>진행 중인 프로젝트를 확인하고 관리할 수 있습니다.</p>
            </section>
          )}

        </div>
      </main>
    </div>
  );
}
