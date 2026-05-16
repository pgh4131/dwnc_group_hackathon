import { Link } from 'react-router-dom';
import Footer from '../Footer.jsx';
import Header from '../Header.jsx';
import { homepageCopy } from '../../data/homepage.js';
import { getCampaignPostById } from '../../services/campaignPostStorage.js';

export default function PostCreateCompletePage() {
  const postId = new URLSearchParams(window.location.search).get('id');
  const createdPost = postId ? getCampaignPostById(postId) : null;

  return (
    <div className="app-shell">
      <Header copy={homepageCopy} isAuthenticated={false} />
      <main className="complete-page section-spacing">
        <section className="section-wrap complete-panel">
          <p className="eyebrow">Post Created</p>
          <h1>공고가 등록되었습니다</h1>
          <p>
            {createdPost
              ? `${createdPost.company.serviceName}의 "${createdPost.project.title}" 공고가 임시 저장소에 등록되었습니다.`
              : '새 공고가 임시 저장소에 등록되었습니다.'}
          </p>
          <div className="complete-actions">
            {createdPost ? (
              <Link className="button button-primary button-large" to={`/projects/${createdPost.id}`}>
                등록한 공고 보기
              </Link>
            ) : null}
            <Link className="button button-secondary button-large" to="/dashboard/company">
              스타트업 대시보드로 돌아가기
            </Link>
            <Link className="button button-secondary button-large" to="/company/posts/new">
              새 공고 작성하기
            </Link>
          </div>
        </section>
      </main>
      <Footer copy={homepageCopy.footer} serviceName={homepageCopy.serviceName} />
    </div>
  );
}
