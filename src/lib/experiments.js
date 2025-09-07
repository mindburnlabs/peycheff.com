// Simple A/B testing and feature flag system
import { trackEvent } from './analytics';

// Experiment configurations
const EXPERIMENTS = {
  HERO_CTA_VARIANT: {
    name: 'Hero CTA Text',
    variants: {
      control: 'Generate my plan',
      variant_a: 'Get your 30-day plan',
      variant_b: 'Build your product in 30 days'
    },
    allocation: { control: 40, variant_a: 30, variant_b: 30 },
    active: true
  },
  ORDER_BUMP_PRICE: {
    name: 'Order Bump Pricing',
    variants: {
      control: 6900, // $69
      variant_a: 5900, // $59
      variant_b: 7900  // $79
    },
    allocation: { control: 40, variant_a: 30, variant_b: 30 },
    active: true
  },
  TRIAL_USAGE_CAP: {
    name: 'Trial Usage Limit',
    variants: {
      control: 5,
      variant_a: 10,
      variant_b: 3
    },
    allocation: { control: 50, variant_a: 30, variant_b: 20 },
    active: true
  },
  FOUNDER_PACK_VISIBILITY: {
    name: 'Founder Pack Visibility',
    variants: {
      control: 'hidden', // Only show post-purchase
      variant_a: 'checkout', // Show during checkout
      variant_b: 'always' // Always visible
    },
    allocation: { control: 60, variant_a: 30, variant_b: 10 },
    active: false
  }
};

// Feature flags (simple on/off switches)
const FEATURE_FLAGS = {
  PROGRAMMATIC_PAGES: true,
  AUDIT_REPORTS: true,
  POST_PURCHASE_UPSELL: true,
  MEMBER_PRO_FEATURES: true,
  PREVIEW_EMAIL_GATE: false, // Collect email before or after preview
  LINEAR_GRADE_MOTION: false, // New animation system
  CONTAINER_LIGHT_LAYOUT: false // New layout system
};

// User bucketing - deterministic based on email/session
const getUserBucket = (userId, experimentKey) => {
  const hash = simpleHash(`${userId}-${experimentKey}`);
  return hash % 100;
};

const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

// Get experiment variant for a user
export const getExperimentVariant = (experimentKey, userId = null) => {
  const experiment = EXPERIMENTS[experimentKey];
  
  if (!experiment || !experiment.active) {
    return experiment?.variants?.control || null;
  }

  // Use localStorage for anonymous users, userId for identified users
  const identifier = userId || getAnonymousId();

  // Local override for experiments (store variant key e.g., 'variant_a')
  try {
    const overrideKey = localStorage.getItem(`exp_${experimentKey}_override`);
    if (overrideKey && experiment.variants[overrideKey] !== undefined) {
      return experiment.variants[overrideKey];
    }
  } catch {}

  // Check for a stored assignment first to avoid re-bucketing
  const storedVariantKey = getStoredVariant(experimentKey, identifier);
  if (storedVariantKey && experiment.variants[storedVariantKey] !== undefined) {
    return experiment.variants[storedVariantKey];
  }

  const bucket = getUserBucket(identifier, experimentKey);
  
  // Allocate based on experiment allocation percentages
  let cumulativePercentage = 0;
  for (const [variantKey, percentage] of Object.entries(experiment.allocation)) {
    cumulativePercentage += percentage;
    if (bucket < cumulativePercentage) {
      // Persist assignment and track exposure
      storeVariant(experimentKey, variantKey, identifier);
      trackEvent('experiment_exposure', {
        experiment_key: experimentKey,
        experiment_name: experiment.name,
        variant: variantKey,
        user_bucket: bucket,
        user_id: identifier
      });
      
      return experiment.variants[variantKey];
    }
  }
  
  // Fallback to control
  storeVariant(experimentKey, 'control', identifier);
  return experiment.variants.control;
};

