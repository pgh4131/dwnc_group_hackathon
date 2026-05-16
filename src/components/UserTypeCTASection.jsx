import { Link } from 'react-router-dom';

export default function UserTypeCTASection({ cards, onStartupClick }) {
  return (
    <section className="section-surface-cta section-spacing">
      <div className="section-wrap">
        <div className="cta-grid">
          {cards.map((card) => (
            <article className="cta-card" key={card.audience}>
              <span>{card.audience}</span>
              <h2>{card.title}</h2>
              <p>{card.description}</p>
              {card.href === '/startup' && onStartupClick ? (
                <button type="button" className="button button-primary" onClick={onStartupClick}>
                  {card.buttonLabel}
                </button>
              ) : (
                <Link className="button button-primary" to={card.href}>
                  {card.buttonLabel}
                </Link>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
