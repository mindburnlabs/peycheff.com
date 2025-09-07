const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const { Resend } = require('resend');

// Initialize services
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

// Trial configuration
const TRIAL_CONFIG = {
  duration_days: 7,
  usage_limit: 10,
  sku: 'UTILITY_PASS_TRIAL'
};

// SHA-256 email hashing for privacy
const hashEmail = (email) => {
  return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
};

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { email, source = 'website' } = JSON.parse(event.body || '{}');

    // Validate email
    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email is required' })
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid email format' })
      };
    }

    const hashedEmail = hashEmail(email);

    // Check if user already has an active trial
    const existingTrial = await checkExistingTrial(hashedEmail);
    if (existingTrial.exists) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({
          error: 'Trial already exists',
          message: 'You already have an active or expired trial for this email.',
          trial: existingTrial.trial
        })
      };
    }

    // Create trial entitlement
    const trial = await createTrialEntitlement(hashedEmail, email, source);
    
    // Send welcome email
    await sendTrialWelcomeEmail(email, trial);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Trial activated successfully',
        data: {
          trial_id: trial.id,
          expires_at: trial.expires_at,
          usage_limit: TRIAL_CONFIG.usage_limit,
          usage_remaining: TRIAL_CONFIG.usage_limit
        }
      })
    };

  } catch (error) {
    console.error('Trial signup error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to activate trial. Please try again.'
      })
    };
  }
};

// Check for existing trials
const checkExistingTrial = async (hashedEmail) => {
  try {
    const { data: trials, error } = await supabase
      .from('trial_entitlements')
      .select('*')
      .eq('email', hashedEmail)
      .eq('sku', TRIAL_CONFIG.sku)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;
    
    return {
      exists: trials && trials.length > 0,
      trial: trials?.[0] || null
    };
  } catch (error) {
    console.error('Error checking existing trial:', error);
    return { exists: false, trial: null };
  }
};

// Create trial entitlement record
const createTrialEntitlement = async (hashedEmail, originalEmail, source) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + TRIAL_CONFIG.duration_days);

  const { data: trial, error } = await supabase
    .from('trial_entitlements')
    .insert([{
      email: hashedEmail,
      original_email: originalEmail, // Store for email purposes only
      sku: TRIAL_CONFIG.sku,
      status: 'active',
      usage_limit: TRIAL_CONFIG.usage_limit,
      usage_count: 0,
      expires_at: expiresAt.toISOString(),
      source: source,
      trial_token: crypto.randomUUID()
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating trial entitlement:', error);
    throw new Error('Failed to create trial entitlement');
  }

  return trial;
};

// Send trial welcome email
const sendTrialWelcomeEmail = async (email, trial) => {
  const welcomeHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #0A84FF 0%, #007AFF 100%); padding: 30px; border-radius: 12px; margin-bottom: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">🚀 Your Utility Pass Trial is Live!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 15px 0 0 0; font-size: 18px;">7 days of unlimited automation access</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
        <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">What's included in your trial:</h2>
        
        <div style="display: flex; align-items: flex-start; margin-bottom: 20px;">
          <div style="background: #0A84FF; width: 6px; height: 6px; border-radius: 50%; margin: 8px 15px 0 0; flex-shrink: 0;"></div>
          <div>
            <h3 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">${TRIAL_CONFIG.usage_limit} utility runs included</h3>
            <p style="margin: 0; color: #6b7280; line-height: 1.5;">Sprint generators, audit tools, framework builders, and more.</p>
          </div>
        </div>
        
        <div style="display: flex; align-items: flex-start; margin-bottom: 20px;">
          <div style="background: #0A84FF; width: 6px; height: 6px; border-radius: 50%; margin: 8px 15px 0 0; flex-shrink: 0;"></div>
          <div>
            <h3 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">Access to all automation tools</h3>
            <p style="margin: 0; color: #6b7280; line-height: 1.5;">Full suite of productivity utilities and generators.</p>
          </div>
        </div>
        
        <div style="display: flex; align-items: flex-start;">
          <div style="background: #0A84FF; width: 6px; height: 6px; border-radius: 50%; margin: 8px 15px 0 0; flex-shrink: 0;"></div>
          <div>
            <h3 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">No commitment required</h3>
            <p style="margin: 0; color: #6b7280; line-height: 1.5;">Cancel anytime. No credit card required.</p>
          </div>
        </div>
      </div>
      
      <div style="background: white; padding: 25px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 25px;">
        <h2 style="color: #1a1a1a; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Quick Start Guide</h2>
        <ol style="color: #374151; line-height: 1.6; margin: 0; padding-left: 20px;">
          <li style="margin-bottom: 8px;">Visit <a href="https://peycheff.com/utilities" style="color: #0A84FF;">peycheff.com/utilities</a></li>
          <li style="margin-bottom: 8px;">Enter your email to access the tools</li>
          <li style="margin-bottom: 8px;">Choose from sprint generators, audit tools, or custom builders</li>
          <li>Generate personalized frameworks in seconds</li>
        </ol>
      </div>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="https://peycheff.com/utilities?trial=${trial.trial_token}" 
           style="background: #0A84FF; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
          Start Using Your Trial
        </a>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
        <p style="margin: 0 0 10px 0;">Trial expires on ${new Date(trial.expires_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p style="margin: 0;">Questions? Just reply to this email.</p>
        <p style="margin: 15px 0 0 0;">
          Ivan Peycheff • <a href="https://peycheff.com" style="color: #0A84FF; text-decoration: none;">peycheff.com</a>
        </p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: 'Ivan Peycheff <ivan@peycheff.com>',
      to: email,
      subject: '🚀 Your Utility Pass trial is ready!',
      html: welcomeHtml
    });
  } catch (error) {
    console.error('Failed to send trial welcome email:', error);
    // Don't fail the trial creation if email fails
  }
};
