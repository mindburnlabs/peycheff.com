import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';


const CTAButton = ({ 
  variant = "primary", 
  size = "default",
  children,
  href,
  to,
  onClick,
  iconName,
  iconPosition = "right",
  fullWidth = false,
  className = "",
  ...props 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-accent text-accent-foreground hover:bg-accent/90';
      case 'secondary':
        return 'bg-secondary text-secondary-foreground hover:bg-secondary/90 border border-border';
      case 'outline':
        return 'border border-accent text-accent hover:bg-accent hover:text-accent-foreground';
      case 'ghost':
        return 'text-accent hover:bg-accent/10';
      default:
        return 'bg-accent text-accent-foreground hover:bg-accent/90';
    }
  };

  const buttonContent = (
    <Button
      variant={variant === 'primary' ? 'default' : variant}
      size={size}
      onClick={onClick}
      iconName={iconName}
      iconPosition={iconPosition}
      fullWidth={fullWidth}
      className={`${getVariantStyles()} transition-all duration-150 ease-out ${className}`}
      {...props}
    >
      {children}
    </Button>
  );

  // External link
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={fullWidth ? 'block' : 'inline-block'}
      >
        {buttonContent}
      </a>
    );
  }

  // Internal link
  if (to) {
    return (
      <Link 
        to={to}
        className={fullWidth ? 'block' : 'inline-block'}
      >
        {buttonContent}
      </Link>
    );
  }

  // Regular button
  return buttonContent;
};

// Predefined CTA variants for common use cases
export const WorkWithMeCTA = ({ size = "default", fullWidth = false, className = "", ...props }) => (
  <CTAButton
    variant="primary"
    size={size}
    to="/contact-inquiry"
    iconName="ArrowRight"
    fullWidth={fullWidth}
    className={className}
    {...props}
  >
    Work with me
  </CTAButton>
);

export const ReadNotesCTA = ({ size = "default", fullWidth = false, className = "", ...props }) => (
  <CTAButton
    variant="outline"
    size={size}
    to="/notes-content-hub"
    iconName="BookOpen"
    fullWidth={fullWidth}
    className={className}
    {...props}
  >
    Read my notes
  </CTAButton>
);

export const ViewWorkCTA = ({ size = "default", fullWidth = false, className = "", ...props }) => (
  <CTAButton
    variant="secondary"
    size={size}
    to="/work-portfolio"
    iconName="ExternalLink"
    fullWidth={fullWidth}
    className={className}
    {...props}
  >
    View my work
  </CTAButton>
);

export const LearnMoreCTA = ({ to = "/about-profile", size = "default", fullWidth = false, className = "", ...props }) => (
  <CTAButton
    variant="ghost"
    size={size}
    to={to}
    iconName="ArrowRight"
    fullWidth={fullWidth}
    className={className}
    {...props}
  >
    Learn more
  </CTAButton>
);

export default CTAButton;