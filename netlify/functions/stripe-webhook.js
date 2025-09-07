import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Autopilot SKU configuration with fulfillment logic
const SKU_CONFIG = {
  'CALL_60': {
    name: 'Strategy Call (60–90 min)',
    type: 'service',
    fulfillment: 'schedule',
    entitlement: 'CALL_60',
    expires_days: null // lifetime
  },
  'CALL_PACK': {
    name: 'Strategy Call Pack (3 calls)',
    type: 'service', 
    fulfillment: 'schedule',
    entitlement: 'CALL_PACK',
    expires_days: 90 // 90 days to use
  },
  'PACK_30DAY': {
    name: '30-Day Idea→Product Sprint',
    type: 'digital',
    fulfillment: 'personalize_and_deliver',
    entitlement: 'PACK_30DAY',
    expires_days: null
  },
  'KIT_AUTOMATION': {
    name: 'Micro-Automation Kit',
    type: 'digital',
    fulfillment: 'personalize_and_deliver',
    entitlement: 'KIT_AUTOMATION',
    expires_days: null
  },
  'KIT_DIAGRAMS': {
    name: 'Diagram Library Kit',
    type: 'digital',
    fulfillment: 'instant_deliver',
    entitlement: 'KIT_DIAGRAMS',
    expires_days: null
  },
  'MEMBER_MONTHLY': {
    name: 'Build Notes Membership',
    type: 'subscription',
    fulfillment: 'membership_welcome',
    entitlement: 'MEMBER_MONTHLY',
    expires_days: 31
  },
  'MEMBER_ANNUAL': {
    name: 'Build Notes Membership (Annual)',
    type: 'subscription',
    fulfillment: 'membership_welcome',
    entitlement: 'MEMBER_ANNUAL',
    expires_days: 366
  },
  'OFFICE_HOURS': {
    name: 'Office Hours Seat',
    type: 'service',
    fulfillment: 'schedule',
    entitlement: 'OFFICE_HOURS',
    expires_days: 60
  },
  'DEPOSIT_AUDIT': {
    name: 'Systems Audit Deposit',
    type: 'service',
    fulfillment: 'intake_form',
    entitlement: 'DEPOSIT_AUDIT',
    expires_days: null
  },
  'DEPOSIT_SPRINT': {
    name: 'Build Sprint Deposit',
    type: 'service',
    fulfillment: 'intake_form',
    entitlement: 'DEPOSIT_SPRINT',
    expires_days: null
  }
};

