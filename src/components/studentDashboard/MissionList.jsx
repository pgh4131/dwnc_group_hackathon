import { useMemo, useRef } from "react";

const approvalStatusMeta = {
  approved: { label: "승인 완료", tone: "success" },
  pending: { label: "승인 대기", tone: "warning" },
  revision: { label: "수정 요청", tone: "danger" },
  not_submitted: { label: "미제출", tone: "muted" },
};

function calculateMissionProgress(mission) {
  const approvalTotal = mission.approvalItems?.length || 1;
  const approvedCount = (mission.approvalItems || []).filter((item) => item.status === "approved").length;
  const approvalProgress = Math.round((approvedCount / approvalTotal) * 100);
  const blended = Math.round((mission.kpiProgress || 0) * 0.55 + approvalProgress * 0.45);
  return {
    ...mission,
    approvalProgress,
    overallProgress: approvalProgress < 100 ? Math.min(blended, 82) : blended,
  };
}

function StatusBadge({ status }) {
  const meta = approvalStatusMeta[status] ?? approvalStatusMeta.not_submitted;
  return <span className={`student-status-badge student-status-badge--${meta.tone}`}>{meta.label}</span>;
}

function formatFileSize(size) {
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)}MB`;
  return `${Math.max(1, Math.round(size / 1024))}KB`;
}

function truncateFileName(name) {
  if (name.length <= 20) return name;
  return `${name.slice(0, 17)}...`;
}

export default function MissionList({ missions, onMissionsChange }) {
  const fileInputRefs = useRef({});

  const summary = useMemo(() => {
    const total = missions.length || 1;
    const avgOverall = Math.round(missions.reduce((sum, mission) => sum + mission.overallProgress, 0) / total);
    const approvedItems = missions.flatMap((mission) => mission.approvalItems).filter((item) => item.status === "approved");
    const allItems = missions.flatMap((mission) => mission.approvalItems);

    return {
      avgOverall,
      approvedCount: approvedItems.length,
      totalApprovals: allItems.length,
    };
  }, [missions]);

  function submitApproval(missionId, itemId) {
    fileInputRefs.current[`${missionId}-${itemId}`]?.click();
  }

  function handleFileChange(event, missionId, itemId) {
    const file = event.target.files?.[0];
    if (!file) return;

    onMissionsChange((rows) =>
      rows.map((mission) => {
        if (mission.id !== missionId) return mission;

        return calculateMissionProgress({
          ...mission,
          approvalItems: mission.approvalItems.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  status: "pending",
                  fileName: file.name,
                  fileSize: file.size,
                }
              : item,
          ),
        });
      }),
    );

    event.target.value = "";
  }

  return (
    <section className="dashboard-card student-section">
      <div className="student-section-head">
        <div>
          <p className="dashboard-section-label">Mission Control</p>
          <h2 className="student-section-title">미션 목록 · KPI · 승인 제출</h2>
        </div>
        <div className="student-summary-pill">
          전체 진행률 <strong>{summary.avgOverall}%</strong>
        </div>
      </div>

      <div className="student-kpi-split">
        <div>
          <span>KPI 달성률은 성과 지표 기준</span>
          <strong>{Math.round(missions.reduce((sum, m) => sum + m.kpiProgress, 0) / missions.length)}%</strong>
        </div>
        <div>
          <span>기업 승인 완료</span>
          <strong>
            {summary.approvedCount}/{summary.totalApprovals}
          </strong>
        </div>
      </div>

      <div className="student-mission-list">
        {missions.map((mission) => (
          <article key={mission.id} className="student-mission-card">
            <div className="student-mission-main">
              <div>
                <h3>{mission.title}</h3>
                <p>{mission.period}</p>
              </div>
              <span className="student-reward">{mission.reward}</span>
            </div>

            <div className="student-mission-kpi">
              <span>목표 KPI</span>
              <strong>{mission.targetKpi}</strong>
            </div>

            <div className="student-progress-grid">
              <div>
                <div className="student-progress-label">
                  <span>정량 KPI 달성률</span>
                  <strong>{mission.kpiProgress}%</strong>
                </div>
                <div className="student-progress-track">
                  <span style={{ width: `${mission.kpiProgress}%` }} />
                </div>
              </div>

              <div>
                <div className="student-progress-label">
                  <span>전체 진행률</span>
                  <strong>{mission.overallProgress}%</strong>
                </div>
                <div className="student-progress-track student-progress-track--overall">
                  <span style={{ width: `${mission.overallProgress}%` }} />
                </div>
                <p className="student-progress-note">
                  기업 승인 완료율 {mission.approvalProgress}% 반영. 승인 미완료 시 진행률이 제한됩니다.
                </p>
              </div>
            </div>

            <div className="student-approval-list">
              {mission.approvalItems.map((item) => {
                const canSubmit = item.status === "not_submitted" || item.status === "revision";
                return (
                  <div key={item.id} className="student-approval-row">
                    <div>
                      <strong>{item.label}</strong>
                      <StatusBadge status={item.status} />
                      {item.fileName ? (
                        <span className="student-file-meta">
                          {truncateFileName(item.fileName)} · {formatFileSize(item.fileSize)}
                        </span>
                      ) : null}
                    </div>
                    <input
                      type="file"
                      ref={(element) => {
                        fileInputRefs.current[`${mission.id}-${item.id}`] = element;
                      }}
                      style={{ display: "none" }}
                      accept=".pdf,.jpg,.png,.mp4,.zip"
                      onChange={(event) => handleFileChange(event, mission.id, item.id)}
                    />
                    <button
                      type="button"
                      className="student-small-btn"
                      onClick={() => submitApproval(mission.id, item.id)}
                    >
                      {canSubmit ? "콘텐츠 업로드" : item.fileName ? "다시 제출" : "제출 완료"}
                    </button>
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
