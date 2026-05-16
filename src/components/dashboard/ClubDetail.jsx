import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../Header.jsx";
import { homepageCopy } from "../../data/homepage.js";
import { getCurrentSession, getAccountType, signOut, subscribeToAuthChanges } from "../../services/auth.js";
import { fetchCompanyByOwner, fetchClubDashboardBundle } from "../../services/companies.js";
import { assignMissionToMatch, approveMissionDeliverable } from "../../services/missions.js";
import StudentMetricCharts from "../studentDashboard/StudentMetricCharts.jsx";
import SolutionPanel from "./SolutionPanel";

const LAYOUT_BREAKPOINT_PX = 768;
const PAID_REPORT_PRICE = "월 29,000원";
const PAYMENT_INITIAL_VALUES = {
  cardNumber: "",
  expiry: "",
  cvc: "",
};

const statusLabel = {
  in_progress: { label: "진행 중", bg: "#eef2ff", color: "#4f46e5" },
  pending_review: { label: "검토 중", bg: "#f8fafc", color: "#64748b" },
  scheduled: { label: "예정", bg: "#f8fafc", color: "#64748b" },
  completed: { label: "완료", bg: "#f8fafc", color: "#334155" },
};

function getColor(clubId) {
  const palette = [
    { bg: "#eef2ff", text: "#4f46e5", line: "#2563eb" },
    { bg: "#f8fafc", text: "#2563eb", line: "#4f46e5" },
    { bg: "#f0fdf4", text: "#16a34a", line: "#22c55e" },
    { bg: "#fff7ed", text: "#ea580c", line: "#f97316" },
  ];
  return palette[(clubId || 0) % palette.length];
}

function trackPaymentEvent(eventName) {
  // 이후 구독 전환율/모달 노출 빈도 측정으로 확장하기 위한 mock hook.
  console.info(`[payment-mock] ${eventName}`);
}

function isPaymentFormComplete(values) {
  return values.cardNumber.trim() && values.expiry.trim() && values.cvc.trim();
}

function mapCompanyMetricsToStudentRows(rows = []) {
  return rows.map((row) => ({
    date: row.week,
    impressions: row.노출수,
    clicks: row.클릭수,
    ctr: row.CTR,
    cpc: row.CPC,
    engagement: row["Eng.Rate"],
    conversion: row.전환율,
    avgScore: row.avgScore ?? 0,
  }));
}

