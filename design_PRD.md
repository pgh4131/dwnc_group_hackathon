# Campus Bridge Design PRD

## 1. 제품 개요

`Campus Bridge`는 스타트업과 대학 동아리/학회를 연결해 캠퍼스 마케팅 프로젝트를 탐색, 지원, 운영할 수 있게 돕는 B2B 플랫폼이다.

현재 구현 범위는 메인페이지, Supabase 기반 공고 조회, 공고 검색, Supabase Auth 기반 로그인/회원가입 모달이다.

## 2. 대상 사용자

- 스타트업 담당자: 대학생 타깃 마케팅 프로젝트를 시작하고 운영하려는 사용자
- 대학 동아리/학회 구성원: 기업 협업 프로젝트를 찾고 활동 이력을 남기려는 사용자

## 3. 핵심 사용자 흐름

1. 사용자는 메인페이지에서 서비스 목적과 프로젝트 운영 흐름을 이해한다.
2. Hero 바로 아래 공고 섹션에서 Supabase에 저장된 모집 공고를 확인한다.
3. 검색창으로 스타트업명, 프로젝트명, 태그, 기간, 보상, 모집 상태를 검색한다.
4. 공고 카드를 클릭해 `/projects/[id]` 상세 페이지로 이동한다.
5. 더 많은 공고는 `더보기` 버튼으로 `/projects`에서 확인한다.
6. `로그인` 버튼을 누르면 로그인/회원가입 모달이 열린다.
7. 로그인 이후에는 `동아리/학회용` 메뉴가 노출된다.
8. 스타트업 사용자는 우측 상단 `스타트업용` 버튼으로 이동한다.

## 4. 페이지 구조

### Header

- 좌측: `Campus Bridge` 브랜드
- 우측: `로그인` 또는 `로그아웃`, `스타트업용`
- 로그인 상태일 때 사용자 이메일을 표시한다.
- 로그인 상태일 때만 `동아리/학회용` 메뉴를 노출한다.
- `공고 등록하기`는 메인에서 노출하지 않는다.

### Auth Modal

- `로그인` 버튼 클릭 시 중앙 모달로 열린다.
- 모달 내부에서 `로그인` / `회원가입` 탭을 전환한다.
- 이메일과 비밀번호를 입력한다.
- 로그인은 Supabase `signInWithPassword`를 사용한다.
- 회원가입은 Supabase `signUp`을 사용한다.
- 로그인 성공 시 모달을 닫고 헤더 상태를 갱신한다.
- 회원가입 성공 시 확인 메시지를 표시한다.
- 인증 오류는 모달 내부 메시지로 표시한다.

### Hero

- 핵심 문구: `스타트업과 대학 동아리/학회를 연결하는 캠퍼스 마케팅 플랫폼`
- 설명 문구: `공고 등록부터 동아리 매칭, 미션 운영, 성과 리포트까지 한 번에 관리하세요.`
- CTA: `스타트업으로 시작하기`
- 우측 패널: 공고 등록, 지원 매칭, 미션 운영, 성과 확인 흐름 요약

### Projects

- Hero 바로 아래 배치한다.
- 공고 데이터는 Supabase `public.projects` 테이블에서만 조회한다.
- 로컬 mock 공고는 화면 데이터로 사용하지 않는다.
- 테이블이 없거나 RLS/Data API 설정이 잘못되면 오류 안내를 표시한다.
- 공고가 0개면 “등록된 공고가 없습니다” 빈 상태를 표시한다.
- 검색 결과가 0개면 검색 빈 상태를 표시한다.
- 하단 `더보기` 버튼은 `/projects`로 연결한다.

### Problem / Value

- 스타트업 문제: 대학생 유저 확보는 필요하지만 앰배서더 운영 부담이 큼
- 학생 조직 문제: 기업 협업 기회와 활동 기록이 부족함
- 해결 방식: 기존 동아리/학회와 스타트업을 연결하고 활동 운영까지 지원

### How It Works

1. 스타트업 공고 등록
2. 동아리/학회 지원
3. 미션 수행 및 결과 제출
4. 성과 리포트 및 인증서 발급

### User Type CTA

- 스타트업용: `스타트업용으로 이동`
- 동아리/학회용: `공고 확인하기`

### Footer

- 서비스명
- 해커톤 MVP 설명

## 5. Supabase 데이터 요구사항

### Projects Table

테이블명: `public.projects`

필드:

- `id`: text, primary key
- `startup_name`: text, not null
- `title`: text, not null
- `tags`: text[], not null
- `period`: text, not null
- `reward`: text, not null
- `status`: text, not null
- `created_at`: timestamptz

보안/접근:

- `anon`, `authenticated` role에 select 권한을 부여한다.
- RLS를 활성화한다.
- public read policy를 생성한다.

초기 더미데이터:

- `supabase/projects_seed.sql`에서 테이블 생성, 권한 설정, RLS policy, 더미 공고 4개 insert를 제공한다.
- 실제 Supabase 화면 표시를 위해 SQL Editor에서 해당 파일을 실행해야 한다.

### Frontend Mapping

Supabase row는 화면에서 다음 형태로 변환한다.

- `id`: `slug || id`
- `startupName`: `startup_name`
- `title`: `title`
- `tags`: `tags`
- `period`: `period`
- `reward`: `reward`
- `status`: `status`

## 6. Supabase Auth 요구사항

인증 방식:

- 이메일/비밀번호 로그인
- 이메일/비밀번호 회원가입
- 로그아웃
- 세션 유지 및 auth state change 구독

화면 반영:

- 비로그인: `로그인`, `스타트업용`
- 로그인: 사용자 이메일, `로그아웃`, `스타트업용`, `동아리/학회용`

오류 처리:

- 환경 변수 누락 시 인증 요청을 막고 오류를 표시한다.
- Supabase Auth 오류 메시지는 모달 내부에 표시한다.

## 7. 검색 기능 요구사항

검색 대상:

- 스타트업명
- 프로젝트 제목
- 분야 태그
- 활동 기간
- 보상
- 모집 상태

검색 방식:

- 입력 즉시 클라이언트 필터링
- 대소문자 구분 없음
- 검색어가 없으면 Supabase에서 불러온 전체 공고 표시

빈 상태:

- 공고 자체가 없을 때: `등록된 공고가 없습니다. Supabase projects 테이블에 공고를 추가해 주세요.`
- 검색 결과가 없을 때: `검색 결과가 없습니다. 다른 키워드로 다시 찾아보세요.`

결과 카운트:

- `{검색 결과 수} / {전체 공고 수}개 공고`

## 8. 비주얼 방향

- 톤: 밝고 신뢰감 있는 B2B SaaS 스타일
- 배경: 흰색 중심, 일부 섹션에 연한 blue/indigo gradient
- 카드: 흰색 카드, 둥근 모서리, 얕은 그림자
- 모달: 중앙 정렬, 반투명 backdrop, 흰색 패널
- 분위기: 발표용으로 안정적이고 읽기 쉬운 화면
- 애니메이션: hover와 focus 정도의 최소 인터랙션

## 9. 디자인 토큰

색상:

- Primary Blue: `#2563eb`
- Primary Blue Hover: `#1d4ed8`
- Indigo: `#4f46e5`
- Indigo Light: `#eef2ff`
- Background: `#ffffff`, `#f8fafc`
- Border: `#e2e8f0`
- Text Strong: `#0f172a`
- Text Body: `#334155`
- Text Muted: `#64748b`
- Error: `#b91c1c`
- Success: `#047857`

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
- Auth modal width: `440px`
- Card grid: desktop 3 columns, tablet 2 columns, mobile 1 column

## 10. 반응형 요구사항

Desktop:

- Header 3영역 배치
- Hero 2열
- 공고 카드 3열
- Auth modal 중앙 배치

Tablet:

- 주요 카드 2열
- Hero 1열 전환

Mobile:

- Header 세로 정렬
- 버튼 full width
- 검색창과 결과 카운트 세로 정렬
- 공고 카드 1열
- Auth modal은 좌우 14px 여백 유지

## 11. 연결 정책

- 실제 미구현 페이지는 구현하지 않고 링크만 연결한다.
- 공고 상세: `/projects/[id]`
- 전체 공고: `/projects`
- 스타트업용: `/startup`
- 동아리/학회용: `/clubs`
- 로그인: 별도 페이지가 아니라 메인페이지 모달

## 12. 환경 변수

Vite 앱:

```text
VITE_SUPABASE_URL=https://jrdpdebdbmvoazjsxoek.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

호환용:

```text
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Next 전환용 템플릿:

```text
NEXT_PUBLIC_SUPABASE_URL=https://jrdpdebdbmvoazjsxoek.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 13. 현재 구현 파일

- `src/App.jsx`
- `src/components/Header.jsx`
- `src/components/AuthModal.jsx`
- `src/components/HeroSection.jsx`
- `src/components/FeaturedProjectsSection.jsx`
- `src/components/ValueSection.jsx`
- `src/components/HowItWorksSection.jsx`
- `src/components/UserTypeCTASection.jsx`
- `src/components/Footer.jsx`
- `src/components/SectionHeading.jsx`
- `src/data/homepage.js`
- `src/services/auth.js`
- `src/services/projects.js`
- `src/utils/supabase/client.js`
- `src/styles.css`
- `supabase/projects_seed.sql`
- `supabase/README.md`

## 14. 구현상 주의사항

- 현재 앱은 Vite + React다.
- `app/page.tsx`, `middleware.ts`, `utils/supabase/*`는 Next 전환용 템플릿이며 현재 Vite 런타임에는 직접 관여하지 않는다.
- Supabase `public.projects` 테이블이 없으면 공고 카드가 표시되지 않는다.
- 실제 공고 표시를 위해 Supabase SQL Editor에서 `supabase/projects_seed.sql`을 실행해야 한다.
- Supabase Auth에서 이메일 확인 설정이 켜져 있으면 회원가입 후 확인 메일 인증이 필요하다.
