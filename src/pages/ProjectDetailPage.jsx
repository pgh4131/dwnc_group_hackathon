import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Footer from '../components/Footer.jsx';
import Header from '../components/Header.jsx';
import { homepageCopy } from '../data/homepage.js';
import { fetchProjectById } from '../services/projects.js';

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

  return (
    <div className="app-shell">
      <Header copy={homepageCopy} isAuthenticated={false} />
      <main className="project-detail-page section-spacing">
        <section className="section-wrap">
          <Link className="project-detail-back" to="/">
            ← 메인 공고 목록으로
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
                    {project.startupName}에서 운영하는 캠퍼스 협업 프로젝트입니다. 활동 조건과 보상을
                    확인하고 팀에 맞는 공고인지 검토해 보세요.
                  </p>
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
                  </dl>
                </div>
              </section>
            </>
          ) : null}
        </section>
      </main>
      <Footer copy={homepageCopy.footer} serviceName={homepageCopy.serviceName} />
    </div>
  );
}
