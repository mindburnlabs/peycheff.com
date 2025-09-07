const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
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

// Audit generation prompt
const AUDIT_PROMPT = `Analyze this website and generate a comprehensive audit:

URL: {url}
Niche: {niche}
Goal: {goal}
Content: {content}
Metrics: {metrics}

Provide a detailed JSON response with:
1. 10 prioritized issues (Impact × Effort matrix)
2. Each issue with: title, description, impact (1-10), effort (hours), category, fix
3. 7-day implementation cadence
4. Quick wins (≤60 min fixes)
5. 3 alternative H1 headlines (56/36/24 char scales)
6. Tracking checklist (specific events to implement)
7. Conversion optimization recommendations
8. Performance improvements

Be specific, actionable, and blunt. Focus on what will actually move the needle.`;

exports.handler = async (event, context) => {
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
    const { url, niche, goal, email } = JSON.parse(event.body || '{}');

    // Validate inputs
    if (!url || !email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required fields: url, email' 
        })
      };
    }

    // Validate URL
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Invalid URL protocol');
    }

    // Check entitlements
    const { data: entitlement } = await supabase
      .from('entitlements')
      .select('*')
      .eq('email', email)
      .in('sku', ['AUDIT_PRO', 'FOUNDER_PACK', 'MEMBER_PRO'])
      .single();

    if (!entitlement) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ 
          error: 'No valid entitlement found. Please purchase Auto-Audit Pro.' 
        })
      };
    }

    console.log(`Starting audit for ${url}...`);

    // Fetch and analyze the URL
    const siteData = await fetchAndAnalyze(url);
    
    // Generate audit with AI
    const prompt = AUDIT_PROMPT
      .replace('{url}', url)
      .replace('{niche}', niche || 'general')
      .replace('{goal}', goal || 'increase conversions')
      .replace('{content}', JSON.stringify(siteData.content))
      .replace('{metrics}', JSON.stringify(siteData.metrics));

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert web auditor and conversion optimizer. Provide brutally honest, actionable audits. Respond only with valid JSON.'
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

    const auditData = JSON.parse(completion.choices[0].message.content);
    
    // Add metadata
    const audit = {
      ...auditData,
      metadata: {
        url,
        niche,
        goal,
        timestamp: new Date().toISOString(),
        performance: siteData.metrics
      }
    };

    // Generate shareable report ID
    const reportId = crypto.randomBytes(16).toString('hex');
    
    // Store audit report
    await supabase.from('audit_reports').insert({
      id: reportId,
      url,
      email,
      niche,
      goal,
      report_data: audit,
      is_public: true,
      created_at: new Date().toISOString()
    });

    // Generate PDF
    const pdfBuffer = await generateAuditPDF(audit);
    
    // Upload to storage
    const pdfPath = `audits/${email}/${reportId}/audit-report.pdf`;
    await supabase.storage
      .from('downloads')
      .upload(pdfPath, pdfBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600'
      });

    // Create download record
    const downloadToken = crypto.randomBytes(32).toString('hex');
    await supabase.from('downloads').insert({
      email,
      sku: 'AUDIT_PRO',
      file_path: pdfPath,
      token: downloadToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    // Track metrics
    const generationTime = Date.now() - startTime;
    await supabase.from('performance_metrics').insert({
      metric_type: 'generation',
      metric_name: 'audit_pro',
      value_ms: generationTime,
      metadata: { url, niche }
    });

    const baseUrl = process.env.URL || 'https://peycheff.com';
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        reportId,
        shareUrl: `${baseUrl}/r/${reportId}`,
        downloadUrl: `${baseUrl}/.netlify/functions/download?token=${downloadToken}`,
        generationTime: `${(generationTime / 1000).toFixed(1)}s`,
        summary: {
          totalIssues: audit.issues?.length || 0,
          criticalIssues: audit.issues?.filter(i => i.impact >= 8).length || 0,
          quickWins: audit.quickWins?.length || 0
        }
      })
    };

  } catch (error) {
    console.error('Audit generation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to generate audit',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};

// Fetch and analyze website
async function fetchAndAnalyze(url) {
  let browser;
  try {
    // Launch headless browser
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    
    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    
    // Navigate and wait for load
    const response = await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Collect metrics
    const metrics = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0];
      return {
        loadTime: perf?.loadEventEnd - perf?.fetchStart,
        domContentLoaded: perf?.domContentLoadedEventEnd - perf?.fetchStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime
      };
    });

    // Extract content
    const content = await page.evaluate(() => {
      return {
        title: document.title,
        h1: Array.from(document.querySelectorAll('h1')).map(h => h.textContent.trim()),
        h2: Array.from(document.querySelectorAll('h2')).slice(0, 5).map(h => h.textContent.trim()),
        meta: {
          description: document.querySelector('meta[name="description"]')?.content,
          viewport: document.querySelector('meta[name="viewport"]')?.content,
          ogTitle: document.querySelector('meta[property="og:title"]')?.content
        },
        links: {
          total: document.querySelectorAll('a').length,
          external: Array.from(document.querySelectorAll('a[href^="http"]')).filter(a => !a.href.includes(window.location.hostname)).length
        },
        images: {
          total: document.querySelectorAll('img').length,
          withoutAlt: document.querySelectorAll('img:not([alt])').length
        },
        forms: document.querySelectorAll('form').length,
        buttons: document.querySelectorAll('button, input[type="submit"]').length
      };
    });

    // Take screenshot for reference
    const screenshot = await page.screenshot({ 
      encoding: 'base64',
      fullPage: false,
      type: 'jpeg',
      quality: 80
    });

    await browser.close();

    return {
      metrics,
      content,
      screenshot,
      statusCode: response.status()
    };

  } catch (error) {
    if (browser) await browser.close();
    throw error;
  }
}

