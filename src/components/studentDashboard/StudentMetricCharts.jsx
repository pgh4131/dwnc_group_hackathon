import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const BLUE = "#2563eb";
const INDIGO = "#4f46e5";
const tickStyle = { fontSize: 11, fill: "var(--color-text-muted)" };

function sliceByPeriod(rows, period) {
  if (period === "week") return rows.slice(-7);
  if (period === "twoWeeks") return rows.slice(-14);
  return rows;
}

function average(rows, key) {
  if (!rows.length) return 0;
  return rows.reduce((sum, row) => sum + Number(row[key] || 0), 0) / rows.length;
}

function ChartBox({ title, subtitle, children }) {
  return (
    <div className="student-chart-box">
      <div>
        <h3>{title}</h3>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {children}
    </div>
  );
}

export default function StudentMetricCharts({ rows, myScore, peerScore, embedded = false }) {
  const [period, setPeriod] = useState("week");
  const filteredRows = useMemo(() => sliceByPeriod(rows, period), [rows, period]);
  const latest = filteredRows[filteredRows.length - 1] ?? {};
  const avgCtr = average(filteredRows, "ctr");

  return (
    <section className={embedded ? "student-section student-section--embedded" : "dashboard-card student-section"}>
      <div className="student-section-head">
        <div>
          <p className="dashboard-section-label">Marketing Metrics</p>
          <h2 className="student-section-title">마케팅 지표 차트</h2>
        </div>
        <div className="metric-chart-toolbar">
          {[
            { id: "week", label: "1주" },
            { id: "twoWeeks", label: "2주" },
            { id: "all", label: "전체" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              className={`metric-period-btn ${period === item.id ? "metric-period-btn--active" : ""}`}
              onClick={() => setPeriod(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="student-score-card">
        <div>
          <span>우리 동아리 평균 스코어</span>
          <strong>{myScore}</strong>
        </div>
        <div>
          <span>타 단체 평균</span>
          <strong>{peerScore}</strong>
        </div>
        <div>
          <span>최근 CTR / CPC</span>
          <strong>
            {latest.ctr?.toFixed(2)}% · {latest.cpc?.toLocaleString()}원
          </strong>
        </div>
      </div>

      <div className="student-metric-grid">
        <ChartBox title="노출 추이" subtitle="기간별 impressions와 클릭 반응">
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={filteredRows}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" tick={tickStyle} />
              <YAxis yAxisId="left" tick={tickStyle} />
              <YAxis yAxisId="right" orientation="right" tick={tickStyle} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="impressions" name="노출" fill="#93c5fd" radius={[6, 6, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="clicks" name="클릭" stroke={INDIGO} strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title="CTR" subtitle="평균 CTR 기준선 포함">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={filteredRows}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" tick={tickStyle} />
              <YAxis tick={tickStyle} domain={["auto", "auto"]} />
              <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
              <ReferenceLine y={avgCtr} stroke={INDIGO} strokeDasharray="4 4" label={{ value: "평균", fill: INDIGO, fontSize: 10 }} />
              <Line type="monotone" dataKey="ctr" name="CTR" stroke={BLUE} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title="CPC" subtitle="클릭당 비용 감소/증가 패턴">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={filteredRows}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" tick={tickStyle} />
              <YAxis tick={tickStyle} domain={["auto", "auto"]} />
              <Tooltip formatter={(value) => `${Number(value).toLocaleString()}원`} />
              <Area type="monotone" dataKey="cpc" name="CPC" stroke={INDIGO} fill="#c7d2fe" fillOpacity={0.82} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title="Engagement Rate" subtitle="좋아요·댓글·공유 반응 강도">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={filteredRows}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" tick={tickStyle} />
              <YAxis tick={tickStyle} domain={["auto", "auto"]} />
              <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
              <Line type="monotone" dataKey="engagement" name="Engagement" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title="전환율" subtitle="노출 → 클릭 이후 가입/참여 전환">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={filteredRows}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" tick={tickStyle} />
              <YAxis tick={tickStyle} domain={[0, "auto"]} />
              <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
              <Bar dataKey="conversion" name="전환율" fill={BLUE} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title="타 단체 대비 평균 스코어" subtitle="스코어 추이와 현재 평균 비교">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={filteredRows}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" tick={tickStyle} />
              <YAxis tick={tickStyle} domain={[50, 100]} />
              <Tooltip />
              <ReferenceLine y={peerScore} stroke={INDIGO} strokeDasharray="4 4" label={{ value: "타 단체 평균", fill: INDIGO, fontSize: 10 }} />
              <Line type="monotone" dataKey="avgScore" name="우리 스코어" stroke={BLUE} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartBox>
      </div>
    </section>
  );
}
