import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AuthModal from '../components/AuthModal.jsx';
import Footer from '../components/Footer.jsx';
import FormField from '../components/post-create/FormField.jsx';
import Header from '../components/Header.jsx';
import { homepageCopy } from '../data/homepage.js';
import {
  getAccountType,
  getCurrentSession,
  signOut,
  subscribeToAuthChanges,
} from '../services/auth.js';
import { fetchProjectById } from '../services/projects.js';
import {
  createStudentApplication,
  getStudentApplicationByProjectId,
} from '../services/studentApplicationStorage.js';
import {
  getStudentClubProfile,
  hasStudentClubProfile,
} from '../services/studentClubProfileStorage.js';

const organizationTypeOptions = [
  '마케팅 동아리',
  '창업 학회',
  '콘텐츠 제작 동아리',
  '디자인 동아리',
  'IT/개발 학회',
  '기타',
];

const expectedOutcomeOptions = [
  '실무 경험',
  '포트폴리오 구축',
  '브랜드 빌딩 경험',
  '콘텐츠 제작 연습',
  '네트워킹',
  '기타',
];

const linkFields = [
  ['instagramUrl', '인스타그램 URL', 'https://instagram.com/club'],
  ['youtubeUrl', '유튜브 URL', 'https://youtube.com/@club'],
  ['blogUrl', '블로그 URL', 'https://blog.example.com'],
  ['websiteUrl', '노션 또는 기타 웹사이트 URL', 'https://notion.site/club'],
  ['portfolioUrl', 'PDF 포트폴리오 링크', 'https://drive.google.com/...'],
  ['campusBridgeCertificateUrl', 'Campus Bridge 인증서 링크', 'https://drive.google.com/...'],
];

const initialValues = {
  officialName: '',
  englishName: '',
  school: '',
  campus: '',
  organizationType: '',
  organizationTypeOther: '',
  representativeName: '',
  representativePhone: '',
  representativeEmail: '',
  totalMembers: '',
  activeMembers: '',
  introduction: '',
  activityHistory: '',
  instagramUrl: '',
  youtubeUrl: '',
  blogUrl: '',
  websiteUrl: '',
  portfolioUrl: '',
  campusBridgeCertificateUrl: '',
  motivationReason: '',
  expectedOutcomes: [],
  expectedOutcomeOther: '',
};

const requiredTextFields = [
  ['officialName', '동아리/학회명을 입력해주세요.'],
  ['school', '소속 학교를 입력해주세요.'],
  ['campus', '캠퍼스 위치를 입력해주세요.'],
  ['representativeName', '대표자 이름을 입력해주세요.'],
  ['representativePhone', '대표자 연락처를 입력해주세요.'],
  ['representativeEmail', '대표자 이메일을 입력해주세요.'],
  ['totalMembers', '총 회원 수를 입력해주세요.'],
  ['activeMembers', '실제 참여 인원 수를 입력해주세요.'],
  ['introduction', '단체 소개를 입력해주세요.'],
  ['activityHistory', '주요 활동 이력을 입력해주세요.'],
  ['motivationReason', '지원 이유를 입력해주세요.'],
];

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isValidUrl = (value) => /^https?:\/\/.+/i.test(value);

