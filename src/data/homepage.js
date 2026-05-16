export const homepageCopy = {
  serviceName: 'Campus Bridge',
  navigation: [],
  authenticatedNavigation: [],
  headerActions: [
    { label: '로그인', variant: 'secondary', type: 'auth' },
    { label: '스타트업용', href: '/dashboard/company', variant: 'primary', type: 'startup' },
  ],
  hero: {
    title: '스타트업과 대학 동아리/학회를 연결하는 캠퍼스 마케팅 플랫폼',
    description: '공고 등록부터 동아리 매칭, 미션 운영, 성과 리포트까지 한 번에 관리하세요.',
    actions: [
      {
        label: '스타트업으로 시작하기',
        href: '/dashboard/company',
        variant: 'primary',
        type: 'startup',
      },
    ],
  },
  valueSection: {
    eyebrow: 'Problem / Value',
    title: '양쪽 모두의 마케팅·협업 비용을 낮춥니다',
    description:
      '스타트업은 캠퍼스 캠페인을 빠르게 시작하고, 동아리·학회는 신뢰할 수 있는 기업 프로젝트를 만날 수 있습니다.',
  },
  howItWorksSection: {
    eyebrow: 'How It Works',
    title: '공고부터 성과 리포트까지 네 단계',
    description: '메인에서는 전체 흐름만 안내하고, 상세 기능은 이후 화면에서 연결합니다.',
  },
  values: [
    {
      label: '스타트업의 문제',
      title: '대학생 타깃 마케팅은 필요하지만 운영 부담이 큽니다',
      description:
        '공고 작성, 동아리 선발, 미션 관리, 성과 집계까지 직접 하기엔 인력과 시간이 부족합니다.',
    },
    {
      label: '학생 조직의 문제',
      title: '기업 협업 기회와 공식 활동 기록을 남기기 어렵습니다',
      description:
        '신뢰할 만한 프로젝트를 찾기 어렵고, 수행한 성과를 팀 이력·인증으로 정리하기도 쉽지 않습니다.',
    },
    {
      label: 'Campus Bridge 해결 방식',
      title: '탐색·지원·운영·리포트를 한 플랫폼에서 이어 줍니다',
      description:
        '공고 노출과 검색, 지원 매칭, 미션 운영, 성과 리포트까지 끊기지 않는 흐름으로 캠퍼스 캠페인을 관리합니다.',
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
      href: '/dashboard/company',
      type: 'startup',
    },
    {
      audience: '동아리/학회용',
      title: '실무 협업 경험을 프로젝트로 남기세요',
      description: '팀의 전공, 관심사, 실행력을 살릴 수 있는 기업 프로젝트를 확인하고 지원하세요.',
      buttonLabel: '지원서 작성하기',
      href: '/student/apply',
    },
  ],
  footer: {
    description:
      'Campus Bridge는 스타트업과 대학 동아리·학회를 연결해 캠퍼스 마케팅 프로젝트를 탐색·지원·운영할 수 있도록 돕는 MVP입니다.',
    badge: 'Hackathon MVP',
  },
  projects: {
    sectionEyebrow: 'Projects',
    sectionTitle: '모집 중인 공고',
    sectionDescription:
      '관심 분야·스타트업명·프로젝트명으로 검색하고, 카드를 눌러 공고 상세로 이동해 보세요.',
    searchLabel: '공고 검색',
    searchPlaceholder: '스타트업명, 프로젝트명, 분야, 기간, 보상, 모집 상태 등 검색',
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
    loginRequiredMessage: '스타트업 대시보드는 로그인 후 이용할 수 있습니다.',
    studentLoginRequiredMessage: '학생 대시보드는 로그인 후 이용할 수 있습니다.',
    startupOnlyMessage: '스타트업용 계정이 아닙니다.',
    studentOnlyMessage: '동아리/학회용 계정이 아닙니다.',
    loginSuccess: '로그인되었습니다.',
    signupSuccess: '회원가입 확인 메일을 확인해 주세요.',
  },
};
