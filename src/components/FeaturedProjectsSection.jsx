import SectionHeading from './SectionHeading.jsx';

export default function FeaturedProjectsSection({ projects }) {
  return (
    <section className="featured-section section-spacing">
      <div className="section-wrap">
        <SectionHeading
          eyebrow="Featured Projects"
          title="지금 확인할 수 있는 캠퍼스 프로젝트"
          description="mock data로 구성된 공고 카드입니다. 이후 Supabase 또는 API 응답으로 교체하기 쉽게 분리되어 있습니다."
        />
        <div className="project-grid">
          {projects.map((project) => (
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
      </div>
    </section>
  );
}