function validateValues(values) {
  const nextErrors = requiredTextFields.reduce((errors, [field, message]) => {
    if (!String(values[field]).trim()) {
      errors[field] = message;
    }

    return errors;
  }, {});

  if (!values.organizationType) {
    nextErrors.organizationType = '단체 유형을 선택해주세요.';
  }

  if (values.organizationType === '기타' && !values.organizationTypeOther.trim()) {
    nextErrors.organizationTypeOther = '기타 단체 유형을 구체적으로 입력해주세요.';
  }

  if (values.representativeEmail && !isValidEmail(values.representativeEmail.trim())) {
    nextErrors.representativeEmail = '올바른 이메일 형식으로 입력해주세요.';
  }

  const totalMembers = Number(values.totalMembers);
  const activeMembers = Number(values.activeMembers);

  if (values.totalMembers && (!Number.isInteger(totalMembers) || totalMembers < 1)) {
    nextErrors.totalMembers = '1명 이상의 숫자로 입력해주세요.';
  }

  if (values.activeMembers && (!Number.isInteger(activeMembers) || activeMembers < 1)) {
    nextErrors.activeMembers = '1명 이상의 숫자로 입력해주세요.';
  }

  if (
    Number.isInteger(totalMembers) &&
    Number.isInteger(activeMembers) &&
    activeMembers > totalMembers
  ) {
    nextErrors.activeMembers = '실제 참여 인원은 총 회원 수보다 클 수 없습니다.';
  }

  linkFields.forEach(([field, label]) => {
    const value = values[field].trim();
    if (value && !isValidUrl(value)) {
      nextErrors[field] = `${label}은 http:// 또는 https://로 시작해야 합니다.`;
    }
  });

  if (values.motivationReason.trim().length > 150) {
    nextErrors.motivationReason = '지원 이유는 150자 이내로 작성해주세요.';
  }

  if (values.expectedOutcomes.length === 0) {
    nextErrors.expectedOutcomes = '기대하는 항목을 1개 이상 선택해주세요.';
  }

  if (values.expectedOutcomes.includes('기타') && !values.expectedOutcomeOther.trim()) {
    nextErrors.expectedOutcomeOther = '기타 기대 항목을 구체적으로 입력해주세요.';
  }

  return nextErrors;
}

const formatSubmittedAt = (createdAt) => {
  if (!createdAt) {
    return '접수일 미정';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(createdAt));
};

const getInitialValues = () => {
  const clubProfile = getStudentClubProfile();

  return {
    ...initialValues,
    officialName: clubProfile?.clubName || '',
    school: clubProfile?.university || '',
    representativeName: clubProfile?.owner || '',
    introduction: clubProfile?.description || '',
  };
};

const createProjectPlaceholder = (projectId) =>
  projectId
    ? {
        id: projectId,
        title: '선택한 공고',
        startupName: '스타트업',
      }
    : null;

