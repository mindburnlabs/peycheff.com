const aiService = require('./lib/ai-service-production');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Utility Tools API
 * Provides backend processing for all utility pass features
 */
exports.handler = async (event, context) => {
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
    const { tool, data, userId, subscriptionId } = JSON.parse(event.body || '{}');

    // Verify subscription
    const hasAccess = await verifyUtilityPassAccess(userId, subscriptionId);
    if (!hasAccess) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ 
          error: 'Utility Pass subscription required',
          upgrade_url: '/products/utility-pass'
        })
      };
    }

    // Route to appropriate tool handler
    let result;
    switch (tool) {
      case 'utm-memory':
        result = await processUTMMemory(data, userId);
        break;
      case 'note-to-thread':
        result = await processNoteToThread(data, userId);
        break;
      case 'headline-linearify':
        result = await processHeadlineLinearify(data, userId);
        break;
      case 'pricing-heuristic':
        result = await processPricingHeuristic(data, userId);
        break;
      case 'brief-forge':
        result = await processBriefForge(data, userId);
        break;
      case 'audit-report':
        result = await processAuditReport(data, userId);
        break;
      default:
        throw new Error(`Unknown tool: ${tool}`);
    }

    // Track usage
    await trackToolUsage(userId, tool);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        tool,
        result,
        credits_remaining: await getCreditsRemaining(userId)
      })
    };

  } catch (error) {
    console.error('Utility tool error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Processing failed',
        message: error.message
      })
    };
  }
};

// Verify utility pass access
async function verifyUtilityPassAccess(userId, subscriptionId) {
  if (!userId) return false;

  const { data, error } = await supabase
    .from('subscriptions')
    .select('status, expires_at')
    .eq('user_id', userId)
    .eq('product_type', 'utility_pass')
    .eq('status', 'active')
    .single();

  if (error || !data) return false;

  // Check if subscription is still valid
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return false;
  }

  return true;
}

// UTM Memory Tool - Enhanced with AI suggestions
async function processUTMMemory(data, userId) {
  const { action, urls, exportFormat } = data;

  if (action === 'generate') {
    const { baseUrl, campaign, source, medium, term, content } = data;
    
    // AI-enhanced campaign suggestions
    const suggestions = await aiService.generateCampaignSuggestions({
      baseUrl,
      existingCampaign: campaign,
      context: { source, medium }
    });

    const taggedUrl = buildUTMUrl(baseUrl, { 
      utm_source: source,
      utm_medium: medium,
      utm_campaign: campaign,
      utm_term: term,
      utm_content: content
    });

    // Store in database
    await supabase.from('utm_links').insert({
      user_id: userId,
      original_url: baseUrl,
      tagged_url: taggedUrl,
      campaign,
      source,
      medium,
      term,
      content,
      created_at: new Date().toISOString()
    });

    return {
      tagged_url: taggedUrl,
      suggestions,
      shortened_url: await shortenUrl(taggedUrl)
    };
  }

  if (action === 'export') {
    const { data: savedUrls } = await supabase
      .from('utm_links')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (exportFormat === 'csv') {
      return generateCSV(savedUrls);
    } else if (exportFormat === 'json') {
      return savedUrls;
    }
  }

  if (action === 'analyze') {
    // Analyze UTM performance
    const analytics = await analyzeUTMPerformance(userId);
    return analytics;
  }
}

// Note to Thread Converter - AI-powered
async function processNoteToThread(data, userId) {
  const { note, platforms = ['twitter', 'linkedin'], style = 'professional' } = data;

  const threads = {};

  // Generate Twitter/X thread
  if (platforms.includes('twitter')) {
    const twitterPrompt = `Convert this note into an engaging Twitter thread. Each tweet should be under 280 characters. Make it ${style}. Add relevant emojis. Include a hook in the first tweet and a CTA in the last.

Note: ${note}`;

    const twitterResponse = await aiService.generateContent('thread', 'twitter', {
      prompt: twitterPrompt,
      max_tweets: 10,
      style
    });

    threads.twitter = parseTwitterThread(twitterResponse.content);
  }

  // Generate LinkedIn post
  if (platforms.includes('linkedin')) {
    const linkedinPrompt = `Convert this note into a compelling LinkedIn post. Make it ${style}. Include a strong hook, valuable insights, and a call-to-action. Format with line breaks for readability.

Note: ${note}`;

    const linkedinResponse = await aiService.generateContent('post', 'linkedin', {
      prompt: linkedinPrompt,
      style
    });

    threads.linkedin = linkedinResponse.content;
  }

  // Generate carousel slides
  if (platforms.includes('carousel')) {
    const carouselPrompt = `Convert this note into 10 carousel slides. Each slide should have a title (max 10 words) and content (max 50 words). Make it visually appealing and ${style}.

Note: ${note}`;

    const carouselResponse = await aiService.generateContent('carousel', 'instagram', {
      prompt: carouselPrompt,
      style
    });

    threads.carousel = parseCarouselSlides(carouselResponse.content);
  }

  // Save generated threads
  await supabase.from('generated_threads').insert({
    user_id: userId,
    original_note: note,
    threads: JSON.stringify(threads),
    style,
    created_at: new Date().toISOString()
  });

  return threads;
}

