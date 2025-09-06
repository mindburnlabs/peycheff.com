import React from 'react';
import Icon from '../../../components/AppIcon';

const ProcessStep = ({ 
  step, 
  icon, 
  title, 
  description, 
  isLast = false 
}) => {
  return (
    <div className="relative flex items-start space-x-4">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
          <Icon name={icon} size={20} color="var(--color-accent-foreground)" />
        </div>
        {!isLast && (
          <div className="w-0.5 h-16 bg-border mt-4"></div>
        )}
      </div>
      
      <div className="flex-1 pb-8">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-accent font-medium text-sm">Step {step}</span>
        </div>
        <h3 className="text-foreground font-semibold text-lg mb-2">
          {title}
        </h3>
        <p className="text-text-secondary text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default ProcessStep;