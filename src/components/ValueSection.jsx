import SectionHeading from './SectionHeading.jsx';

export default function ValueSection({ items, sectionMeta }) {
  return (
    <section className="section-surface-muted section-spacing">
      <div className="section-wrap">
        <SectionHeading
          eyebrow={sectionMeta.eyebrow}
          title={sectionMeta.title}
          description={sectionMeta.description}
        />
        <div className="value-grid">
          {items.map((item) => (
            <article className="value-card" key={item.label}>
              <span>{item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
