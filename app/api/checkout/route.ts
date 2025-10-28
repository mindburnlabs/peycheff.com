import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { z } from 'zod'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil',
})

// Checkout session schema
const checkoutSchema = z.object({
  priceId: z.string().min(1, 'Price ID is required'),
  productName: z.string().min(1, 'Product name is required'),
  successUrl: z.string().optional(),
  cancelUrl: z.string().optional(),
  customerEmail: z.string().email().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validatedData = checkoutSchema.parse(body)

    // Get origin for success/cancel URLs
    const origin = request.headers.get('origin') || 'https://peycheff.com'

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: validatedData.priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: validatedData.successUrl || `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: validatedData.cancelUrl || `${origin}/products?canceled=true`,
      customer_email: validatedData.customerEmail,
      metadata: {
        product_name: validatedData.productName,
        source: 'peycheff.com',
        ...validatedData.metadata,
      },
      billing_address_collection: 'auto',
      allow_promotion_codes: true,
      phone_number_collection: {
        enabled: false,
      },
      custom_fields: [
        {
          key: 'company',
          label: {
            type: 'custom',
            custom: 'Company (Optional)',
          },
          type: 'text',
          optional: true,
        },
        {
          key: 'goal',
          label: {
            type: 'custom',
            custom: 'What are you hoping to achieve? (Optional)',
          },
          type: 'text',
          optional: true,
        },
      ],
    })

    // Log the checkout session creation
    console.log(`Checkout session created: ${session.id} for ${validatedData.productName}`)

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      checkoutUrl: session.url,
    })

  } catch (error) {
    console.error('Stripe checkout error:', error)

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.issues.map(err => err.message)
        },
        { status: 400 }
      )
    }

    // Handle Stripe errors
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message
        },
        { status: 400 }
      )
    }

    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred. Please try again.'
      },
      { status: 500 }
    )
  }
}

// Handle GET requests for session status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Session ID is required'
        },
        { status: 400 }
      )
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        status: session.status,
        payment_status: session.payment_status,
        customer_email: session.customer_details?.email,
        metadata: session.metadata,
        created: session.created,
        expires_at: session.expires_at,
      }
    })

  } catch (error) {
    console.error('Session retrieval error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve session information'
      },
      { status: 500 }
    )
  }
}