import { Navigate, useParams } from "react-router-dom";

const projectToMissionId = {
  p1: "m-ugc",
  p2: "m-campus",
  p3: "m-report",
};

export default function StudentProjectDetail() {
  const { id } = useParams();
  const missionId = projectToMissionId[id] ?? "m-ugc";

  return <Navigate to={`/dashboard/student/mission/${missionId}`} replace />;
}
