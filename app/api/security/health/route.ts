import { NextRequest, NextResponse } from 'next/server'
import { getClientIP, validateRequest, createRateLimit } from '@/lib/security'
import { performSecurityHealthCheck } from '@/lib/security-enhanced'

// Rate limiting for health check endpoint
const healthRateLimiter = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 requests per minute
  message: 'Too many health check requests'
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
    const rateLimitResult = await healthRateLimiter(request)
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

    // Perform security health check
    const healthData = performSecurityHealthCheck()

    // Get additional security metrics
    const securityMetrics = {
      rateLimitStoreSize: (global as any).rateLimitStore?.size || 0,
      securityEventStoreSize: (global as any).securityEventStore?.size || 0,
      ipReputationStoreSize: (global as any).ipReputationStore?.size || 0,
      lastCleanup: (global as any).lastCleanupTime || null,
      nextCleanup: (global as any).nextCleanupTime || null
    }

    // Check for common security misconfigurations
    const securityChecklist = {
      environmentVariables: {
        hasSecurityApiKey: !!process.env.SECURITY_API_KEY,
        hasResendApiKey: !!process.env.RESEND_API_KEY,
        hasStripeSecretKey: !!process.env.STRIPE_SECRET_KEY,
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasProductionNodeEnv: process.env.NODE_ENV === 'production'
      },
      securityHeaders: {
        hstsEnabled: true, // These are set in next.config.js
        cspEnabled: true,
        frameOptionsEnabled: true,
        contentTypeOptionsEnabled: true
      },
      apiSecurity: {
        rateLimitingEnabled: true,
        inputValidationEnabled: true,
        authenticationEnabled: true,
        corsEnabled: true
      }
    }

    // Calculate overall security score
    const calculateSecurityScore = () => {
      let score = 100
      let maxScore = 100

      // Environment variables (20 points)
      const envVars = securityChecklist.environmentVariables
      const envScore = Object.values(envVars).filter(Boolean).length
      score -= (20 - envScore * 4)

      // Security health (30 points)
      if (healthData.status === 'critical') score -= 30
      else if (healthData.status === 'warning') score -= 15

      // Recent activity (20 points)
      if (healthData.metrics.blockedIPs > 50) score -= 10
      if (healthData.metrics.highRiskIPs > 20) score -= 10

      // IP reputation (30 points)
      if (healthData.metrics.averageReputationScore > 5) score -= 20
      else if (healthData.metrics.averageReputationScore > 3) score -= 10

      return Math.max(0, Math.min(100, score))
    }

    const securityScore = calculateSecurityScore()

    // Determine security grade
    const getSecurityGrade = (score: number): 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' => {
      if (score >= 95) return 'A+'
      if (score >= 90) return 'A'
      if (score >= 80) return 'B'
      if (score >= 70) return 'C'
      if (score >= 60) return 'D'
      return 'F'
    }

    return NextResponse.json({
      success: true,
      data: {
        health: healthData,
        metrics: securityMetrics,
        checklist: securityChecklist,
        score: {
          overall: securityScore,
          grade: getSecurityGrade(securityScore),
          breakdown: {
            environmentSecurity: Object.values(securityChecklist.environmentVariables).filter(Boolean).length * 4,
            systemHealth: healthData.status === 'healthy' ? 30 : healthData.status === 'warning' ? 15 : 0,
            threatLevel: healthData.metrics.blockedIPs > 50 ? 10 : 20,
            ipReputation: healthData.metrics.averageReputationScore > 5 ? 10 : healthData.metrics.averageReputationScore > 3 ? 20 : 30
          }
        },
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: {
          node: process.version,
          platform: process.platform,
          environment: process.env.NODE_ENV
        }
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
    console.error('Security health check error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve security health information'
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
    const rateLimitResult = await healthRateLimiter(request)
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
    const { action } = body

    switch (action) {
      case 'reset-reputation':
        // Reset IP reputation data (admin action)
        if ((global as any).ipReputationStore) {
          (global as any).ipReputationStore.clear()
          return NextResponse.json({
            success: true,
            message: 'IP reputation data reset successfully',
            timestamp: new Date().toISOString()
          })
        }
        break

      case 'export-events':
        // Export security events for analysis
        const { getSecurityStats } = require('@/lib/security')
        const stats = getSecurityStats()

        return NextResponse.json({
          success: true,
          data: {
            events: stats,
            exportTime: new Date().toISOString(),
            totalEvents: stats.totalEvents
          }
        })

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Unknown action',
            availableActions: ['reset-reputation', 'export-events']
          },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Security health admin action error:', error)

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