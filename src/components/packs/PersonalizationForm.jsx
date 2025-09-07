import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';

// Pack type definitions and field configurations
const PACK_CONFIGURATIONS = {
  'PACK_30DAY': {
    name: '30-Day Idea→Product Sprint',
    price: '$297',
    description: 'Turn your idea into a shipped product in 30 days',
    requiredFields: ['name', 'email', 'idea', 'timeline', 'technical_level'],
    optionalFields: ['company', 'industry', 'budget', 'team_size', 'target_market', 'biggest_challenge', 'success_criteria'],
    fieldConfigs: {
      idea: { type: 'textarea', placeholder: 'Describe your product idea in detail...' },
      timeline: { type: 'select', options: ['30 days', '45 days', '60 days', '90 days'] },
      technical_level: { type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
      budget: { type: 'select', options: ['$0-1k', '$1k-5k', '$5k-15k', '$15k+', 'To be determined'] },
      team_size: { type: 'select', options: ['Just me', '2-3 people', '4-10 people', '10+ people'] }
    }
  },
  'KIT_AUTOMATION': {
    name: 'Micro-Automation Kit',
    price: '$197',
    description: 'High-impact automation scripts tailored to your workflow',
    requiredFields: ['name', 'email', 'current_tools', 'biggest_challenge'],
    optionalFields: ['company', 'industry', 'team_size', 'technical_level', 'time_spent', 'manual_processes'],
    fieldConfigs: {
      current_tools: { type: 'textarea', placeholder: 'List the tools you currently use (e.g., Gmail, Slack, Notion, CRM...)' },
      biggest_challenge: { type: 'textarea', placeholder: 'What repetitive tasks take up most of your time?' },
      technical_level: { type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
      time_spent: { type: 'select', options: ['1-5 hours/week', '5-15 hours/week', '15-30 hours/week', '30+ hours/week'] }
    }
  },
  'KIT_DIAGRAMS': {
    name: 'Visual Thinking Toolkit',
    price: '$147',
    description: 'Custom diagram templates for your industry',
    requiredFields: ['name', 'email', 'industry', 'team_size'],
    optionalFields: ['company', 'role', 'biggest_challenge', 'decision_types', 'stakeholders'],
    fieldConfigs: {
      team_size: { type: 'select', options: ['Just me', '2-5 people', '6-20 people', '20+ people'] },
      decision_types: { type: 'textarea', placeholder: 'What types of decisions do you need to visualize?' },
      stakeholders: { type: 'textarea', placeholder: 'Who are your key stakeholders and collaborators?' }
    }
  }
};

const PersonalizationForm = ({ 
  packType, 
  onSubmit, 
  loading = false,
  className = '',
  showPreview = true 
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  const config = PACK_CONFIGURATIONS[packType];
  
  if (!config) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Invalid pack type: {packType}</p>
      </div>
    );
  }

  const totalSteps = showOptionalFields ? 3 : 2;
  
  // Field validation
  const validateField = (name, value) => {
    if (config.requiredFields.includes(name) && (!value || value.trim() === '')) {
      return 'This field is required';
    }
    
    if (name === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address';
      }
    }
    
    return null;
  };

  // Update form data and clear errors
  const updateFormData = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validate all required fields
  const validateForm = () => {
    const newErrors = {};
    
    config.requiredFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Move to next step
  const nextStep = () => {
    const requiredFieldsForStep = getFieldsForStep(currentStep).filter(field => 
      config.requiredFields.includes(field)
    );
    
    const stepErrors = {};
    requiredFieldsForStep.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        stepErrors[field] = error;
      }
    });
    
    if (Object.keys(stepErrors).length === 0) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      setErrors(stepErrors);
    }
  };

  // Get fields for current step
  const getFieldsForStep = (step) => {
    if (step === 1) {
      return ['name', 'email'];
    } else if (step === 2) {
      return config.requiredFields.filter(field => !['name', 'email'].includes(field));
    } else {
      return config.optionalFields;
    }
  };

  // Render field based on configuration
  const renderField = (fieldName) => {
    const fieldConfig = config.fieldConfigs[fieldName] || { type: 'text' };
    const isRequired = config.requiredFields.includes(fieldName);
    const value = formData[fieldName] || '';
    const error = errors[fieldName];
    
    const label = fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    const baseClasses = cn(
      'w-full px-4 py-3 border rounded-lg transition-colors duration-200',
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
      'text-foreground bg-background',
      error 
        ? 'border-red-300 focus:ring-red-500' 
        : 'border-gray-300 hover:border-gray-400'
    );

    return (
      <div key={fieldName} className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {fieldConfig.type === 'textarea' ? (
          <textarea
            value={value}
            onChange={(e) => updateFormData(fieldName, e.target.value)}
            placeholder={fieldConfig.placeholder}
            className={cn(baseClasses, 'h-24 resize-none')}
            rows={3}
          />
        ) : fieldConfig.type === 'select' ? (
          <select
            value={value}
            onChange={(e) => updateFormData(fieldName, e.target.value)}
            className={baseClasses}
          >
            <option value="">Select {label.toLowerCase()}...</option>
            {fieldConfig.options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        ) : (
          <input
            type={fieldConfig.type || 'text'}
            value={value}
            onChange={(e) => updateFormData(fieldName, e.target.value)}
            placeholder={fieldConfig.placeholder || `Enter ${label.toLowerCase()}...`}
            className={baseClasses}
          />
        )}
        
        {error && (
          <p className="text-sm text-red-600 mt-1">{error}</p>
        )}
      </div>
    );
  };

  return (
    <div className={cn('max-w-2xl mx-auto', className)}>
      {/* Pack Preview */}
      {showPreview && (
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{config.name}</h3>
              <p className="text-gray-600 mt-1">{config.description}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{config.price}</div>
              <div className="text-sm text-gray-500">One-time</div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round((currentStep / totalSteps) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Let's Get Started
              </h2>
              <p className="text-gray-600">
                Tell us a bit about yourself to personalize your pack
              </p>
            </div>
            
            {getFieldsForStep(1).map(renderField)}
            
            <button
              type="button"
              onClick={nextStep}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Pack-Specific Requirements */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                About Your Project
              </h2>
              <p className="text-gray-600">
                Help us understand your specific needs and goals
              </p>
            </div>
            
            {getFieldsForStep(2).map(renderField)}
            
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
              >
                Back
              </button>
              
              {config.optionalFields.length > 0 ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setShowOptionalFields(true);
                      nextStep();
                    }}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                  >
                    More Details
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Generating...' : 'Generate Pack'}
                  </button>
                </>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Generating...' : 'Generate Pack'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Optional Details */}
        {currentStep === 3 && showOptionalFields && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Optional Details
              </h2>
              <p className="text-gray-600">
                These details help us create even more personalized content
              </p>
            </div>
            
            {getFieldsForStep(3).map(renderField)}
            
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
              >
                Back
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating...' : 'Generate Pack'}
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl max-w-sm mx-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Generating Your Pack</h3>
            <p className="text-gray-600 text-sm">
              Our AI is creating personalized content based on your inputs. 
              This usually takes 2-3 minutes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalizationForm;