export const handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Validate configurations
    if (!process.env.STRIPE_SECRET_KEY || !webhookSecret) {
      throw new Error('Stripe configuration is missing');
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase configuration is missing');
    }

    // Verify webhook signature
    const signature = event.headers['stripe-signature'];
    let stripeEvent;

    try {
      stripeEvent = stripe.webhooks.constructEvent(
        event.body,
        signature,
        webhookSecret
      );
    } catch (error) {
      console.error('Webhook signature verification failed:', error.message);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid signature' })
      };
    }

    console.log('Autopilot webhook received:', stripeEvent.type, stripeEvent.id);

    // Handle different event types
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(stripeEvent.data.object, stripeEvent.id);
        break;
        
      case 'invoice.payment_succeeded':
        await handleSubscriptionPayment(stripeEvent.data.object, stripeEvent.id);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(stripeEvent.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true, event_id: stripeEvent.id })
    };

  } catch (error) {
    console.error('Autopilot webhook error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Webhook processing failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};

// Handle successful checkout completion - autopilot style
async function handleCheckoutCompleted(session, eventId) {
  try {
    console.log('Processing autopilot checkout for session:', session.id);
    
    // Extract purchase data
    const customerEmail = session.customer_details?.email || session.customer_email;
    const productKey = session.metadata?.product_key || inferProductFromSession(session);
    const amount = session.amount_total;
    const source = session.metadata?.source || 'website';

    if (!customerEmail || !productKey) {
      console.warn('Missing customer email or product key:', { customerEmail, productKey });
      return;
    }

    const skuConfig = SKU_CONFIG[productKey];
    if (!skuConfig) {
      console.warn(`Unknown SKU: ${productKey}`);
      return;
    }

    // 1. Create or update customer
    await upsertCustomer(customerEmail, session.customer_details?.name);

    // 2. Record the order
    const order = await createOrder({
      stripe_event_id: eventId,
      email: customerEmail,
      sku: productKey,
      amount_cents: amount,
      source,
      metadata: session.metadata || {}
    });

    // 3. Create entitlement
    await createEntitlement(customerEmail, skuConfig);

    // 4. Dispatch fulfillment based on SKU type
    await dispatchFulfillment(productKey, skuConfig, {
      customer_email: customerEmail,
      session_id: session.id,
      order_id: order.id,
      amount: amount
    });

    console.log(`Autopilot fulfillment dispatched for ${productKey} → ${customerEmail}`);

  } catch (error) {
    console.error('Error in autopilot checkout:', error);
    // Don't throw - we want the webhook to succeed even if fulfillment fails
  }
}

// Handle subscription payments (monthly/annual renewals)
async function handleSubscriptionPayment(invoice, eventId) {
  try {
    console.log('Processing subscription payment:', invoice.id);
    
    // Get customer info
    const customer = await stripe.customers.retrieve(invoice.customer);
    const customerEmail = customer.email;
    
    if (!customerEmail) {
      console.warn('No customer email for subscription payment');
      return;
    }

    // For initial subscription payments, this is handled by checkout.session.completed
    // For renewals, we need to extend the entitlement
    if (invoice.billing_reason === 'subscription_cycle') {
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
      const productKey = inferProductFromSubscription(subscription);
      
      if (productKey) {
        const skuConfig = SKU_CONFIG[productKey];
        if (skuConfig) {
          // Extend entitlement for renewal
          await extendEntitlement(customerEmail, skuConfig);
          console.log(`Entitlement extended for ${productKey} → ${customerEmail}`);
        }
      }
    }
    
  } catch (error) {
    console.error('Error handling subscription payment:', error);
  }
}

// Handle subscription cancellation
async function handleSubscriptionCanceled(subscription) {
  try {
    console.log('Processing subscription cancellation:', subscription.id);
    
    const customer = await stripe.customers.retrieve(subscription.customer);
    const customerEmail = customer.email;
    const productKey = inferProductFromSubscription(subscription);
    
    if (customerEmail && productKey) {
      // Remove or expire the entitlement
      await expireEntitlement(customerEmail, productKey);
      console.log(`Entitlement expired for ${productKey} → ${customerEmail}`);
    }
    
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}

// =============================================================================
// SUPABASE DATABASE OPERATIONS
// =============================================================================

async function upsertCustomer(email, name = null) {
  const { data, error } = await supabase
    .from('customers')
    .upsert({ email, name }, { onConflict: 'email' })
    .select()
    .single();
    
  if (error) {
    console.error('Error upserting customer:', error);
    throw error;
  }
  
  return data;
}

async function createOrder(orderData) {
  const { data, error } = await supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single();
    
  if (error) {
    console.error('Error creating order:', error);
    throw error;
  }
  
  return data;
}

async function createEntitlement(email, skuConfig) {
  const expiresAt = skuConfig.expires_days 
    ? new Date(Date.now() + skuConfig.expires_days * 24 * 60 * 60 * 1000).toISOString()
    : null;

  const { data, error } = await supabase
    .from('entitlements')
    .upsert({ 
      email, 
      sku: skuConfig.entitlement, 
      expires_at: expiresAt 
    }, { onConflict: 'email,sku' })
    .select()
    .single();
    
  if (error) {
    console.error('Error creating entitlement:', error);
    throw error;
  }
  
  return data;
}

async function extendEntitlement(email, skuConfig) {
  const newExpiresAt = skuConfig.expires_days
    ? new Date(Date.now() + skuConfig.expires_days * 24 * 60 * 60 * 1000).toISOString()
    : null;

  const { error } = await supabase
    .from('entitlements')
    .update({ expires_at: newExpiresAt })
    .eq('email', email)
    .eq('sku', skuConfig.entitlement);
    
  if (error) {
    console.error('Error extending entitlement:', error);
    throw error;
  }
}

async function expireEntitlement(email, sku) {
  const { error } = await supabase
    .from('entitlements')
    .update({ expires_at: new Date().toISOString() })
    .eq('email', email)
    .eq('sku', sku);
    
  if (error) {
    console.error('Error expiring entitlement:', error);
    throw error;
  }
}

// =============================================================================
// FULFILLMENT DISPATCH SYSTEM
// =============================================================================

async function dispatchFulfillment(productKey, skuConfig, purchaseData) {
  const fulfillmentUrl = `${process.env.URL || 'https://peycheff.com'}/.netlify/functions/fulfill-${skuConfig.fulfillment.replace('_', '-')}`;
  
  try {
    const response = await fetch(fulfillmentUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.FULFILLMENT_SECRET || 'default-secret'}`
      },
      body: JSON.stringify({
        sku: productKey,
        config: skuConfig,
        purchase: purchaseData
      })
    });

    if (!response.ok) {
      throw new Error(`Fulfillment failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`Fulfillment dispatched for ${productKey}:`, result);
    
  } catch (error) {
    console.error(`Fulfillment dispatch failed for ${productKey}:`, error);
    // Continue - we don't want to fail the webhook for fulfillment issues
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function inferProductFromSession(session) {
  // Try to extract product key from line items or other session data
  if (session.metadata?.product_key) {
    return session.metadata.product_key;
  }
  
  // Fallback: try to match by amount (not reliable but better than nothing)
  const amount = session.amount_total;
  for (const [sku, config] of Object.entries(SKU_CONFIG)) {
    // This would need product price lookup - simplified for now
  }
  
  return null;
}

function inferProductFromSubscription(subscription) {
  // Extract product key from subscription metadata or price ID mapping
  if (subscription.metadata?.product_key) {
    return subscription.metadata.product_key;
  }
  
  // Try to match subscription items to our SKUs
  const priceId = subscription.items.data[0]?.price?.id;
  
  // Map price IDs to product keys (you'd need to maintain this mapping)
  const priceToSku = {
    [process.env.VITE_STRIPE_MEMBER_MONTHLY_PRICE_ID]: 'MEMBER_MONTHLY',
    [process.env.VITE_STRIPE_MEMBER_ANNUAL_PRICE_ID]: 'MEMBER_ANNUAL'
  };
  
  return priceToSku[priceId] || null;
}
