import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import crypto from 'crypto'
import { z } from 'zod'
import { getClientIP, validateRequest, validateWebhookSignature, createRateLimit, RATE_LIMITS } from '@/lib/security'

// Initialize Supabase only if environment variables are available
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

// Whop webhook event schemas
const whopEventSchemas = {
  purchase_created: z.object({
    id: z.string(),
    user: z.object({
      id: z.string(),
      username: z.string(),
      email: z.string().optional(),
    }),
    product: z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      price: z.number(),
    }),
    quantity: z.number(),
    total_amount: z.number(),
    currency: z.string(),
    created_at: z.string(),
  }),

  purchase_completed: z.object({
    id: z.string(),
    user: z.object({
      id: z.string(),
      username: z.string(),
      email: z.string().optional(),
    }),
    product: z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      price: z.number(),
    }),
    quantity: z.number(),
    total_amount: z.number(),
    currency: z.string(),
    completed_at: z.string(),
  }),

  subscription_created: z.object({
    id: z.string(),
    user: z.object({
      id: z.string(),
      username: z.string(),
      email: z.string().optional(),
    }),
    product: z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      price: z.number(),
    }),
    quantity: z.number(),
    total_amount: z.number(),
    currency: z.string(),
    created_at: z.string(),
  }),
}

// Verify Whop webhook signature using enhanced security function
function verifyWhopSignature(payload: string, signature: string): boolean {
  return validateWebhookSignature(payload, signature, process.env.WHOP_WEBHOOK_SECRET || '')
}

// Store purchase in database
async function storePurchase(purchaseData: any, eventType: string) {
  if (!supabase) {
    console.log('Supabase not configured, skipping database storage')
    return { success: true, data: null, note: 'Database storage skipped' }
  }

  try {
    const { data, error } = await supabase
      .from('purchases')
      .upsert({
        id: purchaseData.id,
        user_id: purchaseData.user.id,
        username: purchaseData.user.username,
        email: purchaseData.user.email,
        product_id: purchaseData.product.id,
        product_name: purchaseData.product.name,
        product_description: purchaseData.product.description,
        price: purchaseData.total_amount,
        currency: purchaseData.currency,
        quantity: purchaseData.quantity,
        status: eventType.includes('completed') ? 'completed' : 'pending',
        created_at: purchaseData.created_at || purchaseData.completed_at,
        webhook_type: eventType,
      })
      .select()

    if (error) {
      console.error('Database error:', error)
      return { success: false, error: error.message }
    }

    console.log('Purchase stored:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Store purchase error:', error)
    return { success: false, error: (error as Error).message }
  }
}

// Send purchase confirmation email
async function sendPurchaseConfirmation(purchaseData: any, eventType: string) {
  if (!purchaseData.user.email) {
    console.log('No email provided, skipping confirmation')
    return { success: false, error: 'No email address' }
  }

  try {
    const template = {
      subject: `Your ${purchaseData.product.name} purchase is confirmed!`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px; margin-bottom: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Purchase Confirmed!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 15px 0 0 0; font-size: 18px;">Thank you for your purchase, ${purchaseData.user.username}!</p>
          </div>

          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">Order Details</h2>
            <div style="background: white; padding: 20px; border-radius: 6px; border: 1px solid #e5e7eb;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <span style="color: #1a1a1a; font-weight: 600; font-size: 18px;">${purchaseData.product.name}</span>
                <span style="color: #10b981; font-weight: 700; font-size: 18px;">$${(purchaseData.total_amount / 100).toFixed(2)}</span>
              </div>
              ${purchaseData.product.description ? `
                <p style="color: #6b7280; margin: 0; line-height: 1.5;">${purchaseData.product.description}</p>
              ` : ''}
              <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #f3f4f6; font-size: 14px; color: #6b7280;">
                <strong>Order ID:</strong> ${purchaseData.id}<br>
                <strong>Quantity:</strong> ${purchaseData.quantity}<br>
                <strong>Date:</strong> ${new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>

          <div style="background: white; padding: 25px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #1a1a1a; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">What happens next?</h2>
            <ul style="color: #374151; line-height: 1.6; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">You'll receive access instructions via email</li>
              <li style="margin-bottom: 8px;">Check your Whop account for product access</li>
              <li style="margin-bottom: 8px;">For digital products, download links will be available immediately</li>
              <li>Questions? Just reply to this email</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://whop.com/portal"
               style="background: #0A84FF; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
              View Your Purchase
            </a>
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
      to: purchaseData.user.email!,
      subject: template.subject,
      html: template.html,
    })

    console.log('Purchase confirmation email sent:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error: (error as Error).message }
  }
}

// Track analytics event for purchase
async function trackPurchaseEvent(purchaseData: any, eventType: string) {
  try {
    const analyticsData = {
      event: 'purchase_completed',
      properties: {
        product_id: purchaseData.product.id,
        product_name: purchaseData.product.name,
        price: purchaseData.total_amount,
        currency: purchaseData.currency,
        quantity: purchaseData.quantity,
        user_id: purchaseData.user.id,
        username: purchaseData.user.username,
        platform: 'whop',
      },
      timestamp: new Date().toISOString(),
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/analytics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(analyticsData),
    })

    if (!response.ok) {
      throw new Error(`Analytics tracking failed: ${response.status}`)
    }

    console.log('Purchase event tracked successfully')
    return { success: true }
  } catch (error) {
    console.error('Analytics tracking error:', error)
    return { success: false, error: (error as Error).message }
  }
}

// Handle POST requests - Whop webhooks
export async function POST(request: NextRequest) {
  try {
    // Get client IP
    const ip = getClientIP(request)

    // Validate request for security threats
    const validation = validateRequest(request)
    if (!validation.valid) {
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

    // Get headers
    const headersList = headers()
    const signature = headersList.get('whop-signature')

    if (!signature) {
      console.error('Missing Whop signature')
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      )
    }

    // Get raw body for signature verification
    const body = await request.text()
    const payload = JSON.parse(body)

    // Verify webhook signature
    if (!verifyWhopSignature(body, signature)) {
      console.error('Invalid Whop signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    console.log('Whop webhook received:', payload)

    // Handle different event types
    const eventType = payload.type
    let eventData = payload.data

    // Validate event data based on type
    let validatedEvent
    switch (eventType) {
      case 'purchase.created':
        validatedEvent = whopEventSchemas.purchase_created.parse(eventData)
        break
      case 'purchase.completed':
        validatedEvent = whopEventSchemas.purchase_completed.parse(eventData)
        break
      case 'subscription.created':
        validatedEvent = whopEventSchemas.subscription_created.parse(eventData)
        break
      default:
        console.log(`Unhandled event type: ${eventType}`)
        return NextResponse.json({ received: true })
    }

    // Store purchase in database
    const storeResult = await storePurchase(validatedEvent, eventType)
    if (!storeResult.success) {
      console.error('Failed to store purchase:', storeResult.error)
    }

    // Send confirmation email for completed purchases
    if (eventType.includes('completed')) {
      const emailResult = await sendPurchaseConfirmation(validatedEvent, eventType)
      if (!emailResult.success) {
        console.error('Failed to send confirmation email:', emailResult.error)
      }
    }

    // Track analytics event
    const analyticsResult = await trackPurchaseEvent(validatedEvent, eventType)
    if (!analyticsResult.success) {
      console.error('Failed to track analytics:', analyticsResult.error)
    }

    // Log the webhook for debugging
    console.log(`Successfully processed ${eventType} webhook`)

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Whop webhook error:', error)
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
    service: 'whop-webhook',
    timestamp: new Date().toISOString(),
    configured: {
      supabase: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      resend: !!process.env.RESEND_API_KEY,
      webhook_secret: !!process.env.WHOP_WEBHOOK_SECRET,
    }
  })
}