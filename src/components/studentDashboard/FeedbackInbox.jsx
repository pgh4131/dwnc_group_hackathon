import { useMemo, useState } from "react";

export default function FeedbackInbox({ messages, missions }) {
  const [selectedMission, setSelectedMission] = useState("all");
  const [rows, setRows] = useState(messages);
  const [drafts, setDrafts] = useState({});

  const filteredRows = useMemo(() => {
    if (selectedMission === "all") return rows;
    return rows.filter((message) => message.missionId === selectedMission);
  }, [rows, selectedMission]);

  function markRead(messageId) {
    setRows((current) => current.map((message) => (message.id === messageId ? { ...message, isRead: true } : message)));
  }

  function addComment(messageId) {
    const value = drafts[messageId]?.trim();
    if (!value) return;

    setRows((current) =>
      current.map((message) =>
        message.id === messageId ? { ...message, comments: [...message.comments, value], isRead: true } : message,
      ),
    );
    setDrafts((current) => ({ ...current, [messageId]: "" }));
  }

  return (
    <section className="dashboard-card student-section">
      <div className="student-section-head">
        <div>
          <p className="dashboard-section-label">Feedback Inbox</p>
          <h2 className="student-section-title">피드백 수신함</h2>
        </div>
        <select
          className="student-select"
          value={selectedMission}
          onChange={(event) => setSelectedMission(event.target.value)}
          aria-label="미션별 피드백 필터"
        >
          <option value="all">전체 미션</option>
          {missions.map((mission) => (
            <option key={mission.id} value={mission.id}>
              {mission.title}
            </option>
          ))}
        </select>
      </div>

      <div className="student-inbox-list">
        {filteredRows.map((message) => (
          <article
            key={message.id}
            className={`student-message-card ${message.isRead ? "student-message-card--read" : "student-message-card--unread"}`}
          >
            <div className="student-message-head">
              <div>
                <span className={`student-channel student-channel--${message.channel}`}>
                  {message.channel === "mail" ? "메일" : "메신저"}
                </span>
                <h3>{message.sender}</h3>
                <p>{message.missionTitle}</p>
              </div>
              <button type="button" className="student-small-btn" onClick={() => markRead(message.id)}>
                {message.isRead ? "읽음" : "읽음 처리"}
              </button>
            </div>
            <div className="student-message-bubble">
              <span>{message.receivedAt}</span>
              <p>{message.body}</p>
            </div>

            {message.comments.length > 0 ? (
              <div className="student-comment-list">
                {message.comments.map((comment, index) => (
                  <p key={`${message.id}-${index}`}>{comment}</p>
                ))}
              </div>
            ) : null}

            <div className="student-comment-form">
              <input
                value={drafts[message.id] ?? ""}
                onChange={(event) => setDrafts((current) => ({ ...current, [message.id]: event.target.value }))}
                placeholder="댓글을 남겨 팀/기업 커뮤니케이션을 기록하세요"
              />
              <button type="button" className="student-small-btn student-small-btn--primary" onClick={() => addComment(message.id)}>
                댓글 남기기
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
