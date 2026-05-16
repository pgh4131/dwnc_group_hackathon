import { useMemo, useState } from "react";
import { submitMissionDeliverable } from "../../services/missions.js";

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

export default function MissionList({ missions, onMissionsChange }) {
  const [inputValues, setInputValues] = useState({});
  const [submitting, setSubmitting] = useState(false);

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

  async function handleSubmitApproval(mission, itemId) {
    const content = inputValues[`${mission.id}-${itemId}`];
    if (!content) return;

    setSubmitting(true);
    const { error, autoApproved } = await submitMissionDeliverable({
      deliverableId: itemId,
      missionId: mission.mission_id,
      clubId: mission.club_id,
      content,
      targetMetric: mission.targetMetric
    });
    setSubmitting(false);

    if (error) {
      alert(`제출 실패: ${error}`);
      return;
    }

    onMissionsChange((rows) =>
      rows.map((m) => {
        if (m.id !== mission.id) return m;

        return calculateMissionProgress({
          ...m,
          kpiProgress: autoApproved ? 100 : m.kpiProgress,
          approvalItems: m.approvalItems.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  status: autoApproved ? "approved" : "pending",
                  submissionContent: content,
                }
              : item,
          ),
        });
      }),
    );
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
          <strong>{Math.round(missions.reduce((sum, m) => sum + m.kpiProgress, 0) / (missions.length || 1))}%</strong>
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
                const isMetric = mission.targetMetric != null;
                const inputKey = `${mission.id}-${item.id}`;
                const val = inputValues[inputKey] ?? (item.submissionContent || "");

                return (
                  <div key={item.id} className="student-approval-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{item.label}</strong>
                        <StatusBadge status={item.status} />
                      </div>
                      <button
                        type="button"
                        className="student-small-btn"
                        disabled={submitting || (!canSubmit && item.status !== "pending")}
                        onClick={() => handleSubmitApproval(mission, item.id)}
                      >
                        {item.status === 'approved' ? "제출 완료" : canSubmit ? "제출하기" : "수정하여 다시 제출"}
                      </button>
                    </div>
                    {item.status !== 'approved' && (
                      <input
                        type={isMetric ? "number" : "text"}
                        value={val}
                        onChange={(e) => setInputValues({ ...inputValues, [inputKey]: e.target.value })}
                        placeholder={isMetric ? `달성 수치를 입력하세요 (목표: ${mission.targetMetric})` : "수행 결과를 설명하거나 링크를 입력하세요"}
                        className="dashboard-input dashboard-input--single"
                        style={{ width: '100%' }}
                      />
                    )}
                    {item.status === 'approved' && item.submissionContent && (
                      <p className="student-file-meta" style={{ marginTop: '4px' }}>
                        제출 내용: {item.submissionContent}
                      </p>
                    )}
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
