/**
 * Enhanced Security Utilities for peycheff.com
 * Advanced threat detection, monitoring, and response system
 */

import crypto from 'crypto'
import { NextRequest } from 'next/server'
import { getClientIP, logSecurityEvent, validateRequest, SECURITY_EVENTS } from './security'

// Advanced threat detection patterns
const ADVANCED_THREAT_PATTERNS = {
  // SQL Injection patterns (more comprehensive)
  SQL_INJECTION: [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b.*\b(FROM|INTO|TABLE|DATABASE)\b)/i,
    /(OR\s+1\s*=\s*1|AND\s+1\s*=\s*1|'|\s*OR\s*''\s*=)/i,
    /(WAITFOR\s+DELAY|BENCHMARK|SLEEP\(|pg_sleep\()/i,
    /(\b(INFORMATION_SCHEMA|SYS\.|MASTER\.)\b)/i,
    /(CHAR\(|ASCII\(|CONCAT\(|GROUP_CONCAT\()/i,
    /(--|#|\/\*|\*\/)/i,
  ],

  // XSS patterns (more comprehensive)
  XSS: [
    /(<script[^>]*>.*?<\/script>)/gi,
    /(javascript\s*:)/gi,
    /(on\w+\s*=)/gi,
    /(<iframe[^>]*>)/gi,
    /(<object[^>]*>)/gi,
    /(<embed[^>]*>)/gi,
    /(<link[^>]*>)/gi,
    /(<meta[^>]*>)/gi,
    /(vbscript\s*:)/gi,
    /(data\s*:\s*text\/html)/gi,
    /(\.innerHTML\s*=|\.outerHTML\s*=)/gi,
    /(eval\s*\(|setTimeout\s*\(|setInterval\s*\()/gi,
  ],

  // Command injection patterns
  COMMAND_INJECTION: [
    /(;|\||&|\$\(|`|\\$\(|\${)/,
    /(wget|curl|nc|netcat|telnet|ssh|ftp)/i,
    /(rm\s+-rf|mv\s+.*\s+\/|cp\s+.*\s+.*;)/i,
    /(cat\s+\/etc\/|ls\s+-la|pwd|whoami)/i,
    /(\/bin\/|\/usr\/bin\/|\/sbin\/)/i,
    /(python\s+|perl\s+|ruby\s+|php\s+|node\s+)/i,
  ],

  // Path traversal patterns
  PATH_TRAVERSAL: [
    /(\.\.[\/\\])/,
    /(\/etc\/passwd|\/etc\/shadow|\/proc\/)/i,
    /(\/windows\/system32|c:\\windows\\)/i,
    /(\/www\/|\/htdocs\/|\/var\/www\/)/i,
  ],

  // NoSQL injection patterns
  NOSQL_INJECTION: [
    /(\{\s*\$where\s*:)/i,
    /(\{\s*\$ne\s*:)/i,
    /(\{\s*\$gt\s*:)/i,
    /(\{\s*\$regex\s*:)/i,
    /(MapReduce|group\(|aggregate\()/i,
  ],

  // LDAP injection patterns
  LDAP_INJECTION: [
    /(\*\)\(|\)\(\*|\)\(cn=)/i,
    /(\&|\||\(|\))/i,
    /(\(\s*attribute\s*=)/i,
  ],

  // XXE (XML External Entity) patterns
  XXE: [
    /(<!ENTITY.*SYSTEM)/i,
    /(<\?xml.*encoding.*utf-8\?>)/i,
    /(&[a-zA-Z]+;)/i,
  ],

  // SSRF (Server-Side Request Forgery) patterns
  SSRF: [
    /(localhost|127\.0\.0\.1|0\.0\.0\.0|::1)/i,
    /(169\.254\.|192\.168\.|10\.|172\.1[6-9]\.|172\.2[0-9]\.|172\.3[0-1]\.)/i,
    /(metadata|169\.254\.169\.254)/i,
  ],

  // File inclusion patterns
  FILE_INCLUSION: [
    /(include\s*\(|require\s*\(|include_once\s*\(|require_once\s*\()/i,
    /(file_get_contents\s*\(|file_put_contents\s*\()/i,
    /(fopen\s*\(|readfile\s*\()/i,
  ],

  // Cryptographic attack patterns
  CRYPTO_ATTACKS: [
    /(md5\s*\(|sha1\s*\(|hash\s*\()/i,
    /(base64_encode|base64_decode)/i,
    /(openssl_encrypt|openssl_decrypt)/i,
  ]
}

// Advanced rate limiting with progressive penalties
interface AdvancedRateLimitConfig {
  baseLimit: number
  baseWindow: number
  penaltyMultiplier: number
  maxPenaltyWindow: number
  violationsToBlock: number
}

export const ADVANCED_RATE_LIMITS: Record<string, AdvancedRateLimitConfig> = {
  '/api/contact': {
    baseLimit: 5,
    baseWindow: 15 * 60 * 1000, // 15 minutes
    penaltyMultiplier: 2,
    maxPenaltyWindow: 2 * 60 * 60 * 1000, // 2 hours
    violationsToBlock: 3
  },
  '/api/checkout': {
    baseLimit: 10,
    baseWindow: 60 * 60 * 1000, // 1 hour
    penaltyMultiplier: 1.5,
    maxPenaltyWindow: 4 * 60 * 60 * 1000, // 4 hours
    violationsToBlock: 5
  },
  '/api/whop': {
    baseLimit: 20,
    baseWindow: 60 * 1000, // 1 minute
    penaltyMultiplier: 3,
    maxPenaltyWindow: 30 * 60 * 1000, // 30 minutes
    violationsToBlock: 2
  },
  '/api/security/stats': {
    baseLimit: 10,
    baseWindow: 60 * 1000, // 1 minute
    penaltyMultiplier: 4,
    maxPenaltyWindow: 60 * 60 * 1000, // 1 hour
    violationsToBlock: 2
  },
  'default': {
    baseLimit: 100,
    baseWindow: 15 * 60 * 1000, // 15 minutes
    penaltyMultiplier: 1.5,
    maxPenaltyWindow: 60 * 60 * 1000, // 1 hour
    violationsToBlock: 10
  }
}

// IP reputation scoring
interface IPReputation {
  score: number
  violations: number
  lastViolation: number
  blocked: boolean
  blockExpiry: number
}

const ipReputationStore = new Map<string, IPReputation>()

// Advanced threat detection
export function detectAdvancedThreats(request: NextRequest): {
  isThreat: boolean
  threatType: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  details: any
  patterns: string[]
} {
  const url = request.url
  const userAgent = request.headers.get('user-agent') || ''
  const referer = request.headers.get('referer') || ''
  const ip = getClientIP(request)

  const allContent = [url, userAgent, referer].join(' ')
  const detectedThreats = []

  // Check each threat category
  Object.entries(ADVANCED_THREAT_PATTERNS).forEach(([category, patterns]) => {
    patterns.forEach(pattern => {
      if (pattern.test(allContent)) {
        detectedThreats.push({
          type: category,
          pattern: pattern.source,
          match: allContent.match(pattern)?.[0],
          severity: getThreatSeverity(category)
        })
      }
    })
  })

  if (detectedThreats.length === 0) {
    return {
      isThreat: false,
      threatType: '',
      severity: 'low',
      details: null,
      patterns: []
    }
  }

  // Determine highest severity
  const highestSeverity = detectedThreats.reduce((prev, current) => {
    const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 }
    return severityOrder[current.severity] > severityOrder[prev.severity] ? current : prev
  })

  return {
    isThreat: true,
    threatType: highestSeverity.type,
    severity: highestSeverity.severity,
    details: {
      ip,
      url,
      userAgent,
      detectedThreats: detectedThreats.length,
      matches: detectedThreats.map(t => ({ type: t.type, match: t.match }))
    },
    patterns: detectedThreats.map(t => t.pattern)
  }
}

function getThreatSeverity(threatType: string): 'low' | 'medium' | 'high' | 'critical' {
  const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
    'SQL_INJECTION': 'critical',
    'XSS': 'high',
    'COMMAND_INJECTION': 'critical',
    'PATH_TRAVERSAL': 'high',
    'NOSQL_INJECTION': 'high',
    'LDAP_INJECTION': 'medium',
    'XXE': 'high',
    'SSRF': 'high',
    'FILE_INCLUSION': 'high',
    'CRYPTO_ATTACKS': 'medium'
  }

  return severityMap[threatType] || 'low'
}

// Advanced rate limiting with IP reputation
export function createAdvancedRateLimit(endpoint: string) {
  const config = ADVANCED_RATE_LIMITS[endpoint] || ADVANCED_RATE_LIMITS['default']
  const store = new Map<string, any>()

  return async function advancedRateLimit(request: NextRequest) {
    const ip = getClientIP(request)
    const now = Date.now()

    // Check IP reputation
    const reputation = getIPReputation(ip)
    if (reputation.blocked && now < reputation.blockExpiry) {
      return {
        success: false,
        error: 'IP address temporarily blocked due to repeated violations',
        statusCode: 403,
        retryAfter: Math.ceil((reputation.blockExpiry - now) / 1000),
        blocked: true
      }
    }

    // Calculate adjusted limit based on reputation
    const adjustedLimit = Math.max(1, Math.floor(config.baseLimit / (reputation.score + 1)))
    const adjustedWindow = Math.min(config.maxPenaltyWindow, config.baseWindow * Math.pow(config.penaltyMultiplier, reputation.violations))

    const key = `${endpoint}:${ip}`
    const current = store.get(key) || { count: 0, resetTime: now + adjustedWindow, violations: 0 }

    // Reset if window expired
    if (now > current.resetTime) {
      current.count = 0
      current.resetTime = now + adjustedWindow
    }

    current.count++
    store.set(key, current)

    // Check if limit exceeded
    if (current.count > adjustedLimit) {
      current.violations++
      updateIPReputation(ip, current.violations)

      await logSecurityEvent({
        type: SECURITY_EVENTS.RATE_LIMIT_EXCEEDED,
        ip,
        url: request.url,
        userAgent: request.headers.get('user-agent'),
        method: request.method,
        count: current.count,
        limit: adjustedLimit,
        window: adjustedWindow,
        reputationScore: reputation.score,
        endpoint
      })

      return {
        success: false,
        error: 'Rate limit exceeded',
        statusCode: 429,
        retryAfter: Math.ceil((current.resetTime - now) / 1000),
        remaining: 0,
        resetTime: current.resetTime
      }
    }

    return {
      success: true,
      remaining: Math.max(0, adjustedLimit - current.count),
      resetTime: current.resetTime,
      limit: adjustedLimit,
      reputationScore: reputation.score
    }
  }
}

function getIPReputation(ip: string): IPReputation {
  const existing = ipReputationStore.get(ip)
  if (existing) {
    return existing
  }

  const reputation: IPReputation = {
    score: 0,
    violations: 0,
    lastViolation: 0,
    blocked: false,
    blockExpiry: 0
  }

  ipReputationStore.set(ip, reputation)
  return reputation
}

function updateIPReputation(ip: string, violations: number) {
  const reputation = getIPReputation(ip)
  reputation.violations = violations
  reputation.lastViolation = Date.now()
  reputation.score = Math.min(10, Math.floor(violations / 3))

  // Block IP if too many violations
  if (violations >= 5) {
    reputation.blocked = true
    reputation.blockExpiry = Date.now() + (60 * 60 * 1000) // 1 hour block
  }

  ipReputationStore.set(ip, reputation)
}

// Advanced request validation
export function validateAdvancedRequest(request: NextRequest): {
  valid: boolean
  reason?: string
  threat?: any
} {
  // Basic validation first
  const basicValidation = validateRequest(request)
  if (!basicValidation.valid) {
    return basicValidation
  }

  // Advanced threat detection
  const threatDetection = detectAdvancedThreats(request)
  if (threatDetection.isThreat) {
    return {
      valid: false,
      reason: `Advanced threat detected: ${threatDetection.threatType}`,
      threat: threatDetection
    }
  }

  // Check for suspicious headers
  const suspiciousHeaders = detectSuspiciousHeaders(request)
  if (suspiciousHeaders.length > 0) {
    return {
      valid: false,
      reason: 'Suspicious headers detected',
      threat: { type: 'SUSPICIOUS_HEADERS', headers: suspiciousHeaders }
    }
  }

  return { valid: true }
}

function detectSuspiciousHeaders(request: NextRequest): string[] {
  const suspiciousHeaders = []
  const headers = request.headers

  // Check for unusually long headers
  headers.forEach((value, name) => {
    if (value.length > 1000) {
      suspiciousHeaders.push(`${name}: unusually long header value`)
    }
  })

  // Check for known malicious headers
  const maliciousHeaders = [
    'x-forwarded-host',
    'x-originating-ip',
    'x-real-ip',
    'x-cluster-client-ip'
  ]

  maliciousHeaders.forEach(header => {
    if (headers.get(header) && headers.get(header) !== getClientIP(request)) {
      suspiciousHeaders.push(`${header}: IP spoofing attempt`)
    }
  })

  return suspiciousHeaders
}

// Enhanced security event logging
export async function logAdvancedSecurityEvent(eventData: any) {
  const enhancedEvent = {
    ...eventData,
    timestamp: new Date().toISOString(),
    eventId: `sec_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`,
    serverInfo: {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    }
  }

  // Log to console with structured format
  console.error('🚨 ADVANCED SECURITY EVENT:', JSON.stringify(enhancedEvent, null, 2))

  // In production, integrate with external monitoring
  if (process.env.NODE_ENV === 'production') {
    // Send to monitoring service (Sentry, Datadog, etc.)
    // Store in security database
    // Send alerts to security team
  }

  return enhancedEvent
}

// Security health check
export function performSecurityHealthCheck(): {
  status: 'healthy' | 'warning' | 'critical'
  issues: string[]
  recommendations: string[]
  metrics: any
} {
  const issues = []
  const recommendations = []
  const metrics = {
    blockedIPs: 0,
    totalViolations: 0,
    averageReputationScore: 0,
    highRiskIPs: 0
  }

  // Analyze IP reputation data
  let totalScore = 0
  let ipCount = 0

  ipReputationStore.forEach((reputation, ip) => {
    ipCount++
    totalScore += reputation.score
    metrics.totalViolations += reputation.violations

    if (reputation.blocked) {
      metrics.blockedIPs++
    }

    if (reputation.score >= 5) {
      metrics.highRiskIPs++
      issues.push(`High-risk IP detected: ${ip} (score: ${reputation.score})`)
    }
  })

  metrics.averageReputationScore = ipCount > 0 ? totalScore / ipCount : 0

  // Determine overall status
  let status: 'healthy' | 'warning' | 'critical' = 'healthy'

  if (metrics.blockedIPs > 10 || metrics.highRiskIPs > 5) {
    status = 'critical'
    recommendations.push('Consider implementing additional IP blocking measures')
  } else if (metrics.blockedIPs > 5 || metrics.highRiskIPs > 2) {
    status = 'warning'
    recommendations.push('Monitor IP reputation trends closely')
  }

  if (metrics.averageReputationScore > 3) {
    status = 'critical'
    recommendations.push('High average IP reputation score indicates widespread abuse')
  }

  // General recommendations
  if (ipCount > 1000) {
    recommendations.push('Consider implementing IP reputation cleanup for old entries')
  }

  return {
    status,
    issues,
    recommendations,
    metrics
  }
}

// Re-export from original security module
export {
  getClientIP,
  validateRequest,
  logSecurityEvent,
  SECURITY_EVENTS,
  RATE_LIMITS
} from './security'