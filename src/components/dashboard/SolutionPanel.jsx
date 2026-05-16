import { useState } from "react";

/**
 * marketing_solutions: 기업 선택·전달 (목数据)
 * notifications: 공지 발송 목록 (notifications 테이블 형식에 맞춘 UI 상태)
 */
export default function SolutionPanel({ missionId, solutions = [], initialNotices = [], onAssign }) {
  const [selected, setSelected] = useState([]);

  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeText, setNoticeText] = useState("");
  const [notices, setNotices] = useState(initialNotices);
  const [noticeSent, setNoticeSent] = useState(false);
  const [missionForm, setMissionForm] = useState({
    title: "",
    description: "",
    deadline: "",
    delayBuffer: "",
    targetMetric: ""
  });
  const [missionSent, setMissionSent] = useState(false);
  const [showMetricInput, setShowMetricInput] = useState(false);

  function toggleSol(id) {
    const isSelected = selected.includes(id);
    if (isSelected) {
      setSelected([]);
    } else {
      setSelected([id]);
      const sol = solutions.find((s) => s.id === id);
      if (sol) {
        setMissionForm((prev) => ({
          ...prev,
          title: sol.title || "",
          description: sol.description || "",
        }));
      }
    }
    setMissionSent(false);
  }

  function handleSendMission() {
    const isFormEmpty = Object.values(missionForm).every(val => !val.trim());
    if (selected.length === 0 && isFormEmpty) return;
    setMissionSent(true);
    
    if (onAssign) {
      onAssign(missionForm);
    }
    
    setTimeout(() => {
      setMissionSent(false);
      setSelected([]);
      setShowMetricInput(false);
      setMissionForm({
        title: "",
        description: "",
        deadline: "",
        delayBuffer: "",
        targetMetric: ""
      });
    }, 2500);
  }

  function handleSendNotice() {
    if (!noticeText.trim()) return;
    const today = new Date();
    const label = `${today.getMonth() + 1}/${today.getDate()}`;
    const title = noticeTitle.trim() || "공지";
    setNotices((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        notification_id: null,
        match_id: null,
        date: label,
        title,
        content: noticeText.trim(),
      },
    ]);
    setNoticeTitle("");
    setNoticeText("");
    setNoticeSent(true);
    setTimeout(() => setNoticeSent(false), 2500);
  }

  function handleAiRecommendMission() {
    window.alert("AI 추천 기능은 추후 지원될 예정입니다.");
  }

  return (
    <div>
      <div className="dashboard-card">
        <h2 className="dashboard-card-title">미션 전달</h2>
        <p className="dashboard-lead">동아리에게 전달할 미션을 선택하거나 직접 입력하여 전달하세요.</p>

        {solutions.map((sol) => {
          const on = selected.includes(sol.id);
          return (
            <div
              key={sol.id}
              role="button"
              tabIndex={0}
              onClick={() => toggleSol(sol.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleSol(sol.id);
                }
              }}
              className={`dashboard-solution-item ${on ? "dashboard-solution-item--on" : ""}`}
            >
              <div
                className={`dashboard-solution-radio ${on ? "dashboard-solution-radio--on" : ""}`}
                aria-hidden
              >
                {on ? <span className="dashboard-solution-check">✓</span> : null}
              </div>
              <span className={`dashboard-solution-text ${on ? "dashboard-solution-text--on" : ""}`}>
                <span className="dashboard-solution-title">{sol.title}</span>
                {sol.description ? ` — ${sol.description}` : ""}
              </span>
            </div>
          );
        })}

        <div className="dashboard-field-block" style={{ marginTop: '24px' }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <p className="dashboard-input-label" style={{ margin: 0 }}>직접 입력 / 기타 미션</p>
            <button
              type="button"
              className="ai-recommend-btn"
              onClick={handleAiRecommendMission}
            >
              ✨ AI로 미션 추천받기
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <p className="dashboard-input-label">미션 제목</p>
              <input
                type="text"
                value={missionForm.title}
                onChange={(e) => { setMissionForm({...missionForm, title: e.target.value}); setMissionSent(false); }}
                placeholder="예: 여름 시즌 SNS 숏폼 제작"
                className="dashboard-input dashboard-input--single"
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <p className="dashboard-input-label">미션 상세 설명</p>
              <textarea
                value={missionForm.description}
                onChange={(e) => { setMissionForm({...missionForm, description: e.target.value}); setMissionSent(false); }}
                placeholder="동아리가 수행할 구체적인 미션 내용을 직접 입력하거나 AI 추천을 받아보세요..."
                rows={3}
                className="dashboard-input dashboard-input--mb"
                style={{ marginBottom: 0 }}
              />
            </div>
            <div>
              <p className="dashboard-input-label">제출 기한</p>
              <input
                type="date"
                value={missionForm.deadline}
                onChange={(e) => { setMissionForm({...missionForm, deadline: e.target.value}); setMissionSent(false); }}
                className="dashboard-input dashboard-input--single"
              />
            </div>
            <div>
              <p className="dashboard-input-label">지연 버퍼 (선택)</p>
              <input
                type="text"
                value={missionForm.delayBuffer}
                onChange={(e) => { setMissionForm({...missionForm, delayBuffer: e.target.value}); setMissionSent(false); }}
                placeholder="예: 기한 후 최대 3일 이내"
                className="dashboard-input dashboard-input--single"
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <div 
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: showMetricInput ? '8px' : '0' }}
                onClick={() => setShowMetricInput(!showMetricInput)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setShowMetricInput(!showMetricInput);
                  }
                }}
              >
                <div
                  className={`dashboard-solution-radio ${showMetricInput ? "dashboard-solution-radio--on" : ""}`}
                  aria-hidden
                  style={{ marginRight: '8px' }}
                >
                  {showMetricInput ? <span className="dashboard-solution-check">✓</span> : null}
                </div>
                <p className="dashboard-input-label" style={{ margin: 0, cursor: 'pointer' }}>목표 수치 / KPI 입력 (선택)</p>
              </div>
              
              {showMetricInput && (
                <div>
                  <input
                    type="number"
                    value={missionForm.targetMetric}
                    onChange={(e) => { setMissionForm({...missionForm, targetMetric: e.target.value}); setMissionSent(false); }}
                    placeholder="숫자만 입력해 주세요 (예: 10000)"
                    className="dashboard-input dashboard-input--single"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSendMission}
          disabled={missionSent}
          className={`button ${missionSent ? "button-secondary" : "button-primary"}`}
        >
          {missionSent ? "✓ 미션 전달 완료" : "동아리에 미션 전달"}
        </button>
      </div>

      <div className="dashboard-card">
        <h2 className="dashboard-card-title">공지·알림</h2>
        <p className="dashboard-lead">매칭 단위로 동아리에 알림을 보냅니다.</p>

        <p className="dashboard-input-label">제목</p>
        <input
          type="text"
          value={noticeTitle}
          onChange={(e) => setNoticeTitle(e.target.value)}
          placeholder="알림 제목"
          className="dashboard-input dashboard-input--single"
        />

        <p className="dashboard-input-label" style={{ marginTop: 10 }}>
          내용
        </p>
        <textarea
          value={noticeText}
          onChange={(e) => setNoticeText(e.target.value)}
          placeholder="공지 내용을 입력하세요..."
          rows={3}
          className="dashboard-input dashboard-input--mb"
        />
        <button
          type="button"
          onClick={handleSendNotice}
          className={`button ${noticeSent ? "button-secondary" : "button-primary"}`}
        >
          {noticeSent ? "✓ 발송 완료" : "공지 발송"}
        </button>

        {notices.length > 0 && (
          <div className="dashboard-notice-list">
            <p className="dashboard-input-label">발송 내역</p>
            {notices.map((n) => (
              <div key={n.id} className="dashboard-notice-item">
                <div className="dashboard-notice-head">
                  <span className="dashboard-notice-title">{n.title ?? "공지"}</span>
                  <span className="dashboard-notice-date">{n.date}</span>
                </div>
                <p className="dashboard-notice-body">{n.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
