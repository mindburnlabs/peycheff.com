import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Analytics event schema
const analyticsEventSchema = z.object({
  event: z.string(),
  properties: z.record(z.string(), z.any()).optional(),
  timestamp: z.string().optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  url: z.string().optional(),
  userAgent: z.string().optional(),
  referrer: z.string().optional(),
  utm: z.object({
    source: z.string().optional(),
    medium: z.string().optional(),
    campaign: z.string().optional(),
    term: z.string().optional(),
    content: z.string().optional(),
  }).optional(),
})

// Google Analytics 4 measurement ID
const GA4_MEASUREMENT_ID = process.env.GA4_MEASUREMENT_ID || 'G-XXXXXXXXXX'
const GA4_API_SECRET = process.env.GA4_API_SECRET

// Send event to Google Analytics 4
async function sendToGA4(eventData: any) {
  if (!GA4_API_SECRET) {
    console.warn('GA4_API_SECRET not configured, skipping GA4 tracking')
    return { success: false, error: 'GA4 not configured' }
  }

  try {
    const payload = {
      measurement_id: GA4_MEASUREMENT_ID,
      api_secret: GA4_API_SECRET,
      events: [{
        name: eventData.event,
        params: {
          ...eventData.properties,
          session_id: eventData.sessionId,
          user_id: eventData.userId,
          page_location: eventData.url,
          user_agent: eventData.userAgent,
          page_referrer: eventData.referrer,
          ...eventData.utm,
        }
      }]
    }

    const response = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    )

    if (!response.ok) {
      throw new Error(`GA4 API error: ${response.status} ${response.statusText}`)
    }

    return { success: true, data: await response.json() }
  } catch (error) {
    console.error('GA4 tracking error:', error)
    return { success: false, error: (error as Error).message }
  }
}

// Send event to Meta Pixel (Facebook)
async function sendToMetaPixel(eventData: any) {
  if (!process.env.META_PIXEL_ID) {
    console.warn('META_PIXEL_ID not configured, skipping Meta tracking')
    return { success: false, error: 'Meta Pixel not configured' }
  }

  try {
    const pixelData = {
      event: eventData.event,
      event_id: `${eventData.event}_${Date.now()}`,
      user_data: {
        client_user_agent: eventData.userAgent,
        client_ip_address: eventData.ip,
      },
      custom_data: eventData.properties,
      event_source_url: eventData.url,
      action_source: 'website'
    }

    // Note: This would typically require server-side Facebook Conversions API setup
    // For now, we'll just log the event
    console.log('Meta Pixel event:', pixelData)
    return { success: true, data: pixelData }
  } catch (error) {
    console.error('Meta Pixel tracking error:', error)
    return { success: false, error: (error as Error).message }
  }
}

// Store analytics event locally (for backup, custom dashboards, etc.)
async function storeAnalyticsEvent(eventData: any) {
  try {
    // In a production environment, you might want to store this in a database
    // For now, we'll just log it with a structured format
    const logEntry = {
      timestamp: eventData.timestamp || new Date().toISOString(),
      event: eventData.event,
      properties: eventData.properties,
      userId: eventData.userId,
      sessionId: eventData.sessionId,
      url: eventData.url,
      userAgent: eventData.userAgent,
      referrer: eventData.referrer,
      utm: eventData.utm,
      ip: eventData.ip,
    }

    console.log('Analytics event:', JSON.stringify(logEntry))

    // You could also store this in:
    // - A database (PostgreSQL, MongoDB, etc.)
    // - A logging service (LogRocket, Sentry, etc.)
    // - A file system (for development)
    // - A queue system (Redis, SQS, etc.)

    return { success: true, data: logEntry }
  } catch (error) {
    console.error('Analytics storage error:', error)
    return { success: false, error: (error as Error).message }
  }
}

// Handle POST requests - track analytics events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Get client IP from request headers
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               '127.0.0.1'

    // Validate request body
    const validatedData = analyticsEventSchema.parse({
      ...body,
      ip,
      userAgent: request.headers.get('user-agent') || '',
      url: body.url || request.headers.get('referer') || '',
      referrer: request.headers.get('referer') || '',
    })

    // Add timestamp if not provided
    if (!validatedData.timestamp) {
      validatedData.timestamp = new Date().toISOString()
    }

    // Track event in multiple systems
    const results = await Promise.allSettled([
      sendToGA4(validatedData),
      sendToMetaPixel(validatedData),
      storeAnalyticsEvent(validatedData),
    ])

    // Check if any tracking succeeded
    const hasSuccess = results.some(result =>
      result.status === 'fulfilled' && result.value.success
    )

    // Log any failures
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Analytics system ${index} failed:`, result.reason)
      } else if (!result.value.success) {
        console.error(`Analytics system ${index} error:`, result.value.error)
      }
    })

    if (hasSuccess) {
      return NextResponse.json({
        success: true,
        message: 'Event tracked successfully',
        eventId: `${validatedData.event}_${Date.now()}`
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'All tracking systems failed'
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Analytics tracking error:', error)

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

    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred'
      },
      { status: 500 }
    )
  }
}

// Handle GET requests - retrieve analytics data (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const apiKey = searchParams.get('api_key')

    // Simple API key authentication for admin access
    if (apiKey !== process.env.ANALYTICS_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized'
        },
        { status: 401 }
      )
    }

    // In a real implementation, you would fetch this from your analytics database
    // For now, return a summary of available analytics
    const summary = {
      totalEvents: 0, // Would query database
      uniqueUsers: 0, // Would query database
      topPages: [], // Would query database
      conversionRate: 0, // Would calculate from data
      popularProducts: [], // Would query database
      lastUpdated: new Date().toISOString(),
      message: 'Analytics dashboard data - implement database queries to populate'
    }

    return NextResponse.json({
      success: true,
      data: summary
    })

  } catch (error) {
    console.error('Analytics retrieval error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve analytics data'
      },
      { status: 500 }
    )
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}