# Campus Bridge Design PRD

## 1. 제품 개요

제품명: `Campus Bridge`

목적: 스타트업과 대학 동아리/학회를 연결해 캠퍼스 마케팅 프로젝트를 탐색, 지원, 운영할 수 있는 메인페이지를 제공한다.

현재 범위:

- 메인페이지 UI
- 공고 카드 탐색 및 검색
- Supabase 기반 공고 데이터 연결
- 미구현 페이지는 링크만 연결

## 2. 대상 사용자

- 스타트업 담당자: 대학생 타깃 마케팅 프로젝트를 빠르게 시작하고 싶은 사용자
- 대학 동아리/학회 구성원: 기업 협업 프로젝트를 찾고 활동 이력을 남기고 싶은 사용자

## 3. 핵심 사용자 흐름

1. 사용자는 메인페이지에서 서비스 목적을 이해한다.
2. Hero 바로 아래에서 모집 중인 공고를 확인한다.
3. 검색창으로 관심 분야, 스타트업명, 프로젝트명을 검색한다.
4. 공고 카드를 클릭해 `/projects/[id]` 상세 페이지로 이동한다.
5. 더 많은 공고는 `더보기` 버튼으로 `/projects`에서 확인한다.
6. 스타트업 사용자는 우측 상단 `스타트업용` 버튼으로 이동한다.
7. 로그인 후에만 `동아리/학회용` 메뉴가 노출된다.

## 4. 페이지 구조

### Header

- 좌측: `Campus Bridge` 브랜드
- 우측: `로그인`, `스타트업용`
- `공고 등록하기`는 메인에서 제거한다.
- `동아리/학회용`은 로그인 이후에만 노출한다.

### Hero

- 핵심 문구: `스타트업과 대학 동아리/학회를 연결하는 캠퍼스 마케팅 플랫폼`
- 설명 문구: `공고 등록부터 동아리 매칭, 미션 운영, 성과 리포트까지 한 번에 관리하세요.`
- CTA: `스타트업으로 시작하기`
- 우측 패널: 공고 등록, 지원 매칭, 미션 운영, 성과 확인 흐름 요약

### Projects

- Hero 바로 아래 배치한다.
- Supabase `public.projects` 테이블에서 공고 데이터를 불러온다.
- Supabase 연결 실패 또는 테이블 미준비 시 로컬 샘플 데이터로 fallback한다.
- 검색창을 제공한다.
- 검색 결과 개수를 표시한다.
- 검색 결과 없음 메시지를 표시한다.
- 하단 `더보기` 버튼으로 `/projects`에 연결한다.

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

## 5. 데이터 요구사항

### Supabase Table

테이블명: `public.projects`

필드:

- `id`: text, primary key
- `startup_name`: text
- `title`: text
- `tags`: text[]
- `period`: text
- `reward`: text
- `status`: text
- `created_at`: timestamptz

보안/접근:

- `anon`, `authenticated` role에 select 권한 부여
- RLS 활성화
- public read policy 생성

초기 데이터:

- `supabase/projects_seed.sql`로 테이블 생성, 권한 설정, RLS policy, 샘플 공고 insert를 한 번에 실행한다.

### Frontend Data Mapping

Supabase row는 화면에서 다음 형태로 normalize한다.

- `id`: `slug || id`
- `startupName`: `startup_name`
- `title`: `title`
- `tags`: `tags`
- `period`: `period`
- `reward`: `reward`
- `status`: `status`

### Fallback

다음 경우에는 `src/data/homepage.js`의 로컬 샘플 공고를 표시한다.

- Supabase 환경 변수가 없음
- `public.projects` 테이블이 없음
- Data API 권한/RLS 설정 오류
- 네트워크 오류

사용자에게는 “Supabase 공고 테이블이 준비되지 않아 샘플 공고를 표시 중입니다.” 메시지를 노출한다.

## 6. 검색 기능 요구사항

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
- 검색어가 없으면 전체 공고 표시

빈 상태:

- `검색 결과가 없습니다. 다른 키워드로 다시 찾아보세요.`

결과 카운트:

- `{검색 결과 수} / {전체 공고 수}개 공고`

## 7. 비주얼 방향

- 톤: 밝고 신뢰감 있는 B2B SaaS 스타일
- 배경: 흰색 중심, 일부 섹션에 아주 연한 blue/indigo gradient
- 카드: 흰색 카드, 둥근 모서리, 얕은 그림자
- 분위기: 발표용으로 안정적이고 읽기 쉬운 화면
- 애니메이션: hover 정도의 최소 인터랙션

## 8. 디자인 토큰

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

## 9. 반응형 요구사항

Desktop:

- Header 3영역 배치
- Hero 2열
- 공고 카드 3열

Tablet:

- 주요 카드 2열
- Hero 1열 전환

Mobile:

- Header 세로 정렬
- 버튼 full width
- 검색창과 결과 카운트 세로 정렬
- 공고 카드 1열

## 10. 연결 정책

- 실제 미구현 페이지는 구현하지 않고 링크만 연결한다.
- 공고 상세: `/projects/[id]`
- 전체 공고: `/projects`
- 스타트업용: `/startup`
- 로그인: `/login`
- 동아리/학회용: `/clubs`

## 11. 환경 변수

Vite 앱에서 사용하는 값:

```text
VITE_SUPABASE_URL=https://jrdpdebdbmvoazjsxoek.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

호환용:

```text
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Next 전환용 템플릿에서 사용하는 값:

```text
NEXT_PUBLIC_SUPABASE_URL=https://jrdpdebdbmvoazjsxoek.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 12. 현재 구현 파일

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
- `src/services/projects.js`
- `src/utils/supabase/client.js`
- `src/styles.css`
- `supabase/projects_seed.sql`
- `supabase/README.md`

## 13. 구현상 주의사항

- 현재 앱은 Vite + React다.
- `app/page.tsx`, `middleware.ts`, `utils/supabase/*`는 Next 전환용 템플릿이며 현재 Vite 런타임에는 직접 관여하지 않는다.
- Supabase에 `public.projects` 테이블이 없으면 앱은 정상적으로 샘플 데이터를 보여준다.
- 실제 DB 데이터 확인을 위해서는 Supabase SQL Editor에서 `supabase/projects_seed.sql`을 실행해야 한다.
