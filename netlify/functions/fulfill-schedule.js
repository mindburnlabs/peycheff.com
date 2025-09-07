import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Fulfillment handler for scheduling services (CALL_60, CALL_PACK, OFFICE_HOURS)
 * Auto-assigns next available slot and sends confirmation with self-serve rescheduling
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
    
    console.log(`Processing schedule fulfillment for ${sku}:`, purchase.customer_email);

    // Get or create scheduling slots
    const availableSlot = await getNextAvailableSlot(sku);
    
    if (!availableSlot) {
      // If no slots available, send manual scheduling email
      await sendManualSchedulingEmail(sku, config, purchase);
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          type: 'manual_scheduling',
          message: 'Manual scheduling email sent'
        })
      };
    }

    // Reserve the slot
    await reserveSlot(availableSlot.id, purchase.customer_email, sku);

    // Generate calendar invite
    const calendarInvite = generateCalendarInvite(availableSlot, config, purchase);

    // Send confirmation email with calendar invite
    await sendSchedulingConfirmation({
      sku,
      config,
      purchase,
      slot: availableSlot,
      calendarInvite
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        type: 'auto_scheduled',
        slot: availableSlot,
        message: 'Session scheduled and confirmation sent'
      })
    };

  } catch (error) {
    console.error('Schedule fulfillment error:', error);
    
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
// SCHEDULING LOGIC
// =============================================================================

async function getNextAvailableSlot(sku) {
  // Check if we have slots stored in Supabase
  const { data: slots, error } = await supabase
    .from('schedule_slots')
    .select('*')
    .eq('service_type', getSlotTypeForSku(sku))
    .eq('status', 'available')
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { // Not found is OK
    console.error('Error fetching slots:', error);
    return null;
  }

  if (slots) {
    return slots;
  }

  // If no slots in DB, generate some default ones
  return generateDefaultSlot(sku);
}

async function reserveSlot(slotId, customerEmail, sku) {
  const { error } = await supabase
    .from('schedule_slots')
    .update({
      status: 'reserved',
      customer_email: customerEmail,
      sku: sku,
      reserved_at: new Date().toISOString()
    })
    .eq('id', slotId);

  if (error) {
    console.error('Error reserving slot:', error);
    throw error;
  }
}

function getSlotTypeForSku(sku) {
  const slotTypes = {
    'CALL_60': 'strategy_call',
    'CALL_PACK': 'strategy_call',
    'OFFICE_HOURS': 'office_hours'
  };
  
  return slotTypes[sku] || 'general';
}

function generateDefaultSlot(sku) {
  // Generate a slot 7 days from now during business hours
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  // Set to 2 PM EST (business hours)
  nextWeek.setUTCHours(19, 0, 0, 0); // 2 PM EST = 19:00 UTC
  
  // If weekend, move to Monday
  if (nextWeek.getDay() === 0) nextWeek.setDate(nextWeek.getDate() + 1); // Sunday → Monday
  if (nextWeek.getDay() === 6) nextWeek.setDate(nextWeek.getDate() + 2); // Saturday → Monday

  const duration = sku === 'OFFICE_HOURS' ? 90 : 60; // Office hours are 90 min
  const endTime = new Date(nextWeek.getTime() + duration * 60 * 1000);

  return {
    id: `default-${Date.now()}`,
    service_type: getSlotTypeForSku(sku),
    start_time: nextWeek.toISOString(),
    end_time: endTime.toISOString(),
    timezone: 'America/New_York',
    status: 'available'
  };
}

// =============================================================================
// CALENDAR INTEGRATION
// =============================================================================

function generateCalendarInvite(slot, config, purchase) {
  const startDate = new Date(slot.start_time);
  const endDate = new Date(slot.end_time);
  
  // Format dates for ICS (YYYYMMDDTHHMMSSZ)
  const formatICSDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//peycheff.com//Autopilot Scheduler//EN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${slot.id}@peycheff.com`,
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:${config.name} - ${purchase.customer_email}`,
    'DESCRIPTION:Strategy session with Ivan Peychev. Recording will be provided after the call.',
    'LOCATION:Video call (link will be sent 24h before)',
    `ORGANIZER:MAILTO:ivan@peycheff.com`,
    `ATTENDEE:MAILTO:${purchase.customer_email}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return {
    filename: 'session.ics',
    content: icsContent
  };
}

// =============================================================================
// EMAIL NOTIFICATIONS
// =============================================================================

async function sendSchedulingConfirmation({ sku, config, purchase, slot, calendarInvite }) {
  const startTime = new Date(slot.start_time);
  const formattedTime = startTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/New_York',
    timeZoneName: 'short'
  });

  const rescheduleUrl = `https://peycheff.com/reschedule?token=${Buffer.from(JSON.stringify({
    slot_id: slot.id,
    email: purchase.customer_email,
    sku: sku
  })).toString('base64')}`;

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #1d1d1f;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="font-size: 28px; font-weight: 600; margin: 0; color: #1d1d1f;">Session Confirmed</h1>
      </div>
      
      <div style="background: #f5f5f7; border-radius: 12px; padding: 24px; margin: 32px 0;">
        <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">${config.name}</h2>
        <p style="margin: 8px 0; font-size: 16px;"><strong>When:</strong> ${formattedTime}</p>
        <p style="margin: 8px 0; font-size: 16px;"><strong>Duration:</strong> ${sku === 'OFFICE_HOURS' ? '90' : '60'} minutes</p>
        <p style="margin: 8px 0; font-size: 16px;"><strong>Format:</strong> Video call</p>
      </div>

      <div style="margin: 32px 0;">
        <h3 style="font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">What happens next</h3>
        <ol style="margin: 0; padding-left: 20px;">
          <li style="margin: 8px 0;">Calendar invite attached (add it now)</li>
          <li style="margin: 8px 0;">Video call link sent 24 hours before</li>
          <li style="margin: 8px 0;">Session recording + one-page plan within 24h after</li>
        </ol>
      </div>

      <div style="margin: 32px 0; text-align: center;">
        <a href="${rescheduleUrl}" 
           style="display: inline-block; background: #0a84ff; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 500;">
          Reschedule if Needed
        </a>
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
    subject: `Session confirmed: ${formattedTime}`,
    html: htmlContent,
    attachments: [{
      filename: calendarInvite.filename,
      content: Buffer.from(calendarInvite.content).toString('base64'),
      type: 'text/calendar'
    }],
    headers: {
      'X-Auto-Response-Suppress': 'OOF, DR, RN, NRN, AutoReply'
    }
  });
}

async function sendManualSchedulingEmail(sku, config, purchase) {
  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #1d1d1f;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="font-size: 28px; font-weight: 600; margin: 0; color: #1d1d1f;">Let's Schedule Your Session</h1>
      </div>
      
      <div style="background: #f5f5f7; border-radius: 12px; padding: 24px; margin: 32px 0;">
        <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">${config.name}</h2>
        <p style="margin: 0; font-size: 16px; color: #1d1d1f;">Thanks for your purchase. I'll reach out within 24 hours to schedule your session.</p>
      </div>

      <div style="margin: 32px 0;">
        <h3 style="font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">What to expect</h3>
        <ul style="margin: 0; padding-left: 20px;">
          <li style="margin: 8px 0;">Personal email from me within 24 hours</li>
          <li style="margin: 8px 0;">3-4 scheduling options that work with your timezone</li>
          <li style="margin: 8px 0;">Calendar invite with video call details</li>
          <li style="margin: 8px 0;">One-page action plan delivered after our session</li>
        </ul>
      </div>

      <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #d2d2d7; font-size: 14px; color: #86868b;">
        <p>Looking forward to working together.</p>
        <p>— Ivan</p>
      </div>
    </div>
  `;

  await resend.emails.send({
    from: 'Ivan Peychev <ivan@peycheff.com>',
    to: purchase.customer_email,
    subject: `Next step: Scheduling your ${config.name}`,
    html: htmlContent
  });

  // Also notify Ivan
  await resend.emails.send({
    from: 'Autopilot <system@peycheff.com>',
    to: 'ivan@peycheff.com',
    subject: `New ${config.name} - Manual Scheduling Needed`,
    html: `
      <div style="font-family: system-ui, sans-serif; padding: 20px;">
        <h2>New Purchase - Manual Scheduling Required</h2>
        <p><strong>Product:</strong> ${config.name}</p>
        <p><strong>Customer:</strong> ${purchase.customer_email}</p>
        <p><strong>Order ID:</strong> ${purchase.order_id}</p>
        <p><strong>Amount:</strong> $${(purchase.amount / 100).toFixed(2)}</p>
        
        <p>Next step: Reach out to schedule within 24 hours.</p>
      </div>
    `,
    reply_to: purchase.customer_email
  });
}
