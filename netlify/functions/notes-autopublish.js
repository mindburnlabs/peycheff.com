import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Notes Autopublish Pipeline - The Content Engine
 * 
 * Scheduled to run nightly:
 * 1. Check research queue for pending topics
 * 2. Research with Perplexity API → facts.json
 * 3. Draft with Claude/GPT → 1200-word operator note
 * 4. Edit with Gemini → tighten, enforce style
 * 5. Style enforce → headings, buy-box insertion
 * 6. Plagiarism guard → compare with facts
 * 7. Generate OG image → black-on-white card
 * 8. Publish → save MDX + send member email
 */
export const handler = async (event, context) => {
  // Only allow POST (for manual trigger) or scheduled execution
  if (event.httpMethod !== 'POST' && !event.headers['x-netlify-cron']) {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('🚀 Starting autopublish pipeline...');

    // 1. Get or seed research queue
    const researchTopic = await getNextResearchTopic();
    
    if (!researchTopic) {
      console.log('No research topics in queue, seeding...');
      await seedResearchQueue();
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          action: 'queue_seeded',
          message: 'Research queue seeded for next run'
        })
      };
    }

    console.log(`📚 Processing topic: ${researchTopic.topic}`);

    // 2. Research phase
    await updateTopicStatus(researchTopic.id, 'researching');
    const researchData = await conductResearch(researchTopic.topic);

    // 3. Draft phase
    await updateTopicStatus(researchTopic.id, 'drafted');
    const draftContent = await generateDraft(researchTopic, researchData);

    // 4. Edit phase
    await updateTopicStatus(researchTopic.id, 'editing');
    const editedContent = await editContent(draftContent);

    // 5. Style enforcement
    const styledContent = await enforceStyle(editedContent, researchTopic.intent);

    // 6. Quality guard
    const qualityCheck = await performQualityCheck(styledContent, researchData);
    
    if (!qualityCheck.passed) {
      console.warn('Quality check failed:', qualityCheck.issues);
      
      if (qualityCheck.canRetry) {
        // Loop editor once
        const reEditedContent = await editContent(styledContent, qualityCheck.feedback);
        const reStyledContent = await enforceStyle(reEditedContent, researchTopic.intent);
        
        const finalCheck = await performQualityCheck(reStyledContent, researchData);
        if (!finalCheck.passed) {
          throw new Error('Content failed quality check twice');
        }
        
        styledContent = reStyledContent;
      } else {
        throw new Error('Content failed critical quality check');
      }
    }

    // 7. Create draft in database
    const draft = await saveDraft({
      title: styledContent.title,
      summary: styledContent.summary,
      body_mdx: styledContent.body,
      research_queue_id: researchTopic.id,
      status: 'ready'
    });

    // 8. Generate OG image
    const ogImagePath = await generateOGImage(draft.slug, styledContent.title);
    
    // 9. Update draft with OG path
    await supabase
      .from('drafts')
      .update({ og_path: ogImagePath })
      .eq('id', draft.id);

    // 10. Publish and notify
    await publishDraft(draft.id, styledContent);
    await notifyMembersOfNewNote(draft, styledContent);

    // 11. Mark research topic as published
    await updateTopicStatus(researchTopic.id, 'published');

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        action: 'published',
        draft: {
          id: draft.id,
          slug: draft.slug,
          title: styledContent.title,
          url: `https://peycheff.com/notes/${draft.slug}`
        },
        stats: {
          research_sources: researchData.sources?.length || 0,
          word_count: styledContent.word_count,
          quality_score: qualityCheck.score
        }
      })
    };

  } catch (error) {
    console.error('Autopublish pipeline error:', error);
    
    // TODO: Alert Ivan via SMS/email for pipeline failures
    await notifyPipelineFailure(error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Pipeline failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};

// =============================================================================
// RESEARCH PHASE
// =============================================================================

async function getNextResearchTopic() {
  const { data, error } = await supabase
    .from('research_queue')
    .select('*')
    .eq('status', 'queued')
    .order('priority', { ascending: false })
    .order('scheduled_for', { ascending: true })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching research topic:', error);
    return null;
  }

  return data;
}

