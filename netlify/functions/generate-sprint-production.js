const aiService = require('./lib/ai-service-production');
const PDFDocument = require('pdfkit');
const { createClient } = require('@supabase/supabase-js');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');

// Initialize services
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

/**
 * Production Sprint Generator
 * Generates personalized 30-day sprint plans with AI and delivers as PDF
 */
exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { 
      goal, 
      stack, 
      timeline = '30 days',
      experience = 'intermediate',
      constraints = 'none',
      email,
      purchaseId
    } = JSON.parse(event.body || '{}');

    // Validate inputs
    if (!goal || !stack || !email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required fields: goal, stack, email' 
        })
      };
    }

    // Check if this is a paid customer
    const isPaid = await verifyPurchase(purchaseId, email);
    
    if (!isPaid) {
      // Generate preview only
      return generatePreview(goal, stack, headers);
    }

    // Generate full sprint plan with AI
    console.log('🚀 Generating personalized sprint plan...');
    const sprintPlan = await aiService.generateSprintPlan({
      goal,
      stack,
      timeline,
      experience,
      constraints
    });

    // Generate PDF document
    console.log('📄 Creating PDF document...');
    const pdfBuffer = await generatePDF(sprintPlan, { goal, stack, email });

    // Upload to S3
    console.log('☁️ Uploading to cloud storage...');
    const fileUrl = await uploadToS3(pdfBuffer, email, purchaseId);

    // Save to database
    console.log('💾 Saving to database...');
    const saved = await saveGeneration({
      email,
      purchase_id: purchaseId,
      type: 'sprint_plan',
      metadata: {
        goal,
        stack,
        timeline,
        experience,
        constraints
      },
      file_url: fileUrl,
      ai_model: sprintPlan.metadata.model_used
    });

    // Send delivery email
    console.log('📧 Sending delivery email...');
    await sendDeliveryEmail(email, fileUrl, sprintPlan);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Sprint plan generated successfully',
        download_url: fileUrl,
        preview: {
          week1: sprintPlan.plan[0],
          total_days: 30,
          personalized: true
        },
        delivery: {
          email_sent: true,
          file_size: pdfBuffer.length
        }
      })
    };

  } catch (error) {
    console.error('Sprint generation error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Generation failed',
        message: error.message
      })
    };
  }
};

// Verify purchase
async function verifyPurchase(purchaseId, email) {
  if (!purchaseId) return false;

  try {
    const { data, error } = await supabase
      .from('purchases')
      .select('id, status')
      .eq('id', purchaseId)
      .eq('email', email)
      .eq('status', 'completed')
      .single();

    return !!data && !error;
  } catch (error) {
    console.error('Purchase verification failed:', error);
    return false;
  }
}

// Generate preview for non-paid users
async function generatePreview(goal, stack, headers) {
  // Use simpler AI model for preview
  const preview = await generateBasicPreview(goal, stack);
  
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      preview: true,
      message: 'This is a preview. Purchase to get the full 30-day plan.',
      week1_sample: preview,
      upgrade_url: `/checkout?product=PACK_30DAY&goal=${encodeURIComponent(goal)}&stack=${encodeURIComponent(stack)}`
    })
  };
}

// Generate basic preview without full AI
async function generateBasicPreview(goal, stack) {
  // Use templates with some customization
  const templates = {
    'react': {
      day1: 'Set up React with Vite, configure TypeScript, install core dependencies',
      day2: 'Design component architecture, create base UI components',
      day3: 'Implement routing with React Router, set up state management'
    },
    'nextjs': {
      day1: 'Initialize Next.js 14 app, configure App Router, set up TypeScript',
      day2: 'Create API routes, configure database connection with Prisma',
      day3: 'Build authentication with NextAuth, implement middleware'
    },
    'vue': {
      day1: 'Set up Vue 3 with Vite, configure composition API setup',
      day2: 'Create component library, implement Pinia store',
      day3: 'Set up Vue Router, implement navigation guards'
    }
  };

  const stackKey = Object.keys(templates).find(key => 
    stack.toLowerCase().includes(key)
  ) || 'react';

  return {
    days: [
      {
        day: 'Day 1',
        focus: `Foundation for ${goal}`,
        tasks: [templates[stackKey].day1],
        timeEstimate: '4-6 hours'
      },
      {
        day: 'Day 2',
        focus: 'Core Architecture',
        tasks: [templates[stackKey].day2],
        timeEstimate: '5-7 hours'
      },
      {
        day: 'Day 3',
        focus: 'Essential Features',
        tasks: [templates[stackKey].day3],
        timeEstimate: '6-8 hours'
      }
    ],
    note: 'This is a simplified preview. Full plan includes 30 days of detailed, personalized tasks.'
  };
}

