import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  headerActions: [],
};

export default function StudentMissionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [missions, setMissions] = useState(studentMissions);

  const selectedMission = useMemo(
    () => missions.find((mission) => mission.id === id) ?? missions[0],
    [id, missions],
  );

  const detailMissions = useMemo(
    () => missions.filter((mission) => mission.id === selectedMission?.id),
    [missions, selectedMission?.id],
  );

  const detailFeedback = useMemo(
    () => feedbackMessages.filter((message) => message.missionId === selectedMission?.id),
    [selectedMission?.id],
  );

  if (!selectedMission) {
    return (
      <div className="dashboard-page student-dashboard-page">
        <div className="dashboard-header-shell">
          <Header copy={studentHeaderCopy} isAuthenticated={false} />
        </div>
        <main className="section-wrap dashboard-main dashboard-body-muted">미션을 찾을 수 없습니다.</main>
      </div>
    );
  }

  return (
    <div className="dashboard-page student-dashboard-page">
      <div className="dashboard-header-shell">
        <Header copy={studentHeaderCopy} isAuthenticated={false} />
      </div>

      <main className="section-wrap dashboard-main student-dashboard-main">
        <button type="button" className="dashboard-back" onClick={() => navigate("/dashboard/student")}>
          ← 미션 목록으로
        </button>

        <div className="student-hero">
          <div>
            <p className="student-eyebrow">{selectedMission.companyName} · {selectedMission.companyIndustry}</p>
            <h1 className="dashboard-page-title">{selectedMission.title}</h1>
            <p className="dashboard-page-sub">
              {studentProfile.clubName} · {selectedMission.period} · {selectedMission.targetKpi}
            </p>
          </div>
          <div className="student-hero-card">
            <span>전체 진행률</span>
            <strong>{selectedMission.overallProgress}%</strong>
            <p>KPI {selectedMission.kpiProgress}% · 승인 {selectedMission.approvalProgress}%</p>
          </div>
        </div>

        <div className="student-dashboard-grid">
          <div className="student-dashboard-primary">
            <MissionTimeline timeline={studentTimeline} />
            <StudentMetricCharts rows={metricSeries} myScore={myClubScore} peerScore={peerAverageScore} />
            <FeedbackInbox messages={detailFeedback} missions={detailMissions} />
            <CertificateSection missions={detailMissions} certificate={certificateState} />
            <ComparisonChart rows={comparisonRows} />
          </div>

          <aside className="student-dashboard-side">
            <MissionList missions={detailMissions} onMissionsChange={setMissions} />
          </aside>
        </div>
      </main>
    </div>
  );
}
