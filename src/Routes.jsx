import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import HomeLanding from './pages/home-landing';
import NotesContentHub from './pages/notes-content-hub';
import AdvisoryServices from './pages/advisory-services';
import ContactInquiry from './pages/contact-inquiry';
import WorkPortfolio from './pages/work-portfolio';
import AboutProfile from './pages/about-profile';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<AboutProfile />} />
        <Route path="/home-landing" element={<HomeLanding />} />
        <Route path="/notes-content-hub" element={<NotesContentHub />} />
        <Route path="/advisory-services" element={<AdvisoryServices />} />
        <Route path="/contact-inquiry" element={<ContactInquiry />} />
        <Route path="/work-portfolio" element={<WorkPortfolio />} />
        <Route path="/about-profile" element={<AboutProfile />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
