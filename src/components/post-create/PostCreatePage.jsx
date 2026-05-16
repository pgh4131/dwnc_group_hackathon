import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../Footer.jsx';
import Header from '../Header.jsx';
import CompanyInfoSection from './CompanyInfoSection.jsx';
import MissionSection from './MissionSection.jsx';
import PostPreviewCard from './PostPreviewCard.jsx';
import ProjectBasicInfoSection from './ProjectBasicInfoSection.jsx';
import RewardAndConditionSection from './RewardAndConditionSection.jsx';
import SubmitButton from './SubmitButton.jsx';
import { homepageCopy } from '../../data/homepage.js';
import { createCampaignPost } from '../../services/campaignPostStorage.js';

const initialValues = {
  companyName: '',
  serviceName: '',
  tagline: '',
  companyDescription: '',
  websiteUrl: '',
  category: '',
  title: '',
  purpose: '',
  target: '',
  activityTypes: [],
  workMode: '',
  period: '',
  deadline: '',
  recruitCount: '',
  regions: '',
  rewardSummary: '',
  activityBudget: '',
  performanceBonus: '',
  certificate: false,
  networking: false,
  internshipLinked: false,
  mainMission: '',
  deliverables: [],
  deliverableDescription: '',
  preferredQualifications: '',
  notes: '',
};

const requiredFields = [
  ['companyName', '기업명을 입력해주세요.'],
  ['serviceName', '서비스명을 입력해주세요.'],
  ['title', '공고 제목을 입력해주세요.'],
  ['purpose', '프로젝트 목적을 입력해주세요.'],
  ['target', '모집 대상을 입력해주세요.'],
  ['period', '활동 기간을 입력해주세요.'],
  ['deadline', '모집 마감일을 선택해주세요.'],
  ['rewardSummary', '보상 내용을 입력해주세요.'],
  ['mainMission', '주요 미션 설명을 입력해주세요.'],
];

const validateValues = (values) => {
  const nextErrors = requiredFields.reduce((errors, [field, message]) => {
    if (!values[field].trim()) {
      errors[field] = message;
    }

    return errors;
  }, {});

  if (values.activityTypes.length === 0) {
    nextErrors.activityTypes = '활동 유형을 1개 이상 선택해주세요.';
  }

  return nextErrors;
};

export default function PostCreatePage() {
  const navigate = useNavigate();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const completedRequiredCount = useMemo(() => {
    const textFieldCount = requiredFields.filter(([field]) => values[field].trim()).length;
    return textFieldCount + (values.activityTypes.length > 0 ? 1 : 0);
  }, [values]);

  const totalRequiredCount = requiredFields.length + 1;

  const handleChange = (event) => {
    const { checked, name, type, value } = event.target;
    setValues((currentValues) => ({
      ...currentValues,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors((currentErrors) => ({ ...currentErrors, [name]: undefined }));
  };

  const handleCheckboxGroupChange = (event) => {
    const { checked, name, value } = event.target;

    setValues((currentValues) => {
      const currentList = currentValues[name];
      const nextList = checked
        ? [...currentList, value]
        : currentList.filter((item) => item !== value);

      return {
        ...currentValues,
        [name]: nextList,
      };
    });
    setErrors((currentErrors) => ({ ...currentErrors, [name]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validateValues(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setSuccessMessage('');
      return;
    }

    setIsSubmitting(true);
    const createdPost = createCampaignPost(values);
    setSuccessMessage('공고가 등록되었습니다');

    window.setTimeout(() => {
      navigate(`/company/posts/complete?id=${createdPost.id}`);
    }, 450);
  };

  return (
    <div className="app-shell">
      <Header copy={homepageCopy} isAuthenticated={false} />
      <main className="post-create-page">
        <section className="post-create-hero section-wrap">
          <div>
            <p className="eyebrow">Startup Campaign Builder</p>
            <h1>앰배서더 프로젝트 공고 작성</h1>
            <p>
              기업 소개부터 미션과 보상까지 한 번에 정리해 학생 조직이 바로 이해할 수 있는 공고를 만듭니다.
            </p>
          </div>
          <div className="required-progress" aria-label="필수 입력 진행률">
            <strong>
              {completedRequiredCount}/{totalRequiredCount}
            </strong>
            <span>필수 항목 완료</span>
          </div>
        </section>

        <section className="post-create-layout section-wrap">
          <form className="post-create-form" onSubmit={handleSubmit}>
            <CompanyInfoSection errors={errors} onChange={handleChange} values={values} />
            <ProjectBasicInfoSection
              errors={errors}
              onChange={handleChange}
              onCheckboxChange={handleCheckboxGroupChange}
              values={values}
            />
            <RewardAndConditionSection errors={errors} onChange={handleChange} values={values} />
            <MissionSection
              errors={errors}
              onChange={handleChange}
              onCheckboxChange={handleCheckboxGroupChange}
              values={values}
            />

            <section className="post-form-section final-check" aria-labelledby="final-check-title">
              <div className="form-section-heading">
                <span>05</span>
                <div>
                  <h2 id="final-check-title">최종 확인</h2>
                  <p>등록 후 학생용 상세 페이지와 메인 공고 카드에서 재사용될 정보입니다.</p>
                </div>
              </div>
              <div className="final-check-grid">
                <span>공고 상태: 모집중</span>
                <span>저장 방식: localStorage mock</span>
                <span>상세 연결: /projects/[id]</span>
              </div>
              {successMessage ? (
                <p className="success-message" role="status">
                  {successMessage}
                </p>
              ) : null}
              <SubmitButton isSubmitting={isSubmitting} />
            </section>
          </form>

          <div className="preview-column">
            <PostPreviewCard values={values} />
          </div>
        </section>
      </main>
      <Footer copy={homepageCopy.footer} serviceName={homepageCopy.serviceName} />
    </div>
  );
}
