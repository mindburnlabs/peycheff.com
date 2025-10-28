import { NextRequest, NextResponse } from 'next/server'
import { getClientIP, validateRequest, logSecurityEvent, SECURITY_EVENTS } from '@/lib/security'

// Content Security Policy violation report schema
const cspReportSchema = {
  'csp-report': {
    'document-uri': 'string',
    'referrer': 'string',
    'violated-directive': 'string',
    'effective-directive': 'string',
    'original-policy': 'string',
    'disposition': 'string',
    'blocked-uri': 'string',
    'line-number': 'number',
    'column-number': 'number',
    'source-file': 'string',
    'status-code': 'number',
    'script-sample': 'string'
  }
}

// Network Error Logging schema
const nelSchema = {
  'type': 'string',
  'url': 'string',
  'user_agent': 'string',
  'age': 'number',
  'server_ip': 'string',
  'protocol': 'string',
  'method': 'string',
  'status_code': 'number',
  'elapsed_time': 'number',
  'client_address': 'string',
  'event_type': 'string',
  'phase': 'string'
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || ''

    // Basic request validation
    const validation = validateRequest(request)
    if (!validation.valid) {
      await logSecurityEvent({
        type: SECURITY_EVENTS.SUSPICIOUS_REQUEST,
        ip,
        url: request.url,
        userAgent,
        method: request.method,
        reason: validation.reason
      })

      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }

    const contentType = request.headers.get('content-type')

    // Handle CSP Violation Reports
    if (contentType?.includes('application/csp-report')) {
      const body = await request.text()

      try {
        const report = JSON.parse(body)

        if (!report['csp-report']) {
          return NextResponse.json(
            { error: 'Invalid CSP report format' },
            { status: 400 }
          )
        }

        const cspReport = report['csp-report']

        // Log CSP violation as security event
        await logSecurityEvent({
          type: 'csp_violation',
          ip,
          url: request.url,
          userAgent,
          method: request.method,
          details: {
            documentUri: cspReport['document-uri'],
            violatedDirective: cspReport['violated-directive'],
            blockedUri: cspReport['blocked-uri'],
            originalPolicy: cspReport['original-policy'],
            sourceFile: cspReport['source-file'],
            lineNumber: cspReport['line-number'],
            columnNumber: cspReport['column-number'],
            scriptSample: cspReport['script-sample']
          }
        })

        console.warn('🚨 CSP Violation Report:', {
          ip,
          documentUri: cspReport['document-uri'],
          violatedDirective: cspReport['violated-directive'],
          blockedUri: cspReport['blocked-uri'],
          timestamp: new Date().toISOString()
        })

        return NextResponse.json({ success: true })

      } catch (parseError) {
        console.error('CSP report parse error:', parseError)
        return NextResponse.json(
          { error: 'Invalid JSON in CSP report' },
          { status: 400 }
        )
      }
    }

    // Handle Network Error Logging reports
    if (contentType?.includes('application/reports+json')) {
      const body = await request.text()

      try {
        const reports = JSON.parse(body)

        if (!Array.isArray(reports)) {
          return NextResponse.json(
            { error: 'Invalid report format' },
            { status: 400 }
          )
        }

        // Process each report
        for (const report of reports) {
          if (report.type === 'network-error') {
            await logSecurityEvent({
              type: 'network_error',
              ip,
              url: request.url,
              userAgent,
              method: request.method,
              details: {
                reportType: report.type,
                reportUrl: report.url,
                reportMethod: report.method,
                reportStatus: report.status_code,
                reportAge: report.age,
                reportPhase: report.phase
              }
            })

            console.warn('🚨 Network Error Report:', {
              ip,
              type: report.type,
              url: report.url,
              method: report.method,
              status: report.status_code,
              timestamp: new Date().toISOString()
            })
          }
        }

        return NextResponse.json({ success: true })

      } catch (parseError) {
        console.error('Network report parse error:', parseError)
        return NextResponse.json(
          { error: 'Invalid JSON in network report' },
          { status: 400 }
        )
      }
    }

    // Handle generic security reports
    const body = await request.json()

    // Validate report structure
    if (!body.type || !body.details) {
      return NextResponse.json(
        { error: 'Missing required report fields' },
        { status: 400 }
      )
    }

    // Log the security report
    await logSecurityEvent({
      type: 'security_report',
      ip,
      url: request.url,
      userAgent,
      method: request.method,
      details: {
        reportType: body.type,
        reportDetails: body.details,
        reportSeverity: body.severity || 'medium',
        reportSource: body.source || 'client'
      }
    })

    console.info('📊 Security Report Received:', {
      ip,
      type: body.type,
      severity: body.severity || 'medium',
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Security report received and processed',
      reportId: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    })

  } catch (error) {
    console.error('Security report processing error:', error)

    await logSecurityEvent({
      type: SECURITY_EVENTS.SUSPICIOUS_REQUEST,
      ip: getClientIP(request),
      url: request.url,
      userAgent: request.headers.get('user-agent') || '',
      method: request.method,
      reason: 'Report processing error',
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json(
      { error: 'Failed to process security report' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIP(request)

    // Validate request for security threats
    const validation = validateRequest(request)
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid request', reason: validation.reason },
        { status: 400 }
      )
    }

    // Return information about supported report types
    return NextResponse.json({
      endpoint: '/api/security/reports',
      supportedTypes: [
        {
          type: 'csp-violation',
          contentType: 'application/csp-report',
          description: 'Content Security Policy violation reports'
        },
        {
          type: 'network-error',
          contentType: 'application/reports+json',
          description: 'Network Error Logging reports'
        },
        {
          type: 'security-report',
          contentType: 'application/json',
          description: 'Generic security reports',
          schema: {
            type: 'string (required)',
            severity: 'string (low|medium|high|critical, optional)',
            source: 'string (optional)',
            details: 'object (required)'
          }
        }
      ],
      usage: {
        'CSP Reports': 'POST with Content-Type: application/csp-report',
        'Network Reports': 'POST with Content-Type: application/reports+json',
        'Security Reports': 'POST with Content-Type: application/json'
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Security report info error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve report information' },
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
      'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400', // 24 hours
      'Vary': 'Origin'
    },
  })
}