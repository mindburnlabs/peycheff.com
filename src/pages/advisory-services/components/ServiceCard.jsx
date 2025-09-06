import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ServiceCard = ({ 
  icon, 
  title, 
  description, 
  duration, 
  outcomes, 
  isPopular = false,
  onLearnMore 
}) => {
  return (
    <div className={`relative bg-card rounded-lg p-6 border transition-all duration-300 hover:shadow-lg ${
      isPopular 
        ? 'border-accent shadow-md' 
        : 'border-border hover:border-accent/50'
    }`}>
      {isPopular && (
        <div className="absolute -top-3 left-6">
          <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-medium">
            Most Popular
          </span>
        </div>
      )}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
            <Icon name={icon} size={24} color="var(--color-accent)" />
          </div>
          {duration && (
            <span className="text-text-secondary text-sm bg-surface px-2 py-1 rounded">
              {duration}
            </span>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-foreground font-semibold text-lg">
            {title}
          </h3>
          <p className="text-text-secondary text-sm leading-relaxed">
            {description}
          </p>
        </div>
        
        {outcomes && outcomes?.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-foreground font-medium text-sm">Key Outcomes:</h4>
            <ul className="space-y-1">
              {outcomes?.map((outcome, index) => (
                <li key={index} className="flex items-start space-x-2 text-text-secondary text-sm">
                  <Icon name="Check" size={16} color="var(--color-accent)" className="mt-0.5 flex-shrink-0" />
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={onLearnMore}
          className="w-full mt-4 border-accent/30 text-accent hover:bg-accent hover:text-accent-foreground"
        >
          Learn More
        </Button>
      </div>
    </div>
  );
};

export default ServiceCard;