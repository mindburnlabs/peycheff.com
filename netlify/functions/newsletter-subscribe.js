import { createClient } from '@supabase/supabase-js';
import { validateEmailConfig, sendEmail, EMAIL_TEMPLATES } from './lib/email-service.js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const handler = async (event, context) => {
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
    // Validate configurations
    validateEmailConfig();
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration is missing');
    }

    // Parse request body
    const { email, source = 'website' } = JSON.parse(event.body);

    // Validate required fields
    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Email address is required'
        })
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Invalid email format'
        })
      };
    }

    // Check if email already exists
    const { data: existingSubscriber, error: checkError } = await supabase
      .from('subscribers')
      .select('email, status')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Database error: ${checkError.message}`);
    }

    let isNewSubscriber = !existingSubscriber;
    let subscriberData = existingSubscriber;

    if (existingSubscriber) {
      // If subscriber exists but is inactive, reactivate them
      if (existingSubscriber.status !== 'active') {
        const { data: updatedData, error: updateError } = await supabase
          .from('subscribers')
          .update({ 
            status: 'active',
            subscribed_at: new Date().toISOString()
          })
          .eq('email', email)
          .select()
          .single();

        if (updateError) {
          throw new Error(`Failed to reactivate subscriber: ${updateError.message}`);
        }
        
        subscriberData = updatedData;
        isNewSubscriber = true; // Treat as new for welcome email
      }
    } else {
      // Add new subscriber
      const { data: newData, error: insertError } = await supabase
        .from('subscribers')
        .insert([
          {
            email,
            source,
            status: 'active',
            subscribed_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (insertError) {
        // Handle duplicate email constraint error gracefully
        if (insertError.code === '23505') {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              message: 'Already subscribed',
              data: {
                email,
                status: 'already_subscribed',
                welcome_sent: false
              }
            })
          };
        }
        throw new Error(`Failed to add subscriber: ${insertError.message}`);
      }
      
      subscriberData = newData;
    }

    // Send welcome email for new or reactivated subscribers
    let welcomeEmailResult = { success: false };
    if (isNewSubscriber) {
      const welcomeTemplate = EMAIL_TEMPLATES.NEWSLETTER_WELCOME;
      welcomeEmailResult = await sendEmail({
        to: email,
        subject: welcomeTemplate.subject,
        html: welcomeTemplate.html({ email }),
        replyTo: 'ivan@peycheff.com'
      });

      if (!welcomeEmailResult.success) {
        console.warn('Failed to send welcome email:', welcomeEmailResult.error);
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: isNewSubscriber ? 'Successfully subscribed!' : 'Already subscribed',
        data: {
          email,
          status: isNewSubscriber ? 'subscribed' : 'already_subscribed',
          welcome_sent: welcomeEmailResult.success,
          subscriber_id: subscriberData.id
        }
      })
    };

  } catch (error) {
    console.error('Newsletter subscription function error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to process subscription. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};