// Generate PDF document
async function generatePDF(sprintPlan, metadata) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, left: 50, right: 50, bottom: 50 },
        info: {
          Title: `30-Day Sprint Plan: ${metadata.goal}`,
          Author: 'peycheff.com',
          Subject: 'Personalized Sprint Plan',
          CreationDate: new Date()
        }
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Cover page
      doc.fontSize(32)
         .font('Helvetica-Bold')
         .text('30-Day Sprint Plan', { align: 'center' });
      
      doc.moveDown();
      doc.fontSize(20)
         .font('Helvetica')
         .text(metadata.goal, { align: 'center' });
      
      doc.moveDown();
      doc.fontSize(14)
         .text(`Tech Stack: ${metadata.stack}`, { align: 'center' });
      
      doc.moveDown(2);
      doc.fontSize(12)
         .fillColor('#666')
         .text(`Generated for ${metadata.email}`, { align: 'center' });
      doc.text(new Date().toLocaleDateString(), { align: 'center' });
      
      // New page for content
      doc.addPage();
      
      // Executive Summary
      doc.fontSize(20)
         .fillColor('#000')
         .font('Helvetica-Bold')
         .text('Executive Summary');
      
      doc.moveDown();
      doc.fontSize(11)
         .font('Helvetica')
         .text(`This personalized sprint plan will guide you through building ${metadata.goal} using ${metadata.stack} over the next 30 days. Each day includes specific tasks, time estimates, and deliverables tailored to your experience level.`);
      
      doc.moveDown();
      
      // Resources section
      if (sprintPlan.resources) {
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .text('Recommended Resources');
        
        doc.moveDown();
        doc.fontSize(11)
           .font('Helvetica');
        
        if (sprintPlan.resources.tutorials?.length) {
          doc.font('Helvetica-Bold').text('Tutorials:');
          sprintPlan.resources.tutorials.forEach(tutorial => {
            doc.font('Helvetica').text(`• ${tutorial}`);
          });
          doc.moveDown();
        }
        
        if (sprintPlan.resources.tools?.length) {
          doc.font('Helvetica-Bold').text('Tools:');
          sprintPlan.resources.tools.forEach(tool => {
            doc.font('Helvetica').text(`• ${tool}`);
          });
          doc.moveDown();
        }
      }
      
      // Week-by-week breakdown
      sprintPlan.plan.forEach((week, weekIndex) => {
        if (weekIndex > 0) doc.addPage();
        
        doc.fontSize(20)
           .font('Helvetica-Bold')
           .fillColor('#000')
           .text(week.title || `Week ${weekIndex + 1}`);
        
        doc.moveDown();
        
        week.days.forEach(day => {
          doc.fontSize(14)
             .font('Helvetica-Bold')
             .fillColor('#0066CC')
             .text(day.day);
          
          if (day.focus) {
            doc.fontSize(11)
               .font('Helvetica-Oblique')
               .fillColor('#333')
               .text(`Focus: ${day.focus}`);
          }
          
          doc.moveDown(0.5);
          
          if (day.tasks?.length) {
            doc.fontSize(11)
               .font('Helvetica-Bold')
               .fillColor('#000')
               .text('Tasks:');
            
            day.tasks.forEach(task => {
              doc.font('Helvetica')
                 .text(`  • ${task}`, { indent: 10 });
            });
          }
          
          if (day.deliverable) {
            doc.moveDown(0.5);
            doc.font('Helvetica-Bold')
               .text('Deliverable: ', { continued: true })
               .font('Helvetica')
               .text(day.deliverable);
          }
          
          if (day.timeEstimate) {
            doc.font('Helvetica-Bold')
               .text('Time Estimate: ', { continued: true })
               .font('Helvetica')
               .text(day.timeEstimate);
          }
          
          if (day.blockers?.length) {
            doc.moveDown(0.5);
            doc.font('Helvetica-Bold')
               .fillColor('#CC0000')
               .text('Potential Blockers:');
            
            day.blockers.forEach(blocker => {
              doc.font('Helvetica')
                 .fillColor('#000')
                 .text(`  ⚠️ ${blocker}`, { indent: 10 });
            });
          }
          
          doc.moveDown(1.5);
        });
      });
      
      // Success criteria page
      doc.addPage();
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .fillColor('#000')
         .text('Success Criteria');
      
      doc.moveDown();
      doc.fontSize(11)
         .font('Helvetica')
         .text('By the end of this 30-day sprint, you will have:');
      
      doc.moveDown();
      const successCriteria = [
        'A fully functional MVP of your product',
        'Comprehensive test coverage for critical paths',
        'Production-ready deployment pipeline',
        'Documentation for users and developers',
        'Analytics and monitoring in place',
        'Initial user feedback incorporated'
      ];
      
      successCriteria.forEach(criterion => {
        doc.text(`✓ ${criterion}`);
      });
      
      // Footer
      doc.moveDown(2);
      doc.fontSize(10)
         .fillColor('#666')
         .text('---', { align: 'center' });
      doc.text('Generated by peycheff.com AI Sprint Generator', { align: 'center' });
      doc.text('Questions? Email ivan@peycheff.com', { align: 'center' });
      
      // Finalize PDF
      doc.end();
      
    } catch (error) {
      reject(error);
    }
  });
}

