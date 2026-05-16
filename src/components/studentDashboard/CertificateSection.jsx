import { useMemo, useState } from "react";

export default function CertificateSection({ missions, certificate }) {
  const [selectedOption, setSelectedOption] = useState(certificate.options[0]?.id ?? "pdf");
  const [status, setStatus] = useState(certificate.status);

  const validation = useMemo(() => {
    const blockers = [];

    missions.forEach((mission) => {
      if (mission.kpiProgress < 100) {
        blockers.push(`${mission.title}: KPI ${100 - mission.kpiProgress}%p 남음`);
      }

      mission.approvalItems
        .filter((item) => item.status !== "approved")
        .forEach((item) => blockers.push(`${mission.title}: ${item.label} ${item.status === "pending" ? "승인 대기" : "미완료"}`));
    });

    return {
      isReady: blockers.length === 0,
      blockers,
    };
  }, [missions]);

  function requestCertificate() {
    if (!validation.isReady) return;
    setStatus("pending_company");
  }

  return (
    <section className="dashboard-card student-section">
      <div className="student-section-head">
        <div>
          <p className="dashboard-section-label">Certificate</p>
          <h2 className="student-section-title">인증서 신청</h2>
        </div>
        <span className={`student-status-badge ${status === "pending_company" ? "student-status-badge--warning" : "student-status-badge--muted"}`}>
          {status === "pending_company" ? "기업 승인 대기" : "신청 전"}
        </span>
      </div>

      <div className="student-certificate-options" role="radiogroup" aria-label="인증서 형식 선택">
        {certificate.options.map((option) => (
          <label key={option.id} className={selectedOption === option.id ? "student-option student-option--selected" : "student-option"}>
            <input
              type="radio"
              name="certificate-option"
              value={option.id}
              checked={selectedOption === option.id}
              onChange={() => setSelectedOption(option.id)}
            />
            {option.label}
          </label>
        ))}
      </div>

      {validation.isReady ? (
        <p className="student-ready-message">KPI 달성과 기업 승인 항목이 모두 완료되어 신청할 수 있습니다.</p>
      ) : (
        <div className="student-blocker-box">
          <strong>신청 전 완료해야 할 항목</strong>
          <ul>
            {validation.blockers.map((blocker) => (
              <li key={blocker}>{blocker}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        className="company-page-post-btn student-full-btn"
        disabled={!validation.isReady || status === "pending_company"}
        onClick={requestCertificate}
      >
        {status === "pending_company" ? "기업 승인 대기 중" : "자동 검증 후 신청"}
      </button>
    </section>
  );
}
