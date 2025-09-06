import { loadStripe } from '@stripe/stripe-js';
import { trackEvent, EVENTS } from './analytics';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Stripe products - complete monetization suite
export const STRIPE_PRODUCTS = {
  STRATEGY_CALL: {
    price: 19900, // $199.00 in cents
    name: 'Strategy Call (60–90 min)',
    description: 'Founder-to-founder strategy call. 60–90 min + one-page action plan (24h). Digital delivery.',
    priceId: import.meta.env.VITE_STRIPE_STRATEGY_CALL_PRICE_ID,
    type: 'one_time',
    features: [
      '60-90 minute focused strategy session',
      'One-page action plan delivered within 24h',
      'Digital delivery via email',
      'Recorded session for your reference',
      'Follow-up Q&A support for 1 week'
    ]
  },
  SPARRING_SESSION: {
    price: 50000, // $500.00 in cents (legacy - keeping for existing integration)
    name: 'Sparring Session (90 min)', 
    description: 'For founders/operators who need ruthless clarity.',
    priceId: import.meta.env.VITE_STRIPE_SPARRING_PRICE_ID,
    type: 'one_time',
    features: [
      '90-minute deep-dive strategic session',
      'Ruthless clarity on key decisions',
      'One-page action plan within 24h',
      'Digital delivery and recording',
      '1 week of follow-up support'
    ]
  },
  SPARRING_PACK: {
    price: 59900, // $599.00 in cents
    name: 'Sparring Pack (3 calls)',
    description: 'Three focused working sessions with async review between calls. Digital delivery.',
    priceId: import.meta.env.VITE_STRIPE_SPARRING_PACK_PRICE_ID,
    type: 'one_time',
    features: [
      'Three 90-minute strategic sessions',
      'Async review and feedback between calls',
      'Session recordings and transcripts',
      'Comprehensive action plan after each session',
      'Extended follow-up support for 2 weeks'
    ]
  },
  OPERATOR_PACK: {
    price: 3900, // $39.00 in cents
    name: 'Operator Pack: 30-Day Idea→Product Sprint',
    description: 'My 30-day operating cadence (PDF/MDX, checklists, calendar). Digital download.',
    priceId: import.meta.env.VITE_STRIPE_OPERATOR_PACK_PRICE_ID,
    type: 'one_time',
    features: [
      '30-day sprint framework (PDF + MDX)',
      'Daily and weekly checklists',
      'Calendar templates and time-blocking guide',
      'Decision frameworks and prioritization tools',
      'Instant download after payment'
    ]
  },
  AUTOMATION_KIT: {
    price: 7900, // $79.00 in cents
    name: 'Micro-Automation Kit (Bundle of 4)',
    description: 'Four small, useful automation playbooks (scripts/prompts/JSON). Digital download.',
    priceId: import.meta.env.VITE_STRIPE_AUTOMATION_KIT_PRICE_ID,
    type: 'one_time',
    features: [
      '4 complete automation playbooks',
      'Ready-to-use scripts and templates',
      'AI prompts and JSON configurations',
      'Step-by-step implementation guides',
      'Lifetime updates to the kit'
    ]
  },
  DIAGRAM_LIBRARY: {
    price: 5900, // $59.00 in cents
    name: 'Diagram Library (Team License)',
    description: '12 high-res system diagrams (SVG/PNG). Licensed for internal team use.',
    priceId: import.meta.env.VITE_STRIPE_DIAGRAM_LIBRARY_PRICE_ID,
    type: 'one_time',
    features: [
      '12 high-resolution system diagrams',
      'SVG and PNG formats included',
      'Licensed for internal team use',
      'Covers architecture, workflows, and processes',
      'Editable source files provided'
    ]
  },
  BUILD_NOTES_MONTHLY: {
    price: 900, // $9.00 in cents
    name: 'Build Notes Membership',
    description: '2 operator memos/month, early access to Kits. Email delivery.',
    priceId: import.meta.env.VITE_STRIPE_BUILD_NOTES_MONTHLY_PRICE_ID,
    type: 'subscription',
    features: [
      '2 operator memos delivered monthly',
      'Early access to new kits and playbooks',
      'Private member-only content',
      'Email delivery and archive access',
      'Cancel anytime'
    ]
  },
  BUILD_NOTES_YEARLY: {
    price: 9000, // $90.00 in cents
    name: 'Build Notes Membership (Yearly)',
    description: '2 operator memos/month, early access to Kits. Email delivery. Save $18/year.',
    priceId: import.meta.env.VITE_STRIPE_BUILD_NOTES_YEARLY_PRICE_ID,
    type: 'subscription',
    originalPrice: 10800, // $108 (12 months at $9)
    features: [
      '24 operator memos per year',
      'Early access to all new products',
      'Private member community access',
      'Archive of all past content',
      'Save $18 compared to monthly billing'
    ]
  },
  OFFICE_HOURS: {
    price: 4900, // $49.00 in cents
    name: 'Office Hours Seat (Monthly)',
    description: '90-min small-group session (max 10). Digital attendance.',
    priceId: import.meta.env.VITE_STRIPE_OFFICE_HOURS_PRICE_ID,
    type: 'one_time',
    features: [
      '90-minute small group session (max 10 people)',
      'Digital attendance via video call',
      'Q&A format with real-time feedback',
      'Session recording provided afterward',
      'Next available slot guaranteed'
    ]
  },
  SYSTEMS_AUDIT_DEPOSIT: {
    price: 50000, // $500.00 in cents
    name: 'Systems Audit (Deposit)',
    description: 'Non-refundable deposit to reserve a 10-day audit slot. Digital service.',
    priceId: import.meta.env.VITE_STRIPE_SYSTEMS_AUDIT_DEPOSIT_PRICE_ID,
    type: 'one_time',
    features: [
      'Reserve your 10-day systems audit slot',
      'Comprehensive team process analysis',
      'Redesigned workflows and metrics',
      'Implementation roadmap included',
      'Applied toward full $5,000 project cost'
    ]
  },
  BUILD_SPRINT_DEPOSIT: {
    price: 100000, // $1000.00 in cents
    name: 'Build Sprint (Slot Deposit)',
    description: 'Deposit to reserve a 30-day build sprint slot. Applied to total.',
    priceId: import.meta.env.VITE_STRIPE_BUILD_SPRINT_DEPOSIT_PRICE_ID,
    type: 'one_time',
    features: [
      'Reserve your 30-day build sprint slot',
      'Usable v1 product shipped',
      'Small team execution',
      'Complete rollout documentation',
      'Applied toward full $25,000 project cost'
    ]
  }
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

// Export stripe promise and products
export { stripePromise };
