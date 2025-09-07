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

// Comprehensive event catalog for autopilot system
export const EVENTS = {
  // CTAs and Navigation
  CTA_WORK: 'cta_work',
  CTA_NOTES: 'cta_notes', 
  CTA_SUBSCRIBE: 'cta_subscribe',
  CTA_ADVISORY: 'cta_advisory',
  CTA_CONTACT: 'cta_contact',
  
  // Form Interactions
  FORM_CONTACT_SUBMIT: 'form_contact_submit',
  FORM_NEWSLETTER_SIGNUP: 'newsletter_signup',
  FORM_PERSONALIZATION_START: 'personalization_form_start',
  FORM_PERSONALIZATION_COMPLETE: 'personalization_form_complete',
  FORM_INTAKE_START: 'intake_form_start',
  FORM_INTAKE_COMPLETE: 'intake_form_complete',
  
  // Purchase Flow - Critical for Revenue Tracking
  PRODUCT_VIEW: 'product_view',
  PRODUCT_CTA_CLICK: 'product_cta_click',
  STRIPE_CHECKOUT_START: 'stripe_checkout_start',
  STRIPE_PAYMENT_LINK_CLICK: 'stripe_payment_link_click',
  PURCHASE_SUCCESS: 'purchase_success',
  PURCHASE_ABANDONED: 'purchase_abandoned',
  
  // Revenue Events (Enhanced E-commerce)
  PURCHASE: 'purchase',
  REFUND: 'refund',
  SUBSCRIPTION_CREATED: 'subscription_created',
  SUBSCRIPTION_RENEWED: 'subscription_renewed',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  
  // Content & Engagement
  NOTE_VIEW: 'note_view',
  NOTE_SHARE: 'note_share',
  MEMBER_LOGIN: 'member_login',
  DOWNLOAD_START: 'download_start',
  DOWNLOAD_COMPLETE: 'download_complete',
  
  // Automation Events
  AUTOPUBLISH_SUCCESS: 'autopublish_success',
  FULFILLMENT_TRIGGERED: 'fulfillment_triggered',
  FULFILLMENT_COMPLETED: 'fulfillment_completed',
  SCHEDULE_ASSIGNED: 'schedule_assigned',
  
  // User Journey
  VISITOR_IDENTIFIED: 'visitor_identified',
  LEAD_QUALIFIED: 'lead_qualified',
  CUSTOMER_CONVERTED: 'customer_converted',
  
  // Sprint 1 Events - Interactive Preview & Trials
  HERO_PREVIEW_GENERATED: 'hero_preview_generated',
  HERO_CTA_CLICK: 'hero_cta_click',
  ORDER_BUMP_VIEWED: 'order_bump_viewed',
  ORDER_BUMP_SELECTED: 'order_bump_selected',
  TRIAL_SIGNUP_START: 'trial_signup_start',
  TRIAL_SIGNUP_COMPLETE: 'trial_signup_complete',
  TRIAL_USAGE_INCREMENT: 'trial_usage_increment',
  TRIAL_LIMIT_REACHED: 'trial_limit_reached',
  TRIAL_CONVERTED: 'trial_converted',
  PROGRAMMATIC_PAGE_VIEW: 'programmatic_page_view',
  AUDIT_REPORT_GENERATED: 'audit_report_generated',
  AUDIT_REPORT_VIEW: 'audit_report_view',
  AUDIT_REPORT_SHARED: 'audit_report_shared',
  FOUNDER_PACK_VIEWED: 'founder_pack_viewed',
  FOUNDER_PACK_UPGRADE_CLICKED: 'founder_pack_upgrade_clicked',
  FOUNDER_PACK_DECLINED: 'founder_pack_declined',
  
  // Performance & Technical
  ERROR_OCCURRED: 'error_occurred',
  PERFORMANCE_ISSUE: 'performance_issue'
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

// =============================================================================
// REVENUE TRACKING - Critical for Autopilot Performance
// =============================================================================

// Track product views (funnel entry)
export const trackProductView = (product) => {
  trackEvent(EVENTS.PRODUCT_VIEW, {
    product_id: product.id || product,
    product_name: product.name,
    product_price: product.price,
    product_type: product.type,
    currency: 'USD'
  });
};

// Track purchase success (revenue attribution)
export const trackPurchase = (orderData) => {
  const { sku, amount_cents, currency = 'USD', customer_email, order_id } = orderData;
  
  // Enhanced e-commerce event
  trackEvent(EVENTS.PURCHASE, {
    transaction_id: order_id,
    value: amount_cents / 100, // GA4 expects actual dollar amount
    currency,
    items: [{
      item_id: sku,
      item_name: sku,
      category: getProductCategory(sku),
      quantity: 1,
      price: amount_cents / 100
    }],
    // Custom parameters
    customer_type: 'new', // or 'returning'
    fulfillment_type: getFulfillmentType(sku),
    source: 'autopilot_system'
  });
  
  // Also track as purchase success
  trackEvent(EVENTS.PURCHASE_SUCCESS, {
    product_sku: sku,
    revenue: amount_cents / 100,
    customer_email: hashEmail(customer_email), // Privacy-safe
    order_id
  });
};

// Track subscription events
export const trackSubscription = (action, subscriptionData) => {
  const eventMap = {
    'created': EVENTS.SUBSCRIPTION_CREATED,
    'renewed': EVENTS.SUBSCRIPTION_RENEWED,
    'cancelled': EVENTS.SUBSCRIPTION_CANCELLED
  };
  
  trackEvent(eventMap[action], {
    subscription_id: subscriptionData.id,
    product_sku: subscriptionData.sku,
    value: subscriptionData.amount_cents / 100,
    currency: 'USD',
    billing_cycle: subscriptionData.sku.includes('ANNUAL') ? 'annual' : 'monthly'
  });
};

// Track conversion funnel steps
export const trackConversionStep = (step, data = {}) => {
  const steps = {
    'product_view': EVENTS.PRODUCT_VIEW,
    'cta_click': EVENTS.PRODUCT_CTA_CLICK,
    'checkout_start': EVENTS.STRIPE_CHECKOUT_START,
    'purchase_complete': EVENTS.PURCHASE_SUCCESS
  };
  
  trackEvent(steps[step] || step, {
    funnel_step: step,
    ...data
  });
};

// =============================================================================
// AUTOPILOT SYSTEM TRACKING
// =============================================================================

// Track fulfillment pipeline events
export const trackFulfillment = (event, fulfillmentData) => {
  const eventMap = {
    'triggered': EVENTS.FULFILLMENT_TRIGGERED,
    'completed': EVENTS.FULFILLMENT_COMPLETED,
    'failed': EVENTS.ERROR_OCCURRED
  };
  
  trackEvent(eventMap[event], {
    fulfillment_type: fulfillmentData.type,
    product_sku: fulfillmentData.sku,
    customer_email: hashEmail(fulfillmentData.customer_email),
    processing_time_ms: fulfillmentData.processing_time,
    success: event === 'completed'
  });
};

// Track autopublish pipeline performance
export const trackAutopublish = (phase, data = {}) => {
  trackEvent(EVENTS.AUTOPUBLISH_SUCCESS, {
    pipeline_phase: phase, // 'research', 'draft', 'edit', 'publish'
    topic: data.topic,
    word_count: data.word_count,
    quality_score: data.quality_score,
    processing_time_ms: data.processing_time,
    success: data.success !== false
  });
};

// Track member engagement
export const trackMemberActivity = (activity, data = {}) => {
  const activityEvents = {
    'login': EVENTS.MEMBER_LOGIN,
    'note_view': EVENTS.NOTE_VIEW,
    'download': EVENTS.DOWNLOAD_START
  };
  
  trackEvent(activityEvents[activity], {
    member_type: data.membership_type,
    content_type: data.content_type,
    engagement_depth: data.engagement_depth
  });
};

// =============================================================================
// USER JOURNEY & ATTRIBUTION
// =============================================================================

// Track user identification (email capture)
export const identifyUser = (email, properties = {}) => {
  trackEvent(EVENTS.VISITOR_IDENTIFIED, {
    user_id: hashEmail(email),
    identification_method: properties.method || 'form',
    source: properties.source || 'website',
    user_properties: {
      first_visit: properties.is_new_visitor,
      referrer: document.referrer,
      utm_source: getUTMParameter('utm_source'),
      utm_campaign: getUTMParameter('utm_campaign'),
      utm_medium: getUTMParameter('utm_medium')
    }
  });
};

// Track customer conversion
export const trackConversion = (conversionData) => {
  trackEvent(EVENTS.CUSTOMER_CONVERTED, {
    customer_id: hashEmail(conversionData.email),
    conversion_value: conversionData.ltv || conversionData.first_purchase_value,
    conversion_path: conversionData.attribution_path,
    time_to_conversion_days: conversionData.days_since_first_visit,
    touchpoints: conversionData.touchpoint_count
  });
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Get product category for GA4 grouping
function getProductCategory(sku) {
  if (sku.startsWith('CALL_')) return 'Services';
  if (sku.startsWith('PACK_')) return 'Digital Products';
  if (sku.startsWith('KIT_')) return 'Digital Products';
  if (sku.startsWith('MEMBER_')) return 'Subscriptions';
  if (sku.startsWith('DEPOSIT_')) return 'Services';
  if (sku === 'OFFICE_HOURS') return 'Services';
  return 'Other';
}

// Get fulfillment type for tracking
function getFulfillmentType(sku) {
  const fulfillmentMap = {
    'CALL_60': 'schedule',
    'CALL_PACK': 'schedule',
    'PACK_30DAY': 'personalize_and_deliver',
    'KIT_AUTOMATION': 'personalize_and_deliver',
    'KIT_DIAGRAMS': 'instant_deliver',
    'MEMBER_MONTHLY': 'membership_welcome',
    'MEMBER_ANNUAL': 'membership_welcome',
    'OFFICE_HOURS': 'schedule',
    'DEPOSIT_AUDIT': 'intake_form',
    'DEPOSIT_SPRINT': 'intake_form'
  };
  
  return fulfillmentMap[sku] || 'unknown';
}

// Privacy-safe email hashing
function hashEmail(email) {
  if (!email) return null;
  
  // Simple hash for privacy (in production, use crypto.subtle.digest)
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `user_${Math.abs(hash)}`;
}

// Extract UTM parameters
function getUTMParameter(param) {
  if (typeof window === 'undefined') return null;
  
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Track page performance
export const trackPagePerformance = (pageName) => {
  if (typeof window === 'undefined' || !window.performance) return;
  
  // Use setTimeout to ensure all resources are loaded
  setTimeout(() => {
    const navigation = window.performance.getEntriesByType('navigation')[0];
    
    if (navigation) {
      trackEvent(EVENTS.PERFORMANCE_ISSUE, {
        page: pageName,
        load_time_ms: navigation.loadEventEnd - navigation.loadEventStart,
        dom_content_loaded_ms: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        first_byte_ms: navigation.responseStart - navigation.requestStart,
        is_slow_load: (navigation.loadEventEnd - navigation.loadEventStart) > 3000
      });
    }
  }, 1000);
};

// Error tracking
export const trackError = (error, context = {}) => {
  trackEvent(EVENTS.ERROR_OCCURRED, {
    error_message: error.message || error,
    error_stack: error.stack ? error.stack.substring(0, 500) : null,
    error_context: context.context || 'unknown',
    page_url: typeof window !== 'undefined' ? window.location.href : null,
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null
  });
};
