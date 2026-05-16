import { useEffect, useState } from 'react';
import FeaturedProjectsSection from './components/FeaturedProjectsSection.jsx';
import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import HeroSection from './components/HeroSection.jsx';
import HowItWorksSection from './components/HowItWorksSection.jsx';
import UserTypeCTASection from './components/UserTypeCTASection.jsx';
import ValueSection from './components/ValueSection.jsx';
import { featuredProjects, homepageCopy } from './data/homepage.js';
import { fetchProjects } from './services/projects.js';

export default function App() {
  const [projectState, setProjectState] = useState({
    projects: featuredProjects,
    source: 'mock',
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadProjects() {
      const result = await fetchProjects();

      if (!isMounted) {
        return;
      }

      const shouldUseFallback = result.source !== 'supabase' || Boolean(result.error);

      setProjectState({
        projects: shouldUseFallback ? featuredProjects : result.projects,
        source: shouldUseFallback ? 'mock' : result.source,
        isLoading: false,
        error: result.error,
      });
    }

    loadProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="app-shell">
      <Header copy={homepageCopy} isAuthenticated={false} />
      <main>
        <HeroSection copy={homepageCopy.hero} />
        <FeaturedProjectsSection
          projects={projectState.projects}
          copy={homepageCopy.projects}
          isLoading={projectState.isLoading}
          source={projectState.source}
          error={projectState.error}
        />
        <ValueSection items={homepageCopy.values} />
        <HowItWorksSection steps={homepageCopy.steps} />
        <UserTypeCTASection cards={homepageCopy.userCtas} />
      </main>
      <Footer copy={homepageCopy.footer} serviceName={homepageCopy.serviceName} />
    </div>
  );
}