export default function StudentApplicationPage() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId') || '';
  const [values, setValues] = useState(getInitialValues);
  const [errors, setErrors] = useState({});
  const [session, setSession] = useState(null);
  const [accountType, setAccountType] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authNotice, setAuthNotice] = useState('');
  const [hasClubProfile] = useState(() => hasStudentClubProfile());
  const [projectState, setProjectState] = useState({
    project: createProjectPlaceholder(projectId),
    isLoading: false,
    error: null,
  });
  const [submittedApplication, setSubmittedApplication] = useState(null);
  const isSubmitted = Boolean(submittedApplication);
  const isMissingProject = !projectId;
  const isAuthenticated = Boolean(session);
  const isStartupAccount = accountType === 'startup';
  const isBlocked =
    !isAuthenticated ||
    isStartupAccount ||
    !hasClubProfile ||
    isMissingProject;

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const result = await getCurrentSession();

      if (!isMounted) {
        return;
      }

      setSession(result.session);
      setAccountType(result.session?.user?.user_metadata?.account_type || null);
      setIsAuthLoading(false);

      const nextAccountType = await getAccountType(result.session);

      if (isMounted) {
        setAccountType(nextAccountType);
      }
    }

    loadSession();
    const unsubscribe = subscribeToAuthChanges(async (nextSession) => {
      setSession(nextSession);
      setAccountType(nextSession?.user?.user_metadata?.account_type || null);
      setIsAuthLoading(false);

      const nextAccountType = await getAccountType(nextSession);
      setAccountType(nextAccountType);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!projectId) {
      setSubmittedApplication(null);
      setProjectState({
        project: null,
        isLoading: false,
        error: null,
      });
      return;
    }

    let isMounted = true;
    setProjectState({
      project: createProjectPlaceholder(projectId),
      isLoading: true,
      error: null,
    });

    async function loadProject() {
      const result = await fetchProjectById(projectId);

      if (!isMounted) {
        return;
      }

      setProjectState({
        project: result.project || createProjectPlaceholder(projectId),
        isLoading: false,
        error: result.error,
      });

      const nextProject = result.project || createProjectPlaceholder(projectId);
      const application = await getStudentApplicationByProjectId(projectId, nextProject);

      if (isMounted) {
        setSubmittedApplication(application);
      }
    }

    loadProject();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const completedRequiredCount = useMemo(() => {
    const textCount = requiredTextFields.filter(([field]) => String(values[field]).trim()).length;
    const organizationTypeCount = values.organizationType ? 1 : 0;
    const expectedOutcomeCount = values.expectedOutcomes.length > 0 ? 1 : 0;

    return textCount + organizationTypeCount + expectedOutcomeCount;
  }, [values]);

  const totalRequiredCount = requiredTextFields.length + 2;
  const motivationLength = values.motivationReason.trim().length;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitted || isBlocked) {
      return;
    }

    const nextErrors = validateValues(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const createdApplication = await createStudentApplication(
      values,
      projectState.project || createProjectPlaceholder(projectId),
      { session },
    );
    setSubmittedApplication(createdApplication);
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out.', error);
    } finally {
      setSession(null);
      setAccountType(null);
    }
  };

  const openAuthModal = (notice = '') => {
    setAuthNotice(notice);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthNotice('');
  };

  const heroDescription = (() => {
    if (!isAuthenticated) {
      return '로그인 후 동아리 정보를 등록해야 공고 지원서를 작성할 수 있습니다.';
    }

    if (isStartupAccount) {
      return '스타트업 계정은 공고 지원서를 작성할 수 없습니다. 동아리/학회 계정으로 이용해주세요.';
    }

    if (!hasClubProfile) {
      return '학생 대시보드에서 동아리 정보를 먼저 등록해야 공고 지원서를 작성할 수 있습니다.';
    }

    if (isMissingProject) {
      return '지원할 공고를 먼저 선택하면 해당 공고 전용 지원서를 작성할 수 있습니다.';
    }

    if (isSubmitted) {
      return '이 공고에 대한 지원서 접수가 완료되었습니다. 다른 공고는 각각 별도로 지원할 수 있습니다.';
    }

    return '캠페인에 참여할 동아리의 기본 정보, 활동 이력, 지원 동기를 한 번에 정리해 기업 검토자가 빠르게 판단할 수 있게 합니다.';
  })();

  const renderBlockedPanel = () => {
    if (!isAuthenticated) {
      return (
        <section className="section-wrap student-application-complete">
          <div className="complete-panel">
            <p className="eyebrow">Login Required</p>
            <h2>로그인 후 지원할 수 있습니다</h2>
            <p>로그아웃 상태에서는 공고 보기만 가능합니다. 동아리/학회 계정으로 로그인한 뒤 지원해주세요.</p>
            <div className="complete-actions">
              <button
                className="button button-primary button-large"
                type="button"
                onClick={() => openAuthModal(homepageCopy.auth.studentLoginRequiredMessage)}
              >
                로그인하기
              </button>
              <Link className="button button-secondary button-large" to="/projects">
                공고 목록으로 돌아가기
              </Link>
            </div>
          </div>
        </section>
      );
    }

    if (isStartupAccount) {
      return (
        <section className="section-wrap student-application-complete">
          <div className="complete-panel">
            <p className="eyebrow">Student Account Required</p>
            <h2>동아리 계정만 지원할 수 있습니다</h2>
            <p>스타트업 계정은 공고를 등록하고 관리하는 용도입니다. 공고 지원은 동아리/학회 계정으로 진행해주세요.</p>
            <div className="complete-actions">
              <button className="button button-primary button-large" type="button" onClick={handleLogout}>
                스타트업 계정 로그아웃
              </button>
              <Link className="button button-secondary button-large" to="/projects">
                공고 목록으로 돌아가기
              </Link>
            </div>
          </div>
        </section>
      );
    }

    if (!hasClubProfile) {
      return (
        <section className="section-wrap student-application-complete">
          <div className="complete-panel">
            <p className="eyebrow">Profile Required</p>
            <h2>동아리 정보를 먼저 작성해주세요</h2>
            <p>
              대시보드에 동아리명, 소속 대학, 대표자, 소개를 등록한 뒤 공고 지원서를 작성할 수 있습니다.
            </p>
            <div className="complete-actions">
              <Link className="button button-primary button-large" to="/dashboard/student">
                대시보드에서 정보 작성
              </Link>
              <Link className="button button-secondary button-large" to="/projects">
                공고 목록으로 돌아가기
              </Link>
            </div>
          </div>
        </section>
      );
    }

    if (isMissingProject) {
      return (
        <section className="section-wrap student-application-complete">
          <div className="complete-panel">
            <p className="eyebrow">Project Required</p>
            <h2>지원할 공고를 먼저 선택해주세요</h2>
            <p>
              지원서는 공고별로 따로 접수됩니다. 공고 상세 화면에서 지원서 작성하기를 눌러주세요.
            </p>
            <div className="complete-actions">
              <Link className="button button-primary button-large" to="/projects">
                공고 찾기
              </Link>
              <Link className="button button-secondary button-large" to="/dashboard/student">
                학생 대시보드로 이동
              </Link>
            </div>
          </div>
        </section>
      );
    }

    return null;
  };

  return (
    <div className="app-shell">
      <Header
        copy={homepageCopy}
        isAuthenticated={isAuthenticated}
        userEmail={session?.user?.email}
        accountType={accountType}
        onLoginClick={() => openAuthModal()}
        onLogoutClick={handleLogout}
      />
      <main className="post-create-page student-application-page">
        <section className="post-create-hero section-wrap">
          <div>
            <p className="eyebrow">Student / Club Application</p>
            <h1>학생·동아리 캠페인 지원서</h1>
            <p>{heroDescription}</p>
          </div>
          <div className="required-progress" aria-label="필수 입력 진행률">
            <strong>
              {isAuthLoading
                ? '확인 중'
                : isSubmitted
                ? '완료'
                : `${completedRequiredCount}/${totalRequiredCount}`}
            </strong>
            <span>{isSubmitted ? '지원서 제출' : projectState.project ? projectState.project.title : '필수 항목 완료'}</span>
          </div>
        </section>

        {isAuthLoading ? (
          <section className="section-wrap student-application-complete">
            <div className="project-detail-status" role="status">
              지원 가능 상태를 확인하는 중입니다.
            </div>
          </section>
        ) : isBlocked ? (
          renderBlockedPanel()
        ) : isSubmitted ? (
          <section className="section-wrap student-application-complete">
            <div className="complete-panel">
              <p className="eyebrow">Application Submitted</p>
              <h2>지원이 완료되었습니다</h2>
              <p>
                이 공고에 대한 지원서가 접수되었습니다. 같은 공고에는 다시 제출할 수 없고,
                다른 공고는 공고 상세에서 별도로 지원할 수 있습니다.
              </p>
              <dl className="student-application-receipt" aria-label="지원서 접수 정보">
                <div>
                  <dt>지원 공고</dt>
                  <dd>{submittedApplication.project?.title || projectState.project?.title}</dd>
                </div>
                <div>
                  <dt>접수 ID</dt>
                  <dd>{submittedApplication.id}</dd>
                </div>
                <div>
                  <dt>단체명</dt>
                  <dd>{submittedApplication.club.officialName}</dd>
                </div>
                <div>
                  <dt>접수일</dt>
                  <dd>{formatSubmittedAt(submittedApplication.createdAt)}</dd>
                </div>
              </dl>
              <div className="complete-actions">
                <Link className="button button-primary button-large" to="/dashboard/student">
                  학생 대시보드로 이동
                </Link>
                <Link className="button button-secondary button-large" to="/projects">
                  공고 더 보기
                </Link>
              </div>
            </div>
          </section>
        ) : (
        <section className="post-create-layout section-wrap">
          <form className="post-create-form" onSubmit={handleSubmit}>
            <section className="post-form-section" aria-labelledby="application-basic-title">
              <div className="form-section-heading">
                <span>01</span>
                <div>
                  <h2 id="application-basic-title">기본 정보</h2>
                  <p>동아리와 대표 연락 담당자의 핵심 정보를 표준화해서 수집합니다.</p>
                </div>
              </div>

              <div className="form-grid two-columns">
                <FormField id="officialName" label="동아리/학회명 (공식)" required error={errors.officialName}>
                  <input
                    id="officialName"
                    name="officialName"
                    value={values.officialName}
                    placeholder="예: 연세대 마케팅학회 PRISM"
                    onChange={handleChange}
                  />
                </FormField>

                <FormField id="englishName" label="동아리/학회명 (영문)" hint="선택 항목입니다.">
                  <input
                    id="englishName"
                    name="englishName"
                    value={values.englishName}
                    placeholder="예: PRISM"
                    onChange={handleChange}
                  />
                </FormField>

                <FormField id="school" label="소속 학교" required error={errors.school}>
                  <input
                    id="school"
                    name="school"
                    value={values.school}
                    placeholder="예: 연세대학교"
                    onChange={handleChange}
                  />
                </FormField>

                <FormField id="campus" label="캠퍼스 위치" required error={errors.campus}>
                  <input
                    id="campus"
                    name="campus"
                    value={values.campus}
                    placeholder="예: 서울캠퍼스"
                    onChange={handleChange}
                  />
                </FormField>

                <FormField id="representativeName" label="대표자 이름" required error={errors.representativeName}>
                  <input
                    id="representativeName"
                    name="representativeName"
                    value={values.representativeName}
                    placeholder="예: 김캠퍼스"
                    onChange={handleChange}
                  />
                </FormField>

                <FormField
                  id="representativePhone"
                  label="대표자 연락처"
                  required
                  error={errors.representativePhone}
                  hint="국제 형식 권장: +82-10-1234-5678"
                >
                  <input
                    id="representativePhone"
                    name="representativePhone"
                    value={values.representativePhone}
                    placeholder="+82-10-1234-5678"
                    onChange={handleChange}
                  />
                </FormField>

                <FormField id="representativeEmail" label="대표자 이메일" required error={errors.representativeEmail}>
                  <input
                    id="representativeEmail"
                    name="representativeEmail"
                    type="email"
                    value={values.representativeEmail}
                    placeholder="club@example.com"
                    onChange={handleChange}
                  />
                </FormField>

                <FormField id="totalMembers" label="총 회원 수" required error={errors.totalMembers}>
                  <input
                    id="totalMembers"
                    name="totalMembers"
                    type="number"
                    min="1"
                    value={values.totalMembers}
                    placeholder="예: 42"
                    onChange={handleChange}
                  />
                </FormField>

                <FormField id="activeMembers" label="실제 참여 인원 수" required error={errors.activeMembers}>
                  <input
                    id="activeMembers"
                    name="activeMembers"
                    type="number"
                    min="1"
                    value={values.activeMembers}
                    placeholder="예: 12"
                    onChange={handleChange}
                  />
                </FormField>
              </div>

              <fieldset className="choice-fieldset">
                <legend>
                  단체 유형 <em>필수</em>
                </legend>
                <div className="choice-grid">
                  {organizationTypeOptions.map((option) => (
                    <label className="choice-card" key={option}>
                      <input
                        type="radio"
                        name="organizationType"
                        value={option}
                        checked={values.organizationType === option}
                        onChange={handleChange}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
                {errors.organizationType ? (
                  <span className="form-error" role="alert">
                    {errors.organizationType}
                  </span>
                ) : null}
              </fieldset>

              {values.organizationType === '기타' ? (
                <FormField id="organizationTypeOther" label="기타 단체 유형" required error={errors.organizationTypeOther}>
                  <input
                    id="organizationTypeOther"
                    name="organizationTypeOther"
                    value={values.organizationTypeOther}
                    placeholder="예: 영상 제작 연합 동아리"
                    onChange={handleChange}
                  />
                </FormField>
              ) : null}
            </section>

            <section className="post-form-section" aria-labelledby="application-profile-title">
              <div className="form-section-heading">
                <span>02</span>
                <div>
                  <h2 id="application-profile-title">단체/조직 프로필</h2>
                  <p>주요 활동과 과거 작업 링크를 통해 캠페인 적합성을 보여주세요.</p>
                </div>
              </div>

              <FormField id="introduction" label="단체 소개" required error={errors.introduction}>
                <textarea
                  id="introduction"
                  name="introduction"
                  value={values.introduction}
                  placeholder="주요 활동, 핵심 강점, 콘텐츠 제작·캠퍼스 행사 운영·SNS 운영 경험 등을 작성해주세요."
                  rows="5"
                  onChange={handleChange}
                />
              </FormField>

              <FormField
                id="activityHistory"
                label="주요 활동 이력"
                required
                error={errors.activityHistory}
                hint="가독성을 위해 불릿 포인트 사용을 권장합니다."
              >
                <textarea
                  id="activityHistory"
                  name="activityHistory"
                  value={values.activityHistory}
                  placeholder={'예:\n- 교내 축제 브랜드 부스 운영\n- 스타트업 SNS 캠페인 협업\n- 공모전 수상 및 장기 SNS 채널 운영'}
                  rows="6"
                  onChange={handleChange}
                />
              </FormField>

              <div className="form-grid two-columns">
                {linkFields.map(([field, label, placeholder]) => (
                  <FormField id={field} label={label} error={errors[field]} key={field}>
                    <input
                      id={field}
                      name={field}
                      type="url"
                      value={values[field]}
                      placeholder={placeholder}
                      onChange={handleChange}
                    />
                  </FormField>
                ))}
              </div>
            </section>

            <section className="post-form-section" aria-labelledby="application-motivation-title">
              <div className="form-section-heading">
                <span>03</span>
                <div>
                  <h2 id="application-motivation-title">지원 동기</h2>
                  <p>이번 캠페인에 지원하는 이유와 기대하는 경험을 선택해주세요.</p>
                </div>
              </div>

              <FormField
                id="motivationReason"
                label="이번 캠페인에 지원한 이유"
                required
                error={errors.motivationReason}
                hint={`150자 이내로 작성해주세요. 현재 ${motivationLength}/150자`}
              >
                <textarea
                  id="motivationReason"
                  name="motivationReason"
                  maxLength="150"
                  value={values.motivationReason}
                  placeholder="캠페인 목표와의 연관성 또는 동아리만의 강점을 짧게 작성해주세요."
                  rows="4"
                  onChange={handleChange}
                />
              </FormField>

              <fieldset className="choice-fieldset">
                <legend>
                  이번 캠페인을 통해 얻고 싶은 것 <em>필수</em>
                </legend>
                <div className="choice-grid">
                  {expectedOutcomeOptions.map((option) => (
                    <label className="choice-card" key={option}>
                      <input
                        type="checkbox"
                        name="expectedOutcomes"
                        value={option}
                        checked={values.expectedOutcomes.includes(option)}
                        onChange={handleCheckboxGroupChange}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
                {errors.expectedOutcomes ? (
                  <span className="form-error" role="alert">
                    {errors.expectedOutcomes}
                  </span>
                ) : null}
              </fieldset>

              {values.expectedOutcomes.includes('기타') ? (
                <FormField id="expectedOutcomeOther" label="기타 기대 항목" required error={errors.expectedOutcomeOther}>
                  <input
                    id="expectedOutcomeOther"
                    name="expectedOutcomeOther"
                    value={values.expectedOutcomeOther}
                    placeholder="예: 정규 채용 연계 가능성 확인"
                    onChange={handleChange}
                  />
                </FormField>
              ) : null}

              <button type="submit" className="button button-primary button-large submit-button">
                지원서 제출하기
              </button>
            </section>
          </form>

          <aside className="preview-column" aria-label="지원서 작성 안내">
            <div className="post-preview-card student-application-guide">
              <p className="preview-label">작성 체크리스트</p>
              <h2>기업이 빠르게 비교할 수 있는 지원서를 만드세요</h2>
              <ul>
                <li>단체 규모와 실제 참여 인원을 명확히 입력하세요.</li>
                <li>활동 이력은 불릿으로 정리하면 검토 속도가 빨라집니다.</li>
                <li>포트폴리오와 SNS 링크는 http:// 또는 https://로 시작해야 합니다.</li>
                <li>지원 동기는 150자 안에서 캠페인과의 적합성을 강조하세요.</li>
              </ul>
              <div className="student-application-privacy">
                <strong>개인정보 안내</strong>
                <p>이름, 전화번호, 이메일은 검토 담당자 확인과 후속 안내 목적으로만 사용됩니다.</p>
              </div>
            </div>
          </aside>
        </section>
        )}
      </main>
      <Footer copy={homepageCopy.footer} serviceName={homepageCopy.serviceName} />
      <AuthModal
        copy={homepageCopy.auth}
        isOpen={isAuthModalOpen}
        notice={authNotice}
        onClose={closeAuthModal}
      />
    </div>
  );
}
