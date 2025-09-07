import { loadStripe } from '@stripe/stripe-js';
import { trackEvent, EVENTS } from './analytics';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export { stripePromise };

// Autopilot product suite - SKU-based naming for automation
export const STRIPE_PRODUCTS = {
  // Strategy Calls
  CALL_60: {
    price: 19900, // $199.00 in cents
    name: 'Strategy Call (60–90 min)',
    description: 'Founder-to-founder strategy call. 60–90 min + one-page action plan (24h). Digital delivery.',
    priceId: import.meta.env.VITE_STRIPE_CALL_60_PRICE_ID,
    paymentLink: import.meta.env.VITE_STRIPE_CALL_60_PAYMENT_LINK,
    type: 'one_time',
    features: [
      '60-90 minute focused strategy session',
      'One-page action plan delivered within 24h',
      'Digital delivery via email',
      'Recorded session for your reference',
      'Follow-up Q&A support for 1 week'
    ]
  },
  // Call Packs
  CALL_PACK: {
    price: 50000, // $500.00 in cents
    name: 'Strategy Call Pack (3 calls)', 
    description: 'Three strategy calls with async review between sessions.',
    priceId: import.meta.env.VITE_STRIPE_CALL_PACK_PRICE_ID,
    paymentLink: import.meta.env.VITE_STRIPE_CALL_PACK_PAYMENT_LINK,
    type: 'one_time',
    features: [
      '90-minute deep-dive strategic session',
      'Ruthless clarity on key decisions',
      'One-page action plan within 24h',
      'Digital delivery and recording',
      '1 week of follow-up support'
    ]
  },
  // 30-Day Packs
  PACK_30DAY: {
    price: 3900, // $39.00 in cents
    name: '30-Day Idea→Product Sprint',
    description: 'Personalized 30-day operating cadence. PDF/MDX + checklists.',
    priceId: import.meta.env.VITE_STRIPE_PACK_30DAY_PRICE_ID,
    paymentLink: import.meta.env.VITE_STRIPE_PACK_30DAY_PAYMENT_LINK,
    type: 'one_time',
    features: [
      'Three 90-minute strategic sessions',
      'Async review and feedback between calls',
      '30-day personalized framework',
      'AI-generated based on your stack/team/timeline',
      'Instant download after 3-question form'
    ]
  },
  // Kits
  KIT_AUTOMATION: {
    price: 7900, // $79.00 in cents
    name: 'Micro-Automation Kit',
    description: 'Four automation playbooks with scripts/prompts/JSON. Digital download.',
    priceId: import.meta.env.VITE_STRIPE_KIT_AUTOMATION_PRICE_ID,
    paymentLink: import.meta.env.VITE_STRIPE_KIT_AUTOMATION_PAYMENT_LINK,
    type: 'one_time',
    features: [
      '30-day sprint framework (PDF + MDX)',
      '4 complete automation playbooks',
      'Ready-to-use scripts and templates',
      'AI prompts and configurations',
      'Instant personalized generation'
    ]
  },
  KIT_DIAGRAMS: {
    price: 5900, // $59.00 in cents
    name: 'Diagram Library Kit',
    description: '12 high-res system diagrams (SVG/PNG). Team license included.',
    priceId: import.meta.env.VITE_STRIPE_KIT_DIAGRAMS_PRICE_ID,
    paymentLink: import.meta.env.VITE_STRIPE_KIT_DIAGRAMS_PAYMENT_LINK,
    type: 'one_time',
    features: [
      '4 complete automation playbooks',
      '12 high-resolution system diagrams',
      'SVG and PNG formats',
      'Team license for internal use',
      'Editable source files included'
    ]
  },
  // Memberships
  MEMBER_MONTHLY: {
    price: 900, // $9.00 in cents
    name: 'Build Notes Membership',
    description: '2 operator memos/month + early access to Kits. Email delivery.',
    priceId: import.meta.env.VITE_STRIPE_MEMBER_MONTHLY_PRICE_ID,
    paymentLink: import.meta.env.VITE_STRIPE_MEMBER_MONTHLY_PAYMENT_LINK,
    type: 'subscription',
    features: [
      '12 high-resolution system diagrams',
      '2 operator memos delivered monthly',
      'Early access to all new kits',
      'Private member-only content',
      'Cancel anytime'
    ]
  },
  MEMBER_ANNUAL: {
    price: 9000, // $90.00 in cents
    name: 'Build Notes Membership (Annual)',
    description: '2 operator memos/month + early Kit access. Save $18/year.',
    priceId: import.meta.env.VITE_STRIPE_MEMBER_ANNUAL_PRICE_ID,
    paymentLink: import.meta.env.VITE_STRIPE_MEMBER_ANNUAL_PAYMENT_LINK,
    type: 'subscription',
    features: [
      '24 operator memos per year',
      'Early access to all products',
      'Member community access',
      'Save $18 vs monthly billing'
    ]
  },
  // Office Hours
  OFFICE_HOURS: {
    price: 4900, // $49.00 in cents
    name: 'Office Hours Seat',
    description: '90-min small-group session (max 10). Next available slot.',
    priceId: import.meta.env.VITE_STRIPE_OFFICE_HOURS_PRICE_ID,
    paymentLink: import.meta.env.VITE_STRIPE_OFFICE_HOURS_PAYMENT_LINK,
    type: 'one_time',
    features: [
      '90-minute small group session',
      'Max 10 participants',
      'Q&A format with real-time feedback',
      'Session recording provided',
      'Guaranteed seat in next available slot'
    ]
  },
  // Deposits
  DEPOSIT_AUDIT: {
    price: 50000, // $500.00 in cents
    name: 'Systems Audit Deposit',
    description: 'Reserve 10-day audit slot. Applied to $5K total.',
    priceId: import.meta.env.VITE_STRIPE_DEPOSIT_AUDIT_PRICE_ID,
    paymentLink: import.meta.env.VITE_STRIPE_DEPOSIT_AUDIT_PAYMENT_LINK,
    type: 'one_time',
    features: [
      '90-minute small group session (max 10 people)',
      'Comprehensive team process analysis',
      'Redesigned workflows and metrics',
      'Implementation roadmap included',
      'Applied to full $5K project cost'
    ]
  },
  DEPOSIT_SPRINT: {
    price: 100000, // $1,000.00 in cents
    name: 'Build Sprint Deposit',
    description: 'Reserve 30-day build sprint slot. Applied to $25K total.',
    priceId: import.meta.env.VITE_STRIPE_DEPOSIT_SPRINT_PRICE_ID,
    paymentLink: import.meta.env.VITE_STRIPE_DEPOSIT_SPRINT_PAYMENT_LINK,
    type: 'one_time',
    features: [
      'Reserve your 10-day systems audit slot',
      'Usable v1 product shipped',
      'Small team execution model',
      'Complete rollout documentation',
      'Applied to full $25K project cost'
    ]
  }
};

