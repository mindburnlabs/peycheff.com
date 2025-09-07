import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * OG Image Generator - Apple-style black-on-white cards
 * 
 * Generates clean, minimal OG images for notes:
 * - Black text on white background
 * - SF font stack
 * - peycheff.com mark
 * - Date and title only
 */
export const handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { title, slug, date } = JSON.parse(event.body);
    
    if (!title) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Title is required' })
      };
    }

    console.log(`Generating OG image for: ${title}`);

    // Generate the SVG
    const svg = generateOGSVG(title, date);
    
    // In a full implementation, you'd convert SVG to PNG using a service like:
    // - Vercel's @vercel/og
    // - Puppeteer
    // - Sharp with svg2png
    // 
    // For now, we'll save the SVG and return a path
    
    const filename = `og-${slug || generateSlug(title)}.svg`;
    const filePath = `og/${filename}`;
    
    // Upload SVG to Supabase Storage
    const { data, error } = await supabase.storage
      .from('og')
      .upload(filePath, svg, {
        contentType: 'image/svg+xml',
        metadata: {
          title: title,
          generated_at: new Date().toISOString()
        }
      });

    if (error) {
      console.error('Error uploading OG image:', error);
      throw error;
    }

    // Get public URL
    const { data: publicURL } = supabase.storage
      .from('og')
      .getPublicUrl(filePath);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        path: filePath,
        url: publicURL.publicUrl,
        filename
      })
    };

  } catch (error) {
    console.error('OG generation error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'OG generation failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};

function generateOGSVG(title, date = null) {
  const displayDate = date ? new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Split title into multiple lines if too long
  const titleLines = splitTitle(title, 40); // Max 40 chars per line

  return `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .title { 
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif; 
        font-size: 64px; 
        font-weight: 600; 
        fill: #1d1d1f; 
        line-height: 1.2;
      }
      .site { 
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif; 
        font-size: 24px; 
        font-weight: 500; 
        fill: #86868b; 
      }
      .date { 
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif; 
        font-size: 20px; 
        font-weight: 400; 
        fill: #86868b; 
      }
    </style>
  </defs>
  
  <!-- Background -->
  <rect width="1200" height="630" fill="#ffffff"/>
  
  <!-- Subtle border -->
  <rect x="0" y="0" width="1200" height="630" fill="none" stroke="#f5f5f7" stroke-width="2"/>
  
  <!-- Title -->
  ${titleLines.map((line, index) => 
    `<text x="80" y="${200 + (index * 80)}" class="title">${escapeXML(line)}</text>`
  ).join('')}
  
  <!-- Site name -->
  <text x="80" y="${460 + (titleLines.length - 1) * 40}" class="site">peycheff.com</text>
  
  <!-- Date -->
  <text x="80" y="${500 + (titleLines.length - 1) * 40}" class="date">${displayDate}</text>
  
  <!-- Minimal accent line -->
  <line x1="80" y1="${530 + (titleLines.length - 1) * 40}" x2="200" y2="${530 + (titleLines.length - 1) * 40}" stroke="#0a84ff" stroke-width="3" stroke-linecap="round"/>
</svg>
  `.trim();
}

function splitTitle(title, maxCharsPerLine) {
  const words = title.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + word).length <= maxCharsPerLine) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        // Word is longer than max chars, truncate it
        lines.push(word.substring(0, maxCharsPerLine - 3) + '...');
        currentLine = '';
      }
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  // Limit to 3 lines maximum
  return lines.slice(0, 3);
}

function escapeXML(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-')
    .substring(0, 60);
}
