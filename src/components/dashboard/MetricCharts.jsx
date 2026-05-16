import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  Legend,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
} from "recharts";

const BLUE = "#2563eb";
const INDIGO = "#4f46e5";
const AMBER = "#d97706";
const RED = "#dc2626";

const tickStyle = { fontSize: 11, fill: "var(--color-text-muted)" };
const gridColor = "var(--color-border)";

function averageBucket(slice, label) {
  const n = slice.length || 1;
  const sum = (key) => slice.reduce((s, r) => s + (Number(r[key]) || 0), 0);
  return {
    week: label,
    CTR: sum("CTR") / n,
    CPC: sum("CPC") / n,
    노출수: Math.round(sum("노출수") / n),
    클릭수: Math.round(sum("클릭수") / n),
    전환수: Math.round(sum("전환수") / n),
    "Eng.Rate": sum("Eng.Rate") / n,
    전환율: sum("전환율") / n,
  };
}

function applyPeriod(rows, period) {
  if (!rows?.length) return [];
  if (period === "day") return rows.map((r) => ({ ...r, periodLabel: r.week }));
  if (period === "month") return [averageBucket(rows, "월간 합산")];
  const mid = Math.ceil(rows.length / 2);
  return [averageBucket(rows.slice(0, mid), "전반"), averageBucket(rows.slice(mid), "후반")];
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="dashboard-chart-card metric-chart-card">
      <p className="dashboard-chart-title">{title}</p>
      {subtitle ? <p className="metric-chart-subtitle">{subtitle}</p> : null}
      {children}
    </div>
  );
}

function CtrTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const idx = d._idx;
  const prev = typeof idx === "number" && idx > 0 ? d._rows?.[idx - 1] : null;
  const delta = prev ? d.CTR - prev.CTR : null;
  return (
    <div className="metric-tooltip">
      <div className="metric-tooltip-title">{d.week}</div>
      <div>노출 {Number(d.노출수).toLocaleString()}회</div>
      <div>클릭 {Number(d.클릭수).toLocaleString()}회</div>
      <div>CTR {Number(d.CTR).toFixed(2)}%</div>
      {delta != null ? (
        <div className={delta >= 0 ? "metric-delta metric-delta--up" : "metric-delta metric-delta--down"}>
          전일 대비 {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(2)}%p
        </div>
      ) : null}
    </div>
  );
}

function ImpressionTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="metric-tooltip">
      <div className="metric-tooltip-title">{d.week}</div>
      <div>노출 {Number(d.노출수).toLocaleString()}회</div>
      <div>클릭 {Number(d.클릭수).toLocaleString()}회</div>
      <div>CTR {Number(d.CTR).toFixed(2)}%</div>
      {d.peak ? <div className="metric-peak-tag">피크 구간</div> : null}
    </div>
  );
}

