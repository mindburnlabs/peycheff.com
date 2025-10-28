import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { z } from 'zod'
import {
  getClientIP,
  validateRequest,
  validateWebhookSignature,
  createRateLimit,
  RATE_LIMITS,
  logSecurityEvent,
  SECURITY_EVENTS
} from '@/lib/security'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil',
})

// Initialize Supabase
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  : null

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY || 'test_key')

// Initialize rate limiting for webhooks
const webhookRateLimiter = createRateLimit(RATE_LIMITS['/api/whop'])

// Stripe webhook event schemas
const stripeEventSchemas = {
  'checkout.session.completed': z.object({
    id: z.string(),
    object: z.literal('checkout.session'),
    customer: z.string().optional(),
    customer_email: z.string().optional(),
    metadata: z.record(z.string(), z.string()).optional(),
    payment_status: z.enum(['paid', 'unpaid', 'no_payment_required']),
    total_amount: z.number(),
    currency: z.string(),
    created: z.number(),
    success_url: z.string().optional(),
    cancel_url: z.string().optional(),
    payment_intent: z.string().optional(),
    subscription: z.string().optional(),
  }),

  'payment_intent.succeeded': z.object({
    id: z.string(),
    object: z.literal('payment_intent'),
    amount: z.number(),
    currency: z.string(),
    customer: z.string().optional(),
    metadata: z.record(z.string(), z.string()).optional(),
    status: z.string(),
    created: z.number(),
    receipt_email: z.string().optional(),
  }),

  'payment_intent.payment_failed': z.object({
    id: z.string(),
    object: z.literal('payment_intent'),
    amount: z.number(),
    currency: z.string(),
    customer: z.string().optional(),
    metadata: z.record(z.string(), z.string()).optional(),
    status: z.string(),
    last_payment_error: z.object({
      message: z.string(),
      type: z.string(),
    }).optional(),
    created: z.number(),
  }),

  'invoice.payment_succeeded': z.object({
    id: z.string(),
    object: z.literal('invoice'),
    customer: z.string(),
    payment_intent: z.string().optional(),
    subscription: z.string().optional(),
    total: z.number(),
    currency: z.string(),
    status: z.string(),
    created: z.number(),
    metadata: z.record(z.string(), z.string()).optional(),
  }),

  'customer.subscription.created': z.object({
    id: z.string(),
    object: z.literal('subscription'),
    customer: z.string(),
    status: z.string(),
    current_period_start: z.number(),
    current_period_end: z.number(),
    created: z.number(),
    metadata: z.record(z.string(), z.string()).optional(),
  }),
}

// Webhook security validation
async function validateStripeWebhook(request: NextRequest): Promise<{
  valid: boolean
  event?: Stripe.Event
  error?: string
}> {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return {
        valid: false,
        error: 'Missing Stripe signature'
      }
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return {
        valid: false,
        error: 'Stripe webhook secret not configured'
      }
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )

    // Additional security checks
    if (!event.id || !event.type) {
      return {
        valid: false,
        error: 'Invalid webhook event structure'
      }
    }

    // Check for replay attacks (events older than 15 minutes)
    const eventAge = Date.now() - (event.created * 1000)
    if (eventAge > 15 * 60 * 1000) { // 15 minutes
      return {
        valid: false,
        error: 'Webhook event too old (possible replay attack)'
      }
    }

    return {
      valid: true,
      event
    }

  } catch (error) {
    console.error('Stripe webhook validation error:', error)
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown validation error'
    }
  }
}