// Generate PDF report
async function generateAuditPDF(audit) {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 72, bottom: 72, left: 72, right: 72 },
    info: {
      Title: `Website Audit Report: ${audit.metadata.url}`,
      Author: 'Ivan Peycheff',
      Subject: 'Comprehensive Website Audit',
      Keywords: 'audit, website, optimization, conversion'
    }
  });

  const chunks = [];
  doc.on('data', chunk => chunks.push(chunk));

  // Title page
  doc.font('Helvetica-Bold')
    .fontSize(32)
    .fillColor('#0B0C0F')
    .text('Website Audit Report', { align: 'left' });

  doc.moveDown(0.5)
    .font('Helvetica')
    .fontSize(14)
    .fillColor('#6B7280')
    .text(`URL: ${audit.metadata.url}`, { align: 'left' })
    .text(`Date: ${new Date().toLocaleDateString()}`, { align: 'left' })
    .text(`Goal: ${audit.metadata.goal}`, { align: 'left' });

  // Executive summary
  doc.addPage()
    .font('Helvetica-Bold')
    .fontSize(24)
    .fillColor('#0B0C0F')
    .text('Executive Summary');

  doc.moveDown()
    .font('Helvetica')
    .fontSize(12)
    .fillColor('#4B5563');

  if (audit.summary) {
    doc.text(audit.summary);
  }

  // Issues section
  if (audit.issues && audit.issues.length > 0) {
    doc.addPage()
      .font('Helvetica-Bold')
      .fontSize(24)
      .fillColor('#0B0C0F')
      .text('Priority Issues');

    audit.issues.forEach((issue, index) => {
      doc.moveDown()
        .font('Helvetica-Bold')
        .fontSize(14)
        .fillColor('#1F2937')
        .text(`${index + 1}. ${issue.title}`);
      
      doc.font('Helvetica')
        .fontSize(11)
        .fillColor('#4B5563')
        .text(`Impact: ${issue.impact}/10 | Effort: ${issue.effort}`, { indent: 20 })
        .text(issue.description, { indent: 20 });
      
      if (issue.fix) {
        doc.font('Helvetica-Bold')
          .fontSize(11)
          .fillColor('#059669')
          .text('Fix:', { indent: 20 })
          .font('Helvetica')
          .fillColor('#4B5563')
          .text(issue.fix, { indent: 20 });
      }
    });
  }

  // 7-day cadence
  if (audit.cadence) {
    doc.addPage()
      .font('Helvetica-Bold')
      .fontSize(24)
      .fillColor('#0B0C0F')
      .text('7-Day Implementation Plan');

    doc.moveDown()
      .font('Helvetica')
      .fontSize(12)
      .fillColor('#4B5563');

    Object.entries(audit.cadence).forEach(([day, tasks]) => {
      doc.font('Helvetica-Bold')
        .text(day)
        .font('Helvetica');
      
      if (Array.isArray(tasks)) {
        tasks.forEach(task => {
          doc.text(`• ${task}`, { indent: 20 });
        });
      }
      doc.moveDown(0.5);
    });
  }

  // Watermark
  doc.font('Helvetica')
    .fontSize(10)
    .fillColor('#9CA3AF')
    .text('Generated by peycheff.com Auto-Audit Pro', { align: 'center' });

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
  });
}
