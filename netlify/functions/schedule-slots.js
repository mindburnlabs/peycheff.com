const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Working hours and schedule configuration
const SCHEDULE_CONFIG = {
  timezone: 'America/Los_Angeles', // PST/PDT
  workingHours: {
    start: 9, // 9 AM
    end: 17,  // 5 PM
  },
  workingDays: [1, 2, 3, 4, 5], // Monday to Friday
  slotDuration: {
    'CALL_60': 60,     // 1 hour calls
    'CALL_30': 30,     // 30 min calls
    'SPARRING': 60,    // 1 hour sparring
  },
  bufferMinutes: 15, // Buffer between meetings
  advanceBookingDays: 60, // How far ahead to generate slots
  minimumNoticeHours: 24, // Minimum advance notice required
};

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { httpMethod, path, queryStringParameters, body } = event;
    const segments = path.split('/').filter(Boolean);
    const action = segments[segments.length - 1]; // Last segment after /schedule/

    switch (httpMethod) {
      case 'GET':
        if (action === 'available') {
          return await getAvailableSlots(queryStringParameters);
        } else if (action.startsWith('slots')) {
          return await getAllSlots(queryStringParameters);
        }
        break;

      case 'POST':
        if (action === 'generate') {
          return await generateSlots(JSON.parse(body || '{}'));
        } else if (action === 'book') {
          return await bookSlot(JSON.parse(body || '{}'));
        }
        break;

      case 'PUT':
        if (action === 'reschedule') {
          return await rescheduleSlot(JSON.parse(body || '{}'));
        }
        break;

      case 'DELETE':
        if (action === 'cancel') {
          return await cancelSlot(JSON.parse(body || '{}'));
        }
        break;
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Endpoint not found' })
    };

  } catch (error) {
    console.error('Schedule API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    };
  }
};

// Get available slots for booking
async function getAvailableSlots(params = {}) {
  const { 
    service_type = 'CALL_60', 
    start_date, 
    end_date,
    timezone = SCHEDULE_CONFIG.timezone 
  } = params;

  // Default to next 30 days if no date range provided
  const defaultStartDate = new Date();
  const defaultEndDate = new Date();
  defaultEndDate.setDate(defaultEndDate.getDate() + 30);

  const startDate = start_date ? new Date(start_date) : defaultStartDate;
  const endDate = end_date ? new Date(end_date) : defaultEndDate;

  const { data: slots, error } = await supabase
    .from('schedule_slots')
    .select('*')
    .eq('service_type', service_type)
    .eq('status', 'available')
    .gte('start_time', startDate.toISOString())
    .lte('start_time', endDate.toISOString())
    .order('start_time', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch available slots: ${error.message}`);
  }

  // Filter out slots that don't meet minimum notice requirement
  const now = new Date();
  const minimumNoticeTime = new Date(now.getTime() + (SCHEDULE_CONFIG.minimumNoticeHours * 60 * 60 * 1000));

  const availableSlots = slots.filter(slot => 
    new Date(slot.start_time) >= minimumNoticeTime
  );

  return {
    statusCode: 200,
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      success: true,
      data: {
        slots: availableSlots,
        total: availableSlots.length,
        service_type,
        timezone
      }
    })
  };
}

// Generate available slots for future dates
async function generateSlots({ service_types = ['CALL_60', 'CALL_30', 'SPARRING'], days_ahead = 60 }) {
  const generatedSlots = [];
  const now = new Date();

  for (let dayOffset = 1; dayOffset <= days_ahead; dayOffset++) {
    const date = new Date(now);
    date.setDate(date.getDate() + dayOffset);

    // Skip weekends (Saturday = 6, Sunday = 0)
    if (!SCHEDULE_CONFIG.workingDays.includes(date.getDay())) {
      continue;
    }

    // Generate slots for each service type
    for (const serviceType of service_types) {
      const slots = generateDailySlots(date, serviceType);
      generatedSlots.push(...slots);
    }
  }

  // Insert slots into database (ignore duplicates)
  const { data, error } = await supabase
    .from('schedule_slots')
    .upsert(generatedSlots, { 
      onConflict: 'start_time,service_type',
      ignoreDuplicates: true 
    })
    .select();

  if (error) {
    throw new Error(`Failed to generate slots: ${error.message}`);
  }

  return {
    statusCode: 200,
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      success: true,
      data: {
        generated: data?.length || 0,
        slots: data || []
      }
    })
  };
}

// Generate slots for a single day
function generateDailySlots(date, serviceType) {
  const slots = [];
  const slotDuration = SCHEDULE_CONFIG.slotDuration[serviceType];
  const { start: startHour, end: endHour } = SCHEDULE_CONFIG.workingHours;

  for (let hour = startHour; hour < endHour; hour++) {
    // Generate slots at the top of each hour
    const startTime = new Date(date);
    startTime.setHours(hour, 0, 0, 0);

    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + slotDuration);

    // Don't create slots that extend beyond working hours
    if (endTime.getHours() > endHour) {
      continue;
    }

    slots.push({
      id: `${serviceType}_${startTime.toISOString()}`,
      service_type: serviceType,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: 'available',
      timezone: SCHEDULE_CONFIG.timezone,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  return slots;
}

// Book a specific slot
async function bookSlot({ slot_id, customer_email, customer_name, order_id, notes = '' }) {
  if (!slot_id || !customer_email || !customer_name) {
    throw new Error('Missing required booking information');
  }

  // First, check if slot is still available
  const { data: slot, error: fetchError } = await supabase
    .from('schedule_slots')
    .select('*')
    .eq('id', slot_id)
    .eq('status', 'available')
    .single();

  if (fetchError || !slot) {
    throw new Error('Slot not available or not found');
  }

  // Update slot status and add booking information
  const { data: bookedSlot, error: bookingError } = await supabase
    .from('schedule_slots')
    .update({
      status: 'booked',
      customer_email,
      customer_name,
      order_id,
      notes,
      booked_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', slot_id)
    .eq('status', 'available') // Double-check it's still available
    .select()
    .single();

  if (bookingError) {
    throw new Error(`Failed to book slot: ${bookingError.message}`);
  }

  // Generate calendar event
  const calendarEvent = generateCalendarEvent(bookedSlot);

  return {
    statusCode: 200,
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      success: true,
      data: {
        booking: bookedSlot,
        calendar: calendarEvent
      }
    })
  };
}

// Generate ICS calendar event
function generateCalendarEvent(slot) {
  const startDate = new Date(slot.start_time);
  const endDate = new Date(slot.end_time);
  
  const formatDate = (date) => {
    return date.toISOString().replace(/[:\-]|\.\d{3}/g, '');
  };

  const serviceTypeNames = {
    'CALL_60': 'Strategy Call (60 min)',
    'CALL_30': 'Quick Strategy Call (30 min)',
    'SPARRING': 'Strategy Sparring Session (60 min)'
  };

  const title = serviceTypeNames[slot.service_type] || 'Strategy Session';
  const description = `${title} with Ivan Peycheff\\n\\nNotes: ${slot.notes || 'None'}\\n\\nLooking forward to our conversation!`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ivan Peycheff//Strategy Session//EN',
    'BEGIN:VEVENT',
    `UID:${slot.id}@peycheff.com`,
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    'LOCATION:Video Call (Link will be provided)',
    `ORGANIZER:CN=Ivan Peycheff:MAILTO:ivan@peycheff.com`,
    `ATTENDEE:CN=${slot.customer_name}:MAILTO:${slot.customer_email}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return {
    ics: icsContent,
    filename: `strategy-session-${slot.id}.ics`
  };
}

// Cancel a booking
async function cancelSlot({ slot_id, reason = 'Customer cancellation' }) {
  const { data: cancelledSlot, error } = await supabase
    .from('schedule_slots')
    .update({
      status: 'available',
      customer_email: null,
      customer_name: null,
      order_id: null,
      notes: null,
      booked_at: null,
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason,
      updated_at: new Date().toISOString()
    })
    .eq('id', slot_id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to cancel slot: ${error.message}`);
  }

  return {
    statusCode: 200,
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      success: true,
      data: { slot: cancelledSlot }
    })
  };
}

// Get all slots (admin function)
async function getAllSlots(params = {}) {
  const { 
    status, 
    service_type, 
    start_date, 
    end_date,
    limit = 100 
  } = params;

  let query = supabase
    .from('schedule_slots')
    .select('*')
    .order('start_time', { ascending: true })
    .limit(parseInt(limit));

  if (status) {
    query = query.eq('status', status);
  }
  
  if (service_type) {
    query = query.eq('service_type', service_type);
  }
  
  if (start_date) {
    query = query.gte('start_time', start_date);
  }
  
  if (end_date) {
    query = query.lte('start_time', end_date);
  }

  const { data: slots, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch slots: ${error.message}`);
  }

  return {
    statusCode: 200,
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      success: true,
      data: {
        slots,
        total: slots.length
      }
    })
  };
}
