import Stripe from 'stripe'

// Initialize Stripe with your secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
  typescript: true,
})

export interface CreateCheckoutSessionParams {
  priceId: string
  successUrl: string
  cancelUrl: string
  customerEmail?: string
  metadata?: Record<string, string>
}

export async function createCheckoutSession({
  priceId,
  successUrl,
  cancelUrl,
  customerEmail,
  metadata = {}
}: CreateCheckoutSessionParams) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      metadata: {
        ...metadata,
        source: 'peycheff.com'
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      custom_text: {
        submit: {
          message: 'You\'ll receive access immediately after payment.',
        },
      },
    })

    return { success: true, sessionId: session.id, url: session.url }
  } catch (error) {
    console.error('Stripe checkout session creation failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function retrieveCheckoutSession(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    return { success: true, session }
  } catch (error) {
    console.error('Failed to retrieve checkout session:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function createCustomer(email: string, name?: string) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        source: 'peycheff.com'
      }
    })

    return { success: true, customerId: customer.id }
  } catch (error) {
    console.error('Failed to create Stripe customer:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Webhook handling
export interface StripeWebhookEvent {
  type: string
  data: {
    object: any
  }
}

export function handleWebhookEvent(event: StripeWebhookEvent) {
  switch (event.type) {
    case 'checkout.session.completed':
      // Handle successful checkout
      console.log('Checkout session completed:', event.data.object)
      break

    case 'payment_intent.succeeded':
      // Handle successful payment
      console.log('Payment succeeded:', event.data.object)
      break

    case 'payment_intent.payment_failed':
      // Handle failed payment
      console.log('Payment failed:', event.data.object)
      break

    case 'invoice.payment_succeeded':
      // Handle successful subscription payment (if you add subscriptions)
      console.log('Invoice payment succeeded:', event.data.object)
      break

    case 'invoice.payment_failed':
      // Handle failed subscription payment
      console.log('Invoice payment failed:', event.data.object)
      break

    default:
      console.log(`Unhandled webhook event type: ${event.type}`)
  }
}