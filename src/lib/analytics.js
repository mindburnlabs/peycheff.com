// Google Analytics 4 integration
export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

// Initialize Google Analytics
export const initGA = () => {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return;
  
  // Load gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
  
  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };
  
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID);
};

// Track custom events
export const trackEvent = (eventName, parameters = {}) => {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', eventName, {
    ...parameters,
    // Add default parameters
    timestamp: new Date().toISOString(),
  });
};

// Predefined events for peycheff.com
export const EVENTS = {
  CTA_WORK: 'cta_work',
  CTA_NOTES: 'cta_notes', 
  CTA_SUBSCRIBE: 'cta_subscribe',
  FORM_CONTACT_SUBMIT: 'form_contact_submit',
  STRIPE_CHECKOUT_START: 'stripe_checkout_start',
  NEWSLETTER_SIGNUP: 'newsletter_signup',
};

// Track CTA clicks
export const trackCTA = (ctaName, location) => {
  trackEvent('cta_click', {
    cta_name: ctaName,
    page_location: location,
  });
};

// Track form submissions
export const trackFormSubmit = (formName, formData = {}) => {
  trackEvent(EVENTS.FORM_CONTACT_SUBMIT, {
    form_name: formName,
    ...formData,
  });
};
