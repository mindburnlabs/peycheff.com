import React from 'react';
import NewsletterSubscription from '../../../components/ui/NewsletterSubscription';
import Icon from '../../../components/AppIcon';

const NewsletterSection = () => {
  const benefits = [
    {
      icon: "Lightbulb",
      title: "Weekly Insights",
      description: "Get practical systems design tips and startup strategy insights delivered every Tuesday."
    },
    {
      icon: "Users",
      title: "Founder Community",
      description: "Join 2,500+ founders who rely on these insights to build better products."
    },
    {
      icon: "Zap",
      title: "Actionable Content",
      description: "No fluff. Every email contains frameworks and tools you can implement immediately."
    }
  ];

  return (
    <section className="py-20 bg-surface">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                Stay ahead of the curve
              </h2>
              <p className="text-xl text-text-secondary leading-relaxed">
                Get weekly insights on systems design, product strategy, and startup growth. 
                Join thousands of founders who trust these insights to build better products.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-6">
              {benefits?.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name={benefit?.icon} size={20} color="var(--color-accent)" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-foreground font-semibold">
                      {benefit?.title}
                    </h3>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {benefit?.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social Proof */}
            <div className="flex items-center space-x-4 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4]?.map((i) => (
                  <div 
                    key={i}
                    className="w-8 h-8 bg-accent rounded-full border-2 border-surface flex items-center justify-center"
                  >
                    <span className="text-accent-foreground text-xs font-semibold">
                      {String.fromCharCode(64 + i)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-text-secondary text-sm">
                <span className="text-foreground font-semibold">2,500+</span> founders subscribed
              </div>
            </div>
          </div>

          {/* Right Side - Newsletter Form */}
          <div className="lg:pl-8">
            <NewsletterSubscription
              title="Join the Newsletter"
              description="Get practical insights delivered to your inbox every Tuesday. No spam, unsubscribe anytime."
              className="max-w-md mx-auto lg:mx-0"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;