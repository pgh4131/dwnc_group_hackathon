const statusLabel = {
  completed: "완료 단계",
  in_progress: "진행 중",
  upcoming: "남은 단계",
};

export default function MissionTimeline({ timeline }) {
  return (
    <section className="dashboard-card student-section">
      <div className="student-section-head">
        <div>
          <p className="dashboard-section-label">Timeline</p>
          <h2 className="student-section-title">프로젝트 일정 흐름</h2>
        </div>
      </div>

      <div className="student-timeline">
        {timeline.map((phase) => (
          <article key={phase.id} className={`student-timeline-item student-timeline-item--${phase.status}`}>
            <div className="student-timeline-marker" aria-hidden />
            <div className="student-timeline-card">
              <div className="student-timeline-top">
                <h3>{phase.title}</h3>
                <span>{statusLabel[phase.status]}</span>
              </div>
              <p>
                {phase.startDate} - {phase.endDate}
              </p>
              <dl className="student-timeline-meta">
                <div>
                  <dt>마일스톤</dt>
                  <dd>{phase.milestone}</dd>
                </div>
                <div>
                  <dt>제출 기한</dt>
                  <dd>{phase.dueDate}</dd>
                </div>
                <div>
                  <dt>지연 버퍼</dt>
                  <dd>{phase.bufferDays}일 확보</dd>
                </div>
              </dl>
              <div className="student-buffer-bar" aria-label={`지연 대비 버퍼 ${phase.bufferDays}일`}>
                <span style={{ width: `${Math.min(100, phase.bufferDays * 24)}%` }} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
