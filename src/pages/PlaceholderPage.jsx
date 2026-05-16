import { Link } from 'react-router-dom';

export default function PlaceholderPage({ title, description }) {
  return (
    <div className="placeholder-page section-wrap">
      <h1 className="placeholder-title">{title}</h1>
      <p className="placeholder-desc">{description}</p>
      <Link className="button button-primary button-large" to="/">
        메인으로
      </Link>
    </div>
  );
}