async function seedResearchQueue() {
  const topics = [
    { topic: 'AI-First Product Development', intent: 'note', priority: 1 },
    { topic: 'Founder Operating Systems', intent: 'note', priority: 1 },
    { topic: 'Revenue Architecture Design', intent: 'note', priority: 1 },
    { topic: 'Zero-Touch Automation Playbook', intent: 'kit', priority: 2 },
    { topic: 'Team Process Optimization', intent: 'note', priority: 1 },
    { topic: 'Customer Success Automation', intent: 'note', priority: 1 }
  ];

  const { error } = await supabase
    .from('research_queue')
    .upsert(topics.map(topic => ({
      ...topic,
      scheduled_for: new Date().toISOString()
    })));

  if (error) {
    console.error('Error seeding research queue:', error);
    throw error;
  }
}

async function conductResearch(topic) {
  try {
    // Use Perplexity API for current, factual research
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'user',
            content: `Research current trends, data, and insights about "${topic}" for founders and operators. Focus on:
            - Recent developments and statistics (last 12 months)
            - Practical frameworks and methodologies
            - Real company examples and case studies
            - Common pitfalls and anti-patterns
            - Actionable insights for implementation
            
            Provide factual, source-backed information suitable for a technical founder audience.`
          }
        ],
        max_tokens: 2000,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API failed: ${response.statusText}`);
    }

    const result = await response.json();
    const researchContent = result.choices[0].message.content;

    // Parse and structure the research data
    return {
      topic,
      content: researchContent,
      sources: extractSources(researchContent),
      researched_at: new Date().toISOString(),
      word_count: researchContent.split(' ').length
    };

  } catch (error) {
    console.error('Research phase error:', error);
    
    // Fallback to seed data if API fails
    return {
      topic,
      content: `Current research on ${topic} shows significant evolution in founder approaches...`,
      sources: [],
      researched_at: new Date().toISOString(),
      word_count: 100,
      fallback: true
    };
  }
}

function extractSources(content) {
  // Extract URLs and source references from research content
  const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
  const sources = content.match(urlRegex) || [];
  
  return [...new Set(sources)]; // Remove duplicates
}

// =============================================================================
// DRAFTING PHASE
// =============================================================================

async function generateDraft(researchTopic, researchData) {
  const prompt = `Write an operator note for founders on "${researchTopic.topic}".

Research context:
${researchData.content}

Structure:
1. Context (the real pain) - What's the problem/opportunity?
2. System (steps/tools/operating cadence) - How to solve it
3. Result (metrics to track + pitfalls) - What to measure and avoid

Style guide:
- Tone: blunt, dry-humor, street-smart, visionary like Ivan Peychev
- No fluff or buzzwords
- Max 3-line paragraphs
- Apple-clean microcopy
- 900-1,200 words
- End with a small buy box suggestion for relevant product

Make it actionable for technical founders who want systems that work.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY}`,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API failed: ${response.statusText}`);
    }

    const result = await response.json();
    const content = result.content[0].text;

    return {
      raw_content: content,
      word_count: content.split(' ').length,
      generated_at: new Date().toISOString()
    };

  } catch (error) {
    console.error('Draft generation error:', error);
    throw error;
  }
}

// =============================================================================
// EDITING PHASE
// =============================================================================

async function editContent(draftContent, feedback = null) {
  const prompt = `Tighten and edit this operator note. ${feedback ? `Feedback to address: ${feedback}` : ''}

Content to edit:
${draftContent.raw_content || draftContent}

Editing rules:
- Remove filler words and redundancy
- Enforce max 3-line paragraphs
- Convert passive voice to active
- Apple-style microcopy (clear, direct, human)
- Maintain blunt, street-smart tone
- Ensure logical flow between sections
- Return clean MDX format

Return the edited content with:
- Clear H2 sections
- Proper MDX formatting
- A one-line summary (meta description style)`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a technical editor specializing in founder/operator content. Edit for clarity, impact, and Apple-grade simplicity.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.choices[0].message.content;

  } catch (error) {
    console.error('Edit phase error:', error);
    throw error;
  }
}