// Store payment event in database
async function storePaymentEvent(eventData: any, eventType: string) {
  if (!supabase) {
    console.log('Supabase not configured, skipping database storage')
    return { success: true, data: null, note: 'Database storage skipped' }
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .upsert({
        id: eventData.id || `stripe_${eventData.payment_intent || eventData.id}`,
        order_number: eventData.metadata?.order_number || `STRIPE_${Date.now()}`,
        platform: 'stripe',
        status: getEventStatus(eventType),
        amount: eventData.total_amount || eventData.amount || eventData.total,
        currency: eventData.currency,
        customer_email: eventData.customer_email || eventData.receipt_email,
        customer_name: eventData.metadata?.customer_name,
        payment_intent_id: eventData.payment_intent || eventData.id,
        payment_method: eventData.payment_method_types?.[0] || 'card',
        metadata: {
          stripe_event_type: eventType,
          stripe_event_id: eventData.id,
          customer: eventData.customer,
          ...eventData.metadata
        },
        created_at: new Date(eventData.created * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('Database error:', error)
      return { success: false, error: error.message }
    }

    console.log('Payment event stored:', data)
    return { success: true, data }

  } catch (error) {
    console.error('Store payment event error:', error)
    return { success: false, error: (error as Error).message }
  }
}

// Determine order status from event type
function getEventStatus(eventType: string): string {
  switch (eventType) {
    case 'checkout.session.completed':
    case 'payment_intent.succeeded':
    case 'invoice.payment_succeeded':
      return 'completed'
    case 'payment_intent.payment_failed':
      return 'failed'
    case 'customer.subscription.created':
      return 'pending'
    default:
      return 'pending'
  }
}

// Send payment confirmation email
async function sendPaymentConfirmation(eventData: any, eventType: string) {
  const email = eventData.customer_email || eventData.receipt_email
  if (!email) {
    console.log('No email provided, skipping confirmation')
    return { success: false, error: 'No email address' }
  }

  try {
    const productName = eventData.metadata?.product_name || 'Product/Service'
    const amount = eventData.total_amount || eventData.amount || eventData.total
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: eventData.currency?.toUpperCase() || 'USD'
    }).format((amount || 0) / 100)

    const template = {
      subject: `Payment Confirmation - ${productName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px; margin-bottom: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Payment Successful!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 15px 0 0 0; font-size: 18px;">Thank you for your payment</p>
          </div>

          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">Payment Details</h2>
            <div style="background: white; padding: 20px; border-radius: 6px; border: 1px solid #e5e7eb;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <span style="color: #1a1a1a; font-weight: 600; font-size: 18px;">${productName}</span>
                <span style="color: #10b981; font-weight: 700; font-size: 18px;">${formattedAmount}</span>
              </div>
              <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #f3f4f6; font-size: 14px; color: #6b7280;">
                <strong>Payment ID:</strong> ${eventData.payment_intent || eventData.id}<br>
                <strong>Date:</strong> ${new Date(eventData.created * 1000).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}<br>
                <strong>Status:</strong> ${eventType.replace('.', ' ').toUpperCase()}
              </div>
            </div>
          </div>

          <div style="background: white; padding: 25px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #1a1a1a; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">What's Next?</h2>
            <ul style="color: #374151; line-height: 1.6; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">You'll receive a receipt via email</li>
              <li style="margin-bottom: 8px;">Check your email for product access instructions</li>
              <li style="margin-bottom: 8px;">For subscriptions, you'll be notified before renewal</li>
              <li>Questions? Just reply to this email</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
            <p style="margin: 0 0 10px 0;">Thank you for supporting my work!</p>
            <p style="margin: 0;">
              Ivan Peycheff • <a href="mailto:ivan@peycheff.com" style="color: #0A84FF; text-decoration: none;">ivan@peycheff.com</a>
            </p>
          </div>
        </div>
      `
    }

    const data = await resend.emails.send({
      from: 'Ivan Peycheff <ivan@peycheff.com>',
      to: email,
      subject: template.subject,
      html: template.html,
    })

    console.log('Payment confirmation email sent:', data)
    return { success: true, data }

  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error: (error as Error).message }
  }
}

