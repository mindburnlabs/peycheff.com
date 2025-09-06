import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const TestimonialLine = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      quote: "Ivan transformed our chaotic product development into a streamlined system. Our time-to-market improved by 50% and our team finally has clarity on priorities.",
      author: "Sarah Chen",
      role: "CEO & Founder",
      company: "TechFlow",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      rating: 5
    },
    {
      id: 2,
      quote: "Working with Ivan was a game-changer. His systems thinking approach helped us scale from 10K to 1M users without breaking our architecture.",
      author: "Marcus Rodriguez",
      role: "CTO",
      company: "ScaleUp Solutions",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      rating: 5
    },
    {
      id: 3,
      quote: "Ivan\'s strategic guidance during our Series A was invaluable. He helped us build a product roadmap that investors loved and users actually wanted.",
      author: "Emily Watson",
      role: "Founder",
      company: "InnovateLab",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      rating: 5
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === testimonials?.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [testimonials?.length]);

  const currentTestimonial = testimonials?.[currentIndex];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center space-y-8">
          {/* Section Label */}
          <div className="space-y-2">
            <p className="text-accent text-sm font-medium uppercase tracking-wider">
              Client Success Stories
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              What founders say about working with me
            </h2>
          </div>

          {/* Testimonial Content */}
          <div className="relative">
            <div className="bg-card border border-border rounded-lg p-8 md:p-12 space-y-6">
              {/* Quote Icon */}
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <Icon name="Quote" size={24} color="var(--color-accent)" />
                </div>
              </div>

              {/* Quote Text */}
              <blockquote className="text-xl md:text-2xl text-foreground leading-relaxed font-medium">
                "{currentTestimonial?.quote}"
              </blockquote>

              {/* Rating */}
              <div className="flex justify-center space-x-1">
                {[...Array(currentTestimonial?.rating)]?.map((_, i) => (
                  <Icon key={i} name="Star" size={20} color="var(--color-accent)" />
                ))}
              </div>

              {/* Author Info */}
              <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={currentTestimonial?.avatar}
                    alt={currentTestimonial?.author}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left">
                  <div className="text-foreground font-semibold">
                    {currentTestimonial?.author}
                  </div>
                  <div className="text-text-secondary text-sm">
                    {currentTestimonial?.role} at {currentTestimonial?.company}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center space-x-2">
            {testimonials?.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-150 ease-out ${
                  index === currentIndex 
                    ? 'bg-accent w-8' :'bg-border hover:bg-accent/50'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">50+</div>
              <div className="text-text-secondary text-sm">Projects Delivered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">98%</div>
              <div className="text-text-secondary text-sm">Client Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">$2M+</div>
              <div className="text-text-secondary text-sm">Revenue Generated</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialLine;