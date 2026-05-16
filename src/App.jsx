import FeaturedProjectsSection from './components/FeaturedProjectsSection.jsx';
import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import HeroSection from './components/HeroSection.jsx';
import HowItWorksSection from './components/HowItWorksSection.jsx';
import UserTypeCTASection from './components/UserTypeCTASection.jsx';
import ValueSection from './components/ValueSection.jsx';
import { featuredProjects, homepageCopy } from './data/homepage.js';

export default function App() {
  return (
    <div className="app-shell">
      <Header copy={homepageCopy} isAuthenticated={false} />
      <main>
        <HeroSection copy={homepageCopy.hero} />
        <FeaturedProjectsSection projects={featuredProjects} copy={homepageCopy.projects} />
        <ValueSection items={homepageCopy.values} />
        <HowItWorksSection steps={homepageCopy.steps} />
        <UserTypeCTASection cards={homepageCopy.userCtas} />
      </main>
      <Footer copy={homepageCopy.footer} serviceName={homepageCopy.serviceName} />
    </div>
  );
}