// Headline Linearify - Make headlines Linear-quality
async function processHeadlineLinearify(data, userId) {
  const { headline, context = 'product', tone = 'confident' } = data;

  const prompt = `Transform this headline into a Linear-quality headline. Linear's style is:
- Clear and direct
- No fluff or corporate speak
- Confident without being arrogant
- Focus on outcomes, not features
- Use active voice
- Be specific, not generic

Original headline: ${headline}
Context: ${context}
Tone: ${tone}

Generate 5 variations, each progressively more refined.`;

  const response = await aiService.generateContent('headlines', 'linear', {
    prompt,
    variations: 5
  });

  const headlines = parseHeadlineVariations(response.content);

  // Score each headline
  const scoredHeadlines = headlines.map(h => ({
    headline: h,
    score: scoreHeadlineQuality(h),
    improvements: getHeadlineImprovements(h, headline)
  }));

  return {
    original: headline,
    linearified: scoredHeadlines,
    best: scoredHeadlines.reduce((a, b) => a.score > b.score ? a : b),
    tips: getLinearWritingTips()
  };
}

// Pricing Heuristic Calculator
async function processPricingHeuristic(data, userId) {
  const { 
    product_type,
    target_market,
    competitors = [],
    value_metrics,
    cost_structure
  } = data;

  const prompt = `Analyze pricing strategy for:
Product: ${product_type}
Market: ${target_market}
Competitors: ${JSON.stringify(competitors)}
Value Metrics: ${JSON.stringify(value_metrics)}
Costs: ${JSON.stringify(cost_structure)}

Provide:
1. Recommended pricing model (subscription, usage-based, flat, tiered)
2. Price points with justification
3. Positioning strategy
4. Discount strategy
5. Price anchoring tactics
6. Willingness to pay analysis`;

  const response = await aiService.generateContent('pricing', 'analysis', {
    prompt,
    detailed: true
  });

  const analysis = parsePricingAnalysis(response.content);

  // Calculate pricing sweet spots
  const sweetSpots = calculatePricingSweetSpots({
    competitors,
    value_metrics,
    cost_structure
  });

  return {
    recommended_model: analysis.model,
    price_points: analysis.prices,
    sweet_spots: sweetSpots,
    positioning: analysis.positioning,
    tactics: analysis.tactics,
    confidence_score: analysis.confidence,
    market_comparison: compareToMarket(analysis.prices, competitors)
  };
}

// Brief Forge - Generate strategic briefs
async function processBriefForge(data, userId) {
  const { 
    brief_type,
    project_name,
    objectives,
    constraints,
    stakeholders,
    timeline,
    budget
  } = data;

  const briefTemplates = {
    'product': generateProductBrief,
    'marketing': generateMarketingBrief,
    'technical': generateTechnicalBrief,
    'design': generateDesignBrief,
    'strategy': generateStrategyBrief
  };

  const generator = briefTemplates[brief_type] || generateStrategyBrief;
  
  const brief = await generator({
    project_name,
    objectives,
    constraints,
    stakeholders,
    timeline,
    budget
  });

  // Generate executive summary
  const executiveSummary = await generateExecutiveSummary(brief);

  // Generate success metrics
  const metrics = await generateSuccessMetrics(objectives, brief_type);

  // Create brief document
  const document = {
    title: `${project_name} - ${brief_type.charAt(0).toUpperCase() + brief_type.slice(1)} Brief`,
    executive_summary: executiveSummary,
    brief: brief,
    success_metrics: metrics,
    timeline: generateMilestones(timeline),
    budget_breakdown: allocateBudget(budget, brief_type),
    risk_assessment: await assessRisks(brief),
    next_steps: generateNextSteps(brief_type, timeline)
  };

  // Save brief
  await supabase.from('briefs').insert({
    user_id: userId,
    type: brief_type,
    project_name,
    document: JSON.stringify(document),
    created_at: new Date().toISOString()
  });

  return document;
}