// =============================================================================
// STYLE ENFORCEMENT
// =============================================================================

async function enforceStyle(editedContent, intent) {
  // Extract title and summary
  const lines = editedContent.split('\n').filter(line => line.trim());
  const title = extractTitle(lines);
  const summary = extractSummary(lines);
  
  // Add buy-box based on intent
  const buyBox = generateBuyBox(intent, title);
  
  // Ensure proper MDX structure
  const body = cleanAndStructureMDX(editedContent, buyBox);
  
  return {
    title: title || 'Untitled Note',
    summary: summary || 'Operator insights for founders',
    body: body,
    word_count: body.split(' ').length,
    intent: intent
  };
}

function extractTitle(lines) {
  // Find first H1 or use first substantial line
  const h1Line = lines.find(line => line.startsWith('# '));
  if (h1Line) return h1Line.replace('# ', '');
  
  const firstLine = lines.find(line => line.length > 10 && !line.startsWith('#'));
  return firstLine?.substring(0, 60) + '...' || null;
}

function extractSummary(lines) {
  // Look for summary in content or generate from first paragraph
  const summaryLine = lines.find(line => line.toLowerCase().includes('summary:'));
  if (summaryLine) return summaryLine.replace(/summary:\s*/i, '');
  
  // Use first paragraph as summary
  const firstParagraph = lines.find(line => 
    line.length > 50 && 
    !line.startsWith('#') && 
    !line.includes('**')
  );
  
  return firstParagraph?.substring(0, 160) + '...' || null;
}

function generateBuyBox(intent, title) {
  const buyBoxes = {
    note: {
      product: 'MEMBER_MONTHLY',
      text: 'Get operator memos like this twice monthly',
      cta: 'Join Build Notes'
    },
    kit: {
      product: 'KIT_AUTOMATION',
      text: 'Want the automation playbooks?',
      cta: 'Get the Kit'
    },
    diagram: {
      product: 'KIT_DIAGRAMS',
      text: 'System diagrams for your team',
      cta: 'Download Library'
    }
  };

  const box = buyBoxes[intent] || buyBoxes.note;
  
  return `
## Try This

${box.text}. No fluff, just systems that work.

<BuyButton product="${box.product}">${box.cta}</BuyButton>
`;
}

