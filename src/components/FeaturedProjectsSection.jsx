import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SectionHeading from './SectionHeading.jsx';

export default function FeaturedProjectsSection({ projects, copy, isLoading, error }) {
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
          eyebrow={copy.sectionEyebrow}
          title={copy.sectionTitle}
          description={copy.sectionDescription}
        />

        {(isLoading || error) && (
          <div className="project-data-status" role="status">
            {isLoading ? copy.loadingMessage : copy.errorMessage}
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
              autoComplete="off"
            />
          </label>
          <span className="project-count" aria-live="polite">
            {filteredProjects.length} / {projects.length}개 공고
          </span>
        </div>

        {filteredProjects.length > 0 ? (
          <div className="project-grid">
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
            {projects.length === 0 && !normalizedSearchTerm ? copy.noProjectsMessage : copy.emptyMessage}
          </div>
        )}

        <div className="project-more">
          <Link className="button button-secondary button-large" to={copy.moreHref}>
            {copy.moreLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
