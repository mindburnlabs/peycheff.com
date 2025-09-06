import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import Layout from "components/layout/Layout";
import NotFound from "pages/NotFound";

// New pages
import Home from './pages/Home';
import About from './pages/About';
import Work from './pages/Work';
import Notes from './pages/Notes';
import Products from './pages/Products';
import Advisory from './pages/Advisory';
import Contact from './pages/Contact';
import CheckoutSuccess from './pages/CheckoutSuccess';
import CheckoutCancel from './pages/CheckoutCancel';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <Layout>
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
            
            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </Layout>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
