import SectionHeading from './SectionHeading.jsx';

export default function ValueSection({ items }) {
  return (
    <section className="section-wrap section-spacing">
      <SectionHeading
        eyebrow="Problem / Value"
        title="모집과 운영의 간격을 줄입니다"
        description="기업과 학생 조직이 각자 겪는 문제를 하나의 프로젝트 운영 흐름으로 연결합니다."
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
    </section>
  );
}
