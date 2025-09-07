import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Fulfillment handler for membership subscriptions (MEMBER_MONTHLY, MEMBER_ANNUAL)
 * Sends welcome email with recent notes, member benefits, and access info
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
    
    console.log(`Processing membership welcome for ${sku}:`, purchase.customer_email);

    // Get recent published notes for member preview
    const recentNotes = await getRecentPublishedNotes(2);

    // Send membership welcome email
    await sendMembershipWelcome(sku, config, purchase, recentNotes);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        type: 'membership_welcome_sent',
        message: 'Welcome email sent with recent notes preview'
      })
    };

  } catch (error) {
    console.error('Membership welcome error:', error);
    
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
// MEMBERSHIP WELCOME FLOW
// =============================================================================

async function getRecentPublishedNotes(limit = 2) {
  const { data: notes, error } = await supabase
    .from('drafts')
    .select('title, summary, slug, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent notes:', error);
    return []; // Fallback to empty array
  }

  return notes || [];
}

async function sendMembershipWelcome(sku, config, purchase, recentNotes) {
  const membershipType = sku === 'MEMBER_ANNUAL' ? 'Annual' : 'Monthly';
  const nextBillingInfo = sku === 'MEMBER_ANNUAL' 
    ? 'Your next billing is in 12 months'
    : 'Your next billing is in 30 days';

  // Generate member access URL with magic link
  const memberToken = Buffer.from(JSON.stringify({
    email: purchase.customer_email,
    sku: sku,
    expires: Date.now() + 365 * 24 * 60 * 60 * 1000 // 1 year
  })).toString('base64url');

  const memberAccessUrl = `https://peycheff.com/members?token=${memberToken}`;

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #1d1d1f;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="font-size: 28px; font-weight: 600; margin: 0; color: #1d1d1f;">Welcome to Build Notes</h1>
        <p style="font-size: 18px; color: #86868b; margin: 8px 0 0 0;">${membershipType} Membership Active</p>
      </div>
      
      <div style="background: #f5f5f7; border-radius: 12px; padding: 24px; margin: 32px 0;">
        <h3 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">What you get</h3>
        <ul style="margin: 0; padding-left: 20px;">
          <li style="margin: 8px 0;">2 operator memos delivered monthly (first Tuesday and third Tuesday)</li>
          <li style="margin: 8px 0;">Early access to all new kits and playbooks (50% discount)</li>
          <li style="margin: 8px 0;">Member-only utilities and downloads</li>
          <li style="margin: 8px 0;">Archive access to all past content</li>
          ${sku === 'MEMBER_ANNUAL' ? '<li style="margin: 8px 0; font-weight: 600; color: #0a84ff;">Annual member bonus: Priority support via email</li>' : ''}
        </ul>
      </div>

      ${recentNotes.length > 0 ? `
      <div style="margin: 32px 0;">
        <h3 style="font-size: 18px; font-weight: 600; margin: 0 0 20px 0;">Recent notes to get you started</h3>
        ${recentNotes.map(note => `
          <div style="background: #fff; border: 1px solid #d2d2d7; border-radius: 8px; padding: 20px; margin: 16px 0;">
            <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1d1d1f;">${note.title}</h4>
            <p style="margin: 0; font-size: 14px; color: #86868b; line-height: 1.4;">${note.summary}</p>
            <a href="https://peycheff.com/notes/${note.slug}" style="display: inline-block; margin-top: 12px; color: #0a84ff; text-decoration: none; font-size: 14px; font-weight: 500;">Read full note →</a>
          </div>
        `).join('')}
      </div>
      ` : ''}

      <div style="text-align: center; margin: 32px 0;">
        <a href="${memberAccessUrl}" 
           style="display: inline-block; background: #0a84ff; color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 18px;">
          Access Member Area
        </a>
        <p style="font-size: 14px; color: #86868b; margin: 16px 0 0 0;">Bookmark this link for future access</p>
      </div>

      <div style="margin: 32px 0; padding: 24px; background: #f0f9ff; border-radius: 12px;">
        <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 12px 0; color: #0969da;">Next memo: Tuesday, ${getNextMemoDate()}</h3>
        <p style="font-size: 14px; color: #1d1d1f; margin: 0;">I publish on the first and third Tuesday of every month. The next memo will cover AI-first product development strategies.</p>
      </div>

      <div style="margin: 32px 0; padding: 20px; background: #fff; border: 1px solid #d2d2d7; border-radius: 12px;">
        <h3 style="font-size: 14px; font-weight: 600; margin: 0 0 8px 0; color: #86868b;">BILLING INFO</h3>
        <p style="font-size: 14px; color: #1d1d1f; margin: 0;">${nextBillingInfo}. Cancel anytime from your member area.</p>
      </div>

      <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #d2d2d7; font-size: 14px; color: #86868b;">
        <p>Questions about your membership? Just reply to this email.</p>
        <p>— Ivan</p>
      </div>
    </div>
  `;

  await resend.emails.send({
    from: 'Ivan Peychev <ivan@peycheff.com>',
    to: purchase.customer_email,
    subject: 'Welcome to Build Notes 🎯',
    html: htmlContent,
    headers: {
      'X-Auto-Response-Suppress': 'OOF, DR, RN, NRN, AutoReply'
    }
  });

  // Add to newsletter subscription if not already subscribed
  await supabase
    .from('subscribers')
    .upsert({
      email: purchase.customer_email,
      source: `membership_${sku.toLowerCase()}`,
      status: 'active'
    }, { onConflict: 'email' });
}

function getNextMemoDate() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const currentDate = now.getDate();

  // Find the next first or third Tuesday
  const firstTuesday = getFirstTuesdayOfMonth(currentYear, currentMonth);
  const thirdTuesday = getThirdTuesdayOfMonth(currentYear, currentMonth);

  let nextMemo;
  if (currentDate < firstTuesday.getDate()) {
    nextMemo = firstTuesday;
  } else if (currentDate < thirdTuesday.getDate()) {
    nextMemo = thirdTuesday;
  } else {
    // Next month's first Tuesday
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    nextMemo = getFirstTuesdayOfMonth(nextYear, nextMonth);
  }

  return nextMemo.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

function getFirstTuesdayOfMonth(year, month) {
  const firstDay = new Date(year, month, 1);
  const firstTuesday = new Date(firstDay);
  
  // Find the first Tuesday
  const daysUntilTuesday = (2 - firstDay.getDay() + 7) % 7;
  firstTuesday.setDate(1 + daysUntilTuesday);
  
  return firstTuesday;
}

function getThirdTuesdayOfMonth(year, month) {
  const firstTuesday = getFirstTuesdayOfMonth(year, month);
  const thirdTuesday = new Date(firstTuesday);
  thirdTuesday.setDate(firstTuesday.getDate() + 14);
  
  return thirdTuesday;
}
