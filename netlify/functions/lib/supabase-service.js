const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper function to add subscribers
async function addSubscriber(email, source = 'website') {
  const { data, error } = await supabase
    .from('subscribers')
    .upsert({ 
      email, 
      source, 
      subscribed_at: new Date().toISOString() 
    }, { 
      onConflict: 'email' 
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding subscriber:', error);
    throw error;
  }

  return data;
}

// Helper function to add inquiries
async function addInquiry(inquiryData) {
  const { data, error } = await supabase
    .from('inquiries')
    .insert({
      ...inquiryData,
      submitted_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding inquiry:', error);
    throw error;
  }

  return data;
}

// Helper function to check entitlements
async function checkEntitlement(email, sku) {
  const { data, error } = await supabase
    .from('entitlements')
    .select('*')
    .eq('email', email)
    .eq('sku', sku)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error checking entitlement:', error);
    throw error;
  }

  return !!data;
}

// Helper function to create or update customers
async function upsertCustomer(email, name = null, metadata = {}) {
  const { data, error } = await supabase
    .from('customers')
    .upsert({ 
      email, 
      name,
      metadata,
      updated_at: new Date().toISOString()
    }, { 
      onConflict: 'email' 
    })
    .select()
    .single();

  if (error) {
    console.error('Error upserting customer:', error);
    throw error;
  }

  return data;
}

// Helper function to track usage
async function trackUsage(key, increment = 1) {
  const { data, error } = await supabase
    .from('usage_counters')
    .upsert({
      key,
      count: increment,
      last_updated: new Date().toISOString()
    }, {
      onConflict: 'key'
    })
    .select()
    .single();

  if (error) {
    console.error('Error tracking usage:', error);
    // Don't throw - usage tracking failures shouldn't break functionality
  }

  return data;
}

module.exports = {
  supabase,
  addSubscriber,
  addInquiry,
  checkEntitlement,
  upsertCustomer,
  trackUsage
};
