import { Link } from 'react-router-dom';

export default function HeroSection({ copy, onStartupClick }) {
  return (
    <section className="hero-section section-wrap">
      <div className="hero-copy">
        {copy.eyebrow ? <p className="eyebrow">{copy.eyebrow}</p> : null}
        <h1>{copy.title}</h1>
        <p className="hero-description">{copy.description}</p>
        <div className="hero-actions">
          {copy.actions.map((action) => {
            const shouldUseStartupGate = action.type === 'startup' && onStartupClick;

            return (
              <Link
                key={action.href}
                className={`button button-${action.variant} button-large`}
                to={action.href}
                onClick={
                  shouldUseStartupGate
                    ? (event) => {
                        event.preventDefault();
                        onStartupClick();
                      }
                    : undefined
                }
              >
                {action.label}
              </Link>
            );
          })}
        </div>
      </div>

      <aside className="hero-panel" aria-label="서비스 흐름 요약">
        <div className="panel-header">
          <span>운영 흐름</span>
          <strong>공고부터 성과까지</strong>
        </div>
        <div className="hero-flow">
          <span>공고 등록</span>
          <span>지원 매칭</span>
          <span>미션 운영</span>
          <span>성과 확인</span>
        </div>
      </aside>
    </section>
  );
}
