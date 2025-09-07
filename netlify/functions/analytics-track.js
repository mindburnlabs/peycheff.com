import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Server-side Analytics Tracking Endpoint
 * 
 * Handles backend analytics events that can't be tracked from the frontend:
 * - Purchase completions (from webhooks)
 * - Fulfillment events 
 * - System performance metrics
 * - Revenue attribution
 */
export const handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Verify authorization
    const authHeader = event.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${process.env.FULFILLMENT_SECRET}`) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    const { event: eventType, data } = JSON.parse(event.body);

    console.log(`Tracking ${eventType} event:`, data);

    // Route to appropriate tracking handler
    let result;
    switch (eventType) {
      case 'purchase':
        result = await trackPurchaseEvent(data);
        break;
      case 'fulfillment':
        result = await trackFulfillmentEvent(data);
        break;
      case 'autopublish':
        result = await trackAutopublishEvent(data);
        break;
      case 'performance':
        result = await trackPerformanceEvent(data);
        break;
      case 'error':
        result = await trackErrorEvent(data);
        break;
      default:
        result = await trackGenericEvent(eventType, data);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        tracked: eventType,
        result
      })
    };

  } catch (error) {
    console.error('Analytics tracking error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Tracking failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};

// =============================================================================
// EVENT TRACKING HANDLERS
// =============================================================================

async function trackPurchaseEvent(data) {
  const { sku, amount_cents, customer_email, order_id, session_id } = data;
  
  // Store in analytics table
  const analyticsEvent = {
    event_type: 'purchase',
    event_data: {
      sku,
      amount_cents,
      customer_id: hashEmail(customer_email),
      order_id,
      session_id,
      timestamp: new Date().toISOString(),
      // Revenue metrics
      revenue: amount_cents / 100,
      currency: 'USD',
      product_category: getProductCategory(sku),
      fulfillment_type: getFulfillmentType(sku)
    },
    user_id: hashEmail(customer_email),
    session_id,
    created_at: new Date().toISOString()
  };

  await storeAnalyticsEvent(analyticsEvent);

  // Send to external analytics services
  await sendToGoogleAnalytics('purchase', analyticsEvent.event_data);
  
  // Track conversion metrics
  await updateConversionMetrics(sku, amount_cents);

  return { tracked: 'purchase', revenue: amount_cents / 100 };
}

async function trackFulfillmentEvent(data) {
  const { type, sku, customer_email, success, processing_time, error_message } = data;
  
  const analyticsEvent = {
    event_type: 'fulfillment',
    event_data: {
      fulfillment_type: type,
      sku,
      customer_id: hashEmail(customer_email),
      success,
      processing_time_ms: processing_time,
      error_message: success ? null : error_message,
      timestamp: new Date().toISOString()
    },
    user_id: hashEmail(customer_email),
    created_at: new Date().toISOString()
  };

  await storeAnalyticsEvent(analyticsEvent);
  
  // Track fulfillment performance
  if (!success) {
    await sendToGoogleAnalytics('fulfillment_failed', analyticsEvent.event_data);
  }

  return { tracked: 'fulfillment', success };
}

async function trackAutopublishEvent(data) {
  const { phase, topic, word_count, quality_score, success, processing_time } = data;
  
  const analyticsEvent = {
    event_type: 'autopublish',
    event_data: {
      pipeline_phase: phase,
      topic,
      word_count,
      quality_score,
      success,
      processing_time_ms: processing_time,
      timestamp: new Date().toISOString()
    },
    created_at: new Date().toISOString()
  };

  await storeAnalyticsEvent(analyticsEvent);
  
  // Track content production metrics
  if (phase === 'published') {
    await updateContentMetrics(topic, word_count, quality_score);
  }

  return { tracked: 'autopublish', phase };
}

async function trackPerformanceEvent(data) {
  const analyticsEvent = {
    event_type: 'performance',
    event_data: {
      ...data,
      timestamp: new Date().toISOString()
    },
    created_at: new Date().toISOString()
  };

  await storeAnalyticsEvent(analyticsEvent);

  return { tracked: 'performance' };
}

async function trackErrorEvent(data) {
  const analyticsEvent = {
    event_type: 'error',
    event_data: {
      ...data,
      timestamp: new Date().toISOString()
    },
    created_at: new Date().toISOString()
  };

  await storeAnalyticsEvent(analyticsEvent);
  
  // Alert for critical errors
  if (data.severity === 'critical') {
    await alertCriticalError(data);
  }

  return { tracked: 'error' };
}

async function trackGenericEvent(eventType, data) {
  const analyticsEvent = {
    event_type: eventType,
    event_data: {
      ...data,
      timestamp: new Date().toISOString()
    },
    created_at: new Date().toISOString()
  };

  await storeAnalyticsEvent(analyticsEvent);

  return { tracked: eventType };
}

// =============================================================================
// DATA STORAGE & EXTERNAL SERVICES
// =============================================================================

async function storeAnalyticsEvent(analyticsEvent) {
  // Create analytics_events table if it doesn't exist (migration should handle this)
  const { error } = await supabase
    .from('analytics_events')
    .insert(analyticsEvent);

  if (error) {
    console.error('Error storing analytics event:', error);
    // Don't throw - we want to continue even if storage fails
  }
}

async function sendToGoogleAnalytics(eventType, eventData) {
  // Send server-side event to GA4 Measurement Protocol
  if (!process.env.VITE_GA_MEASUREMENT_ID || !process.env.GA_SECRET) {
    return; // Skip if not configured
  }

  try {
    const response = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${process.env.VITE_GA_MEASUREMENT_ID}&api_secret=${process.env.GA_SECRET}`,
      {
        method: 'POST',
        body: JSON.stringify({
          client_id: eventData.customer_id || 'server',
          events: [{
            name: eventType,
            params: {
              ...eventData,
              event_source: 'server'
            }
          }]
        })
      }
    );

    if (!response.ok) {
      console.warn('GA4 tracking failed:', response.statusText);
    }
  } catch (error) {
    console.error('GA4 tracking error:', error);
  }
}

async function updateConversionMetrics(sku, amount_cents) {
  // Update daily metrics
  const today = new Date().toISOString().split('T')[0];
  
  await supabase
    .from('daily_metrics')
    .upsert({
      date: today,
      revenue_cents: amount_cents,
      orders_count: 1,
      product_breakdown: { [sku]: 1 }
    }, {
      onConflict: 'date',
      ignoreDuplicates: false
    });
}

async function updateContentMetrics(topic, wordCount, qualityScore) {
  const today = new Date().toISOString().split('T')[0];
  
  await supabase
    .from('content_metrics')
    .upsert({
      date: today,
      notes_published: 1,
      total_words: wordCount,
      avg_quality_score: qualityScore,
      topics: [topic]
    }, {
      onConflict: 'date',
      ignoreDuplicates: false
    });
}

async function alertCriticalError(errorData) {
  // Send critical error alert (email/SMS)
  console.error('CRITICAL ERROR:', errorData);
  
  // TODO: Implement alerting (email/SMS/Slack)
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function hashEmail(email) {
  if (!email) return null;
  
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `user_${Math.abs(hash)}`;
}

function getProductCategory(sku) {
  if (sku.startsWith('CALL_')) return 'Services';
  if (sku.startsWith('PACK_')) return 'Digital Products';
  if (sku.startsWith('KIT_')) return 'Digital Products';
  if (sku.startsWith('MEMBER_')) return 'Subscriptions';
  if (sku.startsWith('DEPOSIT_')) return 'Services';
  if (sku === 'OFFICE_HOURS') return 'Services';
  return 'Other';
}

function getFulfillmentType(sku) {
  const fulfillmentMap = {
    'CALL_60': 'schedule',
    'CALL_PACK': 'schedule',
    'PACK_30DAY': 'personalize_and_deliver',
    'KIT_AUTOMATION': 'personalize_and_deliver',
    'KIT_DIAGRAMS': 'instant_deliver',
    'MEMBER_MONTHLY': 'membership_welcome',
    'MEMBER_ANNUAL': 'membership_welcome',
    'OFFICE_HOURS': 'schedule',
    'DEPOSIT_AUDIT': 'intake_form',
    'DEPOSIT_SPRINT': 'intake_form'
  };
  
  return fulfillmentMap[sku] || 'unknown';
}
