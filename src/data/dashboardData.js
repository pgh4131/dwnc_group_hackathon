/**
 * Campus Bridge — 기업·학생 대시보드용 ERD 정렬 목 데이터
 * (ERD: companies, clubs, club_company_match, missions, mission_metrics,
 *  marketing_solutions, notifications, students, mission_progress,
 *  mission_timeline_events, feedback, mission_deliverables, certificate_applications)
 */

export const companies = [
  {
    company_id: 1,
    name: "런치플리",
    industry: "캠퍼스 마케팅 / UGC",
    description: "대학 동아리와 협업하는 바이럴 캠페인 운영 기업.",
    contact_email: "campus@launchly.example",
    created_at: "2026-01-10T09:00:00",
  },
];

export const clubsTable = [
  {
    club_id: 1,
    name: "연세대 마케팅학회 PRISM",
    university: "연세대",
    description: "마케팅·브랜딩 동아리",
    contact_email: "prism@yonsei.example",
    created_at: "2026-02-01T10:00:00",
  },
  {
    club_id: 2,
    name: "고려대 창업동아리 SPARKS",
    university: "고려대",
    description: "창업·IT 동아리",
    contact_email: "sparks@korea.example",
    created_at: "2026-02-03T11:00:00",
  },
  {
    club_id: 3,
    name: "서울대 디자인학회 FORM",
    university: "서울대",
    description: "UX·비주얼 디자인",
    contact_email: "form@snu.example",
    created_at: "2026-02-05T12:00:00",
  },
  {
    club_id: 4,
    name: "한양대 IT 동아리 BYTECLUB",
    university: "한양대",
    description: "개발·PM",
    contact_email: "byte@hanyang.example",
    created_at: "2026-02-08T09:00:00",
  },
];

/** club_company_match — 매칭 */
export const clubCompanyMatches = [
  {
    match_id: 101,
    company_id: 1,
    club_id: 1,
    status: "in_progress",
    start_date: "2026-05-01",
    end_date: "2026-06-30",
  },
  {
    match_id: 102,
    company_id: 1,
    club_id: 2,
    status: "in_progress",
    start_date: "2026-05-01",
    end_date: "2026-06-28",
  },
  {
    match_id: 103,
    company_id: 1,
    club_id: 3,
    status: "pending_review",
    start_date: "2026-05-10",
    end_date: "2026-07-15",
  },
  {
    match_id: 104,
    company_id: 1,
    club_id: 4,
    status: "completed",
    start_date: "2026-04-01",
    end_date: "2026-05-08",
  },
];

/** missions — 매칭당 대표 미션(대시보드 1개 캠페인 단위) */
export const missions = [
  {
    mission_id: 1001,
    match_id: 101,
    mission_name: "UGC 콘텐츠 바이럴 미션",
    mission_description: "릴스·커뮤니티 중심 UGC 바이럴 및 앱 유입 캠페인.",
    objective_kpi: "CTR 2.5%p, 전환율 2.0%",
    start_date: "2026-05-08",
    end_date: "2026-05-14",
    status: "in_progress",
  },
  {
    mission_id: 1002,
    match_id: 102,
    mission_name: "SNS 홍보 + 앱 가입 미션",
    mission_description: "SNS 스레드·앱 가입 유도 및 설문 수집.",
    objective_kpi: "가입 30명, CPC 320원 이하",
    start_date: "2026-05-08",
    end_date: "2026-05-14",
    status: "in_progress",
  },
  {
    mission_id: 1003,
    match_id: 103,
    mission_name: "콘텐츠 제작 미션",
    mission_description: "카드뉴스·숏폼 제작 및 업로드.",
    objective_kpi: "참여율 3.0% 이상",
    start_date: "2026-05-08",
    end_date: "2026-05-14",
    status: "scheduled",
  },
  {
    mission_id: 1004,
    match_id: 104,
    mission_name: "사용자 피드백 수집 미션",
    mission_description: "인터뷰·설문·인사이트 리포트.",
    objective_kpi: "설문 100건, 리포트 1건",
    start_date: "2026-05-08",
    end_date: "2026-05-14",
    status: "completed",
  },
];

