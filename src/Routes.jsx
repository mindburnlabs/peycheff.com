import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import Layout from "components/layout/Layout";
import NotFound from "pages/NotFound";

// New pages
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Work = lazy(() => import('./pages/Work'));
const Notes = lazy(() => import('./pages/Notes'));
const Products = lazy(() => import('./pages/Products'));
const Advisory = lazy(() => import('./pages/Advisory'));
const Contact = lazy(() => import('./pages/Contact'));
const CheckoutSuccess = lazy(() => import('./pages/CheckoutSuccess'));
const CheckoutCancel = lazy(() => import('./pages/CheckoutCancel'));
const ReportView = lazy(() => import('./pages/ReportView'));
const ProgrammaticSprint = lazy(() => import('./pages/ProgrammaticSprint'));
const Utilities = lazy(() => import('./pages/Utilities'));
const AdminMetrics = lazy(() => import('./pages/AdminMetrics'));
const ControlCenter = lazy(() => import('./pages/ControlCenter'));

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <Layout>
          <Suspense fallback={<div style={{ padding: 24, color: '#9CA3AF' }}>Loading…</div>}>
          <RouterRoutes>
            {/* Main navigation routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/work" element={<Work />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/products" element={<Products />} />
            <Route path="/advisory" element={<Advisory />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Checkout routes */}
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            <Route path="/checkout/cancel" element={<CheckoutCancel />} />
            <Route path="/r/:token" element={<ReportView />} />
            <Route path="/sprint/:role/:stack/:niche" element={<ProgrammaticSprint />} />
            <Route path="/utilities" element={<Utilities />} />
            <Route path="/admin/metrics" element={<AdminMetrics />} />
            <Route path="/admin/control" element={<ControlCenter />} />
            
            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
          </Suspense>
        </Layout>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
