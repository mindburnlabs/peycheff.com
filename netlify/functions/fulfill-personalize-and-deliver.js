const { aiService } = require('./lib/ai-service');
const { pdfService } = require('./lib/pdf-service');
const { sendEmail } = require('./lib/email-service');
const { supabase } = require('./lib/supabase-service');

/**
 * Fulfillment handler for personalized digital products (PACK_30DAY, KIT_AUTOMATION, KIT_DIAGRAMS)
 * Directly generates personalized content using AI → creates PDF → delivers via email
 */
exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Verify authorization
    const authHeader = event.headers.authorization;
    const expectedAuth = `Bearer ${process.env.FULFILLMENT_SECRET || 'default-secret'}`;
    
    if (authHeader !== expectedAuth) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    const requestBody = JSON.parse(event.body);
    const { sku, config, purchase } = requestBody;

    console.log(`Processing personalized fulfillment for ${sku} → ${purchase.customer_email}`);

    // Extract user inputs from purchase metadata
    const userInputs = extractUserInputsFromMetadata(purchase.metadata, purchase.customer_email, sku);

    // Record the purchase in pack_purchases table
    const purchaseRecord = await createPackPurchase({
      stripe_payment_intent_id: purchase.session_id,
      stripe_customer_id: purchase.metadata.stripe_customer_id || null,
      stripe_checkout_session_id: purchase.session_id,
      pack_type: sku,
      amount: purchase.amount,
      currency: 'usd',
      status: 'paid',
      customer_email: purchase.customer_email,
      customer_name: purchase.metadata.customer_name || null,
      customer_metadata: purchase.metadata || {}
    });

    // Start pack generation with timing
    const startTime = Date.now();
    
    try {
      // Generate personalized content using AI
      console.log(`Generating AI content for ${sku}...`);
      const packResult = await aiService.generatePersonalizedPack(sku, userInputs);
      
      if (!packResult.success) {
        throw new Error(`AI generation failed: ${packResult.error}`);
      }

      console.log(`AI generation completed. Generated ${Object.keys(packResult.sections).length} sections`);

      // Generate PDF
      console.log(`Generating PDF for ${sku}...`);
      const pdfResult = await pdfService.generatePackPDF(packResult, sku);
      
      if (!pdfResult.success) {
        console.warn(`PDF generation failed: ${pdfResult.error}`);
      }

      const endTime = Date.now();
      const generationDuration = endTime - startTime;

      // Store generation record
      const generationRecord = await createPackGeneration({
        pack_type: sku,
        pack_title: packResult.title,
        user_email: purchase.customer_email,
        user_name: userInputs.name || purchase.metadata.customer_name,
        user_inputs: userInputs,
        content_generated: true,
        pdf_generated: !!pdfResult?.success,
        generated_at: packResult.generatedAt,
        sections_count: Object.keys(packResult.sections).length,
        content_size: JSON.stringify(packResult).length,
        pdf_size: pdfResult?.size || 0,
        stripe_payment_intent_id: purchase.session_id,
        purchase_amount: purchase.amount,
        purchase_currency: 'usd',
        ai_model_used: 'gpt-4',
        generation_duration_ms: generationDuration,
        generated_content: packResult
      });

      // Update purchase record with generation ID
      await updatePackPurchase(purchaseRecord.id, {
        fulfilled: true,
        fulfilled_at: new Date().toISOString(),
        pack_generation_id: generationRecord.id
      });

      // Send delivery email with pack content
      await sendPackDeliveryEmail({
        userInputs: {
          ...userInputs,
          email: purchase.customer_email,
          name: userInputs.name || purchase.metadata.customer_name || 'Valued Customer'
        },
        packResult,
        pdfResult: pdfResult?.success ? pdfResult : null,
        packType: sku,
        purchaseAmount: purchase.amount
      });

      // Update generation record to mark email sent
      await updatePackGeneration(generationRecord.id, {
        email_sent: true,
        email_sent_at: new Date().toISOString()
      });

      console.log(`Pack fulfillment completed for ${sku} → ${purchase.customer_email} in ${generationDuration}ms`);

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          sku,
          customer_email: purchase.customer_email,
          generation_id: generationRecord.id,
          generation_time_ms: generationDuration,
          sections_generated: Object.keys(packResult.sections).length,
          pdf_generated: !!pdfResult?.success,
          email_sent: true
        })
      };

    } catch (generationError) {
      console.error(`Pack generation failed for ${sku}:`, generationError);

      // Record failed generation
      const failedRecord = await createPackGeneration({
        pack_type: sku,
        user_email: purchase.customer_email,
        user_name: userInputs.name || purchase.metadata.customer_name,
        user_inputs: userInputs,
        content_generated: false,
        pdf_generated: false,
        stripe_payment_intent_id: purchase.session_id,
        purchase_amount: purchase.amount,
        generation_error: generationError.message,
        generation_duration_ms: Date.now() - startTime
      });

      // Send error notification to customer
      await sendPackErrorNotification({
        customer_email: purchase.customer_email,
        customer_name: userInputs.name || 'Valued Customer',
        pack_name: config.name,
        error_message: 'We encountered an issue generating your pack. Our team has been notified and will manually complete your order within 24 hours.'
      });

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: false,
          sku,
          customer_email: purchase.customer_email,
          error: 'Generation failed - manual fulfillment initiated',
          generation_id: failedRecord.id
        })
      };
    }

  } catch (error) {
    console.error('Fulfillment error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Fulfillment processing failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};

// Helper function to extract user inputs from purchase metadata
function extractUserInputsFromMetadata(metadata, customerEmail, sku) {
  // Start with defaults
  const userInputs = {
    name: metadata.customer_name || metadata.name || '',
    email: customerEmail
  };

  // Pack-specific field extraction from metadata
  if (sku === 'PACK_30DAY') {
    userInputs.idea = metadata.idea || metadata.project_idea || '';
    userInputs.timeline = metadata.timeline || '30 days';
    userInputs.technical_level = metadata.technical_level || metadata.tech_level || 'Intermediate';
    userInputs.industry = metadata.industry || '';
    userInputs.budget = metadata.budget || '';
    userInputs.team_size = metadata.team_size || 'Just me';
    userInputs.target_market = metadata.target_market || '';
    userInputs.biggest_challenge = metadata.biggest_challenge || metadata.challenge || '';
    userInputs.success_criteria = metadata.success_criteria || '';
  } else if (sku === 'KIT_AUTOMATION') {
    userInputs.current_tools = metadata.current_tools || metadata.tools || '';
    userInputs.biggest_challenge = metadata.biggest_challenge || metadata.challenge || 'Time management';
    userInputs.industry = metadata.industry || '';
    userInputs.team_size = metadata.team_size || 'Just me';
    userInputs.technical_level = metadata.technical_level || 'Intermediate';
    userInputs.time_spent = metadata.time_spent || '';
    userInputs.manual_processes = metadata.manual_processes || '';
  } else if (sku === 'KIT_DIAGRAMS') {
    userInputs.industry = metadata.industry || '';
    userInputs.team_size = metadata.team_size || 'Just me';
    userInputs.role = metadata.role || '';
    userInputs.biggest_challenge = metadata.biggest_challenge || metadata.challenge || '';
    userInputs.decision_types = metadata.decision_types || '';
    userInputs.stakeholders = metadata.stakeholders || '';
  }

  // Add common optional fields
  userInputs.company = metadata.company || '';
  userInputs.additional_context = metadata.additional_context || metadata.notes || '';

  return userInputs;
}

// Database operations
async function createPackPurchase(purchaseData) {
  const { data, error } = await supabase
    .from('pack_purchases')
    .insert(purchaseData)
    .select()
    .single();
    
  if (error) {
    console.error('Error creating pack purchase:', error);
    throw error;
  }
  
  return data;
}

async function updatePackPurchase(purchaseId, updates) {
  const { error } = await supabase
    .from('pack_purchases')
    .update(updates)
    .eq('id', purchaseId);
    
  if (error) {
    console.error('Error updating pack purchase:', error);
    throw error;
  }
}

async function createPackGeneration(generationData) {
  const { data, error } = await supabase
    .from('pack_generations')
    .insert(generationData)
    .select()
    .single();
    
  if (error) {
    console.error('Error creating pack generation:', error);
    throw error;
  }
  
  return data;
}

async function updatePackGeneration(generationId, updates) {
  const { error } = await supabase
    .from('pack_generations')
    .update(updates)
    .eq('id', generationId);
    
  if (error) {
    console.error('Error updating pack generation:', error);
    throw error;
  }
}

// Email functions
async function sendPackDeliveryEmail({ userInputs, packResult, pdfResult, packType, purchaseAmount }) {
  const packNames = {
    'PACK_30DAY': '30-Day Idea→Product Sprint',
    'KIT_AUTOMATION': 'Micro-Automation Kit',
    'KIT_DIAGRAMS': 'Visual Thinking Toolkit'
  };

  const emailData = {
    to: userInputs.email,
    subject: `Your ${packNames[packType]} is Ready! 🚀`,
    template: 'pack-delivery',
    data: {
      name: userInputs.name || 'there',
      packTitle: packResult.title,
      packType: packNames[packType],
      sectionsCount: Object.keys(packResult.sections).length,
      purchaseAmount: `$${(purchaseAmount / 100).toFixed(2)}`,
      hasPDF: !!pdfResult,
      pdfSize: pdfResult ? Math.round(pdfResult.size / 1024) : 0,
      generatedAt: new Date(packResult.generatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      // Include first section preview
      previewSection: Object.values(packResult.sections)[0],
      nextSteps: getNextStepsForPack(packType),
      supportEmail: 'ivan@peycheff.com'
    }
  };

  // Attach PDF if available and under size limit
  if (pdfResult && pdfResult.size < 10 * 1024 * 1024) { // 10MB limit
    emailData.attachments = [{
      filename: `${packResult.title.replace(/[^a-z0-9]/gi, '-')}.pdf`,
      content: pdfResult.buffer,
      contentType: 'application/pdf'
    }];
  }

  return await sendEmail(emailData);
}

async function sendPackErrorNotification({ customer_email, customer_name, pack_name, error_message }) {
  const emailData = {
    to: customer_email,
    subject: `Update on Your ${pack_name} Order`,
    template: 'pack-error',
    data: {
      name: customer_name,
      pack_name,
      error_message,
      support_email: 'ivan@peycheff.com'
    }
  };

  return await sendEmail(emailData);
}

function getNextStepsForPack(packType) {
  const nextSteps = {
    'PACK_30DAY': [
      'Review your personalized roadmap',
      'Set up your development environment',
      'Start with Week 1 validation activities',
      'Book a strategy session for detailed planning'
    ],
    'KIT_AUTOMATION': [
      'Review your automation audit',
      'Start with the quick wins (0-2 hours)',
      'Set up your first automation script',
      'Schedule a follow-up for advanced automations'
    ],
    'KIT_DIAGRAMS': [
      'Explore your visual thinking framework',
      'Try the diagram templates for your next project',
      'Customize templates for your team',
      'Book a session for advanced visual strategy'
    ]
  };

  return nextSteps[packType] || [];
}

