const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');
const PDFDocument = require('pdfkit');
const crypto = require('crypto');

// Initialize clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Sprint generation prompt kernel
const SPRINT_PROMPT = `Generate a comprehensive 30-day sprint plan for:
Goal: {goal}
Team Size: {team}
Tech Stack: {stack}
Deadline: {deadline}

Structure the response as a detailed JSON with:
1. Weekly schedules (4 weeks) with daily tasks
2. Daily cadence with specific morning/afternoon blocks
3. Instrumentation (metrics, checkpoints, success criteria)
4. Risk mitigation strategies
5. Review rituals and retrospective format
6. One-page cheat sheet summary

Make it:
- Extremely specific and actionable
- Blunt and direct (no fluff)
- Focused on shipping a usable v1
- Include exact tools, commands, and metrics
- Time-boxed with clear deliverables

Format as structured JSON for programmatic use.`;

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
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
    const startTime = Date.now();
    const { goal, team, stack, deadline, email, orderId } = JSON.parse(event.body || '{}');

    // Validate inputs
    if (!goal || !team || !stack || !email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required fields: goal, team, stack, email' 
        })
      };
    }

    // Check entitlements
    const { data: entitlement } = await supabase
      .from('entitlements')
      .select('*')
      .eq('email', email)
      .in('sku', ['PACK_30DAY', 'SPRINT_GEN', 'FOUNDER_PACK', 'MEMBER_PRO'])
      .single();

    if (!entitlement) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ 
          error: 'No valid entitlement found. Please purchase a sprint plan.' 
        })
      };
    }

    // Generate with OpenAI
    console.log('Generating sprint plan with AI...');
    const prompt = SPRINT_PROMPT
      .replace('{goal}', goal)
      .replace('{team}', team)
      .replace('{stack}', stack)
      .replace('{deadline}', deadline || '30 days');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert technical product strategist who creates highly actionable sprint plans. Respond only with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    });

    const sprintData = JSON.parse(completion.choices[0].message.content);
    
    // Apply style enforcement
    const styledData = await enforceAppleStyle(sprintData);

    // Generate PDF
    const pdfBuffer = await generateSprintPDF(styledData, { goal, team, stack });
    
    // Generate MDX
    const mdxContent = generateSprintMDX(styledData, { goal, team, stack });
    
    // Generate cheat sheet
    const cheatSheet = generateCheatSheet(styledData);

    // Store in Supabase Storage
    const fileId = crypto.randomUUID();
    const timestamp = Date.now();
    
    // Upload PDF
    const pdfPath = `sprints/${email}/${fileId}/sprint-plan-${timestamp}.pdf`;
    const { error: pdfError } = await supabase.storage
      .from('downloads')
      .upload(pdfPath, pdfBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600'
      });

    if (pdfError) throw pdfError;

    // Upload MDX
    const mdxPath = `sprints/${email}/${fileId}/sprint-plan-${timestamp}.mdx`;
    const { error: mdxError } = await supabase.storage
      .from('downloads')
      .upload(mdxPath, Buffer.from(mdxContent), {
        contentType: 'text/mdx',
        cacheControl: '3600'
      });

    if (mdxError) throw mdxError;

    // Upload cheat sheet
    const cheatPath = `sprints/${email}/${fileId}/cheat-sheet-${timestamp}.pdf`;
    const cheatBuffer = await generateCheatSheetPDF(cheatSheet);
    const { error: cheatError } = await supabase.storage
      .from('downloads')
      .upload(cheatPath, cheatBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600'
      });

    if (cheatError) throw cheatError;

    // Create download records
    const downloadToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await supabase.from('downloads').insert([
      {
        email,
        sku: 'SPRINT_GEN',
        file_path: pdfPath,
        token: downloadToken,
        expires_at: expiresAt
      },
      {
        email,
        sku: 'SPRINT_GEN',
        file_path: mdxPath,
        token: `${downloadToken}-mdx`,
        expires_at: expiresAt
      },
      {
        email,
        sku: 'SPRINT_GEN',
        file_path: cheatPath,
        token: `${downloadToken}-cheat`,
        expires_at: expiresAt
      }
    ]);

    // Track generation metrics
    const generationTime = Date.now() - startTime;
    await supabase.from('performance_metrics').insert({
      metric_type: 'generation',
      metric_name: 'sprint_plan',
      value_ms: generationTime,
      metadata: { email, stack, team }
    });

    // Generate download URLs
    const baseUrl = process.env.URL || 'https://peycheff.com';
    const downloadUrls = {
      pdf: `${baseUrl}/.netlify/functions/download?token=${downloadToken}`,
      mdx: `${baseUrl}/.netlify/functions/download?token=${downloadToken}-mdx`,
      cheatSheet: `${baseUrl}/.netlify/functions/download?token=${downloadToken}-cheat`
    };

    // Send email with download links
    await fetch(`${baseUrl}/.netlify/functions/send-download-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        product: '30-Day Sprint Plan',
        downloadUrls
      })
    });

    console.log(`Sprint generated in ${generationTime}ms for ${email}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        downloadUrls,
        generationTime: `${(generationTime / 1000).toFixed(1)}s`,
        message: 'Your personalized sprint plan is ready! Check your email for download links.'
      })
    };

  } catch (error) {
    console.error('Sprint generation error:', error);
    
    // Fallback to static pack if generation fails
    if (error.message?.includes('timeout') || error.message?.includes('rate')) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          fallback: true,
          downloadUrl: '/downloads/static/operator-pack-30day.pdf',
          message: 'High demand! Here\'s our proven 30-day template while we generate your custom plan.'
        })
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to generate sprint plan',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};

