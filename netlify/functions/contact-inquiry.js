const { validateEmailConfig, sendEmail, EMAIL_TEMPLATES } = require('./lib/email-service');

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Method not allowed. Use POST.' 
      })
    };
  }

  try {
    // Validate email configuration
    validateEmailConfig();

    // Parse request body
    const inquiry = JSON.parse(event.body);

    // Validate required fields
    const requiredFields = ['name', 'email', 'linkedin', 'problem', 'timeline', 'budget'];
    const missingFields = requiredFields.filter(field => !inquiry[field]);
    
    if (missingFields.length > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`
        })
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inquiry.email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Invalid email format'
        })
      };
    }

    // Validate LinkedIn URL format
    if (!inquiry.linkedin.includes('linkedin.com')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Please provide a valid LinkedIn profile URL'
        })
      };
    }

    // Send notification email to Ivan
    const notificationTemplate = EMAIL_TEMPLATES.CONTACT_INQUIRY;
    const notificationResult = await sendEmail({
      to: notificationTemplate.to,
      subject: notificationTemplate.subject(inquiry),
      html: notificationTemplate.html(inquiry),
      replyTo: inquiry.email
    });

    if (!notificationResult.success) {
      throw new Error(`Failed to send notification email: ${notificationResult.error}`);
    }

    // Send confirmation email to inquirer
    const confirmationTemplate = EMAIL_TEMPLATES.CONTACT_CONFIRMATION;
    const confirmationResult = await sendEmail({
      to: inquiry.email,
      subject: confirmationTemplate.subject,
      html: confirmationTemplate.html(inquiry),
      replyTo: 'ivan@peycheff.com'
    });

    if (!confirmationResult.success) {
      // Log warning but don't fail the request if confirmation email fails
      console.warn('Failed to send confirmation email:', confirmationResult.error);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Inquiry submitted successfully',
        data: {
          notification_sent: notificationResult.success,
          confirmation_sent: confirmationResult.success,
          inquiry_id: notificationResult.data?.id || null
        }
      })
    };

  } catch (error) {
    console.error('Contact inquiry function error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error. Please try again or email ivan@peycheff.com directly.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};
