import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import MissionList from "../components/studentDashboard/MissionList.jsx";
import MissionTimeline from "../components/studentDashboard/MissionTimeline.jsx";
import FeedbackInbox from "../components/studentDashboard/FeedbackInbox.jsx";
import CertificateSection from "../components/studentDashboard/CertificateSection.jsx";
import ComparisonChart from "../components/studentDashboard/ComparisonChart.jsx";
import StudentMetricCharts from "../components/studentDashboard/StudentMetricCharts.jsx";
import { homepageCopy } from "../data/homepage.js";
import {
  certificateState,
  comparisonRows,
  feedbackMessages,
  metricSeries,
  myClubScore,
  peerAverageScore,
  studentMissions,
  studentProfile,
  studentTimeline,
} from "../data/studentDashboardData.js";

const studentHeaderCopy = {
  ...homepageCopy,
  navigation: [],
  authenticatedNavigation: [],
  headerActions: [{ label: "기업 대시보드로", href: "/dashboard/company", variant: "secondary" }],
};

export default function StudentProjectDetail() {
  const [missions, setMissions] = useState(studentMissions);

  const dashboardStats = useMemo(() => {
    const total = missions.length || 1;
    const avgKpi = Math.round(missions.reduce((sum, mission) => sum + mission.kpiProgress, 0) / total);
    const avgProgress = Math.round(missions.reduce((sum, mission) => sum + mission.overallProgress, 0) / total);
    const approvalItems = missions.flatMap((mission) => mission.approvalItems);
    const pendingCount = approvalItems.filter((item) => item.status === "pending" || item.status === "revision").length;

    return {
      avgKpi,
      avgProgress,
      pendingCount,
      missionCount: missions.length,
    };
  }, [missions]);

  return (
    <div className="dashboard-page student-dashboard-page">
      <div className="dashboard-header-shell">
        <Header copy={studentHeaderCopy} isAuthenticated={false} />
      </div>

      <main className="section-wrap dashboard-main student-dashboard-main">
        <div className="student-hero">
          <div>
            <Link to="/dashboard/student" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 800, color: 'var(--slate-500)', marginBottom: '16px' }}>
              ← 허브로 돌아가기
            </Link>
            <p className="student-eyebrow">{studentProfile.companyName} · {studentProfile.campaignName}</p>
            <h1 className="dashboard-page-title">프로젝트 상세 관리창</h1>
            <p className="dashboard-page-sub">
              {studentProfile.clubName}이 수행 중인 미션, 제출 승인, 성과 지표, 피드백과 인증서 신청 상태를 한 화면에서 관리합니다.
            </p>
          </div>
          <div className="student-hero-card">
            <span>담당자</span>
            <strong>{studentProfile.owner}</strong>
            <p>{studentProfile.university}</p>
          </div>
        </div>

        <div className="dashboard-metric-grid">
          <div className="company-metric-card company-metric-card--neutral">
            <p className="company-metric-label">진행 미션</p>
            <p className="company-metric-value">{dashboardStats.missionCount}</p>
            <p className="company-metric-desc">기업 협업 미션</p>
          </div>
          <div className="company-metric-card company-metric-card--neutral">
            <p className="company-metric-label">평균 KPI 달성률</p>
            <p className="company-metric-value">{dashboardStats.avgKpi}%</p>
            <p className="company-metric-desc">정량 지표 기준</p>
          </div>
          <div className="company-metric-card company-metric-card--neutral">
            <p className="company-metric-label">전체 진행률</p>
            <p className="company-metric-value">{dashboardStats.avgProgress}%</p>
            <p className="company-metric-desc">기업 승인 반영</p>
          </div>
          <div className="company-metric-card company-metric-card--neutral">
            <p className="company-metric-label">확인 필요</p>
            <p className="company-metric-value">{dashboardStats.pendingCount}</p>
            <p className="company-metric-desc">승인 대기·수정 요청</p>
          </div>
        </div>

        <div className="student-dashboard-grid">
          <div className="student-dashboard-primary">
            <MissionList missions={missions} onMissionsChange={setMissions} />
            <StudentMetricCharts rows={metricSeries} myScore={myClubScore} peerScore={peerAverageScore} />
            <ComparisonChart rows={comparisonRows} />
          </div>

          <aside className="student-dashboard-side">
            <MissionTimeline timeline={studentTimeline} />
            <FeedbackInbox messages={feedbackMessages} missions={missions} />
            <CertificateSection missions={missions} certificate={certificateState} />
          </aside>
        </div>
      </main>
    </div>
  );
}
