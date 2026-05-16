import { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { studentProfile } from "../../data/studentDashboardData.js";

function formatToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

function getActivityPeriod(missions) {
  const firstPeriod = missions[0]?.period ?? "";
  const lastPeriod = missions[missions.length - 1]?.period ?? firstPeriod;
  const [startDate] = firstPeriod.split(" - ");
  const [, endDate] = lastPeriod.split(" - ");

  return startDate && endDate ? `${startDate} ~ ${endDate}` : firstPeriod;
}

export default function CertificateSection({ missions, certificate }) {
  const pdfRef = useRef(null);
  const badgeRef = useRef(null);
  const [selectedOption, setSelectedOption] = useState(certificate.options[0]?.id ?? "pdf");
  const [status, setStatus] = useState(certificate.status);
  const [showPreview, setShowPreview] = useState(false);
  const issuedDate = useMemo(() => formatToday(), []);
  const activityPeriod = useMemo(() => getActivityPeriod(missions), [missions]);
  const missionName = missions[0]?.title ?? studentProfile.campaignName;

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
    setShowPreview(true);
    if (validation.isReady) {
      setStatus("pending_company");
    }
  }

  async function handleDownloadPDF() {
    if (!pdfRef.current) return;

    const canvas = await html2canvas(pdfRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save("캠퍼스브릿지_활동인증서.pdf");
  }

  async function handleDownloadBadge() {
    if (!badgeRef.current) return;

    const canvas = await html2canvas(badgeRef.current, { scale: 2 });
    const link = document.createElement("a");

    link.download = "캠퍼스브릿지_디지털배지.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
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
        onClick={requestCertificate}
      >
        자동 검증 후 신청
      </button>

      {showPreview ? (
        <div className="student-certificate-preview-wrap">
          {selectedOption === "badge" ? (
            <article ref={badgeRef} className="student-digital-badge-preview" aria-label="디지털 배지 미리보기">
              <span className="student-digital-badge-brand">CAMPUS BRIDGE</span>
              <div className="student-digital-badge-icon" aria-hidden>
                ⬡
              </div>
              <strong>{studentProfile.clubName}</strong>
              <p>{missionName}</p>
              <span className="student-digital-badge-period">{activityPeriod}</span>
            </article>
          ) : (
            <article ref={pdfRef} className="student-certificate-preview" aria-label="PDF 인증서 미리보기">
              <div className="student-certificate-logo">Campus Bridge</div>
              <div className="student-certificate-body">
                <h3>활동 참여 인증서</h3>
                <dl>
                  <div>
                    <dt>동아리명</dt>
                    <dd>{studentProfile.clubName}</dd>
                  </div>
                  <div>
                    <dt>협업 기업명</dt>
                    <dd>{missions[0]?.companyName ?? studentProfile.companyName}</dd>
                  </div>
                  <div>
                    <dt>미션명</dt>
                    <dd>{missionName}</dd>
                  </div>
                  <div>
                    <dt>활동 기간</dt>
                    <dd>{activityPeriod}</dd>
                  </div>
                </dl>
              </div>
              <div className="student-certificate-footer">
                <span>발급일 {issuedDate}</span>
                <strong>Campus Bridge 발급</strong>
              </div>
            </article>
          )}

          <button
            type="button"
            className="student-pdf-btn"
            onClick={selectedOption === "badge" ? handleDownloadBadge : handleDownloadPDF}
          >
            {selectedOption === "badge" ? "배지 이미지로 저장" : "PDF로 저장"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
