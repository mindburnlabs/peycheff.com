'use client';

import { useState, useRef } from 'react';
import { validateFormAccessibility, generateId, announceToScreenReader } from '@/lib/accessibility';

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'textarea' | 'select';
  required?: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    custom?: (value: string) => string | null;
  };
}

interface AccessibleFormProps {
  fields: FormField[];
  onSubmit: (data: Record<string, string>) => void;
  submitLabel?: string;
  className?: string;
  ariaLabel?: string;
}

export default function AccessibleForm({
  fields,
  onSubmit,
  submitLabel = 'Submit',
  className = '',
  ariaLabel
}: AccessibleFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Generate unique IDs for form fields
  const fieldIds = fields.reduce((acc, field) => {
    acc[field.id] = generateId(`field-${field.id}`);
    return acc;
  }, {} as Record<string, string>);

  const errorIds = fields.reduce((acc, field) => {
    acc[field.id] = generateId(`error-${field.id}`);
    return acc;
  }, {} as Record<string, string>);

  const validateField = (field: FormField, value: string): string | null => {
    if (field.required && !value.trim()) {
      return `${field.label} is required`;
    }

    if (field.validation) {
      const { pattern, minLength, maxLength, custom } = field.validation;

      if (pattern && !new RegExp(pattern).test(value)) {
        return `${field.label} format is invalid`;
      }

      if (minLength && value.length < minLength) {
        return `${field.label} must be at least ${minLength} characters`;
      }

      if (maxLength && value.length > maxLength) {
        return `${field.label} must not exceed ${maxLength} characters`;
      }

      if (custom) {
        return custom(value);
      }
    }

    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach(field => {
      const error = validateField(field, formData[field.id] || '');
      if (error) {
        newErrors[field.id] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);

    if (!isValid) {
      const errorCount = Object.keys(newErrors).length;
      announceToScreenReader(
        `Form has ${errorCount} error${errorCount > 1 ? 's' : ''}. Please review and correct.`,
        'assertive'
      );

      // Focus first error field
      const firstErrorField = document.getElementById(fieldIds[Object.keys(newErrors)[0]]);
      if (firstErrorField) {
        firstErrorField.focus();
      }
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    announceToScreenReader('Submitting form...', 'polite');

    try {
      await onSubmit(formData);
      announceToScreenReader('Form submitted successfully!', 'polite');
      setFormData({});
      setErrors({});
    } catch (error) {
      announceToScreenReader('Form submission failed. Please try again.', 'assertive');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));

    // Clear error for this field if user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }));
    }
  };

  const handleFieldBlur = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (field) {
      const error = validateField(field, formData[fieldId] || '');
      if (error) {
        setErrors(prev => ({ ...prev, [fieldId]: error }));
      }
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={`space-y-6 ${className}`}
      noValidate
      aria-label={ariaLabel}
    >
      {fields.map((field, index) => (
        <div key={field.id} className="space-y-2">
          <label
            htmlFor={fieldIds[field.id]}
            className="block text-sm font-medium text-white"
          >
            {field.label}
            {field.required && (
              <span className="text-red-400 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>

          {field.type === 'select' ? (
            <select
              id={fieldIds[field.id]}
              value={formData[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              onBlur={() => handleFieldBlur(field.id)}
              required={field.required}
              aria-invalid={!!errors[field.id]}
              aria-describedby={errors[field.id] ? errorIds[field.id] : undefined}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
            >
              <option value="">{field.placeholder || `Select ${field.label}`}</option>
              {field.options?.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : field.type === 'textarea' ? (
            <textarea
              id={fieldIds[field.id]}
              value={formData[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              onBlur={() => handleFieldBlur(field.id)}
              placeholder={field.placeholder}
              required={field.required}
              aria-invalid={!!errors[field.id]}
              aria-describedby={errors[field.id] ? errorIds[field.id] : undefined}
              rows={4}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y min-h-[44px]"
            />
          ) : (
            <input
              id={fieldIds[field.id]}
              type={field.type}
              value={formData[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              onBlur={() => handleFieldBlur(field.id)}
              placeholder={field.placeholder}
              required={field.required}
              aria-invalid={!!errors[field.id]}
              aria-describedby={errors[field.id] ? errorIds[field.id] : undefined}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
            />
          )}

          {errors[field.id] && (
            <div
              id={errorIds[field.id]}
              className="text-red-400 text-sm font-medium"
              role="alert"
              aria-live="polite"
            >
              {errors[field.id]}
            </div>
          )}
        </div>
      ))}

      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full glass-button-cta px-6 py-3 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950"
          aria-describedby={isSubmitting ? 'submit-status' : undefined}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Submitting...
            </span>
          ) : (
            submitLabel
          )}
        </button>

        {isSubmitting && (
          <div
            id="submit-status"
            className="sr-only"
            role="status"
            aria-live="polite"
          >
            Form is being submitted. Please wait.
          </div>
        )}
      </div>
    </form>
  );
}