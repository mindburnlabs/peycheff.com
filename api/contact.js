const { validateEmailConfig, sendEmail, EMAIL_TEMPLATES } = require('./lib/email-service');

// Enable CORS for all routes
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

export default async function handler(req, res) {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).setHeaders(corsHeaders).end('');
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).setHeaders(corsHeaders).json({
      success: false,
      error: 'Method not allowed. Use POST.'
    });
    return;
  }

  try {
    const { name, email, company, message, goal } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      res.status(400).setHeaders(corsHeaders).json({
        success: false,
        error: 'Name, email, and message are required fields.'
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).setHeaders(corsHeaders).json({
        success: false,
        error: 'Please provide a valid email address.'
      });
      return;
    }

    // Check email configuration
    const emailConfig = validateEmailConfig();
    if (!emailConfig.valid) {
      console.error('Email configuration error:', emailConfig.error);
      res.status(500).setHeaders(corsHeaders).json({
        success: false,
        error: 'Email service not configured. Please contact support.'
      });
      return;
    }

    // Send notification email to Ivan
    const notificationData = {
      name,
      email,
      company: company || 'Not provided',
      message,
      goal: goal || 'Not provided',
      timestamp: new Date().toISOString()
    };

    const notificationResult = await sendEmail(
      process.env.CONTACT_EMAIL || 'ivan@peycheff.com',
      EMAIL_TEMPLATES.CONTACT_NOTIFICATION.subject(notificationData.name),
      EMAIL_TEMPLATES.CONTACT_NOTIFICATION.html(notificationData)
    );

    if (!notificationResult.success) {
      console.error('Failed to send notification email:', notificationResult.error);
      res.status(500).setHeaders(corsHeaders).json({
        success: false,
        error: 'Failed to send notification. Please try again later.'
      });
      return;
    }

    // Send confirmation email to the sender
    const confirmationData = {
      name: notificationData.name,
      email: notificationData.email
    };

    const confirmationResult = await sendEmail(
      notificationData.email,
      EMAIL_TEMPLATES.CONTACT_CONFIRMATION.subject,
      EMAIL_TEMPLATES.CONTACT_CONFIRMATION.html(confirmationData)
    );

    // Note: We don't fail the request if confirmation email fails
    if (!confirmationResult.success) {
      console.error('Failed to send confirmation email:', confirmationResult.error);
    }

    // Log the inquiry for analytics
    console.log(`New contact inquiry from ${notificationData.email} (${notificationData.company})`);

    res.status(200).setHeaders(corsHeaders).json({
      success: true,
      message: 'Your message has been sent successfully! I\'ll get back to you within 24 hours.',
      inquiryId: Date.now().toString()
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).setHeaders(corsHeaders).json({
      success: false,
      error: 'An unexpected error occurred. Please try again later.'
    });
  }
}