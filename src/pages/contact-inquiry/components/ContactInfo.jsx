import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ContactInfo = () => {
  const contactMethods = [
    {
      icon: 'Mail',
      title: 'Email',
      value: 'ivan@peychev.com',
      description: 'Best for detailed project discussions',
      action: 'mailto:ivan@peychev.com',
      actionText: 'Send Email'
    },
    {
      icon: 'Calendar',
      title: 'Schedule a Call',
      value: '30-minute discovery call',
      description: 'Perfect for complex projects requiring discussion',
      action: 'https://calendly.com/ivanpeychev/discovery',
      actionText: 'Book Meeting'
    },
    {
      icon: 'Linkedin',
      title: 'LinkedIn',
      value: 'Connect professionally',
      description: 'Great for networking and quick questions',
      action: 'https://linkedin.com/in/ivanpeychev',
      actionText: 'Connect'
    }
  ];

  const responseInfo = [
    {
      icon: 'Clock',
      title: 'Response Time',
      description: 'Within 24 hours for all inquiries'
    },
    {
      icon: 'MapPin',
      title: 'Location',
      description: 'San Francisco, CA (PST/PDT)'
    },
    {
      icon: 'Globe',
      title: 'Availability',
      description: 'Working with clients globally'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Contact Methods */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-foreground font-semibold text-xl">
            Get in Touch
          </h3>
          <p className="text-text-secondary">
            Choose the communication method that works best for you.
          </p>
        </div>

        <div className="space-y-4">
          {contactMethods?.map((method, index) => (
            <div
              key={index}
              className="bg-card rounded-lg p-6 border border-border hover:border-accent/20 transition-colors duration-150 ease-out"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name={method?.icon} size={24} color="var(--color-accent)" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="space-y-1">
                    <h4 className="text-foreground font-medium">
                      {method?.title}
                    </h4>
                    <p className="text-foreground text-sm font-medium">
                      {method?.value}
                    </p>
                    <p className="text-text-secondary text-sm">
                      {method?.description}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                  >
                    <a
                      href={method?.action}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {method?.actionText}
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Response Information */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-foreground font-semibold text-xl">
            What to Expect
          </h3>
          <p className="text-text-secondary">
            Here's what happens after you reach out.
          </p>
        </div>

        <div className="space-y-4">
          {responseInfo?.map((info, index) => (
            <div
              key={index}
              className="flex items-start space-x-4 p-4 bg-surface rounded-lg"
            >
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name={info?.icon} size={20} color="var(--color-accent)" />
              </div>
              <div className="space-y-1">
                <h4 className="text-foreground font-medium text-sm">
                  {info?.title}
                </h4>
                <p className="text-text-secondary text-sm">
                  {info?.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Process Steps */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-foreground font-semibold text-xl">
            My Process
          </h3>
          <p className="text-text-secondary">
            How I approach new client relationships.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-accent-foreground font-semibold text-sm">1</span>
            </div>
            <div className="space-y-1">
              <h4 className="text-foreground font-medium text-sm">
                Initial Review
              </h4>
              <p className="text-text-secondary text-sm">
                I review your inquiry and assess how I can best help you achieve your goals.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-accent-foreground font-semibold text-sm">2</span>
            </div>
            <div className="space-y-1">
              <h4 className="text-foreground font-medium text-sm">
                Discovery Call
              </h4>
              <p className="text-text-secondary text-sm">
                We discuss your project in detail, timeline, and determine if we're a good fit.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-accent-foreground font-semibold text-sm">3</span>
            </div>
            <div className="space-y-1">
              <h4 className="text-foreground font-medium text-sm">
                Proposal & Start
              </h4>
              <p className="text-text-secondary text-sm">
                I provide a detailed proposal and we begin working together on your project.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;