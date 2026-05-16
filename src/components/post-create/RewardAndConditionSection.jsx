import FormField from './FormField.jsx';

export default function RewardAndConditionSection({ errors, onChange, values }) {
  return (
    <section className="post-form-section" aria-labelledby="reward-condition-title">
      <div className="form-section-heading">
        <span>03</span>
        <div>
          <h2 id="reward-condition-title">활동 조건 및 보상</h2>
          <p>모집 규모, 활동 지역, 참여 동기를 명확히 보여주세요.</p>
        </div>
      </div>

      <div className="form-grid two-columns">
        <FormField id="recruitCount" label="모집 인원 또는 모집 단체 수">
          <input
            id="recruitCount"
            name="recruitCount"
            value={values.recruitCount}
            placeholder="예: 5개 동아리 / 20명"
            onChange={onChange}
          />
        </FormField>

        <FormField id="regions" label="활동 지역 또는 대상 학교">
          <input
            id="regions"
            name="regions"
            value={values.regions}
            placeholder="예: 서울권 대학, 전국 온라인 가능"
            onChange={onChange}
          />
        </FormField>

        <FormField id="activityBudget" label="활동비">
          <input
            id="activityBudget"
            name="activityBudget"
            value={values.activityBudget}
            placeholder="예: 팀당 80만원"
            onChange={onChange}
          />
        </FormField>

        <FormField id="performanceBonus" label="성과 보너스">
          <input
            id="performanceBonus"
            name="performanceBonus"
            value={values.performanceBonus}
            placeholder="예: 가입자 100명 초과 시 20만원 추가"
            onChange={onChange}
          />
        </FormField>
      </div>

      <FormField id="rewardSummary" label="보상 내용" required error={errors.rewardSummary}>
        <textarea
          id="rewardSummary"
          name="rewardSummary"
          value={values.rewardSummary}
          placeholder="활동비, 성과 보너스, 수료증, 네트워킹, 인턴십 연계 가능 여부를 함께 작성해주세요."
          rows="4"
          onChange={onChange}
        />
      </FormField>

      <fieldset className="choice-fieldset">
        <legend>추가 제공 사항</legend>
        <div className="choice-grid compact">
          <label className="choice-card">
            <input
              type="checkbox"
              name="certificate"
              checked={values.certificate}
              onChange={onChange}
            />
            <span>수료증/인증서</span>
          </label>
          <label className="choice-card">
            <input
              type="checkbox"
              name="networking"
              checked={values.networking}
              onChange={onChange}
            />
            <span>커피챗/네트워킹</span>
          </label>
          <label className="choice-card">
            <input
              type="checkbox"
              name="internshipLinked"
              checked={values.internshipLinked}
              onChange={onChange}
            />
            <span>인턴십 연계 가능</span>
          </label>
        </div>
      </fieldset>
    </section>
  );
}
