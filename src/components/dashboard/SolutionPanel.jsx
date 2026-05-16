import { useState } from "react";

/**
 * marketing_solutions: 기업 선택·전달 (목数据)
 * notifications: 공지 발송 목록 (notifications 테이블 형식에 맞춘 UI 상태)
 */
export default function SolutionPanel({ missionId, solutions = [], initialNotices = [] }) {
  const [selected, setSelected] = useState([]);

  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeText, setNoticeText] = useState("");
  const [notices, setNotices] = useState(initialNotices);
  const [noticeSent, setNoticeSent] = useState(false);

  const [newMissionText, setNewMissionText] = useState("");
  const [missionSent, setMissionSent] = useState(false);

  function toggleSol(id) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setMissionSent(false);
  }

  function handleSendMission() {
    if (selected.length === 0 && !newMissionText.trim()) return;
    setMissionSent(true);
    setTimeout(() => setMissionSent(false), 2500);
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
        <p className="dashboard-section-label">
          미션 전달 (assign_mission) · 공고 #{missionId}
        </p>
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
          
          <textarea
            value={newMissionText}
            onChange={(e) => {
              setNewMissionText(e.target.value);
              setMissionSent(false);
            }}
            placeholder="동아리가 수행할 구체적인 미션 내용을 직접 입력하거나 AI 추천을 받아보세요..."
            rows={4}
            className="dashboard-input dashboard-input--mb"
          />
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
        <p className="dashboard-section-label">공지·알림 (notifications)</p>
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
          내용 (message)
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