function metricRow(mission_id, metric_date, impressions, clicks, ctr, cpc, engagement_rate, conversions, conversion_rate, avg_score_vs_others) {
  return {
    metric_id: mission_id * 1000 + Number(metric_date.replace(/-/g, "")) % 10000,
    mission_id,
    metric_date,
    impressions,
    clicks,
    ctr,
    cpc,
    engagement_rate,
    conversions,
    conversion_rate,
    avg_score_vs_others,
  };
}

/** mission_metrics — 일별 지표 (차트용 시계열) */
export const missionMetrics = [
  ...[
    [1200, 14, 1.2, 320, 3.1, 10, 0.8, 62],
    [1800, 27, 1.5, 300, 3.4, 14, 1.0, 63],
    [2400, 43, 1.8, 290, 3.8, 19, 1.2, 64],
    [3100, 65, 2.1, 280, 4.1, 25, 1.5, 65],
    [3800, 87, 2.3, 270, 4.5, 32, 1.7, 66],
    [4200, 97, 2.3, 265, 4.6, 36, 1.8, 66],
    [4900, 123, 2.5, 260, 4.8, 42, 2.0, 65],
  ].map((row, i) =>
    metricRow(1001, `2026-05-${8 + i}`, ...row),
  ),
  ...[
    [900, 8, 0.9, 380, 2.5, 5, 0.5, 62],
    [1300, 14, 1.1, 360, 2.8, 9, 0.7, 63],
    [1700, 22, 1.3, 340, 3.0, 12, 0.9, 63],
    [2200, 31, 1.4, 330, 3.2, 15, 1.1, 64],
    [2700, 43, 1.6, 320, 3.4, 18, 1.2, 64],
    [3100, 53, 1.7, 310, 3.5, 21, 1.3, 65],
    [3500, 63, 1.8, 305, 3.6, 25, 1.4, 65],
  ].map((row, i) => metricRow(1002, `2026-05-${8 + i}`, ...row)),
  ...[
    [500, 3, 0.5, 450, 1.8, 2, 0.3, 58],
    [700, 4, 0.6, 440, 2.0, 3, 0.4, 58],
    [900, 6, 0.7, 420, 2.2, 4, 0.5, 59],
    [1100, 10, 0.9, 410, 2.4, 6, 0.6, 59],
    [1300, 13, 1.0, 400, 2.5, 7, 0.7, 60],
    [1450, 16, 1.1, 395, 2.6, 8, 0.7, 60],
    [1600, 19, 1.2, 390, 2.7, 9, 0.8, 60],
  ].map((row, i) => metricRow(1003, `2026-05-${8 + i}`, ...row)),
  ...[
    [1000, 10, 1.0, 300, 3.5, 10, 1.0, 68],
    [1500, 18, 1.2, 290, 3.7, 15, 1.2, 69],
    [2100, 32, 1.5, 280, 4.0, 21, 1.5, 70],
    [2700, 46, 1.7, 275, 4.2, 28, 1.7, 70],
    [3300, 63, 1.9, 268, 4.4, 36, 2.0, 71],
    [3700, 74, 2.0, 262, 4.5, 40, 2.1, 71],
    [4100, 86, 2.1, 255, 4.7, 45, 2.2, 71],
  ].map((row, i) => metricRow(1004, `2026-05-${8 + i}`, ...row)),
];

