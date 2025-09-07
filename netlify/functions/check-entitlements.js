const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// SHA-256 email hashing for privacy
const hashEmail = (email) => {
  return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
};

// Check member entitlements for a specific action
const checkMemberEntitlements = async (email, action) => {
  const hashedEmail = hashEmail(email);

  try {
    // Get active entitlements using the view
    const { data: entitlement, error } = await supabase
      .from('active_member_entitlements')
      .select('*')
      .eq('email', hashedEmail)
      .single();

    if (error || !entitlement) {
      return {
        allowed: false,
        reason: 'no_membership',
        message: 'No active membership found. Upgrade to Build Notes Pro for unlimited access.',
        upgradeUrl: '/checkout?product=MEMBER_PRO'
      };
    }

    // Check specific action entitlements
    switch (action) {
      case 'regenerate_sprint':
        return checkRegenEntitlement(entitlement);
      case 'pro_utility':
        return checkProUtilityEntitlement(entitlement);
      default:
        return { allowed: false, reason: 'invalid_action' };
    }

  } catch (error) {
    console.error('Error checking entitlements:', error);
    return {
      allowed: false,
      reason: 'error',
      message: 'Unable to verify membership. Please try again.'
    };
  }
};

const checkRegenEntitlement = (entitlement) => {
  // Pro members get unlimited regenerations (day-throttled)
  if (entitlement.membership_type === 'MEMBER_PRO' && entitlement.unlimited_regens) {
    const dailyLimit = 10; // Reasonable daily limit to prevent abuse
    
    if (entitlement.regens_used_today >= dailyLimit) {
      return {
        allowed: false,
        reason: 'daily_limit_exceeded',
        message: `Daily regeneration limit reached (${dailyLimit}/day). Limit resets at midnight.`,
        resetTime: getNextMidnight()
      };
    }

    return {
      allowed: true,
      remaining: dailyLimit - entitlement.regens_used_today,
      resetTime: getNextMidnight()
    };
  }

  // Regular members don't get unlimited regens
  return {
    allowed: false,
    reason: 'upgrade_required',
    message: 'Unlimited regenerations require Build Notes Pro membership.',
    upgradeUrl: '/checkout?product=MEMBER_PRO'
  };
};

const checkProUtilityEntitlement = (entitlement) => {
  if (entitlement.membership_type === 'MEMBER_PRO' && entitlement.pro_utilities_access) {
    const dailyLimit = 25; // Pro utility daily limit
    
    if (entitlement.utilities_used_today >= dailyLimit) {
      return {
        allowed: false,
        reason: 'daily_limit_exceeded',
        message: `Daily Pro utility limit reached (${dailyLimit}/day). Limit resets at midnight.`,
        resetTime: getNextMidnight()
      };
    }

    return {
      allowed: true,
      remaining: dailyLimit - entitlement.utilities_used_today,
      resetTime: getNextMidnight()
    };
  }

  return {
    allowed: false,
    reason: 'upgrade_required',
    message: 'Pro utilities require Build Notes Pro membership.',
    upgradeUrl: '/checkout?product=MEMBER_PRO'
  };
};

const getNextMidnight = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.toISOString();
};

// Increment usage counter for an action
const incrementUsageCounter = async (email, action) => {
  const hashedEmail = hashEmail(email);
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  try {
    let updateFields = {};
    
    if (action === 'regenerate_sprint') {
      updateFields = {
        last_regen_date: today,
        regens_today: supabase.raw('CASE WHEN last_regen_date = ? THEN regens_today + 1 ELSE 1 END', [today])
      };
    } else if (action === 'pro_utility') {
      updateFields = {
        last_utility_date: today,
        utilities_today: supabase.raw('CASE WHEN last_utility_date = ? THEN utilities_today + 1 ELSE 1 END', [today])
      };
    }

    const { error } = await supabase
      .from('member_entitlements')
      .update(updateFields)
      .eq('email', hashedEmail)
      .eq('status', 'active');

    if (error) {
      console.error('Error incrementing usage counter:', error);
      return { success: false, error: error.message };
    }

    return { success: true };

  } catch (error) {
    console.error('Error incrementing usage counter:', error);
    return { success: false, error: error.message };
  }
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
    const { email, action, increment = false } = JSON.parse(event.body || '{}');

    // Validate required fields
    if (!email || !action) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required fields: email, action' 
        })
      };
    }

    // Check entitlements
    const entitlementCheck = await checkMemberEntitlements(email, action);

    // If increment is requested and action is allowed, increment the counter
    if (increment && entitlementCheck.allowed) {
      const incrementResult = await incrementUsageCounter(email, action);
      if (!incrementResult.success) {
        console.warn('Failed to increment usage counter:', incrementResult.error);
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        entitlement: entitlementCheck
      })
    };

  } catch (error) {
    console.error('Error checking entitlements:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to check entitlements. Please try again.'
      })
    };
  }
};
