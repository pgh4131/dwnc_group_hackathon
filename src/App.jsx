import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Routes, Route, useNavigate } from 'react-router-dom';
import AuthModal from './components/AuthModal.jsx';
import FeaturedProjectsSection from './components/FeaturedProjectsSection.jsx';
import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import HeroSection from './components/HeroSection.jsx';
import HowItWorksSection from './components/HowItWorksSection.jsx';
import PostCreateCompletePage from './components/post-create/PostCreateCompletePage.jsx';
import PostCreatePage from './components/post-create/PostCreatePage.jsx';
import UserTypeCTASection from './components/UserTypeCTASection.jsx';
import ValueSection from './components/ValueSection.jsx';
import CompanyDashboard from './pages/CompanyDashboard.jsx';
import ClubDetail from './components/dashboard/ClubDetail.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import PlaceholderPage from './pages/PlaceholderPage.jsx';
import ProjectDetailPage from './pages/ProjectDetailPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import { homepageCopy } from './data/homepage.js';
import {
  getAccountType,
  getCurrentSession,
  signOut,
  subscribeToAuthChanges,
} from './services/auth.js';
import { fetchProjects } from './services/projects.js';

function MainPage() {
  const navigate = useNavigate();
  const [projectState, setProjectState] = useState({
    projects: [],
    source: 'supabase',
    isLoading: true,
    error: null,
  });
  const [session, setSession] = useState(null);
  const [accountType, setAccountType] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authNotice, setAuthNotice] = useState('');

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

  const openAuthModal = (notice = '') => {
    setAuthNotice(notice);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthNotice('');
  };

  const handleStartupClick = () => {
    if (!session) {
      openAuthModal(homepageCopy.auth.loginRequiredMessage);
      return;
    }

    if (accountType !== 'startup') {
      window.alert(homepageCopy.auth.startupOnlyMessage);
      return;
    }

    navigate('/dashboard/company');
  };

  const handleStudentDashboardClick = () => {
    if (!session) {
      openAuthModal(homepageCopy.auth.studentLoginRequiredMessage);
      return;
    }

    if (accountType === 'startup') {
      window.alert(homepageCopy.auth.studentOnlyMessage);
      return;
    }

    navigate('/dashboard/student');
  };

  return (
    <div className="app-shell">
      <Header
        copy={homepageCopy}
        isAuthenticated={Boolean(session)}
        userEmail={session?.user?.email}
        accountType={accountType}
        onLoginClick={() => openAuthModal()}
        onLogoutClick={handleLogout}
        onStartupClick={handleStartupClick}
      />
      <main>
        <HeroSection copy={homepageCopy.hero} onStartupClick={handleStartupClick} />
        <FeaturedProjectsSection
          projects={projectState.projects}
          copy={homepageCopy.projects}
          isLoading={projectState.isLoading}
          error={projectState.error}
        />
        <ValueSection items={homepageCopy.values} sectionMeta={homepageCopy.valueSection} />
        <HowItWorksSection steps={homepageCopy.steps} sectionMeta={homepageCopy.howItWorksSection} />
        <UserTypeCTASection
          cards={homepageCopy.userCtas}
          onStartupClick={handleStartupClick}
          onStudentClick={handleStudentDashboardClick}
        />
      </main>
      <Footer copy={homepageCopy.footer} serviceName={homepageCopy.serviceName} />
      <AuthModal
        copy={homepageCopy.auth}
        isOpen={isAuthModalOpen}
        notice={authNotice}
        onClose={closeAuthModal}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/startup" element={<Navigate to="/dashboard/company" replace />} />
        <Route
          path="/login"
          element={
            <PlaceholderPage title="로그인" description="로그인 화면은 추후 구현 예정입니다." />
          }
        />
        <Route path="/clubs" element={<Navigate to="/dashboard/student" replace />} />
        <Route path="/clubs/dashboard" element={<Navigate to="/dashboard/student" replace />} />
        <Route path="/dashboard/company" element={<CompanyDashboard />} />
        <Route path="/dashboard/company/club/:id" element={<ClubDetail />} />
        <Route path="/dashboard/student" element={<StudentDashboard />} />
        <Route path="/company/posts/new" element={<PostCreatePage />} />
        <Route path="/company/posts/complete" element={<PostCreateCompletePage />} />
      </Routes>
    </BrowserRouter>
  );
}
