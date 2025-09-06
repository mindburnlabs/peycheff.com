import React, { useState } from 'react';
import Button from './Button';
import Input from './Input';
import Icon from '../AppIcon';

const NewsletterSubscription = ({ 
  title = "Stay Updated", 
  description = "Get the latest insights on systems design and startup strategy delivered to your inbox.",
  variant = "default",
  className = ""
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    
    if (!email) {
      setError('Email address is required');
      return;
    }

    if (!email?.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSubscribed(true);
      setEmail('');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e?.target?.value);
    if (error) setError('');
  };

  if (isSubscribed) {
    return (
      <div className={`bg-card rounded-lg p-6 border border-border ${className}`}>
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center mx-auto">
            <Icon name="Check" size={24} color="var(--color-success)" />
          </div>
          <div className="space-y-2">
            <h3 className="text-foreground font-semibold text-lg">
              You're all set!
            </h3>
            <p className="text-text-secondary text-sm">
              Thanks for subscribing. You'll receive our next update soon.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSubscribed(false)}
            className="text-text-secondary hover:text-foreground"
          >
            Subscribe another email
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card rounded-lg p-6 border border-border ${className}`}>
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-foreground font-semibold text-lg">
            {title}
          </h3>
          <p className="text-text-secondary text-sm leading-relaxed">
            {description}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={handleEmailChange}
            error={error}
            disabled={isLoading}
            className="w-full"
          />
          
          <Button
            type="submit"
            variant="default"
            size="default"
            loading={isLoading}
            disabled={isLoading || !email}
            fullWidth
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isLoading ? 'Subscribing...' : 'Subscribe to Updates'}
          </Button>
        </form>

        <p className="text-text-secondary text-xs text-center">
          No spam, unsubscribe at any time. Read our{' '}
          <a 
            href="/privacy" 
            className="text-accent hover:text-accent/80 transition-colors duration-150 ease-out"
          >
            privacy policy
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default NewsletterSubscription;