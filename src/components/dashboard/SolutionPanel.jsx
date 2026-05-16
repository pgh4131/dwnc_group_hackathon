import { useState } from "react";

/**
 * marketing_solutions: 기업 선택·전달 (목数据)
 * notifications: 공지 발송 목록 (notifications 테이블 형식에 맞춘 UI 상태)
 */
export default function SolutionPanel({ missionId, solutions = [], initialNotices = [] }) {
  const [selected, setSelected] = useState([]);
  const [custom, setCustom] = useState("");
  const [sent, setSent] = useState(false);

  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeText, setNoticeText] = useState("");
  const [notices, setNotices] = useState(initialNotices);
  const [noticeSent, setNoticeSent] = useState(false);

  function toggleSol(id) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setSent(false);
  }

  function handleSendSolution() {
    if (selected.length === 0 && !custom.trim()) return;
    setSent(true);
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

  return (
    <div>
      <div className="dashboard-card">
        <p className="dashboard-section-label">
          마케팅 솔루션 (marketing_solutions) · 미션 #{missionId}
        </p>
        <p className="dashboard-lead">적용할 솔루션을 선택하고 동아리에 전달하세요.</p>

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

        <div className="dashboard-field-block">
          <p className="dashboard-input-label">기타 피드백 (solution_type: custom)</p>
          <textarea
            value={custom}
            onChange={(e) => {
              setCustom(e.target.value);
              setSent(false);
            }}
            placeholder="추가 피드백을 입력하세요..."
            rows={3}
            className="dashboard-input"
          />
        </div>

        <button
          type="button"
          onClick={handleSendSolution}
          disabled={sent}
          className={`button ${sent ? "button-secondary" : "button-primary"}`}
        >
          {sent ? "✓ 전송 완료" : "동아리에 솔루션 전달"}
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
