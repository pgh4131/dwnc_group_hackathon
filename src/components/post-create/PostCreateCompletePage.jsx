import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Footer from '../Footer.jsx';
import Header from '../Header.jsx';
import { homepageCopy } from '../../data/homepage.js';
import { getCampaignPostById } from '../../services/campaignPostStorage.js';
import { getCurrentSession, getAccountType, signOut, subscribeToAuthChanges } from '../../services/auth.js';

export default function PostCreateCompletePage() {
  const postId = new URLSearchParams(window.location.search).get('id');
  const navigate = useNavigate();
  const [createdPost, setCreatedPost] = useState(null);

  useEffect(() => {
    if (postId) {
      getCampaignPostById(postId).then(setCreatedPost);
    }
  }, [postId]);

  const [session, setSession] = useState(null);
  const [accountType, setAccountType] = useState(null);

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

  const handleLogout = async () => {
    await signOut();
    setSession(null);
    setAccountType(null);
    navigate('/');
  };

  const companyHeaderCopy = {
    ...homepageCopy,
    headerActions: homepageCopy.headerActions.filter(action => action.type !== 'startup')
  };

  return (
    <div className="app-shell">
      <Header
        copy={companyHeaderCopy}
        isAuthenticated={Boolean(session)}
        userEmail={session?.user?.email}
        accountType={accountType}
        onLogoutClick={handleLogout}
        hideDashboardButton={true}
      />
      <main className="complete-page section-spacing">
        <section className="section-wrap complete-panel">
          <p className="eyebrow">Post Created</p>
          <h1>공고가 등록되었습니다</h1>
          <p>
            {createdPost
              ? `${createdPost.company_info?.serviceName || createdPost.company_info?.companyName || '기업'}의 "${createdPost.project_info?.title || '새 공고'}" 공고가 Supabase에 등록되었습니다.`
              : '새 공고가 Supabase에 등록되었습니다.'}
          </p>
          <div className="complete-actions">
            <Link className="button button-primary button-large" to="/dashboard/company">
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
