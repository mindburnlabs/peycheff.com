const { aiService } = require('./lib/ai-service');
const { pdfService } = require('./lib/pdf-service');
const { supabase, addInquiry } = require('./lib/supabase-service');
const { sendEmail } = require('./lib/email-service');

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS enabled' })
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const requestBody = JSON.parse(event.body);
    const { packType, userInputs, deliveryOptions = {} } = requestBody;

    // Validate required fields
    if (!packType || !userInputs) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required fields: packType and userInputs' 
        })
      };
    }

    // Validate user inputs for the specific pack type
    const validation = aiService.validateInputs(packType, userInputs);
    if (!validation.valid) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Invalid user inputs',
          details: validation.message,
          missingFields: validation.missingFields
        })
      };
    }

    console.log(`Generating pack: ${packType} for ${userInputs.name || 'anonymous'}`);

    // Generate personalized content using AI
    const packResult = await aiService.generatePersonalizedPack(packType, userInputs);
    
    if (!packResult.success) {
      console.error('AI pack generation failed:', packResult.error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Failed to generate personalized content',
          details: packResult.error
        })
      };
    }

    console.log(`Generated ${Object.keys(packResult.sections).length} sections`);

    // Generate PDF if requested
    let pdfResult = null;
    if (deliveryOptions.includePDF !== false) {
      pdfResult = await pdfService.generatePackPDF(packResult, packType);
      
      if (!pdfResult.success) {
        console.error('PDF generation failed:', pdfResult.error);
        // Continue without PDF - content is still valuable
      } else {
        console.log(`Generated PDF: ${pdfResult.size} bytes`);
      }
    }

    // Store generation record in Supabase
    const generationRecord = {
      pack_type: packType,
      user_email: userInputs.email,
      user_name: userInputs.name,
      user_inputs: userInputs,
      content_generated: !!packResult.success,
      pdf_generated: !!pdfResult?.success,
      generated_at: new Date().toISOString(),
      sections_count: Object.keys(packResult.sections).length,
      content_size: JSON.stringify(packResult).length,
      pdf_size: pdfResult?.size || 0
    };

    try {
      const { error: dbError } = await supabase
        .from('pack_generations')
        .insert([generationRecord]);
      
      if (dbError) {
        console.error('Database logging failed:', dbError);
        // Continue - generation was successful even if logging failed
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue - generation was successful even if logging failed
    }

    // Prepare response
    const response = {
      success: true,
      packType,
      title: packResult.title,
      personalizedFor: packResult.personalizedFor,
      generatedAt: packResult.generatedAt,
      sections: packResult.sections,
      sectionsCount: Object.keys(packResult.sections).length,
      contentSize: JSON.stringify(packResult).length
    };

    // Include PDF data if generated
    if (pdfResult?.success) {
      response.pdf = {
        available: true,
        size: pdfResult.size,
        // Note: We don't include the actual buffer in the response
        // PDF will be delivered via separate endpoint or email
      };
    }

    // Send delivery email if requested
    if (deliveryOptions.sendEmail !== false && userInputs.email) {
      try {
        await sendPackDeliveryEmail({
          userInputs,
          packResult,
          pdfResult: pdfResult?.success ? pdfResult : null,
          packType
        });
        
        response.emailSent = true;
      } catch (emailError) {
        console.error('Email delivery failed:', emailError);
        response.emailError = emailError.message;
        // Don't fail the entire request due to email issues
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('Pack generation error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};

// Helper function to send pack delivery email
async function sendPackDeliveryEmail({ userInputs, packResult, pdfResult, packType }) {
  const packNames = {
    'PACK_30DAY': '30-Day Idea→Product Sprint',
    'KIT_AUTOMATION': 'Micro-Automation Kit',
    'KIT_DIAGRAMS': 'Diagram Library Kit'
  };

  const emailData = {
    to: userInputs.email,
    subject: `Your ${packNames[packType]} is Ready! 🚀`,
    template: 'pack-delivery',
    data: {
      name: userInputs.name || 'there',
      packTitle: packResult.title,
      sectionsCount: Object.keys(packResult.sections).length,
      hasPDF: !!pdfResult,
      pdfSize: pdfResult ? Math.round(pdfResult.size / 1024) : 0,
      generatedAt: new Date(packResult.generatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      // Include first section preview
      previewSection: Object.values(packResult.sections)[0],
      downloadUrl: process.env.URL ? `${process.env.URL}/api/download-pack?id=${packResult.generatedAt}` : null,
      supportEmail: 'ivan@peycheff.com'
    }
  };

  // Attach PDF if available and under size limit (most email providers limit attachments)
  if (pdfResult && pdfResult.size < 10 * 1024 * 1024) { // 10MB limit
    emailData.attachments = [{
      filename: `${packResult.title.replace(/[^a-z0-9]/gi, '-')}.pdf`,
      content: pdfResult.buffer,
      contentType: 'application/pdf'
    }];
  }

  await sendEmail(emailData);
}
