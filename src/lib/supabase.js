import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database table schemas
export const TABLES = {
  SUBSCRIBERS: 'subscribers',
  INQUIRIES: 'inquiries',
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
