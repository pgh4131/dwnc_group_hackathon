import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const tickStyle = { fontSize: 11, fill: "var(--color-text-muted)" };

export default function ComparisonChart({ rows }) {
  return (
    <section className="dashboard-card student-section">
      <div className="student-section-head">
        <div>
          <p className="dashboard-section-label">Peer Comparison</p>
          <h2 className="student-section-title">타 동아리 비교</h2>
        </div>
        <span className="student-summary-pill">우리 동아리 강조</span>
      </div>

      <div className="student-chart-split">
        <div className="student-chart-panel">
          <h3>활동률: 업로드 수 · 댓글 수</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" tick={tickStyle} />
              <YAxis tick={tickStyle} />
              <Tooltip />
              <Legend />
              <Bar dataKey="uploads" name="업로드 수" radius={[6, 6, 0, 0]}>
                {rows.map((row) => (
                  <Cell key={`uploads-${row.name}`} fill={row.isMine ? "#2563eb" : "#cbd5e1"} />
                ))}
              </Bar>
              <Bar dataKey="comments" name="댓글 수" radius={[6, 6, 0, 0]}>
                {rows.map((row) => (
                  <Cell key={`comments-${row.name}`} fill={row.isMine ? "#4f46e5" : "#e2e8f0"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="student-chart-panel">
          <h3>성과율: CTR · Engagement · 전환율</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" tick={tickStyle} />
              <YAxis tick={tickStyle} />
              <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
              <Legend />
              <Bar dataKey="ctr" name="CTR" radius={[6, 6, 0, 0]}>
                {rows.map((row) => (
                  <Cell key={`ctr-${row.name}`} fill={row.isMine ? "#2563eb" : "#cbd5e1"} />
                ))}
              </Bar>
              <Bar dataKey="engagement" name="Engagement" radius={[6, 6, 0, 0]}>
                {rows.map((row) => (
                  <Cell key={`eng-${row.name}`} fill={row.isMine ? "#4f46e5" : "#e2e8f0"} />
                ))}
              </Bar>
              <Bar dataKey="conversion" name="전환율" radius={[6, 6, 0, 0]}>
                {rows.map((row) => (
                  <Cell key={`conv-${row.name}`} fill={row.isMine ? "#60a5fa" : "#f1f5f9"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
