import { Link, useParams } from 'react-router-dom';

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

export function ProjectDetailPlaceholder() {
  const { id } = useParams();
  return (
    <PlaceholderPage
      title={`프로젝트 상세 · ${id ?? ''}`}
      description="공고 상세 페이지는 추후 구현 예정입니다. 메인에서 공고 목록을 계속 확인할 수 있습니다."
    />
  );
}
