const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Simple admin check (in production, you'd want proper authentication)
  const adminKey = event.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_KEY) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  try {
    const { 
      days_ahead = 60,
      service_types = ['CALL_60', 'CALL_30', 'SPARRING']
    } = JSON.parse(event.body || '{}');

    // Call the database function to generate slots
    const { data, error } = await supabase
      .rpc('generate_schedule_slots', {
        p_start_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
        p_end_date: new Date(Date.now() + days_ahead * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        p_service_types: service_types
      });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: data,
        message: `Generated ${data.generated_count} new schedule slots`
      })
    };

  } catch (error) {
    console.error('Admin slot generation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to generate slots',
        details: error.message 
      })
    };
  }
};
