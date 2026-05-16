import FormField from './FormField.jsx';
import { deliverableOptions } from '../../data/postCreateOptions.js';

export default function MissionSection({ errors, onChange, onCheckboxChange, values }) {
  return (
    <section className="post-form-section" aria-labelledby="mission-title">
      <div className="form-section-heading">
        <span>04</span>
        <div>
          <h2 id="mission-title">미션 및 제출물</h2>
          <p>실행해야 할 활동과 제출 기준을 구체적으로 정리합니다.</p>
        </div>
      </div>

      <FormField id="mainMission" label="주요 미션 설명" required error={errors.mainMission}>
        <div className="mission-input-header">
          <button
            type="button"
            className="ai-recommend-btn"
            onClick={() => window.alert('AI 추천 기능은 추후 지원될 예정입니다.')}
          >
            ✨ AI로 미션 추천받기
          </button>
        </div>
        <textarea
          id="mainMission"
          name="mainMission"
          value={values.mainMission}
          placeholder="직접 미션을 입력하거나 AI 추천을 받아보세요. 예: 서비스 가입 유도 콘텐츠 3건 제작..."
          rows="5"
          onChange={onChange}
        />
      </FormField>

      <fieldset className="choice-fieldset">
        <legend>제출해야 하는 결과물</legend>
        <div className="choice-grid">
          {deliverableOptions.map((option) => (
            <label className="choice-card" key={option}>
              <input
                type="checkbox"
                name="deliverables"
                value={option}
                checked={values.deliverables.includes(option)}
                onChange={onCheckboxChange}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <FormField id="deliverableDescription" label="결과물 상세 기준">
        <textarea
          id="deliverableDescription"
          name="deliverableDescription"
          value={values.deliverableDescription}
          placeholder="제출 형식, 최소 수량, 인증 방식, 제출 마감 기준을 작성해주세요."
          rows="4"
          onChange={onChange}
        />
      </FormField>

      <div className="form-grid two-columns">
        <FormField id="preferredQualifications" label="우대 조건">
          <textarea
            id="preferredQualifications"
            name="preferredQualifications"
            value={values.preferredQualifications}
            placeholder="예: SNS 채널 운영 경험, 교내 행사 운영 경험, 디자인 툴 활용 가능"
            rows="4"
            onChange={onChange}
          />
        </FormField>

        <FormField id="notes" label="유의사항">
          <textarea
            id="notes"
            name="notes"
            value={values.notes}
            placeholder="예: 사전 OT 필수 참석, 브랜드 가이드 준수, 결과물 2차 활용 동의"
            rows="4"
            onChange={onChange}
          />
        </FormField>
      </div>
    </section>
  );
}
