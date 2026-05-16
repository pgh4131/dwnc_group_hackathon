import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AuthModal from '../components/AuthModal.jsx';
import Footer from '../components/Footer.jsx';
import Header from '../components/Header.jsx';
import { homepageCopy } from '../data/homepage.js';
import {
  getAccountType,
  getCurrentSession,
  signOut,
  subscribeToAuthChanges,
} from '../services/auth.js';
import { fetchProjectById } from '../services/projects.js';
import { hasStudentClubProfile } from '../services/studentClubProfileStorage.js';

const formatCreatedAt = (createdAt) => {
  if (!createdAt) {
    return '등록일 미정';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(createdAt));
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [projectState, setProjectState] = useState({
    project: null,
    isLoading: true,
    error: null,
  });
  const [session, setSession] = useState(null);
  const [accountType, setAccountType] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authNotice, setAuthNotice] = useState('');
  const [hasClubProfile, setHasClubProfile] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const result = await getCurrentSession();

      if (isMounted) {
        setSession(result.session);
        setAccountType(await getAccountType(result.session));
        setHasClubProfile(hasStudentClubProfile(result.session));
      }
    }

    loadSession();
    const unsubscribe = subscribeToAuthChanges(async (nextSession) => {
      setSession(nextSession);
      setAccountType(await getAccountType(nextSession));
      setHasClubProfile(hasStudentClubProfile(nextSession));
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadProject() {
      if (!id) {
        setProjectState({
          project: null,
          isLoading: false,
          error: '공고 ID가 없습니다.',
        });
        return;
      }

      const result = await fetchProjectById(id);

      if (!isMounted) {
        return;
      }

      setProjectState({
        project: result.project,
        isLoading: false,
        error: result.error,
      });
    }

    loadProject();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const { error, isLoading, project } = projectState;
  const isAuthenticated = Boolean(session);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out.', error);
    } finally {
      setSession(null);
      setAccountType(null);
    }
  };

  const openAuthModal = (notice = '') => {
    setAuthNotice(notice);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthNotice('');
  };

  return (
    <div className="app-shell">
      <Header
        copy={homepageCopy}
        isAuthenticated={isAuthenticated}
        userEmail={session?.user?.email}
        accountType={accountType}
        onLoginClick={() => openAuthModal()}
        onLogoutClick={handleLogout}
      />
      <main className="project-detail-page section-spacing">
        <section className="section-wrap">
          <Link className="project-detail-back" to="/projects">
            ← 전체 공고 목록으로
          </Link>

          {isLoading ? (
            <div className="project-detail-status" role="status">
              공고 정보를 불러오는 중입니다.
            </div>
          ) : null}

          {!isLoading && error ? (
            <div className="project-detail-status project-detail-status--error" role="alert">
              공고 정보를 불러오지 못했습니다.
              <span>{error}</span>
            </div>
          ) : null}

          {!isLoading && !error && !project ? (
            <div className="project-detail-status" role="status">
              해당 공고를 찾을 수 없습니다.
            </div>
          ) : null}

          {!isLoading && !error && project ? (
            <>
              <section className="project-detail-hero" aria-labelledby="project-detail-title">
                <div>
                  <div className="project-detail-kicker">
                    <span className="startup-name">{project.startupName}</span>
                    <span className={`status-pill status-${project.status}`}>{project.status}</span>
                  </div>
                  <h1 id="project-detail-title">{project.title}</h1>
                  <p>
                    {project.description ||
                      `${project.startupName}에서 운영하는 캠퍼스 협업 프로젝트입니다. 활동 조건과 보상을 확인하고 팀에 맞는 공고인지 검토해 보세요.`}
                  </p>
                  <div className="project-detail-actions">
                    {!isAuthenticated ? (
                      <button
                        className="button button-primary button-large"
                        type="button"
                        onClick={() => openAuthModal(homepageCopy.auth.studentLoginRequiredMessage)}
                      >
                        로그인 후 지원하기
                      </button>
                    ) : accountType === 'startup' ? (
                      <button
                        className="button button-primary button-large"
                        type="button"
                        onClick={handleLogout}
                      >
                        스타트업 계정 로그아웃
                      </button>
                    ) : hasClubProfile ? (
                      <Link
                        className="button button-primary button-large"
                        to={`/student/apply?projectId=${encodeURIComponent(project.id)}`}
                      >
                        지원서 작성하기
                      </Link>
                    ) : (
                      <Link className="button button-primary button-large" to="/dashboard/student">
                        대시보드 정보 작성하기
                      </Link>
                    )}
                    <Link className="button button-secondary button-large" to="/projects">
                      전체 공고 보기
                    </Link>
                  </div>
                  {!isAuthenticated ? (
                    <p className="project-detail-guard">
                      로그아웃 상태에서는 공고 내용만 볼 수 있습니다. 지원하려면 동아리 계정으로 로그인해주세요.
                    </p>
                  ) : accountType === 'startup' ? (
                    <p className="project-detail-guard">
                      스타트업 계정은 공고 지원을 할 수 없습니다. 동아리/학회 계정으로 이용해주세요.
                    </p>
                  ) : !hasClubProfile ? (
                    <p className="project-detail-guard">
                      동아리 정보를 먼저 등록해야 이 공고에 지원할 수 있습니다.
                    </p>
                  ) : null}
                </div>

                <aside className="project-detail-summary" aria-label="공고 핵심 정보">
                  <dl>
                    <div>
                      <dt>활동 기간</dt>
                      <dd>{project.period}</dd>
                    </div>
                    <div>
                      <dt>보상</dt>
                      <dd>{project.reward}</dd>
                    </div>
                    <div>
                      <dt>등록일</dt>
                      <dd>{formatCreatedAt(project.createdAt)}</dd>
                    </div>
                  </dl>
                </aside>
              </section>

              <section className="project-detail-content" aria-label="공고 상세 정보">
                <div className="project-detail-panel">
                  <h2>프로젝트 분야</h2>
                  <div className="tag-row">
                    {project.tags.length > 0 ? (
                      project.tags.map((tag) => <span key={tag}>{tag}</span>)
                    ) : (
                      <span>분야 협의</span>
                    )}
                  </div>
                </div>

                <div className="project-detail-panel">
                  <h2>활동 조건</h2>
                  <dl className="project-detail-list">
                    <div>
                      <dt>진행 상태</dt>
                      <dd>{project.status}</dd>
                    </div>
                    <div>
                      <dt>활동 기간</dt>
                      <dd>{project.period}</dd>
                    </div>
                    <div>
                      <dt>보상</dt>
                      <dd>{project.reward}</dd>
                    </div>
                    {project.target ? (
                      <div>
                        <dt>모집 대상</dt>
                        <dd>{project.target}</dd>
                      </div>
                    ) : null}
                    {project.deadline ? (
                      <div>
                        <dt>모집 마감일</dt>
                        <dd>{project.deadline}</dd>
                      </div>
                    ) : null}
                  </dl>
                </div>

                {project.mission ? (
                  <div className="project-detail-panel project-detail-panel--wide">
                    <h2>주요 미션</h2>
                    <p className="project-detail-body">{project.mission}</p>
                  </div>
                ) : null}
              </section>
            </>
          ) : null}
        </section>
      </main>
      <Footer copy={homepageCopy.footer} serviceName={homepageCopy.serviceName} />
      <AuthModal
        copy={homepageCopy.auth}
        isOpen={isAuthModalOpen}
        notice={authNotice}
        onClose={closeAuthModal}
      />
    </div>
  );
}
