import { NextRequest, NextResponse } from 'next/server'
import { getClientIP, validateRequest, logSecurityEvent, SECURITY_EVENTS } from '@/lib/security'

// Rate limiting for middleware
const rateLimitStore = new Map()

// Middleware rate limiting
function middlewareRateLimit(ip: string, limit: number = 100, windowMs: number = 15 * 60 * 1000) {
  const key = `mw_${ip}`
  const now = Date.now()
  const current = rateLimitStore.get(key) || { count: 0, resetTime: now + windowMs }

  if (now > current.resetTime) {
    current.count = 0
    current.resetTime = now + windowMs
  }

  current.count++
  rateLimitStore.set(key, current)

  if (current.count > limit) {
    return { allowed: false, retryAfter: Math.ceil((current.resetTime - now) / 1000) }
  }

  return { allowed: true, remaining: Math.max(0, limit - current.count) }
}

// Blocked user agents and IPs
const BLOCKED_USER_AGENTS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /curl/i,
  /wget/i,
  /python/i,
  /java/i,
  /go-http-client/i,
  /node/i,
  /ruby/i,
  /php/i,
  /perl/i,
]

const SUSPICIOUS_PATHS = [
  '/admin',
  '/wp-admin',
  '/wp-login',
  '/phpmyadmin',
  '/.env',
  '/config',
  '/backup',
  '/test',
  '/api/v1',
]

const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH']

export async function middleware(request: NextRequest) {
  const ip = getClientIP(request)
  const userAgent = request.headers.get('user-agent') || ''
  const url = request.nextUrl
  const path = url.pathname
  const method = request.method

  // Security logging
  const logSecurity = async (eventType: string, details: any) => {
    await logSecurityEvent({
      type: eventType,
      ip,
      url: request.url,
      userAgent,
      method,
      ...details
    })
  }

  // 1. Request validation
  const validation = validateRequest(request)
  if (!validation.valid) {
    await logSecurity(SECURITY_EVENTS.SUSPICIOUS_REQUEST, {
      reason: validation.reason,
      pattern: validation.pattern
    })

    return new NextResponse('Invalid request', {
      status: 400,
      headers: {
        'Content-Type': 'text/plain',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY'
      }
    })
  }

  // 2. Method validation
  if (!ALLOWED_METHODS.includes(method)) {
    await logSecurity(SECURITY_EVENTS.SUSPICIOUS_REQUEST, {
      reason: 'Unexpected HTTP method',
      method
    })

    return new NextResponse('Method not allowed', {
      status: 405,
      headers: {
        'Allow': ALLOWED_METHODS.join(', ')
      }
    })
  }

  // 3. User agent validation
  if (userAgent.length < 10) {
    await logSecurity(SECURITY_EVENTS.SUSPICIOUS_REQUEST, {
      reason: 'Missing or suspicious user agent',
      userAgent
    })
  }

  // Block suspicious user agents for certain endpoints
  if (path.startsWith('/api/') && BLOCKED_USER_AGENTS.some(pattern => pattern.test(userAgent))) {
    await logSecurity(SECURITY_EVENTS.SUSPICIOUS_REQUEST, {
      reason: 'Blocked user agent accessing API',
      userAgent
    })

    return new NextResponse('Access denied', { status: 403 })
  }

  // 4. Path validation
  if (SUSPICIOUS_PATHS.some(suspiciousPath => path.toLowerCase().includes(suspiciousPath.toLowerCase()))) {
    await logSecurity(SECURITY_EVENTS.SUSPICIOUS_REQUEST, {
      reason: 'Access to suspicious path',
      path
    })

    return new NextResponse('Not found', { status: 404 })
  }

  // 5. Rate limiting by IP
  const rateLimitResult = middlewareRateLimit(ip, 1000, 15 * 60 * 1000) // 1000 requests per 15 minutes
  if (!rateLimitResult.allowed) {
    await logSecurity(SECURITY_EVENTS.RATE_LIMIT_EXCEEDED, {
      limit: 1000,
      window: '15 minutes'
    })

    return new NextResponse('Too many requests', {
      status: 429,
      headers: {
        'Retry-After': rateLimitResult.retryAfter?.toString() || '900',
        'X-RateLimit-Limit': '1000',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(Date.now() + (rateLimitResult.retryAfter! * 1000)).toISOString()
      }
    })
  }

  // 6. Content-Type validation for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    const contentType = request.headers.get('content-type')
    const isFormData = contentType?.includes('multipart/form-data')
    const isJson = contentType?.includes('application/json')

    if (!contentType && path.startsWith('/api/')) {
      await logSecurity(SECURITY_EVENTS.SUSPICIOUS_REQUEST, {
        reason: 'Missing Content-Type header for API request',
        contentType
      })

      return new NextResponse('Content-Type required', { status: 400 })
    }

    // Size validation
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
      await logSecurity(SECURITY_EVENTS.SUSPICIOUS_REQUEST, {
        reason: 'Request too large',
        contentLength
      })

      return new NextResponse('Request too large', { status: 413 })
    }
  }

  // 7. Add security headers to response
  const response = NextResponse.next()

  // Custom security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-DNS-Prefetch-Control', 'on')

  // Remove server information
  response.headers.set('Server', '')
  response.headers.set('X-Powered-By', '')

  // Rate limiting headers
  response.headers.set('X-RateLimit-Limit', '1000')
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining?.toString() || '999')
  response.headers.set('X-RateLimit-Reset', new Date(Date.now() + 15 * 60 * 1000).toISOString())

  // IP and request tracking headers (for debugging)
  if (process.env.NODE_ENV === 'development') {
    response.headers.set('X-Client-IP', ip)
    response.headers.set('X-Request-ID', `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  }

  return response
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}