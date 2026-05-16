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
            {/* TODO: 학생용 공고 상세 페이지가 준비되면 `/projects/${postId}`로 연결하세요. */}
            <a className="button button-primary button-large" href="/company/posts/new">
              새 공고 작성하기
            </a>
            <a className="button button-secondary button-large" href="/">
              메인으로 돌아가기
            </a>
          </div>
        </section>
      </main>
      <Footer copy={homepageCopy.footer} serviceName={homepageCopy.serviceName} />
    </div>
  );
}
