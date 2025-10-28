import { NextRequest, NextResponse } from 'next/server'
import { getSecurityStats, getClientIP, validateRequest, createRateLimit } from '@/lib/security'

// Rate limiting for security stats endpoint
const statsRateLimiter = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute
  message: 'Too many security stats requests'
})

// Simple API key authentication for admin access
function authenticateRequest(request: NextRequest): { valid: boolean; reason?: string } {
  const apiKey = request.headers.get('x-api-key')
  const authHeader = request.headers.get('authorization')

  // Check API key in header or authorization header
  const providedKey = apiKey || authHeader?.replace('Bearer ', '')

  if (!providedKey) {
    return { valid: false, reason: 'Missing API key' }
  }

  const validApiKey = process.env.SECURITY_API_KEY

  if (!validApiKey) {
    return { valid: false, reason: 'Security monitoring not configured' }
  }

  // Use timing-safe comparison to prevent timing attacks
  const crypto = require('crypto')

  try {
    const isValid = crypto.timingSafeEqual(
      Buffer.from(providedKey, 'utf8'),
      Buffer.from(validApiKey, 'utf8')
    )

    if (!isValid) {
      return { valid: false, reason: 'Invalid API key' }
    }

    return { valid: true }
  } catch (error) {
    return { valid: false, reason: 'Authentication error' }
  }
}

export async function GET(request: NextRequest) {
  try {
    // Validate request for security threats
    const validation = validateRequest(request)
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request',
          reason: validation.reason
        },
        { status: 400 }
      )
    }

    // Check rate limiting
    const rateLimitResult = await statsRateLimiter(request)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: rateLimitResult.error
        },
        {
          status: rateLimitResult.statusCode,
          headers: {
            'Retry-After': rateLimitResult.retryAfter?.toString() || '60'
          }
        }
      )
    }

    // Authenticate the request
    const auth = authenticateRequest(request)
    if (!auth.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication failed',
          reason: auth.reason
        },
        { status: 401 }
      )
    }

    // Get security statistics
    const stats = getSecurityStats()

    // Get additional system information
    const systemInfo = {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      platform: process.platform,
      nodeVersion: process.version,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }

    // Get request metadata
    const requestInfo = {
      ip: getClientIP(request),
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
      url: request.url,
      method: request.method
    }

    return NextResponse.json({
      success: true,
      data: {
        security: stats,
        system: systemInfo,
        request: requestInfo,
        generated_at: new Date().toISOString()
      }
    }, {
      headers: {
        'X-RateLimit-Remaining': rateLimitResult.remaining?.toString() || '0',
        'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Cache-Control': 'no-store, must-revalidate'
      }
    })

  } catch (error) {
    console.error('Security stats error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve security statistics'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate request for security threats
    const validation = validateRequest(request)
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request',
          reason: validation.reason
        },
        { status: 400 }
      )
    }

    // Check rate limiting
    const rateLimitResult = await statsRateLimiter(request)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: rateLimitResult.error
        },
        {
          status: rateLimitResult.statusCode,
          headers: {
            'Retry-After': rateLimitResult.retryAfter?.toString() || '60'
          }
        }
      )
    }

    // Authenticate the request
    const auth = authenticateRequest(request)
    if (!auth.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication failed',
          reason: auth.reason
        },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Handle different admin actions
    const { action } = body

    switch (action) {
      case 'cleanup':
        // Trigger cleanup of old data
        const { cleanupRateLimitStore, cleanupSecurityEvents } = require('@/lib/security')

        cleanupRateLimitStore()
        cleanupSecurityEvents()

        return NextResponse.json({
          success: true,
          message: 'Security data cleanup completed',
          timestamp: new Date().toISOString()
        })

      case 'test-alert':
        // Send a test security alert
        const { logSecurityEvent, SECURITY_EVENTS } = require('@/lib/security')

        const testEvent = await logSecurityEvent({
          type: SECURITY_EVENTS.SUSPICIOUS_REQUEST,
          ip: getClientIP(request),
          url: '/api/security/stats',
          userAgent: request.headers.get('user-agent'),
          reason: 'Test security alert from admin panel'
        })

        return NextResponse.json({
          success: true,
          message: 'Test security alert sent',
          eventId: testEvent.id,
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Unknown action',
            availableActions: ['cleanup', 'test-alert']
          },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Security admin action error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to execute admin action'
      },
      { status: 500 }
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  const allowedOrigins = process.env.NODE_ENV === 'development'
    ? ['http://localhost:4028', 'https://localhost:4028']
    : ['https://peycheff.com', 'https://www.peycheff.com']

  const isAllowedOrigin = origin && allowedOrigins.includes(origin)

  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': isAllowedOrigin ? origin : 'null',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, X-Requested-With',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400', // 24 hours
      'Vary': 'Origin'
    },
  })
}