// Payment Link integration for 1-click purchases
export const redirectToPaymentLink = (productKey) => {
  const product = STRIPE_PRODUCTS[productKey];
  
  if (!product?.paymentLink) {
    console.error(`No payment link configured for ${productKey}`);
    return { success: false, error: 'Payment link not configured' };
  }
  
  // Track payment link click
  trackEvent(EVENTS.STRIPE_PAYMENT_LINK_CLICK, {
    product_key: productKey,
    product_name: product.name,
    product_price: product.price
  });
  
  window.location.href = product.paymentLink;
  return { success: true };
};

// Legacy product mappings (for backward compatibility)
export const LEGACY_PRODUCTS = {
  STRATEGY_CALL: 'CALL_60',
  SPARRING_SESSION: 'CALL_PACK',
  SPARRING_PACK: 'CALL_PACK',
  OPERATOR_PACK: 'PACK_30DAY',
  AUTOMATION_KIT: 'KIT_AUTOMATION',
  DIAGRAM_LIBRARY: 'KIT_DIAGRAMS',
  BUILD_NOTES_MONTHLY: 'MEMBER_MONTHLY',
  BUILD_NOTES_YEARLY: 'MEMBER_ANNUAL',
  SYSTEMS_AUDIT_DEPOSIT: 'DEPOSIT_AUDIT',
  BUILD_SPRINT_DEPOSIT: 'DEPOSIT_SPRINT'
};

// Get product by key with legacy fallback
export const getProduct = (productKey) => {
  if (STRIPE_PRODUCTS[productKey]) {
    return STRIPE_PRODUCTS[productKey];
  }
  
  const mappedKey = LEGACY_PRODUCTS[productKey];
  if (mappedKey && STRIPE_PRODUCTS[mappedKey]) {
    return STRIPE_PRODUCTS[mappedKey];
  }
  
  return null;
};

// Create Stripe checkout session using Stripe's client-side checkout
export const createCheckoutSession = async (productKey, customerEmail = null) => {
  try {
    const stripe = await stripePromise;
    
    if (!stripe) {
      throw new Error('Stripe failed to load');
    }
    
    const product = STRIPE_PRODUCTS[productKey];
    if (!product) {
      throw new Error(`Product ${productKey} not found`);
    }

    if (!product.priceId) {
      throw new Error(`Price ID not configured for ${product.name}`);
    }
    
    // Track checkout start event
    trackEvent(EVENTS.STRIPE_CHECKOUT_START, {
      product_name: product.name,
      product_price: product.price,
      customer_email: customerEmail
    });
    
    // Determine checkout mode based on product type
    const isSubscription = product.type === 'subscription';
    const mode = isSubscription ? 'subscription' : 'payment';
    
    // Create checkout options
    const checkoutOptions = {
      lineItems: [{
        price: product.priceId,
        quantity: 1
      }],
      mode: mode,
      successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&product=${productKey}`,
      cancelUrl: `${window.location.origin}/checkout/cancel?product=${productKey}`,
      automaticTax: { enabled: true },
      billingAddressCollection: 'required',
      allowPromotionCodes: true,
      metadata: {
        product_key: productKey,
        source: 'peycheff_website'
      }
    };
    
    // Add customer email if provided
    if (customerEmail) {
      checkoutOptions.customerEmail = customerEmail;
    }

    // For subscriptions, add trial period and billing cycle anchor if needed
    if (isSubscription) {
      checkoutOptions.subscriptionData = {
        metadata: {
          product_key: productKey,
          source: 'peycheff_website'
        }
      };
    }
    
    const { error } = await stripe.redirectToCheckout(checkoutOptions);
    
    if (error) {
      throw error;
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('Stripe checkout error:', error);
    
    // Track checkout error
    trackEvent('stripe_checkout_error', {
      product_key: productKey,
      error_message: error.message,
      error_type: error.type || 'unknown'
    });
    
    return { success: false, error: error.message };
  }
};

// Utility function to validate Stripe configuration
export const validateStripeConfig = () => {
  const issues = [];
  const warnings = [];
  
  if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
    issues.push('VITE_STRIPE_PUBLISHABLE_KEY environment variable is missing');
  } else if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY.startsWith('pk_')) {
    issues.push('VITE_STRIPE_PUBLISHABLE_KEY appears to be invalid (should start with pk_)');
  }
  
  return {
    isValid: issues.length === 0,
    hasWarnings: warnings.length > 0,
    issues,
    warnings
  };
};

// Helper to format price for display
export const formatPrice = (priceInCents, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(priceInCents / 100);
};

