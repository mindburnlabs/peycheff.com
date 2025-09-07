import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Fulfillment handler for instant delivery products (KIT_DIAGRAMS)
 * Immediately sends download link for pre-made products
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
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    const { sku, config, purchase } = JSON.parse(event.body);
    
    console.log(`Processing instant delivery for ${sku}:`, purchase.customer_email);

    // Create download link for pre-made product
    const downloadInfo = await createInstantDownload(sku, purchase.customer_email);

    // Send delivery email immediately
    await sendInstantDeliveryEmail(sku, config, purchase, downloadInfo);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        type: 'instant_delivery',
        download_info: downloadInfo,
        message: 'Product delivered instantly'
      })
    };

  } catch (error) {
    console.error('Instant delivery error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Fulfillment failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};

// =============================================================================
// INSTANT DELIVERY FLOW
// =============================================================================

async function createInstantDownload(sku, customerEmail) {
  // Map SKUs to their pre-made files in storage
  const productFiles = {
    'KIT_DIAGRAMS': {
      path: 'products/diagram-library-kit.zip',
      filename: 'diagram-library-kit.zip',
      description: 'Complete diagram library with 12 system architectures'
    }
  };

  const productFile = productFiles[sku];
  if (!productFile) {
    throw new Error(`No file configured for SKU: ${sku}`);
  }

  // Create signed URL (expires in 7 days)
  const { data: signedUrl, error } = await supabase.storage
    .from('downloads')
    .createSignedUrl(productFile.path, 7 * 24 * 60 * 60); // 7 days

  if (error) {
    console.error('Error creating signed URL:', error);
    throw error;
  }

  // Store download record
  const downloadToken = crypto.randomUUID();
  
  await supabase
    .from('downloads')
    .insert({
      email: customerEmail,
      sku: sku,
      file_path: productFile.path,
      token: downloadToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

  return {
    filename: productFile.filename,
    description: productFile.description,
    download_url: signedUrl.signedUrl,
    token: downloadToken,
    expires_in_days: 7
  };
}

async function sendInstantDeliveryEmail(sku, config, purchase, downloadInfo) {
  const productDetails = {
    'KIT_DIAGRAMS': {
      name: 'Diagram Library Kit',
      contents: [
        '12 high-resolution system architecture diagrams',
        'SVG and PNG formats for every diagram',
        'Editable source files (Figma/Sketch)',
        'Team license for internal use',
        'Usage guidelines and best practices'
      ],
      proTip: 'Start with the "API Architecture Patterns" diagram. It\'s the most versatile for technical discussions.'
    }
  };

  const product = productDetails[sku];
  if (!product) {
    throw new Error(`No email template for SKU: ${sku}`);
  }

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #1d1d1f;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="font-size: 28px; font-weight: 600; margin: 0; color: #1d1d1f;">Download Ready</h1>
        <p style="font-size: 18px; color: #86868b; margin: 8px 0 0 0;">${product.name}</p>
      </div>
      
      <div style="background: #f5f5f7; border-radius: 12px; padding: 24px; margin: 32px 0;">
        <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">What's included:</h3>
        <ul style="margin: 0; padding-left: 20px;">
          ${product.contents.map(item => `<li style="margin: 8px 0; color: #1d1d1f;">${item}</li>`).join('')}
        </ul>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${downloadInfo.download_url}" 
           style="display: inline-block; background: #0a84ff; color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 18px;">
          Download Now
        </a>
        <p style="font-size: 14px; color: #86868b; margin: 16px 0 0 0;">Link expires in ${downloadInfo.expires_in_days} days • ${downloadInfo.filename}</p>
      </div>

      <div style="margin: 32px 0; padding: 24px; background: #fff4e6; border-radius: 12px;">
        <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 12px 0; color: #b25000;">💡 Pro tip</h3>
        <p style="font-size: 14px; color: #1d1d1f; margin: 0;">${product.proTip}</p>
      </div>

      <div style="margin: 32px 0; padding: 20px; background: #fff; border: 1px solid #d2d2d7; border-radius: 12px;">
        <h3 style="font-size: 14px; font-weight: 600; margin: 0 0 8px 0; color: #86868b;">LICENSE TERMS</h3>
        <p style="font-size: 14px; color: #1d1d1f; margin: 0;">Licensed for internal team use. You can modify, print, and share within your organization. Resale or redistribution is not permitted.</p>
      </div>

      <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #d2d2d7; font-size: 14px; color: #86868b;">
        <p>Questions about the diagrams or need custom versions? Just reply to this email.</p>
        <p>— Ivan</p>
      </div>
    </div>
  `;

  await resend.emails.send({
    from: 'Ivan Peychev <ivan@peycheff.com>',
    to: purchase.customer_email,
    subject: `Your ${product.name} is ready for download`,
    html: htmlContent
  });
}
