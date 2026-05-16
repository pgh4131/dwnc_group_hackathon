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
import { getAccountType, getCurrentSession } from "../services/auth.js";
import {
  buildStudentProjectSummaries,
  fetchStudentFeedbackForCurrentUser,
  fetchStudentMissionsForCurrentUser,
} from "../services/missions.js";

const studentHeaderCopy = {
  ...homepageCopy,
  navigation: [],
  authenticatedNavigation: [],
  headerActions: [],
};

export default function StudentProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [missions, setMissions] = useState([]);
  const [feedbackMessages, setFeedbackMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [session, setSession] = useState(null);
  const [accountType, setAccountType] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      const { session: currentSession, error: sessionError } = await getCurrentSession();
      const nextAccountType = await getAccountType(currentSession);

      if (!isMounted) return;

      setSession(currentSession);
      setAccountType(nextAccountType);

      if (sessionError || !currentSession) {
        setMissions([]);
        setFeedbackMessages([]);
        setLoadError(sessionError || "로그인 후 프로젝트 상태를 확인할 수 있습니다.");
        setLoading(false);
        return;
      }

      const [{ missions: data, error: missionError }, { feedback, error: feedbackError }] = await Promise.all([
        fetchStudentMissionsForCurrentUser({ session: currentSession }),
        fetchStudentFeedbackForCurrentUser({ session: currentSession }),
      ]);

      if (!isMounted) return;

      setMissions(data);
      setFeedbackMessages(feedback);
      setLoadError(missionError || feedbackError || "");
      setLoading(false);
    }

    load();

    return () => { isMounted = false; };
  }, []);

  const detailMissions = useMemo(
    () => {
      // id from useParams() is the project's match_id (or detailMissionId fallback)
      return missions.filter((mission) => String(mission.match_id ?? mission.id) === String(id));
    },
    [id, missions],
  );

  const selectedMission = useMemo(
    () => detailMissions[0] ?? missions[0],
    [detailMissions, missions]
  );

  const selectedProject = useMemo(
    () => buildStudentProjectSummaries(detailMissions)[0],
    [detailMissions],
  );

  const detailFeedback = useMemo(
    () => {
      const missionIds = new Set(detailMissions.map((mission) => mission.id));
      return feedbackMessages.filter((message) => missionIds.has(message.missionId));
    },
    [feedbackMessages, detailMissions],
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
          <Header
            copy={studentHeaderCopy}
            isAuthenticated={Boolean(session)}
            userEmail={session?.user?.email || ""}
            accountType={accountType}
          />
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
          <Header
            copy={studentHeaderCopy}
            isAuthenticated={Boolean(session)}
            userEmail={session?.user?.email || ""}
            accountType={accountType}
          />
        </div>
        <main className="section-wrap dashboard-main dashboard-body-muted">
          {loadError || "미션을 찾을 수 없습니다."}
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-page student-dashboard-page">
      <div className="dashboard-header-shell">
        <Header
          copy={studentHeaderCopy}
          isAuthenticated={Boolean(session)}
          userEmail={session?.user?.email || ""}
          accountType={accountType}
        />
      </div>

      <main className="section-wrap dashboard-main student-dashboard-main">
        <button type="button" className="dashboard-back" onClick={() => navigate("/dashboard/student")}>
          ← 학생 대시보드로
        </button>

        <div className="student-hero">
          <div>
            <p className="student-eyebrow">{selectedMission.companyName} · {selectedMission.companyIndustry}</p>
            <h1 className="dashboard-page-title">{selectedProject?.title || selectedMission.title}</h1>
            <p className="dashboard-page-sub">
              {selectedProject?.latestMissionTitle || selectedMission.title} · 미션 {detailMissions.length}개
            </p>
          </div>
          <div className="student-hero-card">
            <span>전체 진행률</span>
            <strong>{selectedProject?.overallProgress ?? selectedMission.overallProgress}%</strong>
            <p>프로젝트 내 미션 평균 진행률</p>
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
