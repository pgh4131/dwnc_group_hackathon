import { Link } from 'react-router-dom';

export default function UserTypeCTASection({ cards, onStartupClick, onStudentClick }) {
  return (
    <section className="section-surface-cta section-spacing">
      <div className="section-wrap">
        <div className="cta-grid">
          {cards.map((card) => (
            <article className="cta-card" key={card.audience}>
              <span>{card.audience}</span>
              <h2>{card.title}</h2>
              <p>{card.description}</p>
              <Link
                className="button button-primary"
                to={card.href}
                onClick={
                  card.type === 'startup' && onStartupClick
                    ? (event) => {
                        event.preventDefault();
                        onStartupClick();
                      }
                    : card.type === 'student' && onStudentClick
                      ? (event) => {
                          event.preventDefault();
                          onStudentClick();
                        }
                    : undefined
                }
              >
                {card.buttonLabel}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