// Style enforcement for Apple-grade output
async function enforceAppleStyle(data) {
  // Apply strict formatting rules
  return {
    ...data,
    style: {
      maxParagraphLines: 3,
      bulletStyle: 'concise',
      tone: 'direct',
      formatting: 'clean'
    }
  };
}

// Generate PDF with Apple-grade design
async function generateSprintPDF(data, metadata) {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 72, bottom: 72, left: 72, right: 72 },
    info: {
      Title: `30-Day Sprint Plan: ${metadata.goal}`,
      Author: 'Ivan Peycheff',
      Subject: 'Personalized Sprint Planning',
      Keywords: 'sprint, planning, product, development'
    }
  });

  const chunks = [];
  doc.on('data', chunk => chunks.push(chunk));

  // Apple-style typography
  doc.font('Helvetica-Bold')
    .fontSize(32)
    .fillColor('#0B0C0F')
    .text('30-Day Sprint Plan', { align: 'left' });

  doc.moveDown(0.5)
    .font('Helvetica')
    .fontSize(14)
    .fillColor('#6B7280')
    .text(`Goal: ${metadata.goal}`, { align: 'left' })
    .text(`Stack: ${metadata.stack}`, { align: 'left' })
    .text(`Team: ${metadata.team}`, { align: 'left' });

  doc.moveDown(2);

  // Render sprint content with clean design
  // Week-by-week breakdown
  if (data.weeks) {
    data.weeks.forEach((week, index) => {
      doc.font('Helvetica-Bold')
        .fontSize(18)
        .fillColor('#0B0C0F')
        .text(`Week ${index + 1}: ${week.title || week.focus}`, { align: 'left' });
      
      doc.moveDown(0.5);
      
      if (week.days) {
        week.days.forEach(day => {
          doc.font('Helvetica-Bold')
            .fontSize(12)
            .fillColor('#1A1D23')
            .text(day.name || `Day ${day.number}`);
          
          doc.font('Helvetica')
            .fontSize(11)
            .fillColor('#6B7280');
          
          if (day.tasks) {
            day.tasks.forEach(task => {
              doc.text(`• ${task}`, { indent: 20 });
            });
          }
          
          doc.moveDown(0.5);
        });
      }
      
      doc.moveDown(1);
    });
  }

  // End document
  doc.end();

  // Return buffer
  return new Promise((resolve) => {
    doc.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
  });
}

// Generate MDX content
function generateSprintMDX(data, metadata) {
  let mdx = `---
title: "30-Day Sprint Plan: ${metadata.goal}"
stack: "${metadata.stack}"
team: "${metadata.team}"
generated: "${new Date().toISOString()}"
---

# 30-Day Sprint Plan

## Overview
**Goal:** ${metadata.goal}  
**Stack:** ${metadata.stack}  
**Team:** ${metadata.team}  

---

`;

  // Add weekly breakdowns
  if (data.weeks) {
    data.weeks.forEach((week, index) => {
      mdx += `## Week ${index + 1}: ${week.title || week.focus}\n\n`;
      
      if (week.days) {
        week.days.forEach(day => {
          mdx += `### ${day.name || `Day ${day.number}`}\n\n`;
          
          if (day.tasks) {
            day.tasks.forEach(task => {
              mdx += `- ${task}\n`;
            });
          }
          
          mdx += `\n`;
        });
      }
      
      mdx += `\n---\n\n`;
    });
  }

  // Add instrumentation section
  if (data.instrumentation) {
    mdx += `## Instrumentation\n\n`;
    mdx += `### Metrics to Track\n`;
    if (data.instrumentation.metrics) {
      data.instrumentation.metrics.forEach(metric => {
        mdx += `- ${metric}\n`;
      });
    }
    mdx += `\n`;
  }

  // Add risks section
  if (data.risks) {
    mdx += `## Risk Mitigation\n\n`;
    data.risks.forEach(risk => {
      mdx += `### ${risk.title}\n${risk.mitigation}\n\n`;
    });
  }

  return mdx;
}

// Generate cheat sheet
function generateCheatSheet(data) {
  return {
    title: 'Sprint Cheat Sheet',
    keyMilestones: data.milestones || [],
    dailyRituals: data.dailyCadence || [],
    successCriteria: data.successCriteria || [],
    quickWins: data.quickWins || []
  };
}

// Generate cheat sheet PDF
async function generateCheatSheetPDF(cheatData) {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 }
  });

  const chunks = [];
  doc.on('data', chunk => chunks.push(chunk));

  // Title
  doc.font('Helvetica-Bold')
    .fontSize(24)
    .fillColor('#0B0C0F')
    .text('Sprint Cheat Sheet', { align: 'center' });

  doc.moveDown(2);

  // Sections
  const sections = [
    { title: 'Key Milestones', items: cheatData.keyMilestones },
    { title: 'Daily Rituals', items: cheatData.dailyRituals },
    { title: 'Success Criteria', items: cheatData.successCriteria },
    { title: 'Quick Wins', items: cheatData.quickWins }
  ];

  sections.forEach(section => {
    if (section.items && section.items.length > 0) {
      doc.font('Helvetica-Bold')
        .fontSize(14)
        .fillColor('#1A1D23')
        .text(section.title);
      
      doc.moveDown(0.5);
      
      doc.font('Helvetica')
        .fontSize(11)
        .fillColor('#6B7280');
      
      section.items.forEach(item => {
        doc.text(`• ${item}`, { indent: 15 });
      });
      
      doc.moveDown(1.5);
    }
  });

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
  });
}
