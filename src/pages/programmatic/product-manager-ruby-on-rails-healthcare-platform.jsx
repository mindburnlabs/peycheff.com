import React from 'react';
import { Helmet } from 'react-helmet';
import InteractivePreview from '../../home-landing/components/InteractivePreview';
import { trackEvent, EVENTS } from '../../../lib/analytics';

const ProductManagerRubyonRailsHealthcarePlatformPage = () => {
  React.useEffect(() => {
    // Track programmatic page view
    trackEvent(EVENTS.PROGRAMMATIC_PAGE_VIEW, {
      role: 'product-manager',
      stack: 'ruby-rails',
      niche: 'healthcare',
      page_url: window.location.pathname
    });
  }, []);

  const defaultFormData = {
    goal: 'telemedicine app',
    stack: 'ruby-rails'
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Product Manager Ruby on Rails Healthcare Platform - 30-Day Sprint Plan | Ivan Peycheff</title>
        <meta name="description" content="Get a personalized 30-day development plan for building your Healthcare Platform with Ruby on Rails. Perfect for Product Managers who want to ship fast without the guesswork." />
        <meta property="og:title" content="Product Manager Ruby on Rails Healthcare Platform - 30-Day Sprint Plan | Ivan Peycheff" />
        <meta property="og:description" content="Get a personalized 30-day development plan for building your Healthcare Platform with Ruby on Rails. Perfect for Product Managers who want to ship fast without the guesswork." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Product Manager Ruby on Rails Healthcare Platform - 30-Day Sprint Plan | Ivan Peycheff" />
        <meta name="twitter:description" content="Get a personalized 30-day development plan for building your Healthcare Platform with Ruby on Rails. Perfect for Product Managers who want to ship fast without the guesswork." />
        
        {/* Programmatic SEO markup */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "30-Day Sprint Plan for Product Managers",
            "description": "Get a personalized 30-day development plan for building your Healthcare Platform with Ruby on Rails. Perfect for Product Managers who want to ship fast without the guesswork.",
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "39",
              "priceCurrency": "USD"
            }
          })}
        </script>
      </Helmet>

      <main className="apple-container py-20">
        {/* Hero Section */}
        <section className="text-center space-y-8 mb-20">
          <div className="space-y-6">
            <div className="text-[14px] leading-[22px] text-[#0A84FF] font-medium">
              For Product Managers Building Healthcare Platform Products
            </div>
            
            <h1 className="text-[48px] md:text-[56px] lg:text-[64px] leading-[56px] md:leading-[64px] lg:leading-[72px] font-semibold tracking-[-0.02em] text-[#F2F3F5] max-w-4xl mx-auto">
              Turn your Healthcare Platform idea into a shippable Ruby on Rails product in 30 days
            </h1>
            
            <p className="text-[18px] leading-[28px] text-[#A5ABB3] max-w-3xl mx-auto">
              Get a personalized sprint plan built for Product Managers using Ruby on Rails. Align your team around a proven 30-day execution framework.
            </p>
          </div>
          
          {/* Pain Point */}
          <div className="bg-[#1C1C1E] p-6 rounded-lg max-w-2xl mx-auto">
            <p className="text-[16px] leading-[24px] text-[#F2F3F5] font-medium">
              Struggling to align your team around priorities?
            </p>
            <p className="text-[14px] leading-[22px] text-[#A5ABB3] mt-2">
              Most Product Managers waste 3-6 months planning what could be built in 30 days
            </p>
          </div>
        </section>

        {/* Interactive Preview with Defaults */}
        <section className="mb-20">
          <InteractivePreview defaultFormData={defaultFormData} />
        </section>

        {/* Stack-Specific Benefits */}
        <section className="mb-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-[32px] leading-[40px] font-semibold text-[#F2F3F5] text-center mb-12">
              Perfect for Ruby on Rails Development
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="apple-card">
                <h3 className="text-[18px] font-medium text-[#F2F3F5] mb-4">
                  Optimized Tech Stack
                </h3>
                <ul className="space-y-3 text-[14px] text-[#A5ABB3]">
                  <li>• Ruby on Rails architecture patterns</li>
                  <li>• PostgreSQL database design</li>
                  <li>• Heroku/Railway deployment strategy</li>
                  <li>• RSpec testing approach</li>
                </ul>
              </div>
              
              <div className="apple-card">
                <h3 className="text-[18px] font-medium text-[#F2F3F5] mb-4">
                  Healthcare Platform Essentials
                </h3>
                <ul className="space-y-3 text-[14px] text-[#A5ABB3]">
                  <li>• HIPAA compliance</li><li>• Patient data</li><li>• Appointment scheduling</li><li>• Secure messaging</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <p className="text-[16px] leading-[24px] text-[#A5ABB3]">
              Used by 200+ Product Managers to ship their first version
            </p>
            <p className="text-[14px] leading-[22px] text-[#666668]">
              I've helped 200+ Product Managers turn ideas into revenue
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProductManagerRubyonRailsHealthcarePlatformPage;