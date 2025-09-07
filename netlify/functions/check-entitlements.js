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

// Trial entitlement check (Utility Pass Trial)
const checkTrialEntitlement = async (hashedEmail, action) => {
  if (action !== 'pro_utility') {
    return { allowed: false, reason: 'invalid_action' };
  }

  try {
    const { data: trial, error } = await supabase
      .from('trial_entitlements')
      .select('*')
      .eq('email', hashedEmail)
      .eq('sku', 'UTILITY_PASS_TRIAL')
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking trial entitlement:', error);
      return { allowed: false, reason: 'error' };
    }

    if (!trial) {
      return {
        allowed: false,
        reason: 'no_trial',
        message: 'No active trial found. Start a free trial to access utilities.',
        trial: null,
        upgradeUrl: '/utilities'
      };
    }

    const remaining = Math.max(0, (trial.usage_limit || 0) - (trial.usage_count || 0));
    if (remaining <= 0) {
      return {
        allowed: false,
        reason: 'trial_limit_reached',
        message: 'Trial usage limit reached. Upgrade to Build Notes Pro for unlimited utilities.',
        upgradeUrl: '/checkout?product=MEMBER_PRO',
        trial: {
          expires_at: trial.expires_at,
          usage_limit: trial.usage_limit,
          usage_count: trial.usage_count,
          remaining: 0
        }
      };
    }

    return {
      allowed: true,
      reason: 'trial',
      trial: {
        expires_at: trial.expires_at,
        usage_limit: trial.usage_limit,
        usage_count: trial.usage_count,
        remaining
      }
    };
  } catch (error) {
    console.error('Error during trial entitlement check:', error);
    return { allowed: false, reason: 'error' };
  }
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

// Increment trial usage (non-atomic best effort)
const incrementTrialUsage = async (hashedEmail) => {
  try {
    const { data: trial, error: fetchError } = await supabase
      .from('trial_entitlements')
      .select('id, usage_count, usage_limit')
      .eq('email', hashedEmail)
      .eq('sku', 'UTILITY_PASS_TRIAL')
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !trial) {
      return { success: false, error: fetchError?.message || 'trial_not_found' };
    }

    if ((trial.usage_count || 0) >= (trial.usage_limit || 0)) {
      return { success: false, error: 'limit_reached' };
    }

    const { error: updateError } = await supabase
      .from('trial_entitlements')
      .update({ usage_count: (trial.usage_count || 0) + 1 })
      .eq('id', trial.id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error incrementing trial usage:', error);
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

    if (entitlementCheck.allowed) {
      if (increment) {
        const incrementResult = await incrementUsageCounter(email, action);
        if (!incrementResult.success) {
          console.warn('Failed to increment usage counter:', incrementResult.error);
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, entitlement: entitlementCheck })
      };
    }

    // Trial fallback for utilities
    const hashedEmail = hashEmail(email);
    const trialCheck = await checkTrialEntitlement(hashedEmail, action);

    if (trialCheck.allowed) {
      if (increment) {
        const incTrial = await incrementTrialUsage(hashedEmail);
        if (!incTrial.success) {
          console.warn('Failed to increment trial usage:', incTrial.error);
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, entitlement: trialCheck })
      };
    }

    // Neither membership nor trial allows the action
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, entitlement: entitlementCheck, trial: trialCheck })
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
