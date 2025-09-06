import React from 'react';
import { WorkWithMeCTA, ReadNotesCTA, ViewWorkCTA } from '../../../components/ui/CTAButton';
import NewsletterSubscription from '../../../components/ui/NewsletterSubscription';

const CTASection = () => {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-4xl mx-auto px-6">
        <div className="space-y-12">
          {/* Main CTA */}
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-foreground">
                Ready to Build Something Great?
              </h2>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                Whether you're looking to scale your engineering team, architect a new system, 
                or navigate complex technical decisions, I'm here to help you succeed.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <WorkWithMeCTA size="lg" />
              <ViewWorkCTA size="lg" />
            </div>
          </div>

          {/* Newsletter Subscription */}
          <div className="max-w-md mx-auto">
            <NewsletterSubscription
              title="Stay Connected"
              description="Get insights on systems design, startup strategy, and engineering leadership delivered monthly."
              className="bg-surface"
            />
          </div>

          {/* Secondary Actions */}
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">
                Explore More
              </h3>
              <p className="text-text-secondary">
                Dive deeper into my thoughts on building scalable systems and leading teams.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <ReadNotesCTA />
              <a 
                href="mailto:ivan@peychev.com"
                className="inline-flex items-center justify-center px-6 py-3 text-accent hover:text-accent/80 transition-colors duration-150 ease-out"
              >
                Send me an email
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;