function KpiCard({ label, value, unit, delta, sparkData, dataKey }) {
  const last = sparkData?.length ? sparkData[sparkData.length - 1][dataKey] : 0;
  const prev = sparkData?.length > 1 ? sparkData[sparkData.length - 2][dataKey] : last;
  const d = last - prev;
  const up = d >= 0;
  return (
    <div className="metric-kpi-card">
      <p className="metric-kpi-label">{label}</p>
      <p className="metric-kpi-value">
        {value}
        {unit ? <span className="metric-kpi-unit">{unit}</span> : null}
      </p>
      {delta != null ? (
        <p className={up ? "metric-kpi-delta metric-kpi-delta--up" : "metric-kpi-delta metric-kpi-delta--down"}>
          {up ? "▲" : "▼"} {Math.abs(delta).toFixed(2)}
          {unit === "%" ? "%p" : unit === "원" ? "원" : ""}
        </p>
      ) : null}
      <div className="metric-sparkline" aria-hidden>
        {sparkData?.length ? (
          <ResponsiveContainer width="100%" height={36}>
            <LineChart data={sparkData}>
              <Line type="monotone" dataKey={dataKey} stroke={BLUE} strokeWidth={1.5} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </div>
  );
}

export default function MetricCharts({ chartRows = [], scoreData = [], score = 0 }) {
  const [period, setPeriod] = useState("day");

  const displayRows = useMemo(() => applyPeriod(chartRows, period), [chartRows, period]);

  const rowsWithMeta = useMemo(() => {
    const maxImp = displayRows.reduce((m, r) => Math.max(m, r.노출수 || 0), 0);
    return displayRows.map((r, i) => ({
      ...r,
      _idx: i,
      _rows: displayRows,
      peak: r.노출수 === maxImp && maxImp > 0,
    }));
  }, [displayRows]);

  const avgCtr = useMemo(() => {
    if (!rowsWithMeta.length) return 0;
    return rowsWithMeta.reduce((s, r) => s + r.CTR, 0) / rowsWithMeta.length;
  }, [rowsWithMeta]);

  const avgCpc = useMemo(() => {
    if (!rowsWithMeta.length) return 0;
    return rowsWithMeta.reduce((s, r) => s + r.CPC, 0) / rowsWithMeta.length;
  }, [rowsWithMeta]);

  const last = chartRows[chartRows.length - 1];
  const prev = chartRows.length > 1 ? chartRows[chartRows.length - 2] : last;

  const radarData = useMemo(() => {
    const er = last?.["Eng.Rate"] ?? 0;
    const scale = (f) => Math.min(100, Math.max(8, er * f));
    return [
      { subject: "좋아요", A: scale(10), fullMark: 100 },
      { subject: "댓글", A: scale(7), fullMark: 100 },
      { subject: "저장", A: scale(6), fullMark: 100 },
      { subject: "공유", A: scale(8), fullMark: 100 },
      { subject: "클릭", A: scale(9), fullMark: 100 },
      { subject: "재방문", A: scale(5), fullMark: 100 },
    ];
  }, [last]);

  const peerAvg = scoreData.find((s) => s.name.includes("평균"))?.value ?? 65;
  const clubVal = scoreData.find((s) => !s.name.includes("평균"))?.value ?? score;
  const percentile = Math.min(99, Math.max(1, Math.round(100 - (peerAvg - clubVal) * 1.2)));

  if (!chartRows.length) {
    return <p className="dashboard-body-muted">지표 데이터가 없습니다.</p>;
  }

  const ctrDelta = last && prev ? last.CTR - prev.CTR : 0;
  const cpcDelta = last && prev ? last.CPC - prev.CPC : 0;

  return (
    <div className="metric-charts-root">
      <div className="metric-chart-toolbar">
        <span className="metric-toolbar-label">기간</span>
        {[
          { id: "day", label: "일" },
          { id: "week", label: "주" },
          { id: "month", label: "월" },
        ].map((p) => (
          <button
            key={p.id}
            type="button"
            className={`metric-period-btn ${period === p.id ? "metric-period-btn--active" : ""}`}
            onClick={() => setPeriod(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="metric-kpi-row">
        <KpiCard
          label="CTR"
          value={last?.CTR?.toFixed(2) ?? "—"}
          unit="%"
          delta={ctrDelta}
          sparkData={chartRows}
          dataKey="CTR"
        />
        <KpiCard
          label="CPC"
          value={last?.CPC != null ? Math.round(last.CPC).toLocaleString() : "—"}
          unit="원"
          delta={cpcDelta}
          sparkData={chartRows}
          dataKey="CPC"
        />
        <KpiCard
          label="노출"
          value={last?.노출수 != null ? last.노출수.toLocaleString() : "—"}
          unit=""
          delta={last && prev ? last.노출수 - prev.노출수 : null}
          sparkData={chartRows}
          dataKey="노출수"
        />
        <KpiCard
          label="전환율"
          value={last?.전환율?.toFixed(2) ?? "—"}
          unit="%"
          delta={last && prev ? last.전환율 - prev.전환율 : null}
          sparkData={chartRows}
          dataKey="전환율"
        />
      </div>

      <div className="metric-gauge-row">
        <div className="metric-gauge-card">
          <p className="metric-gauge-label">바이럴 점수 (게이지)</p>
          <div className="metric-gauge-wrap">
            <ResponsiveContainer width={140} height={88}>
              <PieChart>
                <Pie
                  data={[
                    { name: "score", value: Math.min(100, Math.max(0, score)) },
                    { name: "rest", value: Math.max(0, 100 - Math.min(100, Math.max(0, score))) },
                  ]}
                  cx="50%"
                  cy="100%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={44}
                  outerRadius={62}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill={BLUE} />
                  <Cell fill="#e2e8f0" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <span className="metric-gauge-value">{score}%</span>
          </div>
          <p className="metric-percentile">상위 약 {percentile}% 구간 (목업)</p>
        </div>
      </div>

      <div className="dashboard-chart-grid">
        <ChartCard
          title="CTR (클릭률)"
          subtitle="노출 대비 클릭 비율 시계열 · 평균 CTR 기준선 · 전일 대비 추세"
        >
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={rowsWithMeta}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="week" tick={tickStyle} />
              <YAxis tick={tickStyle} domain={["auto", "auto"]} />
              <Tooltip content={<CtrTooltip />} />
              <ReferenceLine y={avgCtr} stroke={INDIGO} strokeDasharray="5 5" label={{ value: "평균 CTR", fill: INDIGO, fontSize: 10 }} />
              <Line type="monotone" dataKey="CTR" stroke={BLUE} strokeWidth={2} dot={{ r: 3, fill: BLUE }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="CPC + CTR (콤보)"
          subtitle="면적=CPC 추이, 선=CTR — 비용·성과 상관 확인 (목표 CPC 점선)"
        >
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={rowsWithMeta}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="week" tick={tickStyle} />
              <YAxis yAxisId="cpc" tick={tickStyle} domain={["auto", "auto"]} label={{ value: "CPC(원)", angle: -90, position: "insideLeft", fontSize: 10, fill: "#64748b" }} />
              <YAxis yAxisId="ctr" orientation="right" tick={tickStyle} domain={["auto", "auto"]} label={{ value: "CTR(%)", angle: 90, position: "insideRight", fontSize: 10, fill: "#64748b" }} />
              <Tooltip formatter={(v, name) => (name === "CTR" ? `${Number(v).toFixed(2)}%` : `${Number(v).toLocaleString()}원`)} />
              <Legend />
              <ReferenceLine yAxisId="cpc" y={avgCpc} stroke={AMBER} strokeDasharray="4 4" label={{ value: "평균 CPC", fill: AMBER, fontSize: 10 }} />
              <Area yAxisId="cpc" type="monotone" dataKey="CPC" name="CPC" fill="#c7d2fe" stroke={INDIGO} fillOpacity={0.85} />
              <Line yAxisId="ctr" type="monotone" dataKey="CTR" name="CTR" stroke={BLUE} strokeWidth={2} dot={{ r: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="노출 추이 (Impressions)"
          subtitle="막대=노출, 선=클릭 — 피크 구간 강조"
        >
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={rowsWithMeta}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="week" tick={tickStyle} />
              <YAxis yAxisId="left" tick={tickStyle} />
              <YAxis yAxisId="right" orientation="right" tick={tickStyle} />
              <Tooltip content={<ImpressionTooltip />} />
              <Legend />
              <Bar yAxisId="left" dataKey="노출수" name="노출" radius={[6, 6, 0, 0]}>
                {rowsWithMeta.map((e, i) => (
                  <Cell key={`c-${i}`} fill={e.peak ? "#f59e0b" : AMBER} />
                ))}
              </Bar>
              <Line yAxisId="right" type="monotone" dataKey="클릭수" name="클릭" stroke={BLUE} strokeWidth={2} dot={{ r: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Engagement Rate (반응 균형)"
          subtitle="레이더: 반응 유형별 상대 강도 (목업 분해) · 호버로 값 확인"
        >
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart cx="50%" cy="52%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke={gridColor} />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#64748b" }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <Radar name="반응" dataKey="A" stroke={RED} fill={RED} fillOpacity={0.35} />
              <Tooltip formatter={(v) => [`${Number(v).toFixed(0)}`, "지표"]} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="타 동아리 대비 스코어" subtitle="수평 막대 + 백분위 카드 (목업)">
          <p className="metric-peer-summary">
            이 동아리 <strong>{clubVal}%</strong> · 참여 평균 <strong>{peerAvg}%</strong>
          </p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart layout="vertical" data={scoreData} margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={tickStyle} />
              <YAxis type="category" dataKey="name" width={88} tick={tickStyle} />
              <Tooltip formatter={(v) => `${v}%`} />
              <ReferenceLine x={peerAvg} stroke={INDIGO} strokeDasharray="4 4" label={{ value: "평균", position: "top", fill: INDIGO, fontSize: 10 }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22}>
                {scoreData.map((_, i) => (
                  <Cell key={`sc-${i}`} fill={i === 0 ? BLUE : "#cbd5e1"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
