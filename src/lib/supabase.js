import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database table schemas
export const TABLES = {
  SUBSCRIBERS: 'subscribers',
  INQUIRIES: 'inquiries',
  USAGE_COUNTERS: 'usage_counters',
};

// Helper functions
export const addSubscriber = async (email, source = 'website') => {
  try {
    const { data, error } = await supabase
      .from(TABLES.SUBSCRIBERS)
      .insert([
        {
          email,
          source,
          status: 'active',
          subscribed_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error adding subscriber:', error);
    return { success: false, error: error.message };
  }
};

export const addInquiry = async (inquiry) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.INQUIRIES)
      .insert([
        {
          ...inquiry,
          status: 'new',
          submitted_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error adding inquiry:', error);
    return { success: false, error: error.message };
  }
};

// Usage counter helpers for API rate limiting
export const checkUsageLimit = async (email, sku, maxRuns = 5, windowHours = 24) => {
  try {
    const windowStart = new Date();
    windowStart.setHours(windowStart.getHours() - windowHours);
    
    const { data, error } = await supabase
      .from(TABLES.USAGE_COUNTERS)
      .select('runs')
      .eq('email', email)
      .eq('sku', sku)
      .gte('window_start', windowStart.toISOString())
      .order('window_start', { ascending: false })
      .limit(1);

    if (error) throw error;
    
    const currentRuns = data?.[0]?.runs || 0;
    return {
      success: true,
      allowed: currentRuns < maxRuns,
      remaining: Math.max(0, maxRuns - currentRuns),
      currentRuns
    };
  } catch (error) {
    console.error('Error checking usage limit:', error);
    return { success: false, error: error.message };
  }
};

export const incrementUsageCounter = async (email, sku) => {
  try {
    const windowStart = new Date();
    windowStart.setMinutes(0, 0, 0); // Round to nearest hour for grouping
    
    // Try to increment existing counter first
    const { data: existing, error: fetchError } = await supabase
      .from(TABLES.USAGE_COUNTERS)
      .select('id, runs')
      .eq('email', email)
      .eq('sku', sku)
      .eq('window_start', windowStart.toISOString())
      .single();
    
    if (existing && !fetchError) {
      // Update existing counter
      const { data, error } = await supabase
        .from(TABLES.USAGE_COUNTERS)
        .update({ runs: existing.runs + 1 })
        .eq('id', existing.id)
        .select();
      
      if (error) throw error;
      return { success: true, data };
    } else {
      // Create new counter
      const { data, error } = await supabase
        .from(TABLES.USAGE_COUNTERS)
        .insert([
          {
            email,
            sku,
            window_start: windowStart.toISOString(),
            runs: 1
          }
        ])
        .select();
      
      if (error) throw error;
      return { success: true, data };
    }
  } catch (error) {
    console.error('Error incrementing usage counter:', error);
    return { success: false, error: error.message };
  }
};
