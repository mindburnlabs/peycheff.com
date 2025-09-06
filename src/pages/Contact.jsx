import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    linkedin: '',
    company: '',
    problem: '',
    timeline: '',
    budget: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const budgetOptions = [
    '$500 - $5k',
    '$5k - $25k',
    '$25k - $100k',
    '$100k+'
  ];

  const timelineOptions = [
    'ASAP',
    '1-2 weeks',
    '1 month',
    '2-3 months',
    'Flexible'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Track form submission
      const { trackFormSubmit } = await import('../lib/analytics');
      trackFormSubmit('contact_inquiry', {
        budget_range: formData.budget,
        timeline: formData.timeline,
        has_company: !!formData.company
      });
      
      // Save to Supabase
      const { addInquiry } = await import('../lib/supabase');
      const result = await addInquiry(formData);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // TODO: Send email notifications via Resend API
      // This would typically be handled by a serverless function or API endpoint
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        linkedin: '',
        company: '',
        problem: '',
        timeline: '',
        budget: ''
      });
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="py-16">
        <div className="container max-w-2xl">
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width="24" height="24" fill="white" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="heading-1 mb-6">Thanks!</h1>
            <p className="text-h3 text-muted-foreground mb-8">
              I'll review your inquiry and reply within <strong>24 hours</strong>.
            </p>
            <button 
              onClick={() => setSubmitStatus(null)}
              className="btn-secondary"
            >
              Submit another inquiry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16">
      <div className="container max-w-2xl">
        {/* Header */}
        <section className="py-20 text-center">
          <h1 className="heading-1 mb-6">Contact</h1>
          <p className="text-h3 text-muted-foreground max-w-xl mx-auto">
            Tell me who you are, the problem in one paragraph, your timeline, and budget range. I reply within <strong>24 hours</strong>.
          </p>
        </section>

        {/* Form */}
        <section className="py-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block small-text font-medium mb-2">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-input border border-border rounded-lg px-4 py-3 focus-ring placeholder-muted-foreground"
                placeholder="Your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block small-text font-medium mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-input border border-border rounded-lg px-4 py-3 focus-ring placeholder-muted-foreground"
                placeholder="your@email.com"
              />
            </div>

            {/* LinkedIn */}
            <div>
              <label htmlFor="linkedin" className="block small-text font-medium mb-2">
                LinkedIn *
              </label>
              <input
                type="url"
                id="linkedin"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                required
                className="w-full bg-input border border-border rounded-lg px-4 py-3 focus-ring placeholder-muted-foreground"
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>

            {/* Company */}
            <div>
              <label htmlFor="company" className="block small-text font-medium mb-2">
                Company <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full bg-input border border-border rounded-lg px-4 py-3 focus-ring placeholder-muted-foreground"
                placeholder="Your company name"
              />
            </div>

            {/* Problem */}
            <div>
              <label htmlFor="problem" className="block small-text font-medium mb-2">
                Problem *
              </label>
              <textarea
                id="problem"
                name="problem"
                value={formData.problem}
                onChange={handleChange}
                required
                rows={6}
                className="w-full bg-input border border-border rounded-lg px-4 py-3 focus-ring placeholder-muted-foreground resize-none"
                placeholder="Describe your problem, what you've tried, and what success looks like. One paragraph is perfect."
              />
            </div>

            {/* Timeline */}
            <div>
              <label htmlFor="timeline" className="block small-text font-medium mb-2">
                Timeline *
              </label>
              <select
                id="timeline"
                name="timeline"
                value={formData.timeline}
                onChange={handleChange}
                required
                className="w-full bg-input border border-border rounded-lg px-4 py-3 focus-ring"
              >
                <option value="">Select timeline</option>
                {timelineOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Budget */}
            <div>
              <label htmlFor="budget" className="block small-text font-medium mb-2">
                Budget Range *
              </label>
              <select
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                required
                className="w-full bg-input border border-border rounded-lg px-4 py-3 focus-ring"
              >
                <option value="">Select budget range</option>
                {budgetOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Inquiry'}
              </button>
            </div>

            {submitStatus === 'error' && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-destructive small-text">
                  Something went wrong. Please try again or email me directly at ivan@peycheff.com
                </p>
              </div>
            )}
          </form>
        </section>

        {/* Alternative Contact */}
        <section className="py-12 text-center border-t border-border">
          <p className="body-text text-muted-foreground mb-4">
            Prefer to email directly?
          </p>
          <a 
            href="mailto:ivan@peycheff.com?subject=Advisory Inquiry"
            className="link text-h3"
          >
            ivan@peycheff.com
          </a>
        </section>
      </div>
    </div>
  );
};

export default Contact;
