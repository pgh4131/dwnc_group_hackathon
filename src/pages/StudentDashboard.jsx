import { Link } from "react-router-dom";

export default function StudentDashboard() {
  return (
    <div style={{ padding: "1.5rem 1.25rem", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>학생 대시보드</h1>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
          동아리 미션·성과는 팀장에게 안내됩니다. 이 페이지는 플레이스홀더입니다.
        </p>
      </div>
      <p style={{ fontSize: 14, marginBottom: 16 }}>
        실제 학생용 지표·미션 UI는 기획에 맞춰 이후 확장할 수 있습니다.
      </p>
      <Link
        to="/"
        style={{
          fontSize: 14,
          color: "var(--color-accent-primary, #534AB7)",
          textDecoration: "underline",
        }}
      >
        메인으로 돌아가기
      </Link>
    </div>
  );
}
