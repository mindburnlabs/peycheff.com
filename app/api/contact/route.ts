import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'
import { createRateLimit, getClientIP, validateRequest, validateWebhookSignature, RATE_LIMITS } from '@/lib/security'

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY || 'test_key')

// Initialize rate limiting
const rateLimiter = createRateLimit(RATE_LIMITS['/api/contact'])

// Email validation schema
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please provide a valid email address'),
  company: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  goal: z.string().optional(),
})

// Email templates
const EMAIL_TEMPLATES = {
  CONTACT_NOTIFICATION: {
    subject: (name: string) => `New Contact Inquiry from ${name}`,
    html: (data: any) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0A84FF 0%, #007AFF 100%); padding: 30px; border-radius: 12px; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">New Contact Inquiry</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">peycheff.com</p>
        </div>

        <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">Contact Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-weight: 500; width: 100px;">Name:</td>
              <td style="padding: 8px 0; color: #1a1a1a; font-weight: 600;">${data.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Email:</td>
              <td style="padding: 8px 0;">
                <a href="mailto:${data.email}" style="color: #0A84FF; text-decoration: none;">${data.email}</a>
              </td>
            </tr>
            ${data.company ? `
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Company:</td>
              <td style="padding: 8px 0; color: #1a1a1a;">${data.company}</td>
            </tr>
            ` : ''}
            ${data.goal ? `
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Goal:</td>
              <td style="padding: 8px 0; color: #1a1a1a;">${data.goal}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <div style="background: white; padding: 25px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #1a1a1a; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Message</h2>
          <p style="color: #374151; line-height: 1.6; margin: 0; white-space: pre-wrap;">${data.message}</p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="mailto:${data.email}?subject=Re: Your inquiry"
             style="background: #0A84FF; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
            Reply to ${data.name}
          </a>
        </div>

        <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 14px;">
          <p>Received at ${new Date().toLocaleString('en-US', {
            timeZone: 'America/New_York',
            dateStyle: 'full',
            timeStyle: 'short'
          })}</p>
        </div>
      </div>
    `
  },

  CONTACT_CONFIRMATION: {
    subject: "Thanks for reaching out - I'll reply within 24 hours",
    html: (data: any) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0A84FF 0%, #007AFF 100%); padding: 30px; border-radius: 12px; margin-bottom: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Thanks, ${data.name}!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 15px 0 0 0; font-size: 18px;">I'll review your message and reply within 24 hours.</p>
        </div>

        <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #1a1a1a; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">What I received:</h2>
          <div style="background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #0A84FF;">
            <p style="color: #374151; line-height: 1.6; margin: 0; font-style: italic;">"${data.message.length > 200 ? data.message.substring(0, 200) + '...' : data.message}"</p>
          </div>
          ${data.goal || data.company ? `
          <div style="margin-top: 15px; font-size: 14px; color: #6b7280;">
            ${data.company ? `<strong>Company:</strong> ${data.company}` : ''}
            ${data.company && data.goal ? ' • ' : ''}
            ${data.goal ? `<strong>Goal:</strong> ${data.goal}` : ''}
          </div>
          ` : ''}
        </div>

        <div style="background: white; padding: 25px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #1a1a1a; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">What happens next?</h2>
          <ul style="color: #374151; line-height: 1.6; margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;">I'll review your inquiry and research your background</li>
            <li style="margin-bottom: 8px;">If it's a good fit, I'll reply with next steps within 24 hours</li>
            <li style="margin-bottom: 8px;">For complex projects, I might suggest a quick call to clarify details</li>
            <li>All initial conversations are free - no commitment required</li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 30px; color: #6b7280;">
          <p style="margin: 0 0 10px 0;">Need to add something? Just reply to this email.</p>
          <p style="margin: 0; font-size: 14px;">
            Ivan Peycheff<br>
            <a href="mailto:ivan@peycheff.com" style="color: #0A84FF; text-decoration: none;">ivan@peycheff.com</a>
          </p>
        </div>
      </div>
    `
  }
}

// Helper function to send email
const sendEmail = async (emailData: {
  to: string
  subject: string
  html: string
  replyTo?: string
}) => {
  try {
    const data = await resend.emails.send({
      from: 'Ivan Peycheff <ivan@peycheff.com>',
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      replyTo: emailData.replyTo || 'ivan@peycheff.com',
    })

    console.log('Email sent successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error: (error as Error).message }
  }
}

// Handle POST requests
export async function POST(request: NextRequest) {
  try {
    // Get client IP
    const ip = getClientIP(request)

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
    const rateLimitResult = await rateLimiter(request)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
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

    const body = await request.json()

    // Enhanced input validation
    const validatedData = contactSchema.parse(body)

    // Additional security checks on input
    const suspiciousInputs = []

    // Check for suspicious patterns in name
    if (/<script|javascript:|onload=|onerror=/i.test(validatedData.name)) {
      suspiciousInputs.push('name contains suspicious content')
    }

    // Check for suspicious patterns in message
    if (/(<script|javascript:|onload=|onerror=|base64_encode|eval|exec|system)/i.test(validatedData.message)) {
      suspiciousInputs.push('message contains suspicious content')
    }

    // Check for excessive length (potential DoS)
    if (validatedData.message.length > 5000) {
      suspiciousInputs.push('message too long')
    }

    if (suspiciousInputs.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input detected',
          reasons: suspiciousInputs
        },
        { status: 400 }
      )
    }

    // Check email configuration
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY environment variable is required')
      return NextResponse.json(
        {
          success: false,
          error: 'Email service not configured. Please contact support.'
        },
        { status: 500 }
      )
    }

    // Send notification email to Ivan
    const notificationResult = await sendEmail({
      to: process.env.CONTACT_EMAIL || 'ivan@peycheff.com',
      subject: EMAIL_TEMPLATES.CONTACT_NOTIFICATION.subject(validatedData.name),
      html: EMAIL_TEMPLATES.CONTACT_NOTIFICATION.html(validatedData),
      replyTo: validatedData.email
    })

    if (!notificationResult.success) {
      console.error('Failed to send notification email:', notificationResult.error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send notification. Please try again later.'
        },
        { status: 500 }
      )
    }

    // Send confirmation email to the sender
    const confirmationResult = await sendEmail({
      to: validatedData.email,
      subject: EMAIL_TEMPLATES.CONTACT_CONFIRMATION.subject,
      html: EMAIL_TEMPLATES.CONTACT_CONFIRMATION.html(validatedData)
    })

    // Note: We don't fail the request if confirmation email fails
    if (!confirmationResult.success) {
      console.error('Failed to send confirmation email:', confirmationResult.error)
    }

    // Log the inquiry for analytics
    console.log(`New contact inquiry from ${validatedData.email} (${validatedData.company || 'Individual'})`)

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully! I\'ll get back to you within 24 hours.',
      inquiryId: Date.now().toString()
    }, {
      headers: {
        'X-RateLimit-Remaining': rateLimitResult.remaining?.toString() || '0',
        'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY'
      }
    })

  } catch (error) {
    console.error('Contact form error:', error)

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
        error: 'An unexpected error occurred. Please try again later.'
      },
      { status: 500 }
    )
  }
}

// Handle OPTIONS requests for CORS
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400', // 24 hours
      'Vary': 'Origin'
    },
  })
}