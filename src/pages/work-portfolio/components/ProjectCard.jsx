import React from 'react';

import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const ProjectCard = ({ project, onViewDetails }) => {
  const {
    id,
    title,
    client,
    category,
    description,
    image,
    technologies,
    outcomes,
    year,
    featured,
    externalUrl
  } = project;

  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails(project);
    }
  };

  return (
    <div 
      className={`group bg-card border border-border rounded-lg overflow-hidden hover:border-accent/50 transition-all duration-300 ease-out cursor-pointer ${
        featured ? 'ring-1 ring-accent/20' : ''
      }`}
      onClick={handleCardClick}
    >
      {/* Project Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={image}
          alt={`${title} project screenshot`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        {featured && (
          <div className="absolute top-3 left-3 bg-accent text-accent-foreground px-2 py-1 rounded-md text-xs font-medium">
            Featured
          </div>
        )}
        <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm text-text-secondary px-2 py-1 rounded-md text-xs">
          {year}
        </div>
      </div>
      {/* Project Content */}
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-accent text-sm font-medium">{client}</span>
            <span className="text-text-secondary text-xs px-2 py-1 bg-muted rounded-md">
              {category}
            </span>
          </div>
          <h3 className="text-foreground font-semibold text-lg leading-tight group-hover:text-accent transition-colors duration-200">
            {title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-text-secondary text-sm leading-relaxed line-clamp-3">
          {description}
        </p>

        {/* Technologies */}
        <div className="flex flex-wrap gap-2">
          {technologies?.slice(0, 3)?.map((tech, index) => (
            <span
              key={index}
              className="text-xs px-2 py-1 bg-surface text-text-secondary rounded-md"
            >
              {tech}
            </span>
          ))}
          {technologies?.length > 3 && (
            <span className="text-xs px-2 py-1 bg-surface text-text-secondary rounded-md">
              +{technologies?.length - 3} more
            </span>
          )}
        </div>

        {/* Key Outcomes */}
        {outcomes && outcomes?.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-foreground text-sm font-medium">Key Results:</h4>
            <ul className="space-y-1">
              {outcomes?.slice(0, 2)?.map((outcome, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm text-text-secondary">
                  <Icon name="ArrowRight" size={14} className="mt-0.5 text-accent flex-shrink-0" />
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleCardClick}
            className="text-accent hover:text-accent/80 text-sm font-medium transition-colors duration-150 ease-out flex items-center space-x-1"
          >
            <span>View Details</span>
            <Icon name="ArrowRight" size={14} />
          </button>
          
          {externalUrl && (
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e?.stopPropagation()}
              className="text-text-secondary hover:text-foreground transition-colors duration-150 ease-out"
              aria-label="View live project"
            >
              <Icon name="ExternalLink" size={16} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;