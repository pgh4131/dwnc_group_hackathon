export const homepageCopy = {
  serviceName: 'Campus Bridge',
  navigation: [],
  authenticatedNavigation: [{ label: '동아리/학회용', href: '/clubs' }],
  headerActions: [
    { label: '로그인', variant: 'secondary', type: 'auth' },
    { label: '스타트업용', href: '/startup', variant: 'primary', type: 'startup' },
  ],
  hero: {
    eyebrow: 'Campus Marketing Platform',
    title: '스타트업과 대학 동아리/학회를 연결하는 캠퍼스 마케팅 플랫폼',
    description: '공고 등록부터 동아리 매칭, 미션 운영, 성과 리포트까지 한 번에 관리하세요.',
    actions: [{ label: '스타트업으로 시작하기', href: '/startup', variant: 'primary' }],
    stats: [
      { value: '4단계', label: '운영 프로세스' },
      { value: '6개', label: '샘플 캠페인' },
      { value: 'MVP', label: '해커톤 발표용 구조' },
    ],
  },
  values: [
    {
      label: '스타트업의 문제',
      title: '대학생 유저 확보는 필요하지만 앰배서더 운영은 부담됩니다',
      description:
        '직접 모집하고 관리하려면 공고 작성, 선발, 미션 관리, 결과 확인까지 많은 시간이 필요합니다.',
    },
    {
      label: '학생 조직의 문제',
      title: '외부 기업과 협업할 기회와 활동 기록이 부족합니다',
      description:
        '동아리와 학회는 기업 프로젝트를 찾기 어렵고, 수행한 활동을 공식 이력으로 남기기도 쉽지 않습니다.',
    },
    {
      label: '해결 방식',
      title: '기존 동아리/학회와 스타트업을 연결하고 활동 운영까지 지원합니다',
      description:
        '공고 등록, 지원, 미션 수행, 진행률 보고, 성과 확인, 인증서 발급까지 하나의 흐름으로 이어집니다.',
    },
  ],
  steps: [
    {
      title: '스타트업 공고 등록',
      description: '타깃 학교, 활동 분야, 기간, 보상 조건을 정리해 프로젝트 공고를 등록합니다.',
    },
    {
      title: '동아리/학회 지원',
      description: '학생 조직이 공고를 확인하고 팀 소개와 실행 계획을 제출합니다.',
    },
    {
      title: '미션 수행 및 결과 제출',
      description: '캠페인 미션을 수행하고 진행률, 산출물, 현장 반응을 공유합니다.',
    },
    {
      title: '성과 리포트 및 인증서 발급',
      description: '기업은 성과를 확인하고 학생 조직은 협업 경험을 인증서로 남깁니다.',
    },
  ],
  userCtas: [
    {
      audience: '스타트업용',
      title: '캠퍼스 마케팅을 빠르게 시작하세요',
      description: '검증된 학생 조직과 연결해 대학생 타깃 캠페인을 작게 시작하고 명확하게 관리하세요.',
      buttonLabel: '스타트업용으로 이동',
      href: '/startup',
    },
    {
      audience: '동아리/학회용',
      title: '실무 협업 경험을 프로젝트로 남기세요',
      description: '팀의 전공, 관심사, 실행력을 살릴 수 있는 기업 프로젝트를 확인하고 지원하세요.',
      buttonLabel: '공고 확인하기',
      href: '/projects',
    },
  ],
  footer: {
    description:
      'Campus Bridge는 스타트업과 대학 동아리/학회를 연결해 캠퍼스 마케팅 프로젝트를 운영하는 해커톤 MVP입니다.',
  },
  projects: {
    searchLabel: '프로젝트 검색',
    searchPlaceholder: '스타트업명, 분야, 프로젝트명을 검색하세요',
    emptyMessage: '검색 결과가 없습니다. 다른 키워드로 다시 찾아보세요.',
    noProjectsMessage: '등록된 공고가 없습니다. Supabase projects 테이블에 공고를 추가해 주세요.',
    loadingMessage: 'Supabase에서 공고를 불러오는 중입니다.',
    errorMessage: 'Supabase 공고 데이터를 불러오지 못했습니다. 테이블과 RLS 정책을 확인하세요.',
    moreLabel: '더보기',
    moreHref: '/projects',
  },
  auth: {
    title: 'Campus Bridge 시작하기',
    description: '이메일과 비밀번호로 로그인하거나 새 계정을 만들 수 있습니다.',
    loginTab: '로그인',
    signupTab: '회원가입',
    emailLabel: '이메일',
    passwordLabel: '비밀번호',
    accountTypeLabel: '회원 유형',
    emailPlaceholder: 'name@example.com',
    passwordPlaceholder: '비밀번호 6자 이상',
    accountTypes: [
      { value: 'general', label: '일반용', description: '동아리/학회 프로젝트 지원' },
      { value: 'startup', label: '스타트업용', description: '캠퍼스 마케팅 공고 운영' },
    ],
    loginButton: '로그인',
    signupButton: '회원가입',
    loadingLabel: '처리 중',
    closeLabel: '닫기',
    logoutLabel: '로그아웃',
    dashboardLabel: '대시보드',
    startupOnlyMessage: '스타트업용 계정이 아닙니다.',
    loginSuccess: '로그인되었습니다.',
    signupSuccess: '회원가입 확인 메일을 확인해 주세요.',
  },
};
