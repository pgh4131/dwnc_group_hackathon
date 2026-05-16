export const studentProfile = {
  clubName: "연세대 마케팅학회 PRISM",
  university: "연세대",
  companyName: "런치플리",
  campaignName: "캠퍼스 런치 챌린지",
  owner: "김민서",
};

const missionSeeds = [
  {
    id: "m-ugc",
    title: "숏폼 콘텐츠 6건 제작",
    period: "2026.05.01 - 2026.05.18",
    targetKpi: "누적 조회 80,000회 / CTR 4.0%",
    reward: "팀 보상 120만원 + 우수작 보너스",
    kpiProgress: 92,
    approvalItems: [
      { id: "a-ugc-1", label: "콘텐츠 원본 업로드", status: "approved" },
      { id: "a-ugc-2", label: "성과 캡처 증빙", status: "pending" },
      { id: "a-ugc-3", label: "브랜드 가이드 검수", status: "revision" },
    ],
  },
  {
    id: "m-campus",
    title: "캠퍼스 부스 바이럴",
    period: "2026.05.14 - 2026.05.27",
    targetKpi: "현장 참여 300명 / 전환율 3.2%",
    reward: "운영비 80만원 + 인증서 발급",
    kpiProgress: 67,
    approvalItems: [
      { id: "a-campus-1", label: "현장 사진 제출", status: "approved" },
      { id: "a-campus-2", label: "참여자 집계 시트", status: "not_submitted" },
    ],
  },
  {
    id: "m-report",
    title: "최종 성과 리포트",
    period: "2026.05.28 - 2026.06.05",
    targetKpi: "성과 요약 + 개선안 5개",
    reward: "최종 성과 인센티브",
    kpiProgress: 28,
    approvalItems: [
      { id: "a-report-1", label: "리포트 초안", status: "not_submitted" },
      { id: "a-report-2", label: "기업 피드백 반영본", status: "not_submitted" },
    ],
  },
];

export const approvalStatusMeta = {
  approved: { label: "승인 완료", tone: "success" },
  pending: { label: "승인 대기", tone: "warning" },
  revision: { label: "수정 요청", tone: "danger" },
  not_submitted: { label: "미제출", tone: "muted" },
};

export function calculateMissionProgress(mission) {
  const approvalTotal = mission.approvalItems.length || 1;
  const approvedCount = mission.approvalItems.filter((item) => item.status === "approved").length;
  const approvalProgress = Math.round((approvedCount / approvalTotal) * 100);
  const blended = Math.round(mission.kpiProgress * 0.55 + approvalProgress * 0.45);

  return {
    ...mission,
    approvalProgress,
    overallProgress: approvalProgress < 100 ? Math.min(blended, 82) : blended,
  };
}

export const studentMissions = missionSeeds.map(calculateMissionProgress);

export const studentTimeline = [
  {
    id: "phase-1",
    title: "킥오프",
    startDate: "2026.05.01",
    endDate: "2026.05.03",
    milestone: "브랜드 가이드 공유",
    dueDate: "2026.05.03",
    status: "completed",
    bufferDays: 1,
  },
  {
    id: "phase-2",
    title: "콘텐츠 제작",
    startDate: "2026.05.04",
    endDate: "2026.05.18",
    milestone: "숏폼 6건 게시",
    dueDate: "2026.05.18",
    status: "in_progress",
    bufferDays: 2,
  },
  {
    id: "phase-3",
    title: "오프라인 부스",
    startDate: "2026.05.14",
    endDate: "2026.05.27",
    milestone: "참여자 집계 제출",
    dueDate: "2026.05.28",
    status: "in_progress",
    bufferDays: 3,
  },
  {
    id: "phase-4",
    title: "성과 리포트",
    startDate: "2026.05.28",
    endDate: "2026.06.05",
    milestone: "최종 리포트 승인",
    dueDate: "2026.06.05",
    status: "upcoming",
    bufferDays: 2,
  },
];

