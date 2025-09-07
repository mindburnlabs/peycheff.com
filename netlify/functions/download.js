const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Get token from query params
    const token = event.queryStringParameters?.token;
    
    if (!token) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Download token required' })
      };
    }

    // Lookup download record
    const { data: download, error } = await supabase
      .from('downloads')
      .select('*')
      .eq('token', token)
      .single();

    if (error || !download) {
      console.error('Download not found:', error);
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Invalid or expired download link' })
      };
    }

    // Check expiration
    const now = new Date();
    const expiresAt = new Date(download.expires_at);
    
    if (now > expiresAt) {
      return {
        statusCode: 410,
        headers,
        body: JSON.stringify({ error: 'Download link has expired' })
      };
    }

    // Get file from Supabase Storage
    const { data: fileData, error: storageError } = await supabase
      .storage
      .from('downloads')
      .download(download.file_path);

    if (storageError) {
      console.error('Storage error:', storageError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to retrieve file' })
      };
    }

    // Update download timestamp
    await supabase
      .from('downloads')
      .update({ downloaded_at: now.toISOString() })
      .eq('token', token);

    // Determine content type based on file extension
    const ext = download.file_path.split('.').pop().toLowerCase();
    const contentTypes = {
      'pdf': 'application/pdf',
      'zip': 'application/zip',
      'mdx': 'text/mdx',
      'md': 'text/markdown',
      'json': 'application/json',
      'txt': 'text/plain'
    };
    const contentType = contentTypes[ext] || 'application/octet-stream';

    // Get filename from path
    const filename = download.file_path.split('/').pop();

    // Convert blob to buffer
    const buffer = Buffer.from(await fileData.arrayBuffer());

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'private, max-age=3600'
      },
      body: buffer.toString('base64'),
      isBase64Encoded: true
    };

  } catch (error) {
    console.error('Download error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Download failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};
