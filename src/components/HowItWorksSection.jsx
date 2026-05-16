import SectionHeading from './SectionHeading.jsx';

export default function HowItWorksSection({ steps, sectionMeta }) {
  return (
    <section className="section-wrap section-spacing">
      <SectionHeading
        eyebrow={sectionMeta.eyebrow}
        title={sectionMeta.title}
        description={sectionMeta.description}
      />
      <ol className="step-list">
        {steps.map((step, index) => (
          <li className="step-card" key={step.title}>
            <span className="step-number">{String(index + 1).padStart(2, '0')}</span>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