// Check if a feature flag is enabled
export const isFeatureEnabled = (flagKey) => {
  try {
    const override = localStorage.getItem(`flag_${flagKey}`);
    if (override !== null) return override === 'true';
  } catch {}
  return FEATURE_FLAGS[flagKey] === true;
};

// Get anonymous ID from localStorage or create one
const getAnonymousId = () => {
  let id = localStorage.getItem('anonymous_id');
  if (!id) {
    id = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('anonymous_id', id);
  }
  return id;
};

// Track experiment conversion
export const trackExperimentConversion = (experimentKey, conversionEvent, metadata = {}) => {
  const identifier = metadata.userId || getAnonymousId();
  const variant = getStoredVariant(experimentKey, identifier);
  
  if (variant) {
    trackEvent('experiment_conversion', {
      experiment_key: experimentKey,
      variant: variant,
      conversion_event: conversionEvent,
      user_id: identifier,
      ...metadata
    });
  }
};

// Get stored variant (to avoid re-bucketing)
const getStoredVariant = (experimentKey, userId) => {
  const storageKey = `exp_${experimentKey}_${getUserBucket(userId, experimentKey)}`;
  return localStorage.getItem(storageKey);
};

// Store variant assignment
const storeVariant = (experimentKey, variant, userId) => {
  const storageKey = `exp_${experimentKey}_${getUserBucket(userId, experimentKey)}`;
  localStorage.setItem(storageKey, variant);
};

// Metrics tracking helper
export const trackMetric = (metricName, value, metadata = {}) => {
  trackEvent('metric_tracked', {
    metric_name: metricName,
    metric_value: value,
    timestamp: new Date().toISOString(),
    ...metadata
  });
};

// Commonly tracked metrics
export const METRICS = {
  // Conversion funnel
  PREVIEW_GENERATED: 'preview_generated',
  CHECKOUT_STARTED: 'checkout_started', 
  ORDER_BUMP_VIEWED: 'order_bump_viewed',
  ORDER_BUMP_SELECTED: 'order_bump_selected',
  PURCHASE_COMPLETED: 'purchase_completed',
  UPSELL_VIEWED: 'upsell_viewed',
  UPSELL_CONVERTED: 'upsell_converted',
  
  // Trial funnel
  TRIAL_SIGNUP_STARTED: 'trial_signup_started',
  TRIAL_SIGNUP_COMPLETED: 'trial_signup_completed',
  TRIAL_TO_PAID_CONVERSION: 'trial_to_paid_conversion',
  
  // Revenue metrics
  REVENUE_PER_VISITOR: 'revenue_per_visitor',
  AVERAGE_ORDER_VALUE: 'average_order_value',
  ATTACH_RATE: 'attach_rate'
};

// Helper to track revenue metrics
export const trackRevenueMetric = (revenueAmount, orderData = {}) => {
  trackMetric(METRICS.REVENUE_PER_VISITOR, revenueAmount, {
    order_id: orderData.orderId,
    product_sku: orderData.productSku,
    customer_type: orderData.customerType || 'new',
    has_order_bump: orderData.hasOrderBump || false
  });
};

// Helper to track conversion rates
export const trackConversionRate = (fromStep, toStep, metadata = {}) => {
  trackEvent('conversion_step', {
    from_step: fromStep,
    to_step: toStep,
    conversion_type: 'funnel_progression',
    ...metadata
  });
};

// Export active experiments for easy reference
export const getActiveExperiments = () => {
  return Object.entries(EXPERIMENTS)
    .filter(([key, experiment]) => experiment.active)
    .map(([key, experiment]) => ({
      key,
      name: experiment.name,
      variants: Object.keys(experiment.variants)
    }));
};

export default {
  getExperimentVariant,
  isFeatureEnabled,
  trackExperimentConversion,
  trackMetric,
  trackRevenueMetric,
  trackConversionRate,
  getActiveExperiments,
  METRICS
};