// Audit Report Generator
async function processAuditReport(data, userId) {
  const { 
    audit_type,
    target_url,
    focus_areas = [],
    depth = 'comprehensive'
  } = data;

  const auditTypes = {
    'seo': performSEOAudit,
    'performance': performPerformanceAudit,
    'security': performSecurityAudit,
    'accessibility': performAccessibilityAudit,
    'ux': performUXAudit,
    'code': performCodeAudit
  };

  const auditor = auditTypes[audit_type] || performSEOAudit;
  
  // Run audit
  const auditResults = await auditor(target_url, focus_areas, depth);

  // Generate recommendations
  const recommendations = await generateAuditRecommendations(auditResults, audit_type);

  // Calculate scores
  const scores = calculateAuditScores(auditResults);

  // Generate report
  const report = {
    audit_type,
    target: target_url,
    timestamp: new Date().toISOString(),
    scores,
    findings: auditResults,
    recommendations,
    priority_issues: identifyPriorityIssues(auditResults),
    implementation_plan: generateImplementationPlan(recommendations),
    estimated_impact: estimateImpact(recommendations)
  };

  // Save audit
  await supabase.from('audit_reports').insert({
    user_id: userId,
    type: audit_type,
    target: target_url,
    report: JSON.stringify(report),
    created_at: new Date().toISOString()
  });

  return report;
}

// Helper functions
function buildUTMUrl(baseUrl, params) {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.append(key, value);
  });
  return url.toString();
}

async function shortenUrl(url) {
  // Implement URL shortening (using bit.ly, custom service, etc.)
  return url; // Placeholder
}

function generateCSV(data) {
  const headers = Object.keys(data[0] || {});
  const rows = data.map(row => headers.map(h => row[h] || ''));
  return [headers, ...rows].map(r => r.join(',')).join('\n');
}

function parseTwitterThread(content) {
  return content.split('\n\n').filter(tweet => tweet.trim().length > 0);
}

function parseCarouselSlides(content) {
  const slides = [];
  const lines = content.split('\n');
  let currentSlide = null;

  for (const line of lines) {
    if (line.startsWith('Slide')) {
      if (currentSlide) slides.push(currentSlide);
      currentSlide = { title: '', content: '' };
    } else if (line.startsWith('Title:')) {
      if (currentSlide) currentSlide.title = line.replace('Title:', '').trim();
    } else if (line.startsWith('Content:')) {
      if (currentSlide) currentSlide.content = line.replace('Content:', '').trim();
    }
  }
  
  if (currentSlide) slides.push(currentSlide);
  return slides;
}

function parseHeadlineVariations(content) {
  return content.split('\n')
    .filter(line => line.trim().length > 0)
    .filter(line => /^\d\./.test(line))
    .map(line => line.replace(/^\d\.\s*/, ''));
}

function scoreHeadlineQuality(headline) {
  let score = 0;
  
  // Length (optimal: 6-12 words)
  const wordCount = headline.split(' ').length;
  if (wordCount >= 6 && wordCount <= 12) score += 20;
  
  // Active voice
  if (!headline.includes('is') && !headline.includes('are') && !headline.includes('was')) score += 15;
  
  // Specificity
  if (/\d+/.test(headline)) score += 10; // Contains numbers
  
  // Power words
  const powerWords = ['transform', 'accelerate', 'unlock', 'master', 'revolutionize'];
  if (powerWords.some(word => headline.toLowerCase().includes(word))) score += 10;
  
  // No fluff
  const fluffWords = ['very', 'really', 'just', 'basically', 'actually'];
  if (!fluffWords.some(word => headline.toLowerCase().includes(word))) score += 15;
  
  // Clear outcome
  const outcomeWords = ['increase', 'reduce', 'improve', 'boost', 'save', 'grow'];
  if (outcomeWords.some(word => headline.toLowerCase().includes(word))) score += 15;
  
  // Clarity
  if (!headline.includes('&') && !headline.includes('/')) score += 5;
  
  // Confidence
  if (!headline.includes('?')) score += 10;
  
  return Math.min(100, score);
}

function getHeadlineImprovements(newHeadline, originalHeadline) {
  const improvements = [];
  
  if (newHeadline.length < originalHeadline.length) {
    improvements.push('More concise');
  }
  
  if (!newHeadline.includes('is') && originalHeadline.includes('is')) {
    improvements.push('Active voice');
  }
  
  if (/\d+/.test(newHeadline) && !/\d+/.test(originalHeadline)) {
    improvements.push('Added specificity');
  }
  
  return improvements;
}

function getLinearWritingTips() {
  return [
    'Lead with the outcome, not the process',
    'Use numbers and specifics whenever possible',
    'Eliminate adjectives that don\'t add information',
    'Write like you\'re explaining to a smart friend',
    'If you can remove a word without losing meaning, remove it'
  ];
}

async function trackToolUsage(userId, tool) {
  await supabase.from('tool_usage').insert({
    user_id: userId,
    tool,
    used_at: new Date().toISOString()
  });
}

async function getCreditsRemaining(userId) {
  // Check usage limits
  const { data } = await supabase
    .from('user_credits')
    .select('credits_remaining')
    .eq('user_id', userId)
    .single();
  
  return data?.credits_remaining || 0;
}

// Additional helper implementations would go here...

module.exports = { handler: exports.handler };
