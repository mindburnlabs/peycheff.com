import React from 'react';
import Image from '../../../components/AppImage';
import { WorkWithMeCTA } from '../../../components/ui/CTAButton';

const HeroSection = () => {
  return (
    <section className="pt-24 pb-16 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                Building systems that scale,
                <span className="text-accent block">
                  leading teams that deliver
                </span>
              </h1>
              <p className="text-xl text-text-secondary leading-relaxed">
                I'm Ivan Peychev, a systems design expert and startup advisor with over 12 years 
                of experience helping founders build scalable, user-centered products that drive 
                business growth.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <WorkWithMeCTA size="lg" />
              <a 
                href="#experience" 
                className="inline-flex items-center justify-center px-6 py-3 text-accent hover:text-accent/80 transition-colors duration-150 ease-out"
              >
                Learn about my journey
              </a>
            </div>
          </div>

          {/* Professional Photo */}
          <div className="relative">
            <div className="relative w-full max-w-md mx-auto">
              <div className="aspect-square rounded-2xl overflow-hidden bg-surface border border-border">
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&crop=face"
                  alt="Ivan Peychev - Systems Design Expert and Startup Advisor"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Accent decoration */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-accent/20 rounded-full blur-xl"></div>
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-accent/10 rounded-full blur-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;