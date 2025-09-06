import Stripe from 'stripe';
import { validateEmailConfig, sendEmail, EMAIL_TEMPLATES } from './lib/email-service.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Product metadata mapping
const PRODUCT_METADATA = {
  'STRATEGY_CALL': {
    name: 'Strategy Call (60–90 min)',
    description: 'Founder-to-founder strategy call. 60–90 min + one-page action plan (24h). Digital delivery.',
    type: 'service'
  },
  'SPARRING_SESSION': {
    name: 'Sparring Session (90 min)',
    description: 'For founders/operators who need ruthless clarity.',
    type: 'service'
  },
  'SPARRING_PACK': {
    name: 'Sparring Pack (3 calls)',
    description: 'Three focused working sessions with async review between calls. Digital delivery.',
    type: 'service'
  },
  'OPERATOR_PACK': {
    name: 'Operator Pack: 30-Day Idea→Product Sprint',
    description: 'My 30-day operating cadence (PDF/MDX, checklists, calendar). Digital download.',
    type: 'digital'
  },
  'AUTOMATION_KIT': {
    name: 'Micro-Automation Kit (Bundle of 4)',
    description: 'Four small, useful automation playbooks (scripts/prompts/JSON). Digital download.',
    type: 'digital'
  },
  'DIAGRAM_LIBRARY': {
    name: 'Diagram Library (Team License)',
    description: '12 high-res system diagrams (SVG/PNG). Licensed for internal team use.',
    type: 'digital'
  },
  'BUILD_NOTES_MONTHLY': {
    name: 'Build Notes Membership',
    description: '2 operator memos/month, early access to Kits. Email delivery.',
    type: 'subscription'
  },
  'BUILD_NOTES_YEARLY': {
    name: 'Build Notes Membership (Yearly)',
    description: '2 operator memos/month, early access to Kits. Email delivery. Save $18/year.',
    type: 'subscription'
  },
  'OFFICE_HOURS': {
    name: 'Office Hours Seat (Monthly)',
    description: '90-min small-group session (max 10). Digital attendance.',
    type: 'service'
  },
  'SYSTEMS_AUDIT_DEPOSIT': {
    name: 'Systems Audit (Deposit)',
    description: 'Non-refundable deposit to reserve a 10-day audit slot. Digital service.',
    type: 'service'
  },
  'BUILD_SPRINT_DEPOSIT': {
    name: 'Build Sprint (Slot Deposit)',
    description: 'Deposit to reserve a 30-day build sprint slot. Applied to total.',
    type: 'service'
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
    validateEmailConfig();
    
    if (!process.env.STRIPE_SECRET_KEY || !webhookSecret) {
      throw new Error('Stripe configuration is missing');
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

    console.log('Received Stripe webhook:', stripeEvent.type);

    // Handle different event types
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(stripeEvent.data.object);
        break;
        
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(stripeEvent.data.object);
        break;
        
      case 'invoice.payment_succeeded':
        // Handle subscription payments
        await handleSubscriptionPayment(stripeEvent.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };

  } catch (error) {
    console.error('Stripe webhook error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Webhook processing failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};

// Handle successful checkout completion
async function handleCheckoutCompleted(session) {
  try {
    console.log('Processing checkout completion for session:', session.id);
    
    // Get customer email and product information
    const customerEmail = session.customer_details?.email || session.customer_email;
    const productKey = session.metadata?.product_key;
    const amount = session.amount_total;

    if (!customerEmail || !productKey) {
      console.warn('Missing customer email or product key in session metadata');
      return;
    }

    // Get product metadata
    const productInfo = PRODUCT_METADATA[productKey];
    if (!productInfo) {
      console.warn(`Unknown product key: ${productKey}`);
      return;
    }

    // Prepare purchase data for email template
    const purchaseData = {
      customer_email: customerEmail,
      session_id: session.id,
      product_name: productInfo.name,
      product_description: productInfo.description,
      product_type: productInfo.type,
      amount: amount,
      payment_status: session.payment_status
    };

    // Send purchase confirmation email
    const confirmationTemplate = EMAIL_TEMPLATES.PURCHASE_CONFIRMATION;
    const emailResult = await sendEmail({
      to: customerEmail,
      subject: confirmationTemplate.subject(productInfo),
      html: confirmationTemplate.html(purchaseData),
      replyTo: 'ivan@peycheff.com'
    });

    if (emailResult.success) {
      console.log(`Purchase confirmation email sent to ${customerEmail}`);
      
      // Also notify Ivan for service-based products
      if (productInfo.type === 'service') {
        await sendEmail({
          to: 'ivan@peycheff.com',
          subject: `New ${productInfo.name} Purchase - ${customerEmail}`,
          html: `
            <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #10b981;">New Purchase Alert</h1>
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Product:</strong> ${productInfo.name}</p>
                <p><strong>Customer:</strong> ${customerEmail}</p>
                <p><strong>Amount:</strong> $${(amount / 100).toFixed(2)}</p>
                <p><strong>Session ID:</strong> ${session.id}</p>
              </div>
              <p>Next step: Reach out to schedule the session within 24 hours.</p>
            </div>
          `,
          replyTo: customerEmail
        });
      }
    } else {
      console.error('Failed to send purchase confirmation email:', emailResult.error);
    }

  } catch (error) {
    console.error('Error handling checkout completion:', error);
    throw error;
  }
}

// Handle successful payment (for immediate payments)
async function handlePaymentSucceeded(paymentIntent) {
  try {
    console.log('Processing payment success for payment intent:', paymentIntent.id);
    
    // Get metadata from payment intent
    const customerEmail = paymentIntent.receipt_email;
    const productKey = paymentIntent.metadata?.product_key;
    
    if (customerEmail && productKey) {
      // This would typically be handled by checkout.session.completed
      // But we can add additional logic here if needed
      console.log(`Payment succeeded for ${productKey} - ${customerEmail}`);
    }
    
  } catch (error) {
    console.error('Error handling payment success:', error);
    throw error;
  }
}

// Handle subscription payment success
async function handleSubscriptionPayment(invoice) {
  try {
    console.log('Processing subscription payment for invoice:', invoice.id);
    
    // Get customer info
    const customer = await stripe.customers.retrieve(invoice.customer);
    const customerEmail = customer.email;
    
    if (!customerEmail) {
      console.warn('No customer email found for subscription payment');
      return;
    }

    // For recurring subscription payments (not the first one)
    if (invoice.billing_reason === 'subscription_cycle') {
      console.log(`Recurring subscription payment from ${customerEmail}`);
      
      // Send subscription renewal confirmation if needed
      // This could be a lighter email than the welcome email
    }
    
  } catch (error) {
    console.error('Error handling subscription payment:', error);
    throw error;
  }
}
