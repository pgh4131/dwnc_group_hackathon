create table if not exists public.projects (
  id text primary key,
  startup_name text not null,
  title text not null,
  tags text[] not null default '{}',
  period text not null,
  reward text not null,
  status text not null default '모집중',
  created_at timestamptz not null default now()
);

grant usage on schema public to anon, authenticated;
grant select on public.projects to anon, authenticated;

alter table public.projects enable row level security;

drop policy if exists "public can read projects" on public.projects;
create policy "public can read projects"
on public.projects
for select
to anon, authenticated
using (true);

insert into public.projects (id, startup_name, title, tags, period, reward, status)
values
  (
    'early-user-interview',
    'Looply',
    '대학생 초기 유저 인터뷰 및 온보딩 캠페인',
    array['앱 서비스', '리서치', '온보딩'],
    '4주',
    '팀 활동비 80만원',
    '모집중'
  ),
  (
    'campus-sns-launch',
    'Notedrop',
    '캠퍼스 SNS 숏폼 콘텐츠 런칭 프로젝트',
    array['콘텐츠', 'SNS', '브랜딩'],
    '6주',
    '활동비 120만원',
    '모집중'
  ),
  (
    'fintech-survey',
    'Paytiny',
    '대학생 소비 패턴 설문 및 서비스 피드백',
    array['핀테크', '설문', 'UX'],
    '3주',
    '팀 활동비 60만원',
    '마감임박'
  ),
  (
    'ai-study-tool',
    'StudyPilot',
    'AI 학습 도구 체험단 운영 및 후기 수집',
    array['AI', '교육', '체험단'],
    '5주',
    '활동비 100만원',
    '모집중'
  ),
  (
    'local-pop-up',
    'GroundKit',
    '지역 기반 팝업 행사 홍보 서포터즈',
    array['오프라인', '행사', '홍보'],
    '2주',
    '성과 보너스 별도',
    '신규'
  ),
  (
    'b2b-beta-test',
    'Teamflow',
    '대학생 팀 협업 SaaS 베타 테스트',
    array['SaaS', '협업툴', '테스트'],
    '4주',
    '활동비 70만원',
    '모집중'
  ),
  (
    'beauty-campus-review',
    'Glowkit',
    '뷰티 브랜드 캠퍼스 리뷰 콘텐츠 프로젝트',
    array['뷰티', '리뷰', '콘텐츠'],
    '3주',
    '제품 제공 및 활동비 50만원',
    '모집중'
  ),
  (
    'career-community-event',
    'CareerNest',
    '대학생 커리어 커뮤니티 오프라인 밋업 운영',
    array['커리어', '커뮤니티', '이벤트'],
    '5주',
    '팀 활동비 90만원',
    '마감임박'
  )
on conflict (id) do update set
  startup_name = excluded.startup_name,
  title = excluded.title,
  tags = excluded.tags,
  period = excluded.period,
  reward = excluded.reward,
  status = excluded.status;
