import React, { useEffect } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProjectModal = ({ project, isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e?.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !project) return null;

  const {
    title,
    client,
    category,
    description,
    image,
    technologies,
    outcomes,
    year,
    challenge,
    solution,
    results,
    externalUrl,
    duration,
    teamSize
  } = project;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal Content */}
      <div className="relative bg-card border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-accent text-sm font-medium">{client}</span>
              <span className="text-text-secondary text-xs">•</span>
              <span className="text-text-secondary text-xs">{year}</span>
            </div>
            <h2 className="text-foreground font-semibold text-xl">{title}</h2>
          </div>
          
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-foreground transition-colors duration-150 ease-out p-2"
            aria-label="Close modal"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Hero Image */}
          <div className="relative h-64 md:h-80 overflow-hidden rounded-lg">
            <Image
              src={image}
              alt={`${title} project screenshot`}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Project Meta */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="text-foreground font-medium text-sm">Category</h3>
              <p className="text-text-secondary text-sm">{category}</p>
            </div>
            
            {duration && (
              <div className="space-y-2">
                <h3 className="text-foreground font-medium text-sm">Duration</h3>
                <p className="text-text-secondary text-sm">{duration}</p>
              </div>
            )}
            
            {teamSize && (
              <div className="space-y-2">
                <h3 className="text-foreground font-medium text-sm">Team Size</h3>
                <p className="text-text-secondary text-sm">{teamSize}</p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-foreground font-semibold text-lg">Overview</h3>
            <p className="text-text-secondary leading-relaxed">{description}</p>
          </div>

          {/* Challenge */}
          {challenge && (
            <div className="space-y-3">
              <h3 className="text-foreground font-semibold text-lg">Challenge</h3>
              <p className="text-text-secondary leading-relaxed">{challenge}</p>
            </div>
          )}

          {/* Solution */}
          {solution && (
            <div className="space-y-3">
              <h3 className="text-foreground font-semibold text-lg">Solution</h3>
              <p className="text-text-secondary leading-relaxed">{solution}</p>
            </div>
          )}

          {/* Technologies */}
          <div className="space-y-3">
            <h3 className="text-foreground font-semibold text-lg">Technologies Used</h3>
            <div className="flex flex-wrap gap-2">
              {technologies?.map((tech, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-surface text-text-secondary rounded-md text-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Results */}
          {(results || outcomes) && (
            <div className="space-y-3">
              <h3 className="text-foreground font-semibold text-lg">Results & Impact</h3>
              {results && (
                <p className="text-text-secondary leading-relaxed mb-4">{results}</p>
              )}
              {outcomes && outcomes?.length > 0 && (
                <ul className="space-y-2">
                  {outcomes?.map((outcome, index) => (
                    <li key={index} className="flex items-start space-x-2 text-text-secondary">
                      <Icon name="Check" size={16} className="mt-0.5 text-accent flex-shrink-0" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border">
            {externalUrl && (
              <Button
                variant="default"
                iconName="ExternalLink"
                iconPosition="right"
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                asChild
              >
                <a href={externalUrl} target="_blank" rel="noopener noreferrer">
                  View Live Project
                </a>
              </Button>
            )}
            
            <Button
              variant="outline"
              iconName="MessageCircle"
              iconPosition="right"
              asChild
            >
              <a href="/contact-inquiry">
                Discuss Similar Project
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;