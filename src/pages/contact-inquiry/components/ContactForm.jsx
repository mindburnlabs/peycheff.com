import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    inquiryType: '',
    budget: '',
    timeline: '',
    description: '',
    newsletter: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const inquiryTypeOptions = [
    { value: 'systems-design', label: 'Systems Design Consultation' },
    { value: 'advisory', label: 'Startup Advisory Services' },
    { value: 'product-strategy', label: 'Product Strategy Review' },
    { value: 'technical-audit', label: 'Technical Architecture Audit' },
    { value: 'general', label: 'General Consultation' }
  ];

  const budgetOptions = [
    { value: '5k-15k', label: '$5,000 - $15,000' },
    { value: '15k-50k', label: '$15,000 - $50,000' },
    { value: '50k-100k', label: '$50,000 - $100,000' },
    { value: '100k+', label: '$100,000+' },
    { value: 'discuss', label: 'Let\'s discuss' }
  ];

  const timelineOptions = [
    { value: 'immediate', label: 'Immediate (1-2 weeks)' },
    { value: 'short', label: 'Short-term (1-3 months)' },
    { value: 'medium', label: 'Medium-term (3-6 months)' },
    { value: 'long', label: 'Long-term (6+ months)' },
    { value: 'flexible', label: 'Flexible timeline' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors?.[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors?.[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData?.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData?.inquiryType) {
      newErrors.inquiryType = 'Please select an inquiry type';
    }

    if (!formData?.description?.trim()) {
      newErrors.description = 'Project description is required';
    } else if (formData?.description?.trim()?.length < 50) {
      newErrors.description = 'Please provide at least 50 characters describing your project';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSubmitted(true);
    } catch (error) {
      setErrors({ submit: 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-card rounded-lg p-8 border border-border">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto">
            <Icon name="Check" size={32} color="var(--color-success)" />
          </div>
          <div className="space-y-3">
            <h3 className="text-foreground font-semibold text-xl">
              Message Sent Successfully!
            </h3>
            <p className="text-text-secondary leading-relaxed max-w-md mx-auto">
              Thank you for reaching out. I'll review your inquiry and respond within 24 hours with next steps or to schedule a discovery call.
            </p>
          </div>
          <div className="pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsSubmitted(false);
                setFormData({
                  name: '',
                  email: '',
                  company: '',
                  inquiryType: '',
                  budget: '',
                  timeline: '',
                  description: '',
                  newsletter: false
                });
              }}
            >
              Send Another Message
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-8 border border-border">
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-foreground font-semibold text-xl">
            Start a Conversation
          </h3>
          <p className="text-text-secondary">
            Tell me about your project and how I can help you achieve your goals.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData?.name}
              onChange={handleInputChange}
              error={errors?.name}
              required
            />
            
            <Input
              label="Email Address"
              type="email"
              name="email"
              placeholder="your@email.com"
              value={formData?.email}
              onChange={handleInputChange}
              error={errors?.email}
              required
            />
          </div>

          <Input
            label="Company (Optional)"
            type="text"
            name="company"
            placeholder="Your company name"
            value={formData?.company}
            onChange={handleInputChange}
          />

          <Select
            label="Type of Inquiry"
            placeholder="Select the type of service you need"
            options={inquiryTypeOptions}
            value={formData?.inquiryType}
            onChange={(value) => handleSelectChange('inquiryType', value)}
            error={errors?.inquiryType}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Budget Range"
              placeholder="Select your budget range"
              options={budgetOptions}
              value={formData?.budget}
              onChange={(value) => handleSelectChange('budget', value)}
            />
            
            <Select
              label="Timeline"
              placeholder="When do you need to start?"
              options={timelineOptions}
              value={formData?.timeline}
              onChange={(value) => handleSelectChange('timeline', value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Project Description *
            </label>
            <textarea
              name="description"
              placeholder="Describe your project, challenges you're facing, and what success looks like to you. The more details you provide, the better I can understand how to help."
              value={formData?.description}
              onChange={handleInputChange}
              rows={6}
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-vertical"
            />
            {errors?.description && (
              <p className="text-error text-sm">{errors?.description}</p>
            )}
            <p className="text-text-secondary text-xs">
              {formData?.description?.length}/500 characters
            </p>
          </div>

          <Checkbox
            label="Subscribe to my newsletter for systems design insights and startup strategy tips"
            checked={formData?.newsletter}
            onChange={handleInputChange}
            name="newsletter"
          />

          {errors?.submit && (
            <div className="p-4 bg-error/10 border border-error/20 rounded-md">
              <p className="text-error text-sm">{errors?.submit}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="default"
            size="lg"
            loading={isSubmitting}
            disabled={isSubmitting}
            fullWidth
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isSubmitting ? 'Sending Message...' : 'Send Message'}
          </Button>
        </form>

        <div className="pt-4 border-t border-border">
          <p className="text-text-secondary text-sm text-center">
            Typical response time: 24 hours • All inquiries are confidential
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;