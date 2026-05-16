import { useEffect, useState } from 'react';
import AuthModal from './components/AuthModal.jsx';
import FeaturedProjectsSection from './components/FeaturedProjectsSection.jsx';
import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import HeroSection from './components/HeroSection.jsx';
import HowItWorksSection from './components/HowItWorksSection.jsx';
import UserTypeCTASection from './components/UserTypeCTASection.jsx';
import ValueSection from './components/ValueSection.jsx';
import { homepageCopy } from './data/homepage.js';
import {
  getAccountType,
  getCurrentSession,
  signOut,
  subscribeToAuthChanges,
} from './services/auth.js';
import { fetchProjects } from './services/projects.js';

export default function App() {
  const [projectState, setProjectState] = useState({
    projects: [],
    source: 'supabase',
    isLoading: true,
    error: null,
  });
  const [session, setSession] = useState(null);
  const [accountType, setAccountType] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProjects() {
      const result = await fetchProjects();

      if (!isMounted) {
        return;
      }

      setProjectState({
        projects: result.projects,
        source: result.source,
        isLoading: false,
        error: result.error,
      });
    }

    loadProjects();

    return () => {
      isMounted = false;
    };
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

  const handleLogout = async () => {
    await signOut();
    setSession(null);
    setAccountType(null);
  };

  const handleStartupClick = () => {
    if (accountType !== 'startup') {
      window.alert(homepageCopy.auth.startupOnlyMessage);
      return;
    }

    window.location.href = '/startup';
  };

  return (
    <div className="app-shell">
      <Header
        copy={homepageCopy}
        isAuthenticated={Boolean(session)}
        userEmail={session?.user?.email}
        accountType={accountType}
        onLoginClick={() => setIsAuthModalOpen(true)}
        onLogoutClick={handleLogout}
        onStartupClick={handleStartupClick}
      />
      <main>
        <HeroSection copy={homepageCopy.hero} />
        <FeaturedProjectsSection
          projects={projectState.projects}
          copy={homepageCopy.projects}
          isLoading={projectState.isLoading}
          error={projectState.error}
        />
        <ValueSection items={homepageCopy.values} />
        <HowItWorksSection steps={homepageCopy.steps} />
        <UserTypeCTASection cards={homepageCopy.userCtas} />
      </main>
      <Footer copy={homepageCopy.footer} serviceName={homepageCopy.serviceName} />
      <AuthModal
        copy={homepageCopy.auth}
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
