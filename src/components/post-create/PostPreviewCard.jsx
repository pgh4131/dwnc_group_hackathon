import { activityTypeOptions, workModeOptions } from '../../data/postCreateOptions.js';

const findLabel = (options, value) => options.find((option) => option.value === value)?.label;

const formatDeadline = (deadline) => {
  if (!deadline) {
    return '마감일 미정';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
  }).format(new Date(deadline));
};

export default function PostPreviewCard({ values }) {
  const selectedActivityTypes = values.activityTypes
    .map((activityType) => findLabel(activityTypeOptions, activityType))
    .filter(Boolean);

  const workModeLabel = findLabel(workModeOptions, values.workMode);
  const tags = [
    ...selectedActivityTypes,
    workModeLabel,
    values.category,
    values.target,
  ].filter(Boolean);

  return (
    <aside className="post-preview-card" aria-labelledby="post-preview-title">
      <p className="preview-label">공고 미리보기</p>
      <div className="post-preview-top">
        <span className="startup-name">{values.companyName || '기업명'}</span>
        <span className="status-pill status-신규">작성중</span>
      </div>
      <p className="preview-service">{values.serviceName || '서비스명'}</p>
      <h2 id="post-preview-title">{values.title || '공고 제목을 입력하면 미리보기에 표시됩니다'}</h2>
      <div className="tag-row">
        {(tags.length > 0 ? tags.slice(0, 4) : ['활동 유형', '모집 대상']).map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <dl className="project-meta">
        <div>
          <dt>활동 기간</dt>
          <dd>{values.period || '활동 기간 미정'}</dd>
        </div>
        <div>
          <dt>보상</dt>
          <dd>{values.rewardSummary || values.activityBudget || '보상 내용 미정'}</dd>
        </div>
        <div>
          <dt>마감</dt>
          <dd>{formatDeadline(values.deadline)}</dd>
        </div>
      </dl>
    </aside>
  );
}
