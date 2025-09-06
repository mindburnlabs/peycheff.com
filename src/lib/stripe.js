import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export { stripePromise };

// Stripe products - these should match your Stripe dashboard
export const STRIPE_PRODUCTS = {
  SPARRING_SESSION: {
    price: 500, // $5.00 in cents
    name: 'Sparring Session (90 min)',
    description: 'For founders/operators who need ruthless clarity.',
    duration: '90 minutes',
    // Replace with your actual Stripe price ID
    priceId: 'price_sparring_session_90min'
  }
};

// Create Stripe checkout session
export const createCheckoutSession = async (priceId, customerEmail = null) => {
  try {
    // This would typically call your backend API
    // For now, we'll redirect to Stripe directly
    const stripe = await stripePromise;
    
    // In a real implementation, you'd call your backend to create a checkout session
    // and get the session ID, then redirect to Stripe
    
    console.log('Creating checkout session for:', priceId, customerEmail);
    
    // Placeholder - implement actual checkout flow
    return { success: false, error: 'Checkout not yet implemented' };
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return { success: false, error: error.message };
  }
};
