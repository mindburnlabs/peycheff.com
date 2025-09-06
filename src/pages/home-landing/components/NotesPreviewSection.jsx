import React from 'react';
import { ReadNotesCTA } from '../../../components/ui/CTAButton';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const NotesPreviewSection = () => {
  const recentNotes = [
    {
      id: 1,
      title: "The Hidden Costs of Technical Debt in Early-Stage Startups",
      excerpt: "Most founders underestimate how technical debt compounds. Here\'s a framework for making smart trade-offs between speed and sustainability in your MVP.",
      category: "Systems Design",
      readTime: "8 min read",
      publishedAt: "2025-01-02",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
      tags: ["Technical Debt", "MVP", "Scaling"]
    },
    {
      id: 2,
      title: "Why Most Product Roadmaps Fail (And How to Build One That Works)",
      excerpt: "After reviewing 100+ startup roadmaps, I've identified the 5 critical mistakes that kill product momentum. Here's what successful founders do differently.",
      category: "Product Strategy",
      readTime: "12 min read",
      publishedAt: "2024-12-28",
      image: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?w=400&h=250&fit=crop",
      tags: ["Product Management", "Strategy", "Planning"]
    },
    {
      id: 3,
      title: "The Founder\'s Guide to Hiring Your First Technical Team",
      excerpt: "Hiring technical talent as a non-technical founder is challenging. This guide covers everything from writing job descriptions to conducting interviews.",
      category: "Team Building",
      readTime: "15 min read",
      publishedAt: "2024-12-20",
      image: "https://images.pixabay.com/photo/2015/07/17/22/43/student-849825_1280.jpg?w=400&h=250&fit=crop",
      tags: ["Hiring", "Team", "Leadership"]
    }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Latest Notes
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Practical insights on systems design, product strategy, and startup growth. 
            Written for founders who want to build better products.
          </p>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {recentNotes?.map((note) => (
            <article 
              key={note?.id}
              className="bg-card border border-border rounded-lg overflow-hidden hover:border-accent/50 transition-all duration-300 ease-out group cursor-pointer"
            >
              {/* Note Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={note?.image}
                  alt={note?.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-background/90 text-foreground text-xs font-medium px-2 py-1 rounded-full">
                    {note?.category}
                  </span>
                </div>
              </div>

              {/* Note Content */}
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-accent transition-colors duration-150 ease-out line-clamp-2">
                    {note?.title}
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed line-clamp-3">
                    {note?.excerpt}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {note?.tags?.slice(0, 2)?.map((tag) => (
                    <span 
                      key={tag}
                      className="bg-surface text-text-secondary text-xs px-2 py-1 rounded border border-border"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center space-x-2 text-text-secondary text-xs">
                    <Icon name="Calendar" size={14} />
                    <span>{formatDate(note?.publishedAt)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-text-secondary text-xs">
                    <Icon name="Clock" size={14} />
                    <span>{note?.readTime}</span>
                  </div>
                </div>

                {/* Read More Link */}
                <div className="pt-2">
                  <button className="flex items-center space-x-2 text-accent hover:text-accent/80 transition-colors duration-150 ease-out">
                    <span className="text-sm font-medium">Read full note</span>
                    <Icon name="ArrowRight" size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <ReadNotesCTA size="lg" />
        </div>
      </div>
    </section>
  );
};

export default NotesPreviewSection;