export const homepageCopy = {
  serviceName: 'Campus Bridge',
  navigation: [
    { label: '공고 둘러보기', href: '/projects' },
    { label: '스타트업용', href: '/startup' },
    { label: '동아리/학회용', href: '/clubs' },
  ],
  headerActions: [
    { label: '공고 등록하기', href: '/projects/new', variant: 'primary' },
    { label: '로그인', href: '/login', variant: 'secondary' },
  ],
  hero: {
    eyebrow: 'Campus Marketing Platform',
    title: '스타트업과 대학 동아리/학회를 연결하는 캠퍼스 마케팅 플랫폼',
    description: '공고 등록부터 동아리 매칭, 미션 운영, 성과 리포트까지 한 번에 관리하세요.',
    actions: [
      { label: '공고 둘러보기', href: '/projects', variant: 'primary' },
      { label: '스타트업으로 시작하기', href: '/startup', variant: 'secondary' },
    ],
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
      buttonLabel: '공고 등록하기',
      href: '/projects/new',
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
};

export const featuredProjects = [
  {
    id: 'early-user-interview',
    startupName: 'Looply',
    title: '대학생 초기 유저 인터뷰 및 온보딩 캠페인',
    tags: ['앱 서비스', '리서치', '온보딩'],
    period: '4주',
    reward: '팀 활동비 80만원',
    status: '모집중',
  },
  {
    id: 'campus-sns-launch',
    startupName: 'Notedrop',
    title: '캠퍼스 SNS 숏폼 콘텐츠 런칭 프로젝트',
    tags: ['콘텐츠', 'SNS', '브랜딩'],
    period: '6주',
    reward: '활동비 120만원',
    status: '모집중',
  },
  {
    id: 'fintech-survey',
    startupName: 'Paytiny',
    title: '대학생 소비 패턴 설문 및 서비스 피드백',
    tags: ['핀테크', '설문', 'UX'],
    period: '3주',
    reward: '팀 활동비 60만원',
    status: '마감임박',
  },
  {
    id: 'ai-study-tool',
    startupName: 'StudyPilot',
    title: 'AI 학습 도구 체험단 운영 및 후기 수집',
    tags: ['AI', '교육', '체험단'],
    period: '5주',
    reward: '활동비 100만원',
    status: '모집중',
  },
  {
    id: 'local-pop-up',
    startupName: 'GroundKit',
    title: '지역 기반 팝업 행사 홍보 서포터즈',
    tags: ['오프라인', '행사', '홍보'],
    period: '2주',
    reward: '성과 보너스 별도',
    status: '신규',
  },
  {
    id: 'b2b-beta-test',
    startupName: 'Teamflow',
    title: '대학생 팀 협업 SaaS 베타 테스트',
    tags: ['SaaS', '협업툴', '테스트'],
    period: '4주',
    reward: '활동비 70만원',
    status: '모집중',
  },
];