export default function ClubDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isNarrow, setIsNarrow] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= LAYOUT_BREAKPOINT_PX : false,
  );

  const [session, setSession] = useState(null);
  const [accountType, setAccountType] = useState(null);
  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignedMissions, setAssignedMissions] = useState([]);
  const [isReportUnlocked, setIsReportUnlocked] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentValues, setPaymentValues] = useState(PAYMENT_INITIAL_VALUES);
  const [paymentError, setPaymentError] = useState("");
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  useEffect(() => {
    function onResize() {
      setIsNarrow(window.innerWidth <= LAYOUT_BREAKPOINT_PX);
    }
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadSession() {
      const result = await getCurrentSession();
      if (isMounted) {
        setSession(result.session);
        setAccountType(await getAccountType(result.session));
      }
    }
    loadSession();
    const unsubscribe = subscribeToAuthChanges(async (nextSession) => {
      setSession(nextSession);
      setAccountType(await getAccountType(nextSession));
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) return;
    let isMounted = true;
    async function loadBundle() {
      const { company } = await fetchCompanyByOwner();
      if (!isMounted || !company) { setLoading(false); return; }
      const data = await fetchClubDashboardBundle(Number(id), company.company_id);
      if (isMounted) {
        setBundle(data);
        setAssignedMissions(data?.missions || []);
        setLoading(false);
      }
    }
    loadBundle();
    return () => { isMounted = false; };
  }, [session, id]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out.', error);
    } finally {
      setSession(null);
      setAccountType(null);
      navigate('/');
    }
  };

  const openPaymentModal = () => {
    trackPaymentEvent("modal_open");
    setPaymentError("");
    setIsPaymentOpen(true);
  };

  const closePaymentModal = () => {
    if (isPaymentProcessing) {
      return;
    }

    setIsPaymentOpen(false);
    setPaymentError("");
  };

  const handlePaymentChange = (event) => {
    const { name, value } = event.target;
    setPaymentValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
    setPaymentError("");
  };

  const handlePaymentSubmit = (event) => {
    event.preventDefault();

    if (!isPaymentFormComplete(paymentValues)) {
      setPaymentError("카드 정보를 모두 입력해주세요.");
      return;
    }

    trackPaymentEvent("payment_attempt");
    setIsPaymentProcessing(true);
    window.setTimeout(() => {
      setIsPaymentProcessing(false);
      setIsReportUnlocked(true);
      setIsPaymentOpen(false);
      setPaymentValues(PAYMENT_INITIAL_VALUES);
      trackPaymentEvent("payment_success");
    }, 850);
  };

  const companyHeaderCopy = {
    ...homepageCopy,
    headerActions: homepageCopy.headerActions.filter(action => action.type !== 'startup')
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header-shell">
          <Header copy={companyHeaderCopy} isAuthenticated={Boolean(session)} userEmail={session?.user?.email}
            accountType={accountType} onLogoutClick={handleLogout} hideDashboardButton={true} />
        </div>
        <main className="section-wrap dashboard-main" style={{ textAlign: 'center', padding: '48px' }}>
          <p className="dashboard-lead">데이터를 불러오는 중입니다...</p>
        </main>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header-shell">
          <Header copy={companyHeaderCopy} isAuthenticated={Boolean(session)} userEmail={session?.user?.email}
            accountType={accountType} onLogoutClick={handleLogout} />
        </div>
        <main className="section-wrap dashboard-main dashboard-body-muted">동아리를 찾을 수 없습니다.</main>
      </div>
    );
  }

  const { club, statusKey, missionTitle, missionDescription, objectiveKpi } = bundle;
  const col = getColor(club.club_id);
  const status = statusLabel[statusKey] || statusLabel.in_progress;

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: isNarrow ? "1fr" : "1fr 1fr",
    gap: 24,
    alignItems: "start",
  };

  const timelineSteps = (bundle.timeline || []).map((t) => ({
    id: t.timeline_id,
    status: t.event_name,
    statusKey: "active",
    period: t.event_date,
    title: t.event_name,
    description: t.description || "",
  }));
  const canSubmitPayment = Boolean(isPaymentFormComplete(paymentValues)) && !isPaymentProcessing;
  const metricRows = mapCompanyMetricsToStudentRows(bundle.chartRows).map((row) => ({
    ...row,
    avgScore: bundle.score,
  }));
  const paidReportCardStyle = isReportUnlocked && !isNarrow
    ? { gridColumn: "1 / -1" }
    : undefined;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header-shell">
        <Header copy={companyHeaderCopy} isAuthenticated={Boolean(session)} userEmail={session?.user?.email}
          accountType={accountType} onLogoutClick={handleLogout} hideDashboardButton={true} />
      </div>

      <main className="section-wrap dashboard-main">
        <button type="button" className="dashboard-back" onClick={() => navigate("/dashboard/company")}>
          ← 목록으로
        </button>

        <div className="dashboard-club-heading">
          <div className="dashboard-avatar dashboard-avatar--lg" style={{ background: col.bg, color: col.text }}>
            {club.initials}
          </div>
          <div style={{ flex: 1 }}>
            <div className="dashboard-club-name">{club.name}</div>
            <div className="dashboard-club-uni">{club.university}</div>
          </div>
          <span className="dashboard-pill" style={{ background: status.bg, color: status.color }}>
            {status.label}
          </span>
        </div>

        <div style={gridStyle}>
          <div className="dashboard-card paid-report-card" style={paidReportCardStyle}>
            <p className="dashboard-section-label">마케팅 지표 (mission_metrics)</p>
            <div className={`paid-report-content ${isReportUnlocked ? "" : "paid-report-content--locked"}`}>
              <StudentMetricCharts
                rows={metricRows}
                myScore={bundle.score}
                peerScore={bundle.avgScore}
                embedded
              />
            </div>
            {!isReportUnlocked ? (
              <div className="paid-report-overlay" aria-label="유료 성과 리포트 안내">
                <span className="paid-report-badge">Premium Report</span>
                <h2>유료 구독 시 열람 가능</h2>
                <p>
                  개인 계정에서 보는 것과 같은 노출, CTR, CPC, 참여율, 전환율 차트를 기업 리포트에서도 확인하세요.
                </p>
                <button type="button" className="button button-primary paid-report-cta" onClick={openPaymentModal}>
                  결제하기
                </button>
                <small>7일 무료 체험 후 {PAID_REPORT_PRICE} · 언제든 취소 가능</small>
              </div>
            ) : (
              <div className="paid-report-unlocked" role="status">
                결제되었습니다. 성과 리포트가 열렸습니다.
              </div>
            )}
          </div>

          <div className="dashboard-card">
            <p className="dashboard-section-label">미션 (missions)</p>
            <div className="dashboard-mission-chip" style={{ background: col.bg, borderColor: "var(--color-border)" }}>
              <span className="dashboard-mission-text" style={{ color: col.text }}>
                {missionTitle}
              </span>
            </div>
            <p className="dashboard-lead" style={{ marginTop: 12 }}>
              {missionDescription}
            </p>
            {objectiveKpi ? (
              <p className="dashboard-input-label" style={{ marginTop: 8 }}>
                목표 KPI: {objectiveKpi}
              </p>
            ) : null}

            {timelineSteps.length > 0 && (
              <div className="mission-timeline-section">
                <p className="dashboard-section-label dashboard-section-label--tight">
                  프로젝트 일정 흐름 (Timeline)
                </p>
                <ol className="mission-timeline-v" aria-label="프로젝트 일정 흐름">
                  {timelineSteps.map((step) => (
                    <li key={step.id} className="mission-timeline-item">
                      <span className="mission-timeline-dot" aria-hidden />
                      <div className="mission-timeline-content">
                        <div className="mission-timeline-meta">
                          <span className={`mission-timeline-status mission-timeline-status--${step.statusKey}`}>
                            {step.status}
                          </span>
                          <span className="mission-timeline-date">{step.period}</span>
                        </div>
                        <h3 className="mission-timeline-name">{step.title}</h3>
                        <p className="mission-timeline-desc">{step.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div style={{ marginTop: 16 }}>
              <p className="dashboard-section-label dashboard-section-label--tight">
                산출물·진행 (mission_deliverables / mission_progress)
              </p>
              {assignedMissions.length === 0 ? (
                <p className="dashboard-lead" style={{ marginTop: 12 }}>아직 등록된 미션이 없습니다.</p>
              ) : (
                assignedMissions.map((m) => {
                  const delayed = !m.done && m.pct > 0 && m.pct < 45;
                  return (
                    <div key={m.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                      <div className={`dashboard-mission-row ${delayed ? "dashboard-mission-row--delayed" : ""}`}>
                        <div className={`dashboard-checkbox ${m.done ? "dashboard-checkbox--done" : ""}`} aria-hidden>
                          {m.done ? "✓" : ""}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div className="dashboard-mission-name">{m.name}</div>
                          <div className="dashboard-progress-track">
                            <div className="dashboard-progress-fill" style={{ width: `${m.pct}%`, background: col.line }} />
                          </div>
                        </div>
                        <span className="dashboard-mission-pct">{m.pct}%</span>
                      </div>
                      
                      {m.submissionContent && (
                        <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', fontSize: '14px', color: '#334155', border: '1px solid #e2e8f0' }}>
                          <div style={{ fontWeight: 600, marginBottom: '4px' }}>제출 결과:</div>
                          <div>{m.submissionContent}</div>
                        </div>
                      )}
                      
                      {m.status === 'pending' && (
                        <button
                          className="button button-primary"
                          style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: '13px' }}
                          onClick={async () => {
                            const { error } = await approveMissionDeliverable(m.deliverableId, bundle.match.company_id, m.missionId, club.club_id);
                            if (error) {
                              alert(`승인 실패: ${error}`);
                            } else {
                              setAssignedMissions(prev => prev.map(item => item.id === m.id ? { ...item, done: true, pct: 100, status: 'approved' } : item));
                            }
                          }}
                        >
                          수행 결과 승인하기
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <SolutionPanel 
          missionId={bundle.mission.mission_id} 
          solutions={bundle.solutions} 
          initialNotices={bundle.notices} 
          onAssign={async (form) => {
            const { mission, error } = await assignMissionToMatch({
              matchId: bundle.match.match_id,
              clubId: club.club_id,
              title: form.title,
              description: form.description,
              deadline: form.deadline,
              delayBuffer: form.delayBuffer,
              targetMetric: form.targetMetric,
            });

            if (error) {
              throw new Error(error);
            }

            setAssignedMissions(prev => [...prev, {
              id: mission.mission_id,
              name: mission.mission_name || form.title || "제목 없는 미션",
              pct: 0,
              done: false
            }]);
          }}
        />
      </main>

      {isPaymentOpen ? (
        <div className="payment-modal-backdrop" role="presentation">
          <section className="payment-modal" role="dialog" aria-modal="true" aria-labelledby="payment-modal-title">
            <div className="payment-modal-head">
              <div>
                <p className="eyebrow">Performance Report Subscription</p>
                <h2 id="payment-modal-title">성과 리포트 구독</h2>
              </div>
              <button type="button" className="payment-modal-close" onClick={closePaymentModal} aria-label="닫기">
                ×
              </button>
            </div>

            <div className="payment-plan-card">
              <strong>{PAID_REPORT_PRICE}</strong>
              <span>7일 무료 체험 후 자동 구독 · 언제든 취소 가능</span>
            </div>

            <ul className="payment-value-list">
              <li>마케팅 지표 상세 차트와 바이럴 점수 분석</li>
              <li>타 동아리 평균 대비 성과 비교</li>
              <li>캠페인 개선 의사결정을 위한 리포트 요약</li>
            </ul>

            <form className="payment-form" onSubmit={handlePaymentSubmit}>
              <label>
                <span>카드 번호</span>
                <input
                  name="cardNumber"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  value={paymentValues.cardNumber}
                  placeholder="1234 5678 9012 3456"
                  onChange={handlePaymentChange}
                />
              </label>
              <div className="payment-form-row">
                <label>
                  <span>만료일(월/년)</span>
                  <input
                    name="expiry"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    value={paymentValues.expiry}
                    placeholder="MM/YY"
                    onChange={handlePaymentChange}
                  />
                </label>
                <label>
                  <span>CVC</span>
                  <input
                    name="cvc"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    value={paymentValues.cvc}
                    placeholder="123"
                    onChange={handlePaymentChange}
                  />
                </label>
              </div>

              {paymentError ? (
                <p className="form-error" role="alert">
                  {paymentError}
                </p>
              ) : null}

              <button type="submit" className="button button-primary button-large submit-button" disabled={!canSubmitPayment}>
                {isPaymentProcessing ? "결제 처리 중..." : "결제하기"}
              </button>
              <button type="button" className="button button-secondary button-large submit-button" onClick={closePaymentModal}>
                닫기
              </button>
            </form>

            <p className="payment-trust-note">카드 정보는 저장되지 않습니다. 이 화면은 실제 결제 API와 연결되지 않은 프로토타입입니다.</p>
          </section>
        </div>
      ) : null}
    </div>
  );
}
