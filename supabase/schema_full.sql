-- ============================================================
-- Campus Bridge — Full ERD Schema Migration
-- 기존: profiles, projects (이미 존재)
-- 신규: companies, clubs, students, club_company_match,
--       missions, mission_metrics, mission_progress,
--       mission_timeline_events, mission_deliverables,
--       marketing_solutions, notifications, feedback,
--       certificate_applications, campaign_posts,
--       student_applications
-- ============================================================

-- ========================
-- 1. companies
-- ========================
CREATE TABLE IF NOT EXISTS public.companies (
  company_id  SERIAL PRIMARY KEY,
  owner_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  industry    TEXT,
  description TEXT,
  contact_email TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.companies TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.companies TO authenticated;

DROP POLICY IF EXISTS "anyone can read companies" ON public.companies;
CREATE POLICY "anyone can read companies"
  ON public.companies FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "owner can manage company" ON public.companies;
CREATE POLICY "owner can manage company"
  ON public.companies FOR ALL
  TO authenticated
  USING (owner_id = (SELECT auth.uid()))
  WITH CHECK (owner_id = (SELECT auth.uid()));

-- ========================
-- 2. clubs
-- ========================
CREATE TABLE IF NOT EXISTS public.clubs (
  club_id       SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  university    TEXT NOT NULL,
  description   TEXT,
  contact_email TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.clubs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.clubs TO authenticated;

DROP POLICY IF EXISTS "anyone can read clubs" ON public.clubs;
CREATE POLICY "anyone can read clubs"
  ON public.clubs FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "authenticated can manage clubs" ON public.clubs;
CREATE POLICY "authenticated can manage clubs"
  ON public.clubs FOR ALL
  TO authenticated
  USING (true);

-- ========================
-- 3. students
-- ========================
CREATE TABLE IF NOT EXISTS public.students (
  student_id    SERIAL PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  club_id       INT REFERENCES public.clubs(club_id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  email         TEXT,
  year_of_study TEXT,
  join_date     DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.students TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.students TO authenticated;

DROP POLICY IF EXISTS "authenticated can read students" ON public.students;
CREATE POLICY "authenticated can read students"
  ON public.students FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "own student record" ON public.students;
CREATE POLICY "own student record"
  ON public.students FOR ALL
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- ========================
-- 4. club_company_match
-- ========================
CREATE TABLE IF NOT EXISTS public.club_company_match (
  match_id    SERIAL PRIMARY KEY,
  company_id  INT NOT NULL REFERENCES public.companies(company_id) ON DELETE CASCADE,
  club_id     INT NOT NULL REFERENCES public.clubs(club_id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','pending_review','scheduled','completed')),
  start_date  DATE,
  end_date    DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.club_company_match ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.club_company_match TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.club_company_match TO authenticated;

DROP POLICY IF EXISTS "authenticated can read matches" ON public.club_company_match;
CREATE POLICY "authenticated can read matches"
  ON public.club_company_match FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "authenticated can manage matches" ON public.club_company_match;
CREATE POLICY "authenticated can manage matches"
  ON public.club_company_match FOR ALL
  TO authenticated
  USING (true);

-- ========================
-- 5. missions
-- ========================
CREATE TABLE IF NOT EXISTS public.missions (
  mission_id         SERIAL PRIMARY KEY,
  match_id           INT NOT NULL REFERENCES public.club_company_match(match_id) ON DELETE CASCADE,
  mission_name       TEXT NOT NULL,
  mission_description TEXT,
  objective_kpi      TEXT,
  start_date         DATE,
  end_date           DATE,
  delay_buffer       TEXT,
  target_metric      NUMERIC,
  status             TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','in_progress','completed')),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.missions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.missions TO authenticated;

DROP POLICY IF EXISTS "authenticated can read missions" ON public.missions;
CREATE POLICY "authenticated can read missions"
  ON public.missions FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "authenticated can manage missions" ON public.missions;
CREATE POLICY "authenticated can manage missions"
  ON public.missions FOR ALL
  TO authenticated
  USING (true);

-- ========================
-- 6. mission_metrics
-- ========================
CREATE TABLE IF NOT EXISTS public.mission_metrics (
  metric_id          SERIAL PRIMARY KEY,
  mission_id         INT NOT NULL REFERENCES public.missions(mission_id) ON DELETE CASCADE,
  metric_date        DATE NOT NULL,
  impressions        INT DEFAULT 0,
  clicks             INT DEFAULT 0,
  ctr                NUMERIC(6,2) DEFAULT 0,
  cpc                NUMERIC(10,2) DEFAULT 0,
  engagement_rate    NUMERIC(6,2) DEFAULT 0,
  conversions        INT DEFAULT 0,
  conversion_rate    NUMERIC(6,2) DEFAULT 0,
  avg_score_vs_others NUMERIC(6,2) DEFAULT 0
);

ALTER TABLE public.mission_metrics ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.mission_metrics TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.mission_metrics TO authenticated;

DROP POLICY IF EXISTS "authenticated can read metrics" ON public.mission_metrics;
CREATE POLICY "authenticated can read metrics"
  ON public.mission_metrics FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "authenticated can manage metrics" ON public.mission_metrics;
CREATE POLICY "authenticated can manage metrics"
  ON public.mission_metrics FOR ALL
  TO authenticated
  USING (true);

-- ========================
-- 7. mission_progress
-- ========================
CREATE TABLE IF NOT EXISTS public.mission_progress (
  progress_id       SERIAL PRIMARY KEY,
  mission_id        INT NOT NULL REFERENCES public.missions(mission_id) ON DELETE CASCADE,
  club_id           INT NOT NULL REFERENCES public.clubs(club_id) ON DELETE CASCADE,
  progress_percent  INT DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  status            TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','completed')),
  last_updated      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mission_progress ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.mission_progress TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.mission_progress TO authenticated;

DROP POLICY IF EXISTS "authenticated can read progress" ON public.mission_progress;
CREATE POLICY "authenticated can read progress"
  ON public.mission_progress FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "authenticated can manage progress" ON public.mission_progress;
CREATE POLICY "authenticated can manage progress"
  ON public.mission_progress FOR ALL
  TO authenticated
  USING (true);

-- ========================
-- 8. mission_timeline_events
-- ========================
CREATE TABLE IF NOT EXISTS public.mission_timeline_events (
  timeline_id  SERIAL PRIMARY KEY,
  mission_id   INT NOT NULL REFERENCES public.missions(mission_id) ON DELETE CASCADE,
  event_name   TEXT NOT NULL,
  event_date   DATE NOT NULL,
  description  TEXT
);

ALTER TABLE public.mission_timeline_events ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.mission_timeline_events TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.mission_timeline_events TO authenticated;

DROP POLICY IF EXISTS "authenticated can read timeline" ON public.mission_timeline_events;
CREATE POLICY "authenticated can read timeline"
  ON public.mission_timeline_events FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "authenticated can manage timeline" ON public.mission_timeline_events;
CREATE POLICY "authenticated can manage timeline"
  ON public.mission_timeline_events FOR ALL
  TO authenticated
  USING (true);

-- ========================
-- 9. mission_deliverables
-- ========================
CREATE TABLE IF NOT EXISTS public.mission_deliverables (
  deliverable_id        SERIAL PRIMARY KEY,
  mission_id            INT NOT NULL REFERENCES public.missions(mission_id) ON DELETE CASCADE,
  title                 TEXT NOT NULL,
  description           TEXT,
  submitted_by_club_id  INT REFERENCES public.clubs(club_id) ON DELETE SET NULL,
  submission_date       TIMESTAMPTZ,
  approval_status       TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending','approved','rejected')),
  approved_by_company_id INT REFERENCES public.companies(company_id) ON DELETE SET NULL,
  approval_date         TIMESTAMPTZ,
  comments              TEXT
);

ALTER TABLE public.mission_deliverables ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.mission_deliverables TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.mission_deliverables TO authenticated;

DROP POLICY IF EXISTS "authenticated can read deliverables" ON public.mission_deliverables;
CREATE POLICY "authenticated can read deliverables"
  ON public.mission_deliverables FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "authenticated can manage deliverables" ON public.mission_deliverables;
CREATE POLICY "authenticated can manage deliverables"
  ON public.mission_deliverables FOR ALL
  TO authenticated
  USING (true);

-- ========================
-- 10. marketing_solutions
-- ========================
CREATE TABLE IF NOT EXISTS public.marketing_solutions (
  solution_id         SERIAL PRIMARY KEY,
  mission_id          INT NOT NULL REFERENCES public.missions(mission_id) ON DELETE CASCADE,
  solution_type       TEXT NOT NULL DEFAULT 'recommended' CHECK (solution_type IN ('recommended','custom')),
  title               TEXT NOT NULL,
  description         TEXT,
  selected_by_company BOOLEAN DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.marketing_solutions ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.marketing_solutions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.marketing_solutions TO authenticated;

DROP POLICY IF EXISTS "authenticated can read solutions" ON public.marketing_solutions;
CREATE POLICY "authenticated can read solutions"
  ON public.marketing_solutions FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "authenticated can manage solutions" ON public.marketing_solutions;
CREATE POLICY "authenticated can manage solutions"
  ON public.marketing_solutions FOR ALL
  TO authenticated
  USING (true);

-- ========================
-- 11. notifications
-- ========================
CREATE TABLE IF NOT EXISTS public.notifications (
  notification_id  SERIAL PRIMARY KEY,
  match_id         INT REFERENCES public.club_company_match(match_id) ON DELETE CASCADE,
  from_company_id  INT REFERENCES public.companies(company_id) ON DELETE SET NULL,
  to_club_id       INT REFERENCES public.clubs(club_id) ON DELETE SET NULL,
  title            TEXT NOT NULL,
  message          TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_flag        BOOLEAN DEFAULT false
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.notifications TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.notifications TO authenticated;

DROP POLICY IF EXISTS "authenticated can read notifications" ON public.notifications;
CREATE POLICY "authenticated can read notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "authenticated can manage notifications" ON public.notifications;
CREATE POLICY "authenticated can manage notifications"
  ON public.notifications FOR ALL
  TO authenticated
  USING (true);

-- ========================
-- 12. feedback
-- ========================
CREATE TABLE IF NOT EXISTS public.feedback (
  feedback_id     SERIAL PRIMARY KEY,
  mission_id      INT REFERENCES public.missions(mission_id) ON DELETE CASCADE,
  from_company_id INT REFERENCES public.companies(company_id) ON DELETE SET NULL,
  from_student_id INT REFERENCES public.students(student_id) ON DELETE SET NULL,
  to_company_id   INT REFERENCES public.companies(company_id) ON DELETE SET NULL,
  to_club_id      INT REFERENCES public.clubs(club_id) ON DELETE SET NULL,
  to_student_id   INT REFERENCES public.students(student_id) ON DELETE SET NULL,
  feedback_type   TEXT NOT NULL DEFAULT 'evaluation',
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.feedback TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.feedback TO authenticated;

DROP POLICY IF EXISTS "authenticated can read feedback" ON public.feedback;
CREATE POLICY "authenticated can read feedback"
  ON public.feedback FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "authenticated can manage feedback" ON public.feedback;
CREATE POLICY "authenticated can manage feedback"
  ON public.feedback FOR ALL
  TO authenticated
  USING (true);

-- ========================
-- 13. certificate_applications
-- ========================
CREATE TABLE IF NOT EXISTS public.certificate_applications (
  application_id    SERIAL PRIMARY KEY,
  student_id        INT REFERENCES public.students(student_id) ON DELETE CASCADE,
  mission_id        INT REFERENCES public.missions(mission_id) ON DELETE CASCADE,
  apply_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  certificate_type  TEXT NOT NULL DEFAULT '수료증',
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  approved_date     DATE
);

ALTER TABLE public.certificate_applications ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.certificate_applications TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.certificate_applications TO authenticated;

DROP POLICY IF EXISTS "authenticated can read certificates" ON public.certificate_applications;
CREATE POLICY "authenticated can read certificates"
  ON public.certificate_applications FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "authenticated can manage certificates" ON public.certificate_applications;
CREATE POLICY "authenticated can manage certificates"
  ON public.certificate_applications FOR ALL
  TO authenticated
  USING (true);

-- ========================
-- 14. campaign_posts (localStorage → Supabase)
-- ========================
CREATE TABLE IF NOT EXISTS public.campaign_posts (
  id             TEXT PRIMARY KEY,
  owner_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status         TEXT NOT NULL DEFAULT 'open',
  company_info   JSONB NOT NULL DEFAULT '{}',
  project_info   JSONB NOT NULL DEFAULT '{}',
  reward_and_condition JSONB NOT NULL DEFAULT '{}',
  mission_info   JSONB NOT NULL DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.campaign_posts ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.campaign_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.campaign_posts TO authenticated;

DROP POLICY IF EXISTS "anyone can read posts" ON public.campaign_posts;
CREATE POLICY "anyone can read posts"
  ON public.campaign_posts FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "owner can manage posts" ON public.campaign_posts;
CREATE POLICY "owner can manage posts"
  ON public.campaign_posts FOR ALL
  TO authenticated
  USING (owner_id = (SELECT auth.uid()))
  WITH CHECK (owner_id = (SELECT auth.uid()));

-- ========================
-- 15. student_applications (localStorage → Supabase)
-- ========================
CREATE TABLE IF NOT EXISTS public.student_applications (
  id              TEXT PRIMARY KEY,
  owner_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  post_id         TEXT REFERENCES public.campaign_posts(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  club_info       JSONB NOT NULL DEFAULT '{}',
  representative  JSONB NOT NULL DEFAULT '{}',
  profile         JSONB NOT NULL DEFAULT '{}',
  motivation      JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.student_applications ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.student_applications TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.student_applications TO authenticated;

DROP POLICY IF EXISTS "authenticated can read applications" ON public.student_applications;
CREATE POLICY "authenticated can read applications"
  ON public.student_applications FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "owner can manage applications" ON public.student_applications;
CREATE POLICY "owner can manage applications"
  ON public.student_applications FOR ALL
  TO authenticated
  USING (owner_id = (SELECT auth.uid()))
  WITH CHECK (owner_id = (SELECT auth.uid()));

-- ========================
-- Grant sequence usage for auto-increment
-- ========================
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
