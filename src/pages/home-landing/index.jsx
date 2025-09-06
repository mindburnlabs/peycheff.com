import React from 'react';
import Header from '../../components/ui/Header';
import Footer from '../../components/ui/Footer';
import HeroSection from './components/HeroSection';
import FeaturedWorkSection from './components/FeaturedWorkSection';
import TestimonialLine from './components/TestimonialLine';
import NotesPreviewSection from './components/NotesPreviewSection';
import NewsletterSection from './components/NewsletterSection';

const HomeLanding = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <HeroSection />
        <FeaturedWorkSection />
        <TestimonialLine />
        <NotesPreviewSection />
        <NewsletterSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default HomeLanding;