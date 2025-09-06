import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const ClientTestimonials = () => {
  const testimonials = [
    {
      id: 1,
      content: `Ivan's systems design expertise transformed our entire platform architecture. His ability to balance technical excellence with business objectives is remarkable. The scalability improvements he implemented helped us handle 10x growth without breaking a sweat.`,
      author: "Sarah Chen",
      role: "CTO",
      company: "TechFlow Solutions",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      project: "Platform Architecture Redesign"
    },
    {
      id: 2,
      content: `Working with Ivan was a game-changer for our startup. His strategic approach to product development and technical leadership helped us secure Series A funding. He doesn't just build systems; he builds the foundation for sustainable growth.`,
      author: "Marcus Rodriguez",
      role: "Founder & CEO",
      company: "DataVault Inc",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      project: "MVP Development & Strategy"
    },
    {
      id: 3,
      content: `Ivan's advisory guidance was instrumental in our product pivot. His deep understanding of both technical architecture and market dynamics helped us make informed decisions that ultimately led to our successful acquisition.`,
      author: "Emily Watson",
      role: "Product Director",
      company: "InnovateLab",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      project: "Product Strategy & Advisory"
    },
    {
      id: 4,
      content: `The performance optimizations Ivan implemented reduced our page load times by 75% and improved our conversion rates significantly. His attention to detail and systematic approach to problem-solving is exceptional.`,
      author: "David Kim",
      role: "Engineering Manager",
      company: "RetailTech Pro",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      project: "Performance Optimization"
    }
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Icon
        key={index}
        name="Star"
        size={14}
        className={index < rating ? 'text-warning fill-current' : 'text-muted'}
      />
    ));
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-foreground font-semibold text-2xl">Client Success Stories</h2>
        <p className="text-text-secondary max-w-2xl mx-auto">
          Hear from founders and technical leaders who've worked with Ivan to build 
          scalable systems and drive business growth.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials?.map((testimonial) => (
          <div
            key={testimonial?.id}
            className="bg-card border border-border rounded-lg p-6 space-y-4 hover:border-accent/30 transition-all duration-300 ease-out"
          >
            {/* Rating */}
            <div className="flex items-center space-x-1">
              {renderStars(testimonial?.rating)}
            </div>

            {/* Content */}
            <blockquote className="text-text-secondary leading-relaxed">
              "{testimonial?.content}"
            </blockquote>

            {/* Project Context */}
            <div className="text-accent text-sm font-medium">
              Project: {testimonial?.project}
            </div>

            {/* Author */}
            <div className="flex items-center space-x-3 pt-2 border-t border-border">
              <div className="w-10 h-10 overflow-hidden rounded-full">
                <Image
                  src={testimonial?.avatar}
                  alt={`${testimonial?.author} profile`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="space-y-1">
                <div className="text-foreground font-medium text-sm">
                  {testimonial?.author}
                </div>
                <div className="text-text-secondary text-xs">
                  {testimonial?.role} at {testimonial?.company}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Stats Section */}
      <div className="bg-surface rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-2">
            <div className="text-accent font-bold text-2xl">50+</div>
            <div className="text-text-secondary text-sm">Projects Delivered</div>
          </div>
          
          <div className="space-y-2">
            <div className="text-accent font-bold text-2xl">98%</div>
            <div className="text-text-secondary text-sm">Client Satisfaction</div>
          </div>
          
          <div className="space-y-2">
            <div className="text-accent font-bold text-2xl">$50M+</div>
            <div className="text-text-secondary text-sm">Client Funding Raised</div>
          </div>
          
          <div className="space-y-2">
            <div className="text-accent font-bold text-2xl">8+</div>
            <div className="text-text-secondary text-sm">Years Experience</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientTestimonials;