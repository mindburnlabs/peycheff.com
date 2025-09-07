const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
    const { reportId } = JSON.parse(event.body || '{}');

    if (!reportId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Report ID is required' })
      };
    }

    // Fetch report from database
    const { data: report, error } = await supabase
      .from('audit_reports')
      .select('*')
      .eq('id', reportId)
      .eq('is_public', true)
      .single();

    if (error || !report) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Report not found' })
      };
    }

    // Increment view count (async, don't wait)
    supabase
      .from('audit_reports')
      .update({ 
        share_count: (report.share_count || 0) + 1,
        last_viewed_at: new Date().toISOString()
      })
      .eq('id', reportId)
      .then(() => {
        console.log(`Incremented view count for report ${reportId}`);
      })
      .catch(err => {
        console.warn('Failed to increment view count:', err);
      });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        report: report.report_data
      })
    };

  } catch (error) {
    console.error('Error fetching audit report:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to fetch audit report. Please try again.'
      })
    };
  }
};
