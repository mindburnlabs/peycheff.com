import React from 'react';
import Header from '../../components/ui/Header';
import Footer from '../../components/ui/Footer';
import HeroSection from './components/HeroSection';
import BiographySection from './components/BiographySection';
import ExpertiseSection from './components/ExpertiseSection';
import ExperienceTimeline from './components/ExperienceTimeline';
import ValuesSection from './components/ValuesSection';
import CredentialsSection from './components/CredentialsSection';
import CTASection from './components/CTASection';

const AboutProfile = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <HeroSection />
        <BiographySection />
        <ExpertiseSection />
        <ExperienceTimeline />
        <ValuesSection />
        <CredentialsSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
};

export default AboutProfile;