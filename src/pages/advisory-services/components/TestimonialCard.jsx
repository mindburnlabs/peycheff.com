import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const TestimonialCard = ({ 
  quote, 
  author, 
  role, 
  company, 
  avatar, 
  rating = 5 
}) => {
  return (
    <div className="bg-card rounded-lg p-6 border border-border">
      <div className="space-y-4">
        <div className="flex items-center space-x-1">
          {[...Array(rating)]?.map((_, index) => (
            <Icon 
              key={index} 
              name="Star" 
              size={16} 
              color="var(--color-accent)" 
              className="fill-current"
            />
          ))}
        </div>
        
        <blockquote className="text-foreground text-sm leading-relaxed">
          "{quote}"
        </blockquote>
        
        <div className="flex items-center space-x-3 pt-2">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-surface">
            <Image 
              src={avatar} 
              alt={`${author} avatar`}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="text-foreground font-medium text-sm">
              {author}
            </div>
            <div className="text-text-secondary text-xs">
              {role} at {company}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;