export const feedbackMessages = [
  {
    id: "fb-1",
    missionId: "m-ugc",
    missionTitle: "숏폼 콘텐츠 6건 제작",
    sender: "런치플리 브랜드팀",
    channel: "mail",
    receivedAt: "오늘 10:12",
    isRead: false,
    body: "3번 릴스의 CTA 문구를 '지금 참여하기'로 바꿔 주세요. 톤은 현재 방향이 좋습니다.",
    comments: ["팀 내부에 수정 요청 공유했습니다."],
  },
  {
    id: "fb-2",
    missionId: "m-campus",
    missionTitle: "캠퍼스 부스 바이럴",
    sender: "런치플리 PM",
    channel: "messenger",
    receivedAt: "어제 17:40",
    isRead: true,
    body: "부스 운영 시간표와 담당자 명단을 오늘 안으로 업로드해 주세요.",
    comments: [],
  },
  {
    id: "fb-3",
    missionId: "m-report",
    missionTitle: "최종 성과 리포트",
    sender: "런치플리 데이터팀",
    channel: "mail",
    receivedAt: "5월 14일",
    isRead: true,
    body: "리포트에는 CTR, CPC, 전환율을 전주 대비로 같이 정리해 주세요.",
    comments: ["차트 캡처 포함 예정입니다."],
  },
];

export const certificateState = {
  status: "not_requested",
  options: [
    { id: "pdf", label: "PDF 인증서" },
    { id: "badge", label: "디지털 배지" },
  ],
};

export const comparisonRows = [
  { name: "PRISM", uploads: 18, comments: 146, ctr: 4.8, engagement: 8.7, conversion: 3.9, isMine: true },
  { name: "SPARKS", uploads: 14, comments: 122, ctr: 4.1, engagement: 7.2, conversion: 3.4, isMine: false },
  { name: "FORM", uploads: 11, comments: 88, ctr: 3.6, engagement: 6.9, conversion: 2.8, isMine: false },
  { name: "BYTECLUB", uploads: 16, comments: 105, ctr: 4.3, engagement: 7.8, conversion: 3.1, isMine: false },
];

export const metricSeries = [
  { date: "5/01", impressions: 10800, clicks: 390, ctr: 3.61, cpc: 1320, engagement: 6.8, conversion: 2.4, avgScore: 68 },
  { date: "5/02", impressions: 12600, clicks: 485, ctr: 3.85, cpc: 1240, engagement: 7.1, conversion: 2.7, avgScore: 69 },
  { date: "5/03", impressions: 11900, clicks: 472, ctr: 3.97, cpc: 1190, engagement: 7.3, conversion: 2.8, avgScore: 69 },
  { date: "5/04", impressions: 14100, clicks: 612, ctr: 4.34, cpc: 1120, engagement: 7.8, conversion: 3.1, avgScore: 70 },
  { date: "5/05", impressions: 15800, clicks: 694, ctr: 4.39, cpc: 1090, engagement: 8.0, conversion: 3.3, avgScore: 70 },
  { date: "5/06", impressions: 15100, clicks: 681, ctr: 4.51, cpc: 1040, engagement: 8.1, conversion: 3.4, avgScore: 71 },
  { date: "5/07", impressions: 17600, clicks: 826, ctr: 4.69, cpc: 990, engagement: 8.4, conversion: 3.7, avgScore: 71 },
  { date: "5/08", impressions: 18200, clicks: 881, ctr: 4.84, cpc: 940, engagement: 8.6, conversion: 3.8, avgScore: 72 },
  { date: "5/09", impressions: 16900, clicks: 792, ctr: 4.69, cpc: 980, engagement: 8.3, conversion: 3.6, avgScore: 72 },
  { date: "5/10", impressions: 19400, clicks: 955, ctr: 4.92, cpc: 910, engagement: 8.8, conversion: 4.0, avgScore: 73 },
  { date: "5/11", impressions: 20600, clicks: 1018, ctr: 4.94, cpc: 895, engagement: 9.0, conversion: 4.1, avgScore: 73 },
  { date: "5/12", impressions: 19800, clicks: 960, ctr: 4.85, cpc: 930, engagement: 8.7, conversion: 3.9, avgScore: 74 },
  { date: "5/13", impressions: 22100, clicks: 1094, ctr: 4.95, cpc: 880, engagement: 9.1, conversion: 4.2, avgScore: 74 },
  { date: "5/14", impressions: 23600, clicks: 1168, ctr: 4.95, cpc: 860, engagement: 9.2, conversion: 4.3, avgScore: 75 },
];

export const peerAverageScore = 75;
export const myClubScore = 88;

export const studentProjectsList = [
  {
    id: 'p1',
    companyName: '런치플리',
    campaignName: '캠퍼스 런치 챌린지',
    status: '진행중',
    dueDate: '2026.06.05',
  },
  {
    id: 'p2',
    companyName: '네이버',
    campaignName: '클립 크리에이터 3기',
    status: '대기중',
    dueDate: '2026.07.15',
  },
  {
    id: 'p3',
    companyName: '토스',
    campaignName: '대학생 금융 앰배서더',
    status: '완료됨',
    dueDate: '2026.04.30',
  }
];
