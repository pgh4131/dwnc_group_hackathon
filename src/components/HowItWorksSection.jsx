import SectionHeading from './SectionHeading.jsx';

export default function HowItWorksSection({ steps }) {
  return (
    <section className="section-wrap section-spacing">
      <SectionHeading
        eyebrow="How It Works"
        title="프로젝트는 네 단계로 운영됩니다"
        description="메인페이지에서는 전체 흐름만 보여주고, 세부 기능은 이후 대시보드와 상세 페이지에서 연결할 수 있습니다."
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