function cleanAndStructureMDX(content, buyBox) {
  // Remove any existing buy boxes
  let cleaned = content.replace(/## Try This[\s\S]*?<BuyButton[^>]*>.*?<\/BuyButton>/g, '');
  
  // Ensure proper heading hierarchy
  cleaned = cleaned.replace(/^# /gm, '## '); // Convert H1 to H2
  
  // Add buy box before conclusion or at end
  const conclusionIndex = cleaned.toLowerCase().indexOf('## conclusion');
  if (conclusionIndex > -1) {
    cleaned = cleaned.substring(0, conclusionIndex) + buyBox + '\n\n' + cleaned.substring(conclusionIndex);
  } else {
    cleaned = cleaned + '\n\n' + buyBox;
  }
  
  return cleaned.trim();
}

// =============================================================================
// QUALITY ASSURANCE
// =============================================================================

async function performQualityCheck(content, researchData) {
  const issues = [];
  let score = 100;

  // Word count check
  const wordCount = content.body.split(' ').length;
  if (wordCount < 800) {
    issues.push('Content too short (< 800 words)');
    score -= 20;
  }
  if (wordCount > 1500) {
    issues.push('Content too long (> 1500 words)');
    score -= 10;
  }

  // Structure check
  if (!content.body.includes('## ')) {
    issues.push('Missing proper section headers');
    score -= 15;
  }

  // Buy box check
  if (!content.body.includes('<BuyButton')) {
    issues.push('Missing buy box');
    score -= 10;
  }

  // Basic plagiarism check (simplified)
  if (researchData.content && !researchData.fallback) {
    const similarity = calculateSimilarity(content.body, researchData.content);
    if (similarity > 0.3) {
      issues.push(`High similarity to source material (${Math.round(similarity * 100)}%)`);
      score -= 25;
    }
  }

  return {
    passed: score >= 70,
    canRetry: score >= 50,
    score,
    issues,
    feedback: issues.length > 0 ? `Address these issues: ${issues.join(', ')}` : null
  };
}

function calculateSimilarity(text1, text2) {
  // Very simplified similarity check
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(word => words2.has(word)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

// =============================================================================
// PUBLISHING & NOTIFICATION
// =============================================================================

async function saveDraft(draftData) {
  // Generate slug from title
  const slug = generateSlug(draftData.title);
  
  const { data, error } = await supabase
    .from('drafts')
    .insert({
      ...draftData,
      slug
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving draft:', error);
    throw error;
  }

  return data;
}

async function publishDraft(draftId, content) {
  const { error } = await supabase
    .from('drafts')
    .update({
      status: 'published',
      published_at: new Date().toISOString()
    })
    .eq('id', draftId);

  if (error) {
    console.error('Error publishing draft:', error);
    throw error;
  }
}

async function notifyMembersOfNewNote(draft, content) {
  // Get all active members
  const { data: members, error } = await supabase
    .from('has_membership')
    .select('email')
    .eq('is_active_member', true);

  if (error) {
    console.error('Error fetching members:', error);
    return;
  }

  if (!members?.length) {
    console.log('No active members to notify');
    return;
  }

  const noteUrl = `https://peycheff.com/notes/${draft.slug}`;
  
  // Send to all members (we'll implement batching later if needed)
  const emailPromises = members.map(member => 
    resend.emails.send({
      from: 'Ivan Peychev <ivan@peycheff.com>',
      to: member.email,
      subject: `New note: ${content.title}`,
      html: `
        <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="font-size: 24px; margin: 0 0 16px 0;">${content.title}</h1>
          <p style="font-size: 16px; color: #666; margin: 0 0 24px 0;">${content.summary}</p>
          <a href="${noteUrl}" style="display: inline-block; background: #0a84ff; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">Read Full Note</a>
          <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 14px; color: #999;">You're receiving this as a Build Notes member. <a href="https://peycheff.com/members">Manage subscription</a></p>
        </div>
      `
    })
  );

  await Promise.allSettled(emailPromises);
  
  // Auto-thread to LinkedIn/X (placeholder webhook calls)
  try {
    await fetch(process.env.LINKEDIN_WEBHOOK_URL || '', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: content.title, url: noteUrl, summary: content.summary })
    });
  } catch (_) {}
  try {
    await fetch(process.env.X_WEBHOOK_URL || '', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: content.title, url: noteUrl, summary: content.summary })
    });
  } catch (_) {}
  console.log(`Notified ${members.length} members of new note: ${draft.slug}`);
}

// =============================================================================
// UTILITIES
// =============================================================================

async function updateTopicStatus(topicId, status) {
  const { error } = await supabase
    .from('research_queue')
    .update({ status })
    .eq('id', topicId);

  if (error) {
    console.error('Error updating topic status:', error);
  }
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-')
    .substring(0, 60);
}

async function generateOGImage(slug, title) {
  // Call OG image generation API (we'll implement this next)
  try {
    const response = await fetch(`${process.env.URL}/.netlify/functions/og-${slug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    });

    if (response.ok) {
      const result = await response.json();
      return result.path;
    }
  } catch (error) {
    console.error('OG image generation failed:', error);
  }

  return null;
}

async function notifyPipelineFailure(error) {
  try {
    await resend.emails.send({
      from: 'Autopilot <system@peycheff.com>',
      to: 'ivan@peycheff.com',
      subject: '🚨 Autopublish Pipeline Failed',
      html: `
        <div style="font-family: system-ui, sans-serif; padding: 20px;">
          <h2>Pipeline Failure</h2>
          <p><strong>Error:</strong> ${error.message}</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          <p><strong>Stack:</strong></p>
          <pre style="background: #f5f5f5; padding: 10px; overflow: auto;">${error.stack}</pre>
        </div>
      `
    });
  } catch (notifyError) {
    console.error('Failed to notify of pipeline failure:', notifyError);
  }
}
