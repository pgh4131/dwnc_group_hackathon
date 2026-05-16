import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header.jsx";
import MissionList from "../components/studentDashboard/MissionList.jsx";
import MissionTimeline from "../components/studentDashboard/MissionTimeline.jsx";
import FeedbackInbox from "../components/studentDashboard/FeedbackInbox.jsx";
import CertificateSection from "../components/studentDashboard/CertificateSection.jsx";
import ComparisonChart from "../components/studentDashboard/ComparisonChart.jsx";
import StudentMetricCharts from "../components/studentDashboard/StudentMetricCharts.jsx";
import { homepageCopy } from "../data/homepage.js";
import { fetchStudentMissions, fetchStudentFeedback } from "../services/missions.js";

const studentHeaderCopy = {
  ...homepageCopy,
  navigation: [],
  authenticatedNavigation: [],
  headerActions: [],
};

export default function StudentMissionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [missions, setMissions] = useState([]);
  const [feedbackMessages, setFeedbackMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      // TODO: resolve club_id from student profile
      const clubId = 1;
      const { missions: data } = await fetchStudentMissions(clubId);
      const { feedback } = await fetchStudentFeedback(clubId);
      if (isMounted) {
        setMissions(data);
        setFeedbackMessages(feedback);
        setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

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
    [feedbackMessages, selectedMission?.id],
  );

  const certificateState = {
    status: "not_requested",
    options: [
      { id: "pdf", label: "PDF 인증서" },
      { id: "badge", label: "디지털 배지" },
    ],
  };

  if (loading) {
    return (
      <div className="dashboard-page student-dashboard-page">
        <div className="dashboard-header-shell">
          <Header copy={studentHeaderCopy} isAuthenticated={false} />
        </div>
        <main className="section-wrap dashboard-main" style={{ textAlign: 'center', padding: '48px' }}>
          <p className="dashboard-lead">데이터를 불러오는 중입니다...</p>
        </main>
      </div>
    );
  }

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
              {selectedMission.period} · {selectedMission.targetKpi}
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
            <MissionTimeline timeline={[]} />
            <StudentMetricCharts rows={[]} myScore={0} peerScore={0} />
            <FeedbackInbox messages={detailFeedback} missions={detailMissions} />
            <CertificateSection missions={detailMissions} certificate={certificateState} />
            <ComparisonChart rows={[]} />
          </div>

          <aside className="student-dashboard-side">
            <MissionList missions={detailMissions} onMissionsChange={setMissions} />
          </aside>
        </div>
      </main>
    </div>
  );
}
