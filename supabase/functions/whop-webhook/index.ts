import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

interface WhopWebhookEvent {
  type: string
  id: string
  data: {
    purchase?: {
      id: string
      user_id: string
      product_id: string
      quantity: number
      amount: number
      currency: string
      status: string
      created_at: string
      metadata?: Record<string, any>
    }
    user?: {
      id: string
      username: string
      email?: string
    }
  }
}

// Verify Whop webhook signature
function verifyWhopSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const messageData = encoder.encode(payload)
  const signatureData = encoder.encode(signature)

  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  ).then(key =>
    crypto.subtle.verify('HMAC', key, signatureData, messageData)
  )
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', {
        status: 405,
        headers: corsHeaders
      })
    }

    const signature = req.headers.get('x-whop-signature')
    const body = await req.text()
    const webhookSecret = Deno.env.get('WHOP_WEBHOOK_SECRET')

    if (!signature || !webhookSecret) {
      console.error('Missing signature or webhook secret')
      return new Response('Unauthorized', {
        status: 401,
        headers: corsHeaders
      })
    }

    // Verify webhook signature
    const isValid = await verifyWhopSignature(body, signature, webhookSecret)
    if (!isValid) {
      console.error('Invalid webhook signature')
      return new Response('Unauthorized', {
        status: 401,
        headers: corsHeaders
      })
    }

    const event: WhopWebhookEvent = JSON.parse(body)
    console.log('Whop webhook received:', event.type, event.id)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Handle purchase events
    if (event.type === 'purchase.completed' && event.data.purchase) {
      const purchase = event.data.purchase
      const user = event.data.user

      // Check if customer exists
      let customerId = null
      if (user?.email) {
        const { data: customers } = await supabase
          .from('customers')
          .select('id')
          .eq('email', user.email)
          .single()

        if (customers) {
          customerId = customers.id
        } else {
          // Create new customer
          const { data: newCustomer } = await supabase
            .from('customers')
            .insert({
              email: user.email,
              name: user.username,
              source: 'whop'
            })
            .select('id')
            .single()

          customerId = newCustomer?.id
        }
      }

      // Create order record
      const { data: order } = await supabase
        .from('orders')
        .insert({
          order_number: `WHOP-${purchase.id}`,
          customer_id: customerId,
          product_id: purchase.metadata?.sku_id || null,
          platform: 'whop',
          status: 'completed',
          amount: purchase.amount,
          currency: purchase.currency.toUpperCase(),
          quantity: purchase.quantity,
          external_order_id: purchase.id,
          external_transaction_id: purchase.id,
          customer_email: user?.email,
          customer_name: user?.username,
          metadata: purchase.metadata || {}
        })
        .select('id')
        .single()

      console.log('Order created:', order?.id)

      return new Response(
        JSON.stringify({
          success: true,
          orderId: order?.id,
          purchaseId: purchase.id
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    // Handle other event types
    console.log('Unhandled Whop event type:', event.type)

    return new Response(
      JSON.stringify({
        success: true,
        eventType: event.type
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Whop webhook error:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})