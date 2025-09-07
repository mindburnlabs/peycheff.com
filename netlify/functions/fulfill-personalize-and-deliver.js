import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Fulfillment handler for personalized digital products (PACK_30DAY, KIT_AUTOMATION)
 * Shows 3-question form → generates personalized content → delivers via email
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
    
    console.log(`Processing personalization fulfillment for ${sku}:`, purchase.customer_email);

    // Send email with 3-question personalization form
    await sendPersonalizationForm(sku, config, purchase);

    // Set up webhook listener for form responses (alternative to this could be a separate endpoint)
    // When form is completed, generatePersonalizedContent will be called

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        type: 'personalization_form_sent',
        message: '3-question form sent to customer'
      })
    };

  } catch (error) {
    console.error('Personalization fulfillment error:', error);
    
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
// PERSONALIZATION FLOW
// =============================================================================

async function sendPersonalizationForm(sku, config, purchase) {
  // Generate secure token for form submission
  const formToken = Buffer.from(JSON.stringify({
    sku,
    customer_email: purchase.customer_email,
    order_id: purchase.order_id,
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  })).toString('base64url');

  const formUrl = `https://peycheff.com/personalize?token=${formToken}`;

  const questions = getQuestionsForSku(sku);

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #1d1d1f;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="font-size: 28px; font-weight: 600; margin: 0; color: #1d1d1f;">Almost Ready</h1>
        <p style="font-size: 18px; color: #86868b; margin: 8px 0 0 0;">3 quick questions to personalize your ${config.name}</p>
      </div>
      
      <div style="background: #f5f5f7; border-radius: 12px; padding: 24px; margin: 32px 0;">
        <p style="margin: 0 0 16px 0; font-size: 16px;">I'll customize your pack based on:</p>
        <ul style="margin: 0; padding-left: 20px; color: #1d1d1f;">
          ${questions.map(q => `<li style="margin: 8px 0;">${q}</li>`).join('')}
        </ul>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${formUrl}" 
           style="display: inline-block; background: #0a84ff; color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 18px;">
          Personalize My Pack
        </a>
        <p style="font-size: 14px; color: #86868b; margin: 16px 0 0 0;">Takes 30 seconds • Your customized pack will be ready in minutes</p>
      </div>

      <div style="margin: 32px 0; padding: 24px; background: #fff; border: 1px solid #d2d2d7; border-radius: 12px;">
        <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">Skip personalization?</h3>
        <p style="font-size: 14px; color: #86868b; margin: 0;">I'll send you the standard version in 24 hours if you don't customize. But the personalized version is much better.</p>
      </div>

      <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #d2d2d7; font-size: 14px; color: #86868b;">
        <p>Questions? Just reply to this email.</p>
        <p>— Ivan</p>
      </div>
    </div>
  `;

  await resend.emails.send({
    from: 'Ivan Peychev <ivan@peycheff.com>',
    to: purchase.customer_email,
    subject: `Personalize your ${config.name} (30 seconds)`,
    html: htmlContent,
    headers: {
      'X-Auto-Response-Suppress': 'OOF, DR, RN, NRN, AutoReply'
    }
  });

  // Store the pending personalization in database
  await supabase
    .from('personalizations')
    .upsert({
      token: formToken,
      sku,
      customer_email: purchase.customer_email,
      order_id: purchase.order_id,
      status: 'pending',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }, { onConflict: 'token' });
}

function getQuestionsForSku(sku) {
  const questions = {
    'PACK_30DAY': [
      'Your current tech stack (React, Python, etc.)',
      'Team size and roles',
      'Target timeline (MVP in 30/60/90 days)'
    ],
    'KIT_AUTOMATION': [
      'Your main workflow pain points',
      'Tools you already use (Notion, Slack, etc.)',
      'Technical comfort level (beginner/intermediate/advanced)'
    ]
  };

  return questions[sku] || [
    'Your industry/market',
    'Current challenges',
    'Preferred format (PDF/Notion/Email)'
  ];
}

// =============================================================================
// AI CONTENT GENERATION (Called by form submission endpoint)
// =============================================================================

export async function generatePersonalizedContent(formData) {
  const { sku, answers, customer_email } = formData;
  
  try {
    console.log(`Generating personalized content for ${sku}:`, customer_email);

    // Generate content based on SKU and answers
    const generatedContent = await callContentGenerationAPI(sku, answers);
    
    // Create PDF/MDX file and upload to Supabase Storage
    const downloadInfo = await createDownloadableFile(sku, generatedContent, customer_email);
    
    // Send delivery email with download link
    await sendDeliveryEmail(sku, customer_email, downloadInfo, answers);
    
    // Update personalization status
    await supabase
      .from('personalizations')
      .update({ 
        status: 'completed',
        answers: answers,
        delivered_at: new Date().toISOString()
      })
      .eq('customer_email', customer_email)
      .eq('sku', sku);

    return {
      success: true,
      download_info: downloadInfo
    };

  } catch (error) {
    console.error('Content generation error:', error);
    throw error;
  }
}

async function callContentGenerationAPI(sku, answers) {
  const prompts = {
    'PACK_30DAY': `Create a personalized 30-Day Idea→Product Sprint framework for a founder with:
- Tech stack: ${answers.tech_stack}
- Team size: ${answers.team_size}
- Timeline: ${answers.timeline}

Generate:
1. 4 weekly schedules with daily tasks
2. Tech stack specific setup guides
3. Team coordination checklists
4. Risk mitigation based on timeline
5. Success metrics and review cadences

Format: Structured markdown with clear sections, actionable tasks, and time estimates.`,

    'KIT_AUTOMATION': `Create 4 micro-automation playbooks for:
- Pain points: ${answers.pain_points}
- Current tools: ${answers.current_tools}
- Technical level: ${answers.technical_level}

Generate playbooks for:
1. ${answers.pain_points.split(',')[0]} automation
2. Tool integration workflow
3. Monitoring and alerts setup
4. Efficiency measurement system

Include: Step-by-step scripts, JSON configs, and troubleshooting guides tailored to their tech level.`
  };

  const prompt = prompts[sku];
  if (!prompt) {
    throw new Error(`No prompt configured for SKU: ${sku}`);
  }

  // Call OpenAI/Anthropic API (using OpenAI as example)
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are Ivan Peychev\'s content generator. Write in a blunt, street-smart, visionary tone. No fluff. Apple-clean formatting. Max 3-line paragraphs.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`Content generation failed: ${response.statusText}`);
  }

  const result = await response.json();
  return result.choices[0].message.content;
}

async function createDownloadableFile(sku, content, customerEmail) {
  // Generate filename
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${sku.toLowerCase()}-${customerEmail.split('@')[0]}-${timestamp}.md`;
  const filePath = `downloads/${sku}/${filename}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('downloads')
    .upload(filePath, content, {
      contentType: 'text/markdown',
      metadata: {
        customer_email: customerEmail,
        sku: sku,
        generated_at: new Date().toISOString()
      }
    });

  if (error) {
    console.error('File upload error:', error);
    throw error;
  }

  // Create signed URL (expires in 7 days)
  const { data: signedUrl } = await supabase.storage
    .from('downloads')
    .createSignedUrl(filePath, 7 * 24 * 60 * 60); // 7 days

  // Store download record
  const downloadToken = crypto.randomUUID();
  
  await supabase
    .from('downloads')
    .insert({
      email: customerEmail,
      sku: sku,
      file_path: filePath,
      token: downloadToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

  return {
    filename,
    download_url: signedUrl.signedUrl,
    token: downloadToken,
    expires_in_days: 7
  };
}

async function sendDeliveryEmail(sku, customerEmail, downloadInfo, answers) {
  const skuNames = {
    'PACK_30DAY': '30-Day Sprint Framework',
    'KIT_AUTOMATION': 'Automation Playbook Kit'
  };

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #1d1d1f;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="font-size: 28px; font-weight: 600; margin: 0; color: #1d1d1f;">Your Pack is Ready</h1>
        <p style="font-size: 18px; color: #86868b; margin: 8px 0 0 0;">Personalized ${skuNames[sku]}</p>
      </div>
      
      <div style="background: #f5f5f7; border-radius: 12px; padding: 24px; margin: 32px 0;">
        <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Customized for your setup:</h3>
        <ul style="margin: 0; padding-left: 20px;">
          ${Object.entries(answers).map(([key, value]) => 
            `<li style="margin: 6px 0; color: #1d1d1f;"><strong>${key.replace('_', ' ')}:</strong> ${value}</li>`
          ).join('')}
        </ul>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${downloadInfo.download_url}" 
           style="display: inline-block; background: #0a84ff; color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 18px;">
          Download Your Pack
        </a>
        <p style="font-size: 14px; color: #86868b; margin: 16px 0 0 0;">Link expires in ${downloadInfo.expires_in_days} days</p>
      </div>

      <div style="margin: 32px 0; padding: 24px; background: #fff4e6; border-radius: 12px;">
        <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 12px 0; color: #b25000;">💡 Pro tip</h3>
        <p style="font-size: 14px; color: #1d1d1f; margin: 0;">Print the first section and keep it on your desk. The best frameworks are the ones you actually use.</p>
      </div>

      <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #d2d2d7; font-size: 14px; color: #86868b;">
        <p>Need clarification on anything? Just reply to this email.</p>
        <p>— Ivan</p>
      </div>
    </div>
  `;

  await resend.emails.send({
    from: 'Ivan Peychev <ivan@peycheff.com>',
    to: customerEmail,
    subject: `Your personalized ${skuNames[sku]} is ready`,
    html: htmlContent
  });
}
