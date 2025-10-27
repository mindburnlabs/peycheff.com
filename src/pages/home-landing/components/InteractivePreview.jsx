import React, { useState } from 'react';
import { trackEvent, EVENTS } from '../../../lib/analytics';
import CheckoutButton from '../../../components/ui/CheckoutButton';

const InteractivePreview = ({ defaultFormData = {} }) => {
  const [formData, setFormData] = useState({
    email: defaultFormData.email || '',
    goal: defaultFormData.goal || '',
    stack: defaultFormData.stack || ''
  });
  const [previewData, setPreviewData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const stackOptions = [
    { value: 'react-node', label: 'React + Node.js' },
    { value: 'nextjs', label: 'Next.js' },
    { value: 'python-django', label: 'Python + Django' },
    { value: 'ruby-rails', label: 'Ruby on Rails' },
    { value: 'vue-nuxt', label: 'Vue.js + Nuxt' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const generatePreview = async () => {
    if (!formData.email || !formData.goal || !formData.stack) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/preview-sprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Failed to generate preview');
      }

      setPreviewData(result.data);
      setShowPreview(true);

      // Track successful preview generation
      trackEvent(EVENTS.HERO_PREVIEW_GENERATED, {
        goal: formData.goal,
        stack: formData.stack,
        remaining_previews: result.meta?.remaining || 0
      });

    } catch (err) {
      console.error('Preview generation error:', err);
      setError(err.message);
      
      trackEvent('hero_preview_error', {
        error: err.message,
        goal: formData.goal,
        stack: formData.stack
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateMyPlan = () => {
    if (!formData.email || !formData.goal || !formData.stack) {
      setError('Please fill in all fields first');
      return;
    }

    // Track CTA click
    trackEvent(EVENTS.HERO_CTA_CLICK, {
      source: 'interactive_preview',
      goal: formData.goal,
      stack: formData.stack,
      has_preview: !!previewData
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Form Section */}
      <div className="apple-card space-y-6">
        <div className="space-y-2">
          <h2 className="text-[24px] leading-[32px] font-medium text-[#F2F3F5]">Get Your 30-Day Sprint Preview</h2>
          <p className="text-[14px] leading-[22px] text-[#A5ABB3]">See exactly how we'll turn your idea into a shippable product</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-[14px] font-medium text-[#F2F3F5]">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your@email.com"
              className="w-full px-4 py-3 bg-[#1C1C1E] border border-[#38383A] rounded-lg text-[#F2F3F5] placeholder-[#A5ABB3] focus:outline-none focus:border-[#0A84FF] apple-motion"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[14px] font-medium text-[#F2F3F5]">
              Tech Stack
            </label>
            <select
              name="stack"
              value={formData.stack}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-[#1C1C1E] border border-[#38383A] rounded-lg text-[#F2F3F5] focus:outline-none focus:border-[#0A84FF] apple-motion"
              required
            >
              <option value="">Choose your stack</option>
              {stackOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-[14px] font-medium text-[#F2F3F5]">
            What do you want to build?
          </label>
          <input
            type="text"
            name="goal"
            value={formData.goal}
            onChange={handleInputChange}
            placeholder="e.g. SaaS analytics dashboard, AI-powered content tool"
            className="w-full px-4 py-3 bg-[#1C1C1E] border border-[#38383A] rounded-lg text-[#F2F3F5] placeholder-[#A5ABB3] focus:outline-none focus:border-[#0A84FF] apple-motion"
            required
          />
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-[14px]">{error}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={generatePreview}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-[#1C1C1E] border border-[#38383A] rounded-lg text-[#A5ABB3] hover:text-[#F2F3F5] hover:border-[#0A84FF] apple-motion focus-visible-accent disabled:opacity-50"
          >
            {isLoading ? 'Generating...' : 'Try a 30-second preview'}
          </button>
          
          <div className="flex-1">
            <CheckoutButton
              productKey="PACK_30DAY"
              customerEmail={formData.email}
              showOrderBump={true}
              orderBumpProduct="AUTO_AUDIT_PRO"
              disabled={!formData.email || !formData.goal || !formData.stack}
              className="apple-button w-full disabled:opacity-50"
            >
              Generate my plan
            </CheckoutButton>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      {showPreview && previewData && (
        <div className="apple-card space-y-6 animate-fade-in">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-[20px] leading-[28px] font-medium text-[#F2F3F5]">
                {previewData.title}
              </h3>
              <p className="text-[14px] leading-[22px] text-[#A5ABB3] mt-1">
                {previewData.subtitle}
              </p>
            </div>
            <div className="text-[12px] leading-[18px] text-[#0A84FF] bg-[#0A84FF]/10 px-3 py-1 rounded-full">
              {previewData.watermark}
            </div>
          </div>

          {/* Week 1 Preview */}
          <div className="space-y-4">
            <h4 className="text-[16px] leading-[24px] font-medium text-[#F2F3F5]">
              Week 1: {previewData.weeks[0].title}
            </h4>
            
            <div className="grid gap-3">
              {previewData.weeks[0].days.slice(0, 3).map((day) => (
                <div key={day.day} className="bg-[#1C1C1E] p-4 rounded-lg border border-[#38383A]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-[#0A84FF] text-white rounded-full flex items-center justify-center text-[12px] font-medium">
                      {day.day}
                    </div>
                    <div>
                      <h5 className="text-[14px] font-medium text-[#F2F3F5]">
                        {day.focus}
                      </h5>
                    </div>
                  </div>
                  <ul className="space-y-1 text-[13px] text-[#A5ABB3] ml-11">
                    {day.tasks.slice(0, 2).map((task, idx) => (
                      <li key={idx}>• {task}</li>
                    ))}
                    <li className="text-[#666668] italic">+ {day.tasks.length - 2} more tasks...</li>
                  </ul>
                  <div className="mt-3 ml-11">
                    <span className="text-[12px] text-[#0A84FF] bg-[#0A84FF]/10 px-2 py-1 rounded">
                      ✓ {day.deliverable}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Locked content teaser */}
            <div className="bg-gradient-to-r from-[#1C1C1E] to-[#2A2A2A] p-6 rounded-lg border border-[#38383A] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0A0A0A]/80 pointer-events-none" />
              <div className="relative space-y-3">
                <h5 className="text-[16px] font-medium text-[#F2F3F5]">
                  🔒 Weeks 2-4 + Bonus Content
                </h5>
                <ul className="space-y-2 text-[14px] text-[#A5ABB3]">
                  {previewData.nextSteps.map((step, idx) => (
                    <li key={idx} className="opacity-70">
                      {step}
                    </li>
                  ))}
                </ul>
                <CheckoutButton
                  productKey="PACK_30DAY"
                  customerEmail={formData.email}
                  showOrderBump={true}
                  orderBumpProduct="AUTO_AUDIT_PRO"
                  className="apple-button mt-4 w-full"
                >
                  Unlock Complete Framework
                </CheckoutButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