/** marketing_solutions */
export const marketingSolutions = [
  { solution_id: 1, mission_id: 1001, solution_type: "recommended", title: "릴스 시간대", description: "릴스 게시 시간을 저녁 7–9시로 집중하면 CTR +0.3%p 기대", selected_by_company: false, created_at: "2026-05-11T10:00:00" },
  { solution_id: 2, mission_id: 1001, solution_type: "recommended", title: "CPC 유지", description: "CPC 260원대 유지 중 — 현재 타겟 세그먼트 유지 권장", selected_by_company: false, created_at: "2026-05-11T10:00:00" },
  { solution_id: 3, mission_id: 1001, solution_type: "recommended", title: "바이럴 스코어", description: "경쟁 동아리 대비 바이럴 스코어 +22% — 현재 전략 지속", selected_by_company: false, created_at: "2026-05-11T10:00:00" },
  { solution_id: 4, mission_id: 1002, solution_type: "recommended", title: "설문 인센티브", description: "설문 참여율 개선 위해 소정의 보상(커피쿠폰) 제안 검토", selected_by_company: false, created_at: "2026-05-12T09:00:00" },
  { solution_id: 5, mission_id: 1002, solution_type: "recommended", title: "앱 가입", description: "앱 가입 80% 달성 중 — 잔여 7명 추가 확보 집중", selected_by_company: false, created_at: "2026-05-12T09:00:00" },
  { solution_id: 6, mission_id: 1002, solution_type: "recommended", title: "스레드 길이", description: "트위터 스레드 길이를 5개 이하로 줄이면 완독률 상승 예상", selected_by_company: false, created_at: "2026-05-12T09:00:00" },
  { solution_id: 7, mission_id: 1003, solution_type: "recommended", title: "중간 점검", description: "현재 콘텐츠 제작 속도 느림 — 마감 전 중간 점검 미팅 권장", selected_by_company: false, created_at: "2026-05-12T11:00:00" },
  { solution_id: 8, mission_id: 1003, solution_type: "recommended", title: "숏츠 후킹", description: "숏츠 제작 시 첫 3초 후킹 강화 필요", selected_by_company: false, created_at: "2026-05-12T11:00:00" },
  { solution_id: 9, mission_id: 1004, solution_type: "recommended", title: "캠페인 완료", description: "모든 미션 완료 — 최종 성과 리포트 다운로드 가능", selected_by_company: false, created_at: "2026-05-10T15:00:00" },
  { solution_id: 10, mission_id: 1004, solution_type: "recommended", title: "재매칭 추천", description: "피드백 질 우수 — 다음 캠페인에 동일 동아리 재매칭 추천", selected_by_company: false, created_at: "2026-05-10T15:00:00" },
];

/** notifications — 기업 → 동아리 공지 */
export const notifications = [
  {
    notification_id: 1,
    match_id: 101,
    from_company_id: 1,
    to_club_id: 1,
    title: "중간 점검 안내",
    message: "1차 중간 점검 완료. 다음 미션 일정 확인 바랍니다.",
    created_at: "2026-05-11T09:30:00",
    read_flag: false,
  },
  {
    notification_id: 2,
    match_id: 104,
    from_company_id: 1,
    to_club_id: 4,
    title: "캠페인 종료",
    message: "최종 리포트 제출 확인 완료. 수고하셨습니다.",
    created_at: "2026-05-10T16:00:00",
    read_flag: true,
  },
];

export const students = [
  { student_id: 1, club_id: 1, name: "김학생", email: "kim@univ.example", year_of_study: "3학년 경영", join_date: "2025-03-01" },
  { student_id: 2, club_id: 4, name: "이학생", email: "lee@univ.example", year_of_study: "2학년 컴공", join_date: "2025-09-01" },
];

/** mission_progress — 미션·동아리 단위 진행률(리스트 스코어용) */
export const missionProgress = [
  { progress_id: 1, mission_id: 1001, club_id: 1, progress_percent: 87, status: "in_progress", last_updated: "2026-05-14T08:00:00" },
  { progress_id: 2, mission_id: 1002, club_id: 2, progress_percent: 74, status: "in_progress", last_updated: "2026-05-14T07:30:00" },
  { progress_id: 3, mission_id: 1003, club_id: 3, progress_percent: 42, status: "in_progress", last_updated: "2026-05-13T18:00:00" },
  { progress_id: 4, mission_id: 1004, club_id: 4, progress_percent: 95, status: "completed", last_updated: "2026-05-10T12:00:00" },
];

