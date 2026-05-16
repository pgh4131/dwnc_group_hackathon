import FormField from './FormField.jsx';
import { categoryOptions } from '../../data/postCreateOptions.js';

export default function CompanyInfoSection({ errors, onChange, values }) {
  return (
    <section className="post-form-section" aria-labelledby="company-info-title">
      <div className="form-section-heading">
        <span>01</span>
        <div>
          <h2 id="company-info-title">기업/서비스 정보</h2>
          <p>공고 카드와 상세 페이지 상단에 노출될 기본 소개입니다.</p>
        </div>
      </div>

      <div className="form-grid two-columns">
        <FormField id="companyName" label="기업명" required error={errors.companyName}>
          <input
            id="companyName"
            name="companyName"
            value={values.companyName}
            placeholder="예: Looply"
            onChange={onChange}
          />
        </FormField>

        <FormField id="serviceName" label="서비스명 또는 제품명" required error={errors.serviceName}>
          <input
            id="serviceName"
            name="serviceName"
            value={values.serviceName}
            placeholder="예: 루플리 캠퍼스"
            onChange={onChange}
          />
        </FormField>

        <FormField id="tagline" label="기업/서비스 한 줄 소개">
          <input
            id="tagline"
            name="tagline"
            value={values.tagline}
            placeholder="대학생 팀을 위한 협업 SaaS"
            onChange={onChange}
          />
        </FormField>

        <FormField id="category" label="기업 분야 또는 서비스 카테고리">
          <select id="category" name="category" value={values.category} onChange={onChange}>
            <option value="">카테고리 선택</option>
            {categoryOptions.map((category) => (
              <option value={category} key={category}>
                {category}
              </option>
            ))}
          </select>
        </FormField>

        <FormField id="websiteUrl" label="홈페이지 또는 서비스 링크">
          <input
            id="websiteUrl"
            name="websiteUrl"
            type="url"
            value={values.websiteUrl}
            placeholder="https://example.com"
            onChange={onChange}
          />
        </FormField>
      </div>

      <FormField id="companyDescription" label="기업/서비스 상세 소개">
        <textarea
          id="companyDescription"
          name="companyDescription"
          value={values.companyDescription}
          placeholder="서비스가 해결하는 문제, 현재 단계, 학생 조직과 협업하고 싶은 이유를 작성해주세요."
          rows="5"
          onChange={onChange}
        />
      </FormField>
    </section>
  );
}
