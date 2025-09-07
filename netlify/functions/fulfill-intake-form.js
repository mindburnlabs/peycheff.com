import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Fulfillment handler for deposit-based services (DEPOSIT_AUDIT, DEPOSIT_SPRINT)
 * Sends intake form to gather project requirements
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
    
    console.log(`Processing intake form for ${sku}:`, purchase.customer_email);

    // Send intake form email to customer
    await sendIntakeFormEmail(sku, config, purchase);

    // Notify Ivan about new deposit with customer details
    await notifyIvanOfDeposit(sku, config, purchase);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        type: 'intake_form_sent',
        message: 'Intake form sent and Ivan notified'
      })
    };

  } catch (error) {
    console.error('Intake form fulfillment error:', error);
    
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
// INTAKE FORM FLOW
// =============================================================================

async function sendIntakeFormEmail(sku, config, purchase) {
  // Generate secure token for intake form submission
  const intakeToken = Buffer.from(JSON.stringify({
    sku,
    customer_email: purchase.customer_email,
    order_id: purchase.order_id,
    expires: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
  })).toString('base64url');

  const formUrl = `https://peycheff.com/intake?token=${intakeToken}`;

  const serviceDetails = getServiceDetails(sku);

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #1d1d1f;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="font-size: 28px; font-weight: 600; margin: 0; color: #1d1d1f;">We're On</h1>
        <p style="font-size: 18px; color: #86868b; margin: 8px 0 0 0;">Deposit received for ${config.name}</p>
      </div>
      
      <div style="background: #f5f5f7; border-radius: 12px; padding: 24px; margin: 32px 0;">
        <h3 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">Project overview</h3>
        <ul style="margin: 0; padding-left: 20px;">
          ${serviceDetails.overview.map(item => `<li style="margin: 8px 0; color: #1d1d1f;">${item}</li>`).join('')}
        </ul>
      </div>

      <div style="margin: 32px 0;">
        <h3 style="font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">Next step: Project intake</h3>
        <p style="margin: 0 0 20px 0; font-size: 16px; color: #1d1d1f;">I need ${serviceDetails.questions.length} pieces of information to design your project plan:</p>
        
        <ol style="margin: 0; padding-left: 20px;">
          ${serviceDetails.questions.map(q => `<li style="margin: 8px 0; color: #1d1d1f;">${q}</li>`).join('')}
        </ol>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${formUrl}" 
           style="display: inline-block; background: #0a84ff; color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 18px;">
          Complete Project Intake
        </a>
        <p style="font-size: 14px; color: #86868b; margin: 16px 0 0 0;">Takes 10 minutes • Plan and timeline in 48 hours</p>
      </div>

      <div style="margin: 32px 0; padding: 24px; background: #f0f9ff; border-radius: 12px;">
        <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 12px 0; color: #0969da;">Timeline</h3>
        <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
          <li style="margin: 6px 0; color: #1d1d1f;"><strong>Next 48h:</strong> Project plan and milestone timeline</li>
          <li style="margin: 6px 0; color: #1d1d1f;"><strong>Week 1:</strong> ${serviceDetails.timeline.week1}</li>
          <li style="margin: 6px 0; color: #1d1d1f;"><strong>Final:</strong> ${serviceDetails.timeline.final}</li>
        </ul>
      </div>

      <div style="margin: 32px 0; padding: 20px; background: #fff; border: 1px solid #d2d2d7; border-radius: 12px;">
        <h3 style="font-size: 14px; font-weight: 600; margin: 0 0 8px 0; color: #86868b;">BILLING DETAILS</h3>
        <p style="font-size: 14px; color: #1d1d1f; margin: 0;">
          Deposit: $${(purchase.amount / 100).toFixed(2)} (applied to total)<br>
          Total project cost: ${serviceDetails.totalCost}<br>
          Remaining: ${serviceDetails.remaining}
        </p>
      </div>

      <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #d2d2d7; font-size: 14px; color: #86868b;">
        <p>Questions about the project? Just reply to this email.</p>
        <p>— Ivan</p>
      </div>
    </div>
  `;

  await resend.emails.send({
    from: 'Ivan Peychev <ivan@peycheff.com>',
    to: purchase.customer_email,
    subject: `Next step: ${serviceDetails.shortName} project intake`,
    html: htmlContent,
    headers: {
      'X-Auto-Response-Suppress': 'OOF, DR, RN, NRN, AutoReply'
    }
  });

  // Store the intake request in database
  await supabase
    .from('intake_forms')
    .upsert({
      token: intakeToken,
      sku,
      customer_email: purchase.customer_email,
      order_id: purchase.order_id,
      status: 'pending',
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }, { onConflict: 'token' });
}

async function notifyIvanOfDeposit(sku, config, purchase) {
  const serviceDetails = getServiceDetails(sku);

  const htmlContent = `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #0a84ff; margin: 0 0 20px 0;">New Project Deposit 🎯</h2>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Service:</strong> ${config.name}</p>
        <p><strong>Customer:</strong> ${purchase.customer_email}</p>
        <p><strong>Deposit:</strong> $${(purchase.amount / 100).toFixed(2)}</p>
        <p><strong>Order ID:</strong> ${purchase.order_id}</p>
        <p><strong>Total Project Value:</strong> ${serviceDetails.totalCost}</p>
      </div>

      <div style="margin: 20px 0;">
        <h3>Next steps:</h3>
        <ol>
          <li>Customer completes intake form (sent automatically)</li>
          <li>You receive intake responses in 24-48 hours</li>
          <li>Create project plan and milestone timeline</li>
          <li>Send plan + remaining invoice</li>
        </ol>
      </div>

      <div style="background: #e8f5e8; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0; color: #1d7324;"><strong>Revenue secured:</strong> ${(purchase.amount / 100).toFixed(0)}% of project value locked in</p>
      </div>
    </div>
  `;

  await resend.emails.send({
    from: 'Autopilot <system@peycheff.com>',
    to: 'ivan@peycheff.com',
    subject: `💰 New ${serviceDetails.shortName} deposit: $${(purchase.amount / 100).toFixed(2)}`,
    html: htmlContent,
    reply_to: purchase.customer_email
  });
}

function getServiceDetails(sku) {
  const details = {
    'DEPOSIT_AUDIT': {
      shortName: 'Systems Audit',
      overview: [
        '10-day comprehensive audit of your team processes',
        'Redesigned workflows and efficiency metrics',
        'Implementation roadmap with priorities',
        'Team training on new systems'
      ],
      questions: [
        'Current team size and structure',
        'Main process bottlenecks and pain points',
        'Tools and systems currently in use',
        'Success metrics and goals for the audit',
        'Timeline constraints and deadlines',
        'Budget for implementation phase'
      ],
      timeline: {
        week1: 'Discovery and process mapping',
        final: 'Redesigned workflows + implementation roadmap'
      },
      totalCost: '$5,000',
      remaining: '$4,500'
    },
    'DEPOSIT_SPRINT': {
      shortName: 'Build Sprint',
      overview: [
        '30-day sprint to ship a usable v1 product',
        'Small team execution model',
        'Complete rollout documentation',
        'User onboarding and success metrics'
      ],
      questions: [
        'Product concept and core functionality',
        'Target user and market validation',
        'Technical requirements and constraints',
        'Success metrics for v1 launch',
        'Team involvement and time allocation',
        'Post-sprint support and maintenance plan'
      ],
      timeline: {
        week1: 'Product specs and technical architecture',
        final: 'Shipped v1 + rollout documentation'
      },
      totalCost: '$25,000',
      remaining: '$24,000'
    }
  };

  return details[sku] || {
    shortName: 'Custom Project',
    overview: ['Custom service engagement'],
    questions: ['Project requirements', 'Timeline', 'Budget'],
    timeline: { week1: 'Planning', final: 'Delivery' },
    totalCost: 'TBD',
    remaining: 'TBD'
  };
}
