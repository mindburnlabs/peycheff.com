import React from 'react';
import Icon from '../../../components/AppIcon';

const ExpertiseArea = ({ 
  icon, 
  title, 
  description, 
  skills = [] 
}) => {
  return (
    <div className="bg-card rounded-lg p-6 border border-border hover:border-accent/30 transition-all duration-300">
      <div className="space-y-4">
        <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
          <Icon name={icon} size={20} color="var(--color-accent)" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-foreground font-semibold text-lg">
            {title}
          </h3>
          <p className="text-text-secondary text-sm leading-relaxed">
            {description}
          </p>
        </div>
        
        {skills?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {skills?.map((skill, index) => (
              <span 
                key={index}
                className="bg-surface text-text-secondary px-2 py-1 rounded text-xs"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpertiseArea;