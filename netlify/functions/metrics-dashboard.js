import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    // Basic auth via header token (optional)
    const authHeader = event.headers.authorization || '';
    if (!authHeader || authHeader !== `Bearer ${process.env.FULFILLMENT_SECRET}`) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [dailyMetrics, trialCounts, conversionCounts] = await Promise.all([
      supabase.from('daily_metrics').select('*').gte('date', weekAgo).lte('date', today).order('date', { ascending: true }),
      supabase.from('trial_entitlements').select('status, count:id', { count: 'exact', head: false }).gte('created_at', `${weekAgo}T00:00:00Z`),
      supabase.from('orders').select('sku, count:id', { count: 'exact', head: false }).gte('created_at', `${weekAgo}T00:00:00Z`)
    ]);

    const attachRate = computeAttachRate(conversionCounts.data || {});
    const revenuePerVisitor = computeRevenuePerVisitor(dailyMetrics.data || []);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        daily: dailyMetrics.data || [],
        trials: trialCounts.data || [],
        conversions: conversionCounts.data || [],
        kpis: {
          attach_rate: attachRate,
          revenue_per_visitor: revenuePerVisitor
        }
      })
    };
  } catch (error) {
    console.error('metrics-dashboard error', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};

function computeAttachRate(orderCounts) {
  // naive: ratio of bump SKU count to main pack count if present
  try {
    const packCount = (orderCounts || []).filter(o => o.sku === 'PACK_30DAY')[0]?.count || 0;
    const bumpCount = (orderCounts || []).filter(o => o.sku === 'AUDIT_PRO')[0]?.count || 0;
    if (!packCount) return 0;
    return bumpCount / packCount;
  } catch {
    return 0;
  }
}

function computeRevenuePerVisitor(daily) {
  try {
    const totals = (daily || []).reduce((acc, d) => {
      acc.revenue += d.revenue_cents || 0;
      acc.visitors += d.visitors_count || 0;
      return acc;
    }, { revenue: 0, visitors: 0 });
    if (!totals.visitors) return 0;
    return (totals.revenue / 100) / totals.visitors;
  } catch {
    return 0;
  }
}


