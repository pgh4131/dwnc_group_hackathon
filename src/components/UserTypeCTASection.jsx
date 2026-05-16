export default function UserTypeCTASection({ cards }) {
  return (
    <section className="section-wrap section-spacing">
      <div className="cta-grid">
        {cards.map((card) => (
          <article className="cta-card" key={card.audience}>
            <span>{card.audience}</span>
            <h2>{card.title}</h2>
            <p>{card.description}</p>
            <a className="button button-primary" href={card.href}>
              {card.buttonLabel}
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
