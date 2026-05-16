export default function Footer({ copy, serviceName }) {
  return (
    <footer className="site-footer">
      <div className="section-wrap footer-inner">
        <div>
          <strong>{serviceName}</strong>
          <p>{copy.description}</p>
        </div>
        <span className="footer-badge">{copy.badge}</span>
      </div>
    </footer>
  );
}
