/**
 * Manual trigger for autopublish pipeline
 * Useful for testing and manual content generation
 */
export const handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Basic auth check (in production, use proper auth)
    const authHeader = event.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${process.env.TRIGGER_SECRET}`) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    console.log('Manual autopublish trigger initiated...');

    // Call the autopublish function
    const autopublishUrl = `${process.env.URL}/.netlify/functions/notes-autopublish`;
    
    const response = await fetch(autopublishUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Manual Trigger'
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`Autopublish failed: ${result.error || 'Unknown error'}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Autopublish triggered successfully',
        result: result
      })
    };

  } catch (error) {
    console.error('Manual trigger error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Trigger failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};
