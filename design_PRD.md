**디자인 PRD**

제품명: `Campus Bridge`

목적: 스타트업과 대학 동아리/학회를 연결해 캠퍼스 마케팅 프로젝트를 탐색, 지원, 운영할 수 있는 플랫폼의 메인페이지를 제공한다.

대상 사용자:
- 스타트업 담당자: 대학생 타깃 마케팅 프로젝트를 빠르게 시작하고 싶은 사용자
- 대학 동아리/학회 구성원: 기업 협업 프로젝트를 찾고 활동 이력을 남기고 싶은 사용자

핵심 사용자 흐름:
1. 사용자는 메인페이지에서 서비스 목적을 이해한다.
2. Hero 바로 아래에서 모집 중인 공고를 확인한다.
3. 검색창으로 관심 분야, 스타트업명, 프로젝트명을 검색한다.
4. 공고 카드를 클릭해 `/projects/[id]` 상세 페이지로 이동한다.
5. 더 많은 공고는 `더보기` 버튼으로 `/projects`에서 확인한다.
6. 스타트업 사용자는 우측 상단 `스타트업용` 버튼으로 이동한다.
7. 로그인 후에만 `동아리/학회용` 메뉴가 노출된다.

**페이지 구조**
- Header
  - 좌측: `Campus Bridge` 브랜드
  - 우측: `로그인`, `스타트업용`
  - `공고 등록하기`는 메인에서 제거
  - `동아리/학회용`은 로그인 이후 노출

- Hero
  - 핵심 문구: “스타트업과 대학 동아리/학회를 연결하는 캠퍼스 마케팅 플랫폼”
  - 설명 문구: “공고 등록부터 동아리 매칭, 미션 운영, 성과 리포트까지 한 번에 관리하세요.”
  - CTA: `스타트업으로 시작하기`
  - 우측 패널: 공고 등록, 지원 매칭, 미션 운영, 성과 확인 흐름 요약

- Projects
  - Hero 바로 아래 배치
  - 검색창 제공
  - 공고 카드 6개 mock data 표시
  - 검색 결과 개수 표시
  - 결과 없음 메시지 표시
  - 하단 `더보기` 버튼으로 `/projects` 이동

- Problem / Value
  - 스타트업 문제
  - 학생 조직 문제
  - Campus Bridge 해결 방식

- How It Works
  - 스타트업 공고 등록
  - 동아리/학회 지원
  - 미션 수행 및 결과 제출
  - 성과 리포트 및 인증서 발급

- User Type CTA
  - 스타트업용: `스타트업용으로 이동`
  - 동아리/학회용: `공고 확인하기`

- Footer
  - 서비스명
  - MVP 설명

**비주얼 방향**
- 톤: 밝고 신뢰감 있는 B2B SaaS 스타일
- 배경: 흰색 중심, 일부 섹션에 아주 연한 blue/indigo gradient
- 카드: 흰색 카드, 둥근 모서리, 얕은 그림자
- 분위기: 발표용으로 안정적이고 읽기 쉬운 화면
- 애니메이션: hover 정도의 최소 인터랙션

**디자인 토큰**
- Primary Blue: `#2563eb`
- Primary Blue Hover: `#1d4ed8`
- Indigo: `#4f46e5`
- Indigo Light: `#eef2ff`
- Background: `#ffffff`, `#f8fafc`
- Border: `#e2e8f0`
- Text Strong: `#0f172a`
- Text Body: `#334155`
- Text Muted: `#64748b`

Typography:
- Font stack: `Inter`, `Pretendard`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif`
- Hero title: `clamp(38px, 6vw, 66px)`
- Section title: `clamp(28px, 4vw, 42px)`
- Body: `15px ~ 20px`
- Letter spacing: `0`

Layout:
- Content max width: `1120px`
- Header max width: `1180px`
- Section vertical spacing: `84px`
- Card radius: `20px`
- Button radius: `12px ~ 14px`
- Card grid: desktop 3 columns, tablet 2 columns, mobile 1 column

**검색 기능 요구사항**
- 검색 대상:
  - 스타트업명
  - 프로젝트 제목
  - 분야 태그
  - 활동 기간
  - 보상
  - 모집 상태
- 검색 방식:
  - 입력 즉시 클라이언트 필터링
  - 대소문자 구분 없음
  - 검색어가 없으면 전체 공고 표시
- 빈 상태:
  - “검색 결과가 없습니다. 다른 키워드로 다시 찾아보세요.”
- 결과 카운트:
  - `{검색 결과 수} / {전체 공고 수}개 공고`

**반응형 요구사항**
- Desktop:
  - Header 3영역 배치
  - Hero 2열
  - 공고 카드 3열
- Tablet:
  - 주요 카드 2열
  - Hero 1열 전환
- Mobile:
  - Header 세로 정렬
  - 버튼 full width
  - 검색창과 결과 카운트 세로 정렬
  - 공고 카드 1열

**연결 정책**
- 실제 미구현 페이지는 구현하지 않고 링크만 연결
- 공고 상세: `/projects/[id]`
- 전체 공고: `/projects`
- 스타트업용: `/startup`
- 로그인: `/login`
- 동아리/학회용: `/clubs`

**현재 구현 파일**
- `src/App.jsx`
- `src/components/Header.jsx`
- `src/components/HeroSection.jsx`
- `src/components/FeaturedProjectsSection.jsx`
- `src/components/ValueSection.jsx`
- `src/components/HowItWorksSection.jsx`
- `src/components/UserTypeCTASection.jsx`
- `src/components/Footer.jsx`
- `src/components/SectionHeading.jsx`
- `src/data/homepage.js`
- `src/styles.css`