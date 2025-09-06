import React from 'react';
import Icon from '../../../components/AppIcon';

const TestimonialLine = () => {
  const testimonials = [
    {
      quote: "Ivan\'s systems thinking transformed how we approach product development. Revenue increased 40% in 6 months.",
      author: "Sarah Chen",
      role: "CEO, TechFlow",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face"
    },
    {
      quote: "The technical architecture review saved us months of development time and prevented costly mistakes.",
      author: "Marcus Rodriguez",
      role: "CTO, DataSync",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face"
    },
    {
      quote: "Ivan's advisory helped us scale from 10 to 50 engineers while maintaining code quality and team velocity.",
      author: "Emily Watson",
      role: "VP Engineering, CloudBase",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-foreground font-semibold text-xl">
          What Clients Say
        </h3>
        <p className="text-text-secondary">
          Feedback from founders and technical leaders I've worked with.
        </p>
      </div>
      <div className="space-y-6">
        {testimonials?.map((testimonial, index) => (
          <div
            key={index}
            className="bg-card rounded-lg p-6 border border-border"
          >
            <div className="space-y-4">
              <div className="flex items-start space-x-1">
                {[...Array(5)]?.map((_, i) => (
                  <Icon
                    key={i}
                    name="Star"
                    size={16}
                    color="var(--color-accent)"
                    className="fill-current"
                  />
                ))}
              </div>
              
              <blockquote className="text-foreground leading-relaxed">
                "{testimonial?.quote}"
              </blockquote>
              
              <div className="flex items-center space-x-3 pt-2">
                <img
                  src={testimonial?.avatar}
                  alt={testimonial?.author}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = '/assets/images/no_image.png';
                  }}
                />
                <div>
                  <p className="text-foreground font-medium text-sm">
                    {testimonial?.author}
                  </p>
                  <p className="text-text-secondary text-sm">
                    {testimonial?.role}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-surface rounded-lg p-6 border border-border">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center space-x-2">
            <Icon name="Award" size={20} color="var(--color-accent)" />
            <span className="text-foreground font-medium text-sm">
              Trusted by 50+ startups and scale-ups
            </span>
          </div>
          <p className="text-text-secondary text-sm">
            From seed-stage to Series B companies across fintech, healthtech, and enterprise SaaS
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialLine;