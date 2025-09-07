// Test script for the auto-scheduler system
// Run with: node test-scheduler.js

const fetch = require('node-fetch');

// Test configuration
const BASE_URL = 'http://localhost:8888/.netlify/functions';
const ADMIN_KEY = 'test-admin-key-123'; // Should match your actual ADMIN_KEY

async function testSchedulerSystem() {
  console.log('🚀 Testing Auto-Scheduler System\n');

  try {
    // Step 1: Generate some test slots
    console.log('1. Generating test schedule slots...');
    const generateResponse = await fetch(`${BASE_URL}/admin-generate-slots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': ADMIN_KEY
      },
      body: JSON.stringify({
        days_ahead: 7, // Just 1 week for testing
        service_types: ['CALL_60', 'CALL_30']
      })
    });

    const generateResult = await generateResponse.json();
    console.log('Generation result:', generateResult);

    if (!generateResult.success) {
      throw new Error('Failed to generate slots');
    }

    // Step 2: Fetch available slots
    console.log('\n2. Fetching available slots...');
    const availableResponse = await fetch(`${BASE_URL}/schedule-slots/available?service_type=CALL_60`);
    const availableResult = await availableResponse.json();
    console.log('Available slots:', availableResult.data?.slots?.length || 0);

    if (!availableResult.success || !availableResult.data?.slots?.length) {
      throw new Error('No available slots found');
    }

    // Step 3: Book a slot
    console.log('\n3. Booking a test slot...');
    const firstSlot = availableResult.data.slots[0];
    console.log('Booking slot:', firstSlot.id);

    const bookingResponse = await fetch(`${BASE_URL}/schedule-slots/book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        slot_id: firstSlot.id,
        customer_email: 'test@example.com',
        customer_name: 'Test Customer',
        notes: 'This is a test booking'
      })
    });

    const bookingResult = await bookingResponse.json();
    console.log('Booking result:', bookingResult);

    if (!bookingResult.success) {
      throw new Error('Failed to book slot');
    }

    // Step 4: Verify the slot is no longer available
    console.log('\n4. Verifying slot is booked...');
    const verifyResponse = await fetch(`${BASE_URL}/schedule-slots/available?service_type=CALL_60`);
    const verifyResult = await verifyResponse.json();
    
    const bookedSlotStillAvailable = verifyResult.data?.slots?.find(s => s.id === firstSlot.id);
    if (bookedSlotStillAvailable) {
      throw new Error('Booked slot is still showing as available');
    }

    console.log('✅ Scheduler system test completed successfully!');
    console.log('\nTest Summary:');
    console.log(`- Generated ${generateResult.data?.generated_count || 0} slots`);
    console.log(`- Found ${availableResult.data?.slots?.length || 0} available slots`);
    console.log(`- Successfully booked slot: ${firstSlot.id}`);
    console.log(`- Booking confirmed for: ${bookingResult.data?.booking?.customer_name}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Helper function to test local development
async function testLocalDev() {
  console.log('📋 Testing local development setup...\n');

  try {
    // Check if Netlify Dev is running
    const healthCheck = await fetch('http://localhost:8888/.netlify/functions/schedule-slots/available');
    console.log('✅ Netlify Dev is running');
    
    await testSchedulerSystem();
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('⚠️  Netlify Dev is not running. Please run: npm run dev');
      console.log('   This will start the local development server with Netlify Functions');
    } else {
      console.error('❌ Local development test failed:', error.message);
    }
  }
}

// Run tests
if (require.main === module) {
  testLocalDev();
}