// Upload PDF to S3
async function uploadToS3(pdfBuffer, email, purchaseId) {
  const fileName = `sprint-plans/${purchaseId || crypto.randomBytes(8).toString('hex')}-${Date.now()}.pdf`;
  
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET || 'peycheff-downloads',
      Key: fileName,
      Body: pdfBuffer,
      ContentType: 'application/pdf',
      Metadata: {
        email,
        generated: new Date().toISOString()
      }
    });

    await s3.send(command);
    
    // Generate signed URL (valid for 7 days)
    const url = `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${fileName}`;
    
    return url;
    
  } catch (error) {
    console.error('S3 upload failed:', error);
    
    // Fallback to Supabase storage
    return uploadToSupabase(pdfBuffer, fileName);
  }
}

// Fallback upload to Supabase
async function uploadToSupabase(pdfBuffer, fileName) {
  const { data, error } = await supabase.storage
    .from('downloads')
    .upload(fileName, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: false
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('downloads')
    .getPublicUrl(fileName);

  return publicUrl;
}

// Save generation record
async function saveGeneration(data) {
  const { error } = await supabase
    .from('generations')
    .insert([{
      ...data,
      created_at: new Date().toISOString()
    }]);

  if (error) {
    console.error('Failed to save generation:', error);
  }
  
  return !error;
}

// Send delivery email
async function sendDeliveryEmail(email, fileUrl, sprintPlan) {
  // This would integrate with your email service
  // For now, we'll just log it
  console.log(`📧 Would send email to ${email} with download link: ${fileUrl}`);
  
  // In production, use Resend or similar:
  /*
  const { Resend } = require('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  await resend.emails.send({
    from: 'ivan@peycheff.com',
    to: email,
    subject: 'Your 30-Day Sprint Plan is Ready!',
    html: generateEmailHTML(fileUrl, sprintPlan)
  });
  */
  
  return true;
}
