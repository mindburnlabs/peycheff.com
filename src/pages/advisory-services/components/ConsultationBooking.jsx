import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const ConsultationBooking = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    serviceType: '',
    message: '',
    preferredTime: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const serviceOptions = [
    { value: 'systems-design', label: 'Systems Design Consultation' },
    { value: 'founder-coaching', label: 'Founder Coaching' },
    { value: 'strategic-planning', label: 'Strategic Planning' },
    { value: 'product-strategy', label: 'Product Strategy' },
    { value: 'team-scaling', label: 'Team Scaling' },
    { value: 'other', label: 'Other / Custom' }
  ];

  const timeOptions = [
    { value: 'morning', label: 'Morning (9AM - 12PM PST)' },
    { value: 'afternoon', label: 'Afternoon (12PM - 5PM PST)' },
    { value: 'evening', label: 'Evening (5PM - 8PM PST)' },
    { value: 'flexible', label: 'Flexible' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.name?.trim()) newErrors.name = 'Name is required';
    if (!formData?.email?.trim()) newErrors.email = 'Email is required';
    if (!formData?.email?.includes('@')) newErrors.email = 'Valid email is required';
    if (!formData?.company?.trim()) newErrors.company = 'Company is required';
    if (!formData?.serviceType) newErrors.serviceType = 'Service type is required';
    if (!formData?.message?.trim()) newErrors.message = 'Message is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSubmitted(true);
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-card rounded-lg p-8 border border-border text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto">
            <Icon name="Check" size={32} color="var(--color-success)" />
          </div>
          <div className="space-y-2">
            <h3 className="text-foreground font-semibold text-xl">
              Consultation Requested
            </h3>
            <p className="text-text-secondary text-sm leading-relaxed max-w-md mx-auto">
              Thank you for your interest! I'll review your request and get back to you within 24 hours to schedule our consultation.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setIsSubmitted(false);
              setFormData({
                name: '',
                email: '',
                company: '',
                serviceType: '',
                message: '',
                preferredTime: ''
              });
            }}
            className="mt-4"
          >
            Book Another Consultation
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-6 border border-border">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-foreground font-semibold text-xl">
            Book a Consultation
          </h3>
          <p className="text-text-secondary text-sm leading-relaxed">
            Let's discuss how I can help accelerate your business growth through strategic systems design and advisory.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Enter your name"
              value={formData?.name}
              onChange={(e) => handleInputChange('name', e?.target?.value)}
              error={errors?.name}
              required
            />
            
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              value={formData?.email}
              onChange={(e) => handleInputChange('email', e?.target?.value)}
              error={errors?.email}
              required
            />
          </div>

          <Input
            label="Company"
            type="text"
            placeholder="Your company name"
            value={formData?.company}
            onChange={(e) => handleInputChange('company', e?.target?.value)}
            error={errors?.company}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Service Type"
              placeholder="Select a service"
              options={serviceOptions}
              value={formData?.serviceType}
              onChange={(value) => handleInputChange('serviceType', value)}
              error={errors?.serviceType}
              required
            />
            
            <Select
              label="Preferred Time"
              placeholder="Select preferred time"
              options={timeOptions}
              value={formData?.preferredTime}
              onChange={(value) => handleInputChange('preferredTime', value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-foreground font-medium text-sm">
              Project Details <span className="text-error">*</span>
            </label>
            <textarea
              placeholder="Tell me about your project, challenges, and what you're looking to achieve..."
              value={formData?.message}
              onChange={(e) => handleInputChange('message', e?.target?.value)}
              rows={4}
              className={`w-full px-3 py-2 bg-input border rounded-md text-foreground placeholder-text-secondary text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-150 ${
                errors?.message ? 'border-error' : 'border-border'
              }`}
            />
            {errors?.message && (
              <p className="text-error text-xs mt-1">{errors?.message}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="default"
            size="default"
            loading={isSubmitting}
            disabled={isSubmitting}
            fullWidth
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isSubmitting ? 'Submitting...' : 'Request Consultation'}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-text-secondary text-xs">
            Consultations are typically 30-60 minutes and can be conducted via video call or in-person in San Francisco.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConsultationBooking;