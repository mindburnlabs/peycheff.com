import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Footer from '../../components/ui/Footer';
import ContactForm from './components/ContactForm';
import ContactInfo from './components/ContactInfo';
import FAQSection from './components/FAQSection';
import TestimonialLine from './components/TestimonialLine';
import NewsletterSubscription from '../../components/ui/NewsletterSubscription';

const ContactInquiry = () => {
  return (
    <>
      <Helmet>
        <title>Contact Ivan Peychev - Systems Design & Startup Advisory</title>
        <meta 
          name="description" 
          content="Get in touch with Ivan Peychev for systems design consultation, startup advisory services, and technical architecture guidance. Start your project today." 
        />
        <meta name="keywords" content="contact, consultation, systems design, startup advisory, technical architecture, Ivan Peychev" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Contact Ivan Peychev - Systems Design & Startup Advisory" />
        <meta property="og:description" content="Get in touch with Ivan Peychev for systems design consultation, startup advisory services, and technical architecture guidance." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ivanpeychev.com/contact-inquiry" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Contact Ivan Peychev - Systems Design & Startup Advisory" />
        <meta name="twitter:description" content="Get in touch with Ivan Peychev for systems design consultation, startup advisory services, and technical architecture guidance." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-16">
          {/* Hero Section */}
          <section className="py-16 lg:py-24">
            <div className="max-w-7xl mx-auto px-6">
              <div className="max-w-3xl mx-auto text-center space-y-6">
                <div className="space-y-4">
                  <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                    Let's Build Something
                    <span className="text-accent"> Exceptional</span>
                  </h1>
                  <p className="text-xl text-text-secondary leading-relaxed">
                    Ready to transform your product and scale your team? I help founders and technical leaders build systems that drive sustainable growth.
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-text-secondary">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span>Available for new projects</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span>24-hour response time</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-warning rounded-full"></div>
                    <span>Global client base</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Main Content */}
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Contact Form - Takes up 2 columns */}
                <div className="lg:col-span-2">
                  <ContactForm />
                </div>
                
                {/* Contact Information - Takes up 1 column */}
                <div className="space-y-8">
                  <ContactInfo />
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="py-16 bg-surface">
            <div className="max-w-4xl mx-auto px-6">
              <TestimonialLine />
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-16">
            <div className="max-w-4xl mx-auto px-6">
              <FAQSection />
            </div>
          </section>

          {/* Newsletter Section */}
          <section className="py-16 bg-surface">
            <div className="max-w-2xl mx-auto px-6">
              <NewsletterSubscription
                title="Stay Connected"
                description="Get weekly insights on systems design, startup strategy, and technical leadership delivered to your inbox."
                className="bg-card"
              />
            </div>
          </section>

          {/* Final CTA Section */}
          <section className="py-16">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <div className="bg-card rounded-lg p-8 lg:p-12 border border-border">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                      Ready to Get Started?
                    </h2>
                    <p className="text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto">
                      Whether you're looking to optimize your current systems, scale your team, or need strategic guidance on your next big initiative, I'm here to help you succeed.
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <a
                      href="#contact-form"
                      className="inline-flex items-center justify-center px-6 py-3 bg-accent text-accent-foreground font-medium rounded-md hover:bg-accent/90 transition-colors duration-150 ease-out"
                      onClick={(e) => {
                        e?.preventDefault();
                        document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      Start Your Project
                    </a>
                    <a
                      href="https://calendly.com/ivanpeychev/discovery"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-6 py-3 border border-border text-foreground font-medium rounded-md hover:bg-surface transition-colors duration-150 ease-out"
                    >
                      Schedule a Call
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ContactInquiry;