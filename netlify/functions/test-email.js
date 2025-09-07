const { emailService, validateEmailConfig } = require('./lib/email-service');

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Simple admin check
  const adminKey = event.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_KEY) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  try {
    // Validate email configuration
    validateEmailConfig();

    const { email, type = 'newsletter' } = JSON.parse(event.body || '{}');
    
    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email address is required' })
      };
    }

    let result;

    switch (type) {
      case 'newsletter':
        result = await emailService.sendNewsletterWelcome(email);
        break;
      
      case 'test':
        result = await emailService.sendTestEmail(email);
        break;
      
      case 'purchase':
        const testPurchaseData = {
          customer_name: 'Test Customer',
          product_name: 'Test Product',
          product_price: '$99',
          product_description: 'This is a test purchase confirmation',
          order_id: 'test_' + Date.now(),
          amount: 9900,
          session_id: 'test_session_' + Date.now(),
          product_type: 'digital'
        };
        result = await emailService.sendPurchaseConfirmation(email, testPurchaseData);
        break;
      
      case 'booking':
        const testBookingData = {
          customer_name: 'Test Customer',
          service_type: 'CALL_60',
          start_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // 1 hour later
          notes: 'This is a test booking confirmation'
        };
        result = await emailService.sendBookingConfirmation(email, testBookingData);
        break;
      
      case 'contact':
        const testInquiryData = {
          name: 'Test User',
          email: email,
          linkedin: 'https://linkedin.com/in/testuser',
          company: 'Test Company',
          problem: 'This is a test contact form submission',
          timeline: '1 month',
          budget: '$5k - $25k'
        };
        
        // Send both notification and confirmation
        const notificationResult = await emailService.sendContactNotification(testInquiryData);
        const confirmationResult = await emailService.sendContactConfirmation(email, testInquiryData);
        
        result = {
          notification: notificationResult,
          confirmation: confirmationResult
        };
        break;
      
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: 'Invalid email type. Supported types: newsletter, test, purchase, booking, contact'
          })
        };
    }

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        type,
        result,
        message: `Test ${type} email sent to ${email}`
      })
    };

  } catch (error) {
    console.error('Test email error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        message: 'Failed to send test email'
      })
    };
  }
};
