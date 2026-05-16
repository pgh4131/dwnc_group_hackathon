import FormField from './FormField.jsx';
import { activityTypeOptions, workModeOptions } from '../../data/postCreateOptions.js';

export default function ProjectBasicInfoSection({
  errors,
  onChange,
  onCheckboxChange,
  values,
}) {
  return (
    <section className="post-form-section" aria-labelledby="project-basic-title">
      <div className="form-section-heading">
        <span>02</span>
        <div>
          <h2 id="project-basic-title">프로젝트 기본 정보</h2>
          <p>학생 조직이 가장 먼저 비교하게 될 모집 조건입니다.</p>
        </div>
      </div>

      <FormField id="title" label="공고 제목" required error={errors.title}>
        <input
          id="title"
          name="title"
          value={values.title}
          placeholder="예: 대학생 초기 유저 확보 앰배서더 프로젝트"
          onChange={onChange}
        />
      </FormField>

      <div className="form-grid two-columns">
        <FormField id="purpose" label="프로젝트 목적" required error={errors.purpose}>
          <input
            id="purpose"
            name="purpose"
            value={values.purpose}
            placeholder="예: 베타테스트, SNS 홍보, 사용자 피드백 수집"
            onChange={onChange}
          />
        </FormField>

        <FormField id="target" label="모집 대상" required error={errors.target}>
          <input
            id="target"
            name="target"
            value={values.target}
            placeholder="예: IT 동아리, 마케팅 학회, 창업 동아리"
            onChange={onChange}
          />
        </FormField>

        <FormField id="period" label="활동 기간" required error={errors.period}>
          <input
            id="period"
            name="period"
            value={values.period}
            placeholder="예: 2026.06.10 - 2026.07.08 / 총 4주"
            onChange={onChange}
          />
        </FormField>

        <FormField id="deadline" label="모집 마감일" required error={errors.deadline}>
          <input
            id="deadline"
            name="deadline"
            type="date"
            value={values.deadline}
            onChange={onChange}
          />
        </FormField>
      </div>

      <fieldset className="choice-fieldset">
        <legend>
          활동 유형 <em>필수</em>
        </legend>
        <div className="choice-grid">
          {activityTypeOptions.map((option) => (
            <label className="choice-card" key={option.value}>
              <input
                type="checkbox"
                name="activityTypes"
                value={option.value}
                checked={values.activityTypes.includes(option.value)}
                onChange={onCheckboxChange}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        {errors.activityTypes ? (
          <span className="form-error" role="alert">
            {errors.activityTypes}
          </span>
        ) : null}
      </fieldset>

      <fieldset className="choice-fieldset">
        <legend>활동 방식</legend>
        <div className="segmented-control">
          {workModeOptions.map((option) => (
            <label key={option.value}>
              <input
                type="radio"
                name="workMode"
                value={option.value}
                checked={values.workMode === option.value}
                onChange={onChange}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </section>
  );
}
