import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer.jsx';
import Header from '../components/Header.jsx';
import { homepageCopy } from '../data/homepage.js';
import { fetchProjects } from '../services/projects.js';

export default function ProjectsPage() {
  const [projectState, setProjectState] = useState({
    projects: [],
    isLoading: true,
    error: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  useEffect(() => {
    let isMounted = true;

    async function loadProjects() {
      const result = await fetchProjects();

      if (!isMounted) {
        return;
      }

      setProjectState({
        projects: result.projects,
        isLoading: false,
        error: result.error,
      });
    }

    loadProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProjects = useMemo(() => {
    if (!normalizedSearchTerm) {
      return projectState.projects;
    }

    return projectState.projects.filter((project) => {
      const searchableText = [
        project.startupName,
        project.title,
        project.period,
        project.reward,
        project.status,
        ...project.tags,
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedSearchTerm);
    });
  }, [normalizedSearchTerm, projectState.projects]);

  return (
    <div className="app-shell">
      <Header copy={homepageCopy} isAuthenticated={false} />
      <main className="projects-page section-spacing">
        <section className="section-wrap">
          <div className="projects-page-hero">
            <div>
              <p className="eyebrow">Projects</p>
              <h1>전체 공고</h1>
              <p>
                Supabase에 등록된 캠퍼스 마케팅 프로젝트를 한 번에 확인하고, 관심 있는 공고의
                상세 조건을 바로 비교해 보세요.
              </p>
            </div>
            <div className="projects-page-summary" aria-label="공고 현황">
              <strong>{projectState.projects.length}</strong>
              <span>등록된 공고</span>
            </div>
          </div>

          {(projectState.isLoading || projectState.error) && (
            <div className="project-data-status" role="status">
              {projectState.isLoading
                ? homepageCopy.projects.loadingMessage
                : homepageCopy.projects.errorMessage}
              {!projectState.isLoading && projectState.error ? <span>{projectState.error}</span> : null}
            </div>
          )}

          <div className="project-toolbar projects-page-toolbar">
            <label className="project-search" htmlFor="all-project-search">
              <span>{homepageCopy.projects.searchLabel}</span>
              <input
                id="all-project-search"
                type="search"
                value={searchTerm}
                placeholder={homepageCopy.projects.searchPlaceholder}
                onChange={(event) => setSearchTerm(event.target.value)}
                autoComplete="off"
              />
            </label>
            <span className="project-count" aria-live="polite">
              {filteredProjects.length} / {projectState.projects.length}개 공고
            </span>
          </div>

          {filteredProjects.length > 0 ? (
            <div className="project-grid projects-page-grid">
              {filteredProjects.map((project) => (
                <Link className="project-card" to={`/projects/${project.id}`} key={project.id}>
                  <div className="project-card-top">
                    <span className="startup-name">{project.startupName}</span>
                    <span className={`status-pill status-${project.status}`}>{project.status}</span>
                  </div>
                  <h3>{project.title}</h3>
                  <div className="tag-row">
                    {project.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <dl className="project-meta">
                    <div>
                      <dt>활동 기간</dt>
                      <dd>{project.period}</dd>
                    </div>
                    <div>
                      <dt>보상</dt>
                      <dd>{project.reward}</dd>
                    </div>
                  </dl>
                </Link>
              ))}
            </div>
          ) : (
            <div className="project-empty" role="status">
              {projectState.projects.length === 0 && !normalizedSearchTerm
                ? homepageCopy.projects.noProjectsMessage
                : homepageCopy.projects.emptyMessage}
            </div>
          )}
        </section>
      </main>
      <Footer copy={homepageCopy.footer} serviceName={homepageCopy.serviceName} />
    </div>
  );
}
