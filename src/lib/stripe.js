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
  // Audit (bump target)
  AUDIT_PRO: {
    price: 6900,
    name: 'Auto-Audit Pro',
    description: 'Paste URL, get the next 7 days. Prioritized fixes and cadence.',
    priceId: import.meta.env.VITE_STRIPE_AUDIT_PRO_PRICE_ID,
    paymentLink: import.meta.env.VITE_STRIPE_AUDIT_PRO_PAYMENT_LINK,
    type: 'one_time',
    features: [
      '7-day prioritized cadence',
      'Top issues with next actions',
      'Works from a single URL',
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
  MEMBER_PRO: {
    price: 1900, // $19.00 in cents
    name: 'Build Notes Pro',
    description: '2 operator memos/month + unlimited re-gens + Pro utilities.',
    priceId: import.meta.env.VITE_STRIPE_MEMBER_PRO_PRICE_ID,
    paymentLink: import.meta.env.VITE_STRIPE_MEMBER_PRO_PAYMENT_LINK,
    type: 'subscription',
    features: [
      '2 operator memos delivered monthly',
      'Unlimited sprint plan re-generations',
      'Pro utility access (day-throttled)',
      'Priority support and feedback',
      'Early access to new frameworks'
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
  },
  // Trials
  UTILITY_PASS_TRIAL: {
    price: 0, // Free trial
    name: 'Utility Pass (7-Day Trial)',
    description: '7-day free trial with 10 utility runs. Auto-converts to paid.',
    priceId: import.meta.env.VITE_STRIPE_UTILITY_PASS_TRIAL_PRICE_ID,
    paymentLink: import.meta.env.VITE_STRIPE_UTILITY_PASS_TRIAL_PAYMENT_LINK,
    type: 'trial',
    trialDays: 7,
    usageLimit: 10,
    features: [
      '7-day free trial period',
      '10 utility runs included',
      'Access to all automation tools',
      'Auto-converts to $19/month after trial',
      'Cancel anytime during trial'
    ]
  },
  // Auto-generated products
  AUTO_AUDIT_PRO: {
    price: 6900, // $69.00 in cents
    name: 'Auto-Audit Pro',
    description: 'Automated system analysis with prioritized fix list + 7-day cadence.',
    priceId: import.meta.env.VITE_STRIPE_AUTO_AUDIT_PRO_PRICE_ID,
    paymentLink: import.meta.env.VITE_STRIPE_AUTO_AUDIT_PRO_PAYMENT_LINK,
    type: 'one_time',
    features: [
      'Automated system analysis (10 key issues)',
      'Prioritized fix list with impact scores',
      '7-day implementation cadence',
      'Email delivery within 2 hours',
      'Follow-up recommendations included'
    ]
  },
  // Premium Bundles
  FOUNDER_PACK: {
    price: 14900, // $149.00 in cents
    name: 'Founder Pack',
    description: 'Complete founder toolkit: Sprint Plan + Auto-Audit Pro + 3-month Build Notes Pro + Office Hours seat.',
    priceId: import.meta.env.VITE_STRIPE_FOUNDER_PACK_PRICE_ID,
    paymentLink: import.meta.env.VITE_STRIPE_FOUNDER_PACK_PAYMENT_LINK,
    type: 'one_time',
    originalValue: 18700, // $39 + $69 + $27 + $49 = $187
    savings: 3800, // $38 savings
    features: [
      '30-Day Sprint Plan (personalized)',
      'Auto-Audit Pro (full analysis)',
      '3-month Build Notes Pro membership',
      'Office Hours seat (next available)',
      'Priority email support',
      'Founder community access'
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
export const createCheckoutSession = async (productKey, customerOrOptions = null, orderBump = null) => {
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
      customer_email: typeof customerOrOptions === 'string' ? customerOrOptions : customerOrOptions?.customerEmail || null
    });
    
    // Determine checkout mode based on product type
    const isSubscription = product.type === 'subscription';
    const mode = isSubscription ? 'subscription' : 'payment';
    
    // Create checkout options
    const lineItems = [{ price: product.priceId, quantity: 1 }];
    
    // Add order bump if specified
    if (orderBump && STRIPE_PRODUCTS[orderBump]) {
      const bumpProduct = STRIPE_PRODUCTS[orderBump];
      if (bumpProduct.priceId) {
        // Experiment: ORDER_BUMP_PRICE variant selects alternate price IDs if provided via env
        let bumpPriceId = bumpProduct.priceId;
        try {
          const { getExperimentVariant } = await import('./experiments');
          const bumpVariantValue = getExperimentVariant('ORDER_BUMP_PRICE');
          if (bumpVariantValue === 5900 && import.meta.env.VITE_STRIPE_AUDIT_PRO_PRICE_ID_59) {
            bumpPriceId = import.meta.env.VITE_STRIPE_AUDIT_PRO_PRICE_ID_59;
          } else if (bumpVariantValue === 7900 && import.meta.env.VITE_STRIPE_AUDIT_PRO_PRICE_ID_79) {
            bumpPriceId = import.meta.env.VITE_STRIPE_AUDIT_PRO_PRICE_ID_79;
          }
        } catch (e) {
          // no-op
        }
        lineItems.push({ price: bumpPriceId, quantity: 1 });
      }
    }

    // Extended options object support
    const options = typeof customerOrOptions === 'string' || customerOrOptions === null
      ? { customerEmail: typeof customerOrOptions === 'string' ? customerOrOptions : null }
      : (customerOrOptions || {});

    const urlContext = options?.context ? `&goal=${encodeURIComponent(options.context.goal || '')}&stack=${encodeURIComponent(options.context.stack || '')}` : '';

    // Capture referral/UTM and pass through metadata
    const utm = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const utmParams = utm ? {
      utm_source: utm.get('utm_source') || undefined,
      utm_campaign: utm.get('utm_campaign') || undefined,
      utm_medium: utm.get('utm_medium') || undefined,
      ref: utm.get('ref') || undefined
    } : {};
    
    const checkoutOptions = {
      lineItems,
      mode: mode,
      successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&product=${productKey}${orderBump ? `&bump=${orderBump}` : ''}${urlContext}`,
      cancelUrl: `${window.location.origin}/checkout/cancel?product=${productKey}${urlContext}`,
      automaticTax: { enabled: true },
      billingAddressCollection: 'required',
      allowPromotionCodes: true,
      metadata: {
        product_key: productKey,
        order_bump: orderBump || 'none',
        source: 'peycheff_website',
        goal: options?.context?.goal || undefined,
        stack: options?.context?.stack || undefined,
        ...utmParams
      }
    };
    
    // Add customer email if provided
    if (options.customerEmail) {
      checkoutOptions.customerEmail = options.customerEmail;
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

