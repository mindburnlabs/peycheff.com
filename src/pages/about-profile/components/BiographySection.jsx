import React from 'react';

const BiographySection = () => {
  return (
    <section className="py-16 bg-surface">
      <div className="max-w-4xl mx-auto px-6">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-foreground">
              My Story
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              From engineering foundations to startup leadership, here's how I developed 
              my expertise in building scalable systems and guiding teams to success.
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="space-y-6 text-text-secondary leading-relaxed">
              <p className="text-lg">
                My journey began in the early days of web development, where I discovered my passion 
                for creating systems that not only work but scale beautifully. What started as curiosity 
                about how things work under the hood evolved into a career dedicated to building 
                products that millions of users depend on.
              </p>

              <p>
                Over the past 12 years, I've had the privilege of working with startups at every stage—from 
                pre-seed companies finding product-market fit to Series B organizations scaling their 
                engineering teams. This experience taught me that great products aren't just about 
                elegant code or beautiful interfaces; they're about understanding users, anticipating 
                growth, and building systems that adapt.
              </p>

              <div className="bg-card border border-border rounded-lg p-6 my-8">
                <blockquote className="text-foreground text-xl font-medium italic">
                  "The best systems are invisible to users but indispensable to businesses. 
                  They scale effortlessly, fail gracefully, and evolve continuously."
                </blockquote>
              </div>

              <p>
                Today, I focus on helping founders navigate the complex decisions that determine 
                whether their products will scale successfully. Whether it's architecting a system 
                for 10x growth, building a design system that unifies user experience, or establishing 
                engineering practices that support rapid iteration, I bring both technical depth 
                and strategic perspective to every engagement.
              </p>

              <p>
                When I'm not working with clients, you'll find me writing about systems design, 
                mentoring early-career engineers, or exploring the intersection of technology and 
                human behavior. I believe the future belongs to products that are not just 
                technically excellent but genuinely useful and delightful to use.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BiographySection;