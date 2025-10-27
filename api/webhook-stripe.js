import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sig = req.headers['stripe-signature'];
    const body = JSON.stringify(req.body);

    // Verify webhook signature
    let stripeEvent;
    try {
      stripeEvent = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).json({ error: 'Invalid signature' });
    }

    console.log('Webhook received:', stripeEvent.type, stripeEvent.id);

    // Handle different event types
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(stripeEvent.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handleSubscriptionPayment(stripeEvent.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(stripeEvent.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return res.status(200).json({
      received: true,
      event_id: stripeEvent.id
    });

  } catch (error) {
    console.error('Webhook error:', error);

    return res.status(500).json({
      error: 'Webhook processing failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Handle successful checkout completion
async function handleCheckoutCompleted(session) {
  try {
    console.log('Processing checkout for session:', session.id);

    const customerEmail = session.customer_details?.email;
    const productKey = session.metadata?.product_key;

    if (!customerEmail) {
      throw new Error('No customer email found in session');
    }

    // Store order in database
    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        stripe_event_id: session.id,
        email: customerEmail,
        sku: productKey || 'unknown',
        amount_cents: session.amount_total,
        currency: session.currency || 'usd',
        source: session.metadata?.source || 'website',
        created_at: new Date().toISOString()
      });

    if (orderError) {
      console.error('Failed to store order:', orderError);
      throw orderError;
    }

    // Create entitlement if applicable
    if (productKey) {
      const { error: entitlementError } = await supabase
        .from('entitlements')
        .insert({
          email: customerEmail,
          sku: productKey,
          expires_at: getExpirationDate(productKey),
          created_at: new Date().toISOString()
        });

      if (entitlementError) {
        console.error('Failed to create entitlement:', entitlementError);
        // Don't throw here - order is still valid
      }
    }

    console.log(`Successfully processed order for ${customerEmail}`);

  } catch (error) {
    console.error('Checkout processing error:', error);
    throw error;
  }
}

// Handle subscription payment success
async function handleSubscriptionPayment(invoice) {
  try {
    const customerEmail = invoice.customer_email;
    const subscriptionId = invoice.subscription;

    console.log(`Subscription payment succeeded: ${subscriptionId} for ${customerEmail}`);

    // Update subscription status in database
    const { error } = await supabase
      .from('entitlements')
      .update({
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('email', customerEmail)
      .eq('stripe_subscription_id', subscriptionId);

    if (error) {
      console.error('Failed to update subscription:', error);
    }

  } catch (error) {
    console.error('Subscription payment handling error:', error);
  }
}

// Handle subscription cancellation
async function handleSubscriptionCanceled(subscription) {
  try {
    const customerEmail = subscription.customer.email;

    console.log(`Subscription canceled: ${subscription.id} for ${customerEmail}`);

    // Update entitlement status
    const { error } = await supabase
      .from('entitlements')
      .update({
        status: 'canceled',
        expires_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('email', customerEmail)
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      console.error('Failed to cancel subscription:', error);
    }

  } catch (error) {
    console.error('Subscription cancellation error:', error);
  }
}

// Helper function to get expiration date based on product
function getExpirationDate(productKey) {
  if (productKey?.includes('TRIAL')) {
    const days = 7; // 7-day trial
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  }

  if (productKey?.includes('MONTHLY')) {
    const days = 30;
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  }

  // Lifetime products don't expire
  return null;
}