export const missionTimelineEvents = [
  { timeline_id: 1, mission_id: 1001, event_name: "킥오프", event_date: "2026-05-08", description: "캠페인 목표·KPI 공유" },
  { timeline_id: 2, mission_id: 1001, event_name: "중간점검", event_date: "2026-05-11", description: "1차 실적 리뷰" },
  { timeline_id: 3, mission_id: 1004, event_name: "종료", event_date: "2026-05-10", description: "최종 산출물 확정" },
];

export const feedback = [
  {
    feedback_id: 1,
    mission_id: 1001,
    from_company_id: 1,
    from_student_id: null,
    to_company_id: null,
    to_club_id: 1,
    to_student_id: null,
    feedback_type: "evaluation",
    content: "릴스 퀄리티 양호, 다음 주까지 클릭 수 목표 달성 부탁드립니다.",
    created_at: "2026-05-12T14:00:00",
  },
];

/** mission_deliverables — 산출물·승인 */
export const missionDeliverables = [
  { deliverable_id: 1, mission_id: 1001, title: "인스타그램 릴스 3개 업로드", description: "https://instagram.com/…", submitted_by_club_id: 1, submission_date: "2026-05-10T12:00:00", approval_status: "approved", approved_by_company_id: 1, approval_date: "2026-05-10T18:00:00", comments: "확인했습니다." },
  { deliverable_id: 2, mission_id: 1001, title: "에브리타임 홍보글 게시", description: "게시 링크 첨부", submitted_by_club_id: 1, submission_date: "2026-05-11T09:00:00", approval_status: "approved", approved_by_company_id: 1, approval_date: "2026-05-11T10:00:00", comments: null },
  { deliverable_id: 3, mission_id: 1001, title: "앱 신규 가입자 20명 유도", description: "진행 중", submitted_by_club_id: 1, submission_date: null, approval_status: "pending", approved_by_company_id: null, approval_date: null, comments: null },
  { deliverable_id: 4, mission_id: 1001, title: "캠퍼스 부스 이벤트 운영", description: null, submitted_by_club_id: 1, submission_date: null, approval_status: "pending", approved_by_company_id: null, approval_date: null, comments: null },
  { deliverable_id: 5, mission_id: 1002, title: "트위터/X 스레드 홍보", description: "링크", submitted_by_club_id: 2, submission_date: "2026-05-09T11:00:00", approval_status: "approved", approved_by_company_id: 1, approval_date: "2026-05-09T15:00:00", comments: null },
  { deliverable_id: 6, mission_id: 1002, title: "앱 가입자 30명 유도", description: null, submitted_by_club_id: 2, submission_date: null, approval_status: "pending", approved_by_company_id: null, approval_date: null, comments: null },
  { deliverable_id: 7, mission_id: 1002, title: "설문조사 참여 유도", description: null, submitted_by_club_id: 2, submission_date: null, approval_status: "pending", approved_by_company_id: null, approval_date: null, comments: null },
  { deliverable_id: 8, mission_id: 1003, title: "브랜드 카드뉴스 제작", description: null, submitted_by_club_id: 3, submission_date: null, approval_status: "pending", approved_by_company_id: null, approval_date: null, comments: null },
  { deliverable_id: 9, mission_id: 1003, title: "유튜브 숏츠 제작", description: null, submitted_by_club_id: 3, submission_date: null, approval_status: "pending", approved_by_company_id: null, approval_date: null, comments: null },
  { deliverable_id: 10, mission_id: 1004, title: "사용자 인터뷰 10건", description: "녹취 업로드", submitted_by_club_id: 4, submission_date: "2026-05-07T10:00:00", approval_status: "approved", approved_by_company_id: 1, approval_date: "2026-05-07T16:00:00", comments: null },
  { deliverable_id: 11, mission_id: 1004, title: "피드백 설문 100건", description: null, submitted_by_club_id: 4, submission_date: "2026-05-08T12:00:00", approval_status: "approved", approved_by_company_id: 1, approval_date: "2026-05-08T14:00:00", comments: null },
  { deliverable_id: 12, mission_id: 1004, title: "인사이트 리포트 제출", description: "PDF", submitted_by_club_id: 4, submission_date: "2026-05-09T09:00:00", approval_status: "approved", approved_by_company_id: 1, approval_date: "2026-05-09T11:00:00", comments: null },
];

export const certificateApplications = [
  {
    application_id: 1,
    student_id: 2,
    mission_id: 1004,
    apply_date: "2026-05-11",
    certificate_type: "수료증",
    status: "pending",
    approved_date: null,
  },
];

export const clubColors = {
  1: { bg: "#eef2ff", text: "#4f46e5", line: "#2563eb" },
  2: { bg: "#f8fafc", text: "#2563eb", line: "#4f46e5" },
  3: { bg: "#eef2ff", text: "#2563eb", line: "#4f46e5" },
  4: { bg: "#f8fafc", text: "#4f46e5", line: "#2563eb" },
};

/** UI용 매칭 상태 → 기존 뱃지 키 */
export const statusLabel = {
  in_progress: { label: "진행 중", bg: "#eef2ff", color: "#4f46e5" },
  pending_review: { label: "검토 중", bg: "#f8fafc", color: "#64748b" },
  scheduled: { label: "예정", bg: "#f8fafc", color: "#64748b" },
  completed: { label: "완료", bg: "#f8fafc", color: "#334155" },
};

const PEER_AVG_SCORE = 65;

function clubInitials(name) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).slice(0, 2);
  return name.slice(0, 2);
}

function formatMetricDateLabel(iso) {
  const [, m, d] = iso.split("-");
  return `${Number(m)}/${Number(d)}`;
}

function deliverableToTask(d) {
  const approved = d.approval_status === "approved";
  const rejected = d.approval_status === "rejected";
  let pct = 0;
  if (approved) pct = 100;
  else if (d.submission_date) pct = 65;
  else if (rejected) pct = 25;
  return {
    id: d.deliverable_id,
    name: d.title,
    done: approved,
    pct,
  };
}

function notificationsToNotices(rows) {
  return rows.map((n) => ({
    id: n.notification_id,
    date: formatMetricDateLabel(n.created_at.slice(0, 10)),
    title: n.title,
    content: n.message,
  }));
}

function solutionsToUi(rows) {
  return rows.map((s) => ({
    id: s.solution_id,
    text: s.title + " — " + s.description,
    solution_type: s.solution_type,
    title: s.title,
    description: s.description,
  }));
}

/**
 * 기업 대시보드 — 매칭된 동아리 요약 (club_id 기준 라우트 유지)
 */
export function listMatchedClubsForCompany(companyId = 1) {
  return clubCompanyMatches
    .filter((m) => m.company_id === companyId)
    .map((match) => {
      const club = clubsTable.find((c) => c.club_id === match.club_id);
      const mission = missions.find((mi) => mi.match_id === match.match_id);
      const progress = missionProgress.find(
        (p) => p.mission_id === mission.mission_id && p.club_id === match.club_id,
      );
      const uiKey =
        match.status === "completed"
          ? "completed"
          : match.status === "pending_review" || match.status === "scheduled"
            ? "pending_review"
            : "in_progress";

      const deliverables = missionDeliverables.filter((d) => d.mission_id === mission.mission_id);
      const missionTasks = deliverables.map(deliverableToTask);

      return {
        id: club.club_id,
        club_id: club.club_id,
        name: club.name,
        initials: clubInitials(club.name),
        university: club.university,
        mission: mission.mission_name,
        mission_id: mission.mission_id,
        match_id: match.match_id,
        status: uiKey,
        score: Math.round(progress?.progress_percent ?? 0),
        missions: missionTasks,
      };
    });
}

/**
 * 동아리 상세 — 차트·솔루션·공지·산출물 묶음
 */
export function getClubDashboardBundle(clubId, companyId = 1) {
  const match = clubCompanyMatches.find((m) => m.club_id === clubId && m.company_id === companyId);
  if (!match) return null;
  const club = clubsTable.find((c) => c.club_id === clubId);
  const mission = missions.find((mi) => mi.match_id === match.match_id);
  if (!club || !mission) return null;

  const metrics = missionMetrics
    .filter((x) => x.mission_id === mission.mission_id)
    .sort((a, b) => a.metric_date.localeCompare(b.metric_date));

  const weeks = metrics.map((m) => formatMetricDateLabel(m.metric_date));
  const chartRows = metrics.map((m) => ({
    week: formatMetricDateLabel(m.metric_date),
    CTR: Number(m.ctr),
    CPC: Number(m.cpc),
    노출수: m.impressions,
    클릭수: m.clicks,
    전환수: m.conversions,
    "Eng.Rate": Number(m.engagement_rate),
    전환율: Number(m.conversion_rate),
  }));

  const avgScoreVsOthers = metrics.length
    ? Number(metrics[metrics.length - 1].avg_score_vs_others)
    : PEER_AVG_SCORE;

  const progress = missionProgress.find(
    (p) => p.mission_id === mission.mission_id && p.club_id === clubId,
  );

  const deliverables = missionDeliverables.filter((d) => d.mission_id === mission.mission_id);
  const taskRows = deliverables.map(deliverableToTask);

  const notifRows = notifications.filter((n) => n.match_id === match.match_id).sort((a, b) => a.created_at.localeCompare(b.created_at));

  const solRows = marketingSolutions.filter((s) => s.mission_id === mission.mission_id);

  const uiKey =
    match.status === "completed"
      ? "completed"
      : match.status === "pending_review" || match.status === "scheduled"
        ? "pending_review"
        : "in_progress";

  return {
    club: {
      id: club.club_id,
      club_id: club.club_id,
      name: club.name,
      initials: clubInitials(club.name),
      university: club.university,
    },
    match,
    mission,
    metrics,
    weeks,
    chartRows,
    score: Math.round(progress?.progress_percent ?? 0),
    avgScore: avgScoreVsOthers,
    viralVsPeerChart: [
      { name: "이 동아리", value: Math.round(progress?.progress_percent ?? 0) },
      { name: "참여 평균", value: PEER_AVG_SCORE },
    ],
    solutions: solutionsToUi(solRows),
    notices: notificationsToNotices(notifRows),
    missions: taskRows,
    timeline: missionTimelineEvents.filter((t) => t.mission_id === mission.mission_id),
    statusKey: uiKey,
    missionTitle: mission.mission_name,
    missionDescription: mission.mission_description,
    objectiveKpi: mission.objective_kpi,
  };
}

export const DEFAULT_COMPANY_ID = 1;

/** 동아리 순위(리더보드) — 점수 내림차순 */
export function getLeaderboardForCompany(companyId = DEFAULT_COMPANY_ID) {
  return [...listMatchedClubsForCompany(companyId)]
    .sort((a, b) => b.score - a.score)
    .map((row, i) => ({
      ...row,
      rank: i + 1,
      rankDelta: i === 0 ? 0 : i <= 1 ? 1 : i >= 3 ? -1 : 0,
    }));
}

/** 라우트·하위 호환: 매칭된 동아리 요약 배열 */
export const clubs = listMatchedClubsForCompany(DEFAULT_COMPANY_ID);
