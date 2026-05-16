import { useMemo, useState } from 'react';
import SectionHeading from './SectionHeading.jsx';

export default function FeaturedProjectsSection({ projects, copy, isLoading, source, error }) {
  const [searchTerm, setSearchTerm] = useState('');
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const filteredProjects = useMemo(() => {
    if (!normalizedSearchTerm) {
      return projects;
    }

    return projects.filter((project) => {
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
  }, [normalizedSearchTerm, projects]);

  return (
    <section className="featured-section section-spacing">
      <div className="section-wrap">
        <SectionHeading
          eyebrow="Featured Projects"
          title="모집 중인 캠퍼스 프로젝트"
          description="메인페이지에서 바로 공고를 확인하고, 관심 있는 프로젝트는 상세 페이지로 이동할 수 있습니다."
        />

        {(isLoading || source === 'mock') && (
          <div className="project-data-status" role="status">
            {isLoading ? copy.loadingMessage : copy.fallbackMessage}
            {!isLoading && error ? <span>{error}</span> : null}
          </div>
        )}

        <div className="project-toolbar">
          <label className="project-search" htmlFor="project-search">
            <span>{copy.searchLabel}</span>
            <input
              id="project-search"
              type="search"
              value={searchTerm}
              placeholder={copy.searchPlaceholder}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>
          <span className="project-count">
            {filteredProjects.length} / {projects.length}개 공고
          </span>
        </div>

        {filteredProjects.length > 0 ? (
          <div className="project-grid">
            {filteredProjects.map((project) => (
              <a className="project-card" href={`/projects/${project.id}`} key={project.id}>
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
              </a>
            ))}
          </div>
        ) : (
          <div className="project-empty" role="status">
            {copy.emptyMessage}
          </div>
        )}

        <div className="project-more">
          <a className="button button-secondary button-large" href={copy.moreHref}>
            {copy.moreLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
