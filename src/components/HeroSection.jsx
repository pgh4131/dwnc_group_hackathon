export default function HeroSection({ copy }) {
  return (
    <section className="hero-section section-wrap">
      <div className="hero-copy">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p className="hero-description">{copy.description}</p>
        <div className="hero-actions">
          {copy.actions.map((action) => (
            <a key={action.href} className={`button button-${action.variant} button-large`} href={action.href}>
              {action.label}
            </a>
          ))}
        </div>
      </div>

      <aside className="hero-panel" aria-label="서비스 운영 요약">
        <div className="panel-header">
          <span>프로젝트 운영</span>
          <strong>모집부터 인증까지</strong>
        </div>
        <div className="hero-flow">
          <span>공고 등록</span>
          <span>지원 매칭</span>
          <span>미션 운영</span>
          <span>성과 확인</span>
        </div>
        <div className="stats-grid">
          {copy.stats.map((stat) => (
            <div className="stat-card" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </aside>
    </section>
  );
}