// Handle POST requests - Stripe webhooks
export async function POST(request: NextRequest) {
  try {
    // Get client IP
    const ip = getClientIP(request)

    // Validate request for security threats
    const validation = validateRequest(request)
    if (!validation.valid) {
      await logSecurityEvent({
        type: SECURITY_EVENTS.SUSPICIOUS_REQUEST,
        ip,
        url: request.url,
        userAgent: request.headers.get('user-agent'),
        method: request.method,
        reason: validation.reason
      })

      return NextResponse.json(
        {
          error: 'Invalid request',
          reason: validation.reason
        },
        { status: 400 }
      )
    }

    // Check rate limiting for webhooks
    const rateLimitResult = await webhookRateLimiter(request)
    if (!rateLimitResult.success) {
      await logSecurityEvent({
        type: SECURITY_EVENTS.RATE_LIMIT_EXCEEDED,
        ip,
        url: request.url,
        userAgent: request.headers.get('user-agent'),
        method: request.method,
        count: rateLimitResult.remaining
      })

      return NextResponse.json(
        {
          error: rateLimitResult.error
        },
        {
          status: rateLimitResult.statusCode,
          headers: {
            'Retry-After': rateLimitResult.retryAfter?.toString() || '3600'
          }
        }
      )
    }

    // Get raw body for signature verification
    const body = await request.text()

    // Create a new request object with the raw body
    const webhookRequest = new NextRequest(request.url, {
      method: request.method,
      headers: Object.fromEntries(request.headers),
      body: body
    })

    // Validate Stripe webhook
    const webhookValidation = await validateStripeWebhook(webhookRequest)
    if (!webhookValidation.valid) {
      await logSecurityEvent({
        type: SECURITY_EVENTS.INVALID_WEBHOOK_SIGNATURE,
        ip,
        url: request.url,
        userAgent: request.headers.get('user-agent'),
        reason: webhookValidation.error
      })

      return NextResponse.json(
        { error: webhookValidation.error },
        { status: 401 }
      )
    }

    const event = webhookValidation.event!
    console.log(`Stripe webhook received: ${event.type}`)

    // Validate event data based on type
    let validatedEvent
    const schema = stripeEventSchemas[event.type as keyof typeof stripeEventSchemas]

    if (schema) {
      try {
        validatedEvent = schema.parse(event.data.object)
      } catch (error) {
        console.error(`Invalid event data for ${event.type}:`, error)
        return NextResponse.json(
          { error: 'Invalid event data structure' },
          { status: 400 }
        )
      }
    } else {
      console.log(`Unhandled event type: ${event.type}`)
      return NextResponse.json({ received: true })
    }

    // Process the event
    const eventData = {
      ...validatedEvent,
      stripe_event_id: event.id,
      stripe_event_type: event.type
    }

    // Store payment event in database
    const storeResult = await storePaymentEvent(eventData, event.type)
    if (!storeResult.success) {
      console.error('Failed to store payment event:', storeResult.error)
    }

    // Send confirmation email for successful payments
    if (event.type.includes('succeeded') || event.type.includes('completed')) {
      const emailResult = await sendPaymentConfirmation(eventData, event.type)
      if (!emailResult.success) {
        console.error('Failed to send confirmation email:', emailResult.error)
      }
    }

    // Track analytics event
    try {
      const analyticsData = {
        event: 'stripe_webhook_processed',
        properties: {
          event_type: event.type,
          payment_intent: validatedEvent.payment_intent,
          customer: validatedEvent.customer,
          amount: validatedEvent.amount || validatedEvent.total_amount,
          currency: validatedEvent.currency
        },
        timestamp: new Date().toISOString(),
      }

      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analyticsData),
      })

    } catch (error) {
      console.error('Analytics tracking error:', error)
    }

    // Log the webhook for debugging
    console.log(`Successfully processed ${event.type} webhook`)

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Stripe webhook error:', error)

    await logSecurityEvent({
      type: SECURITY_EVENTS.SUSPICIOUS_REQUEST,
      ip: getClientIP(request),
      url: request.url,
      userAgent: request.headers.get('user-agent'),
      method: request.method,
      reason: 'Webhook processing error',
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Handle GET requests - webhook status/health check
export async function GET() {
  return NextResponse.json({
    status: 'active',
    service: 'stripe-webhook',
    timestamp: new Date().toISOString(),
    configured: {
      stripe: !!process.env.STRIPE_SECRET_KEY,
      webhook_secret: !!process.env.STRIPE_WEBHOOK_SECRET,
      resend: !!process.env.RESEND_API_KEY,
      supabase: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    supported_events: Object.keys(stripeEventSchemas)
  })
}