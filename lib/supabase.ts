import { createClient } from '@supabase/supabase-js'

// Create a single Supabase client for the entire application
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Export types for better TypeScript support
export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          slug: string
          title: string
          description: string
          price: number
          platform: 'etsy' | 'whop'
          category: 'template' | 'starter'
          promise: string
          url: string
          bullets: string[]
          included: string[]
          license: string
          tags: string[]
          og_title: string | null
          og_description: string | null
          is_featured: boolean
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>
      }
      customers: {
        Row: {
          id: string
          email: string
          name: string | null
          company: string | null
          phone: string | null
          budget_range: '<$5k' | '$5-18k' | '$18-45k' | '>$45k' | null
          timeline: 'asap' | '2-weeks' | '1-month' | '3-months' | 'exploring' | null
          project_description: string | null
          source: string
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          utm_content: string | null
          ip_address: string | null
          user_agent: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at' | 'updated_at'>
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string | null
          product_id: string | null
          platform: 'etsy' | 'whop' | 'stripe'
          status: 'pending' | 'completed' | 'failed' | 'refunded'
          amount: number
          currency: string
          quantity: number
          payment_intent_id: string | null
          payment_method: string | null
          external_order_id: string | null
          external_transaction_id: string | null
          customer_email: string | null
          customer_name: string | null
          metadata: Record<string, any> | null
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          utm_content: string | null
          ip_address: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>
      }
      analytics_events: {
        Row: {
          id: string
          session_id: string | null
          user_id: string | null
          event_name: string
          event_data: Record<string, any> | null
          page_url: string | null
          referrer: string | null
          user_agent: string | null
          ip_address: string | null
          platform: string
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_term: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['analytics_events']['Row'], 'id' | 'created_at'>
      }
    }
  }
}

// Helper functions for common operations
export const getProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  return { data, error }
}

export const getProductBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  return { data, error }
}

export const createCustomer = async (customerData: Omit<Database['public']['Tables']['customers']['Insert'], 'id'>) => {
  const { data, error } = await supabase
    .from('customers')
    .insert(customerData)
    .select()
    .single()

  return { data, error }
}

export const createOrder = async (orderData: Omit<Database['public']['Tables']['orders']['Insert'], 'id'>) => {
  const { data, error } = await supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single()

  return { data, error }
}

export const trackAnalyticsEvent = async (eventName: string, eventData: Record<string, any>, userId?: string) => {
  const { data, error } = await supabase
    .from('analytics_events')
    .insert({
      event_name: eventName,
      event_data: eventData,
      user_id: userId || null,
      page_url: typeof window !== 'undefined' ? window.location.href : null,
      referrer: typeof document !== 'undefined' ? document.referrer : null,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      ip_address: null, // This would need to be captured server-side
      platform: 'web',
      created_at: new Date().toISOString(),
    })

  return { data, error }
}

// Server-side functions for when running in Next.js
export const createServerOrder = async (
  orderData: Omit<Database['public']['Tables']['orders']['Insert'], 'id'>,
  ipAddress?: string
) => {
  const { data, error } = await supabase
    .from('orders')
    .insert({
      ...orderData,
      ip_address: ipAddress || null,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  return { data, error }
}

export const createServerCustomer = async (
  customerData: Omit<Database['public']['Tables']['customers']['Insert'], 'id'>,
  ipAddress?: string
) => {
  const { data, error } = await supabase
    .from('customers')
    .insert({
      ...customerData,
      ip_address: ipAddress || null,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  return { data, error }
}

export const createServerAnalyticsEvent = async (
  eventName: string,
  eventData: Record<string, any>,
  options?: {
    userId?: string
    sessionId?: string
    pageUrl?: string
    referrer?: string
    userAgent?: string
    ipAddress?: string
    utmSource?: string
    utmMedium?: string
    utmCampaign?: string
    utmContent?: string
  }
) => {
  const { data, error } = await supabase
    .from('analytics_events')
    .insert({
      event_name: eventName,
      event_data: eventData,
      user_id: options?.userId || null,
      session_id: options?.sessionId || null,
      page_url: options?.pageUrl || null,
      referrer: options?.referrer || null,
      user_agent: options?.userAgent || null,
      ip_address: options?.ipAddress || null,
      utm_source: options?.utmSource || null,
      utm_medium: options?.utmMedium || null,
      utm_campaign: options?.utmCampaign || null,
      utm_content: options?.utmContent || null,
      created_at: new Date().toISOString(),
    })

  return { data, error }
}