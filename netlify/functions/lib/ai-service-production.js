const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Initialize AI clients with production config
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Rate limiting and cost control
class RateLimiter {
  constructor() {
    this.limits = {
      'gpt-4': { rpm: 40, tpm: 10000, dailyCost: 100 },
      'gpt-3.5-turbo': { rpm: 90, tpm: 90000, dailyCost: 50 },
      'claude-3-opus': { rpm: 30, tpm: 20000, dailyCost: 150 },
      'claude-3-sonnet': { rpm: 60, tpm: 40000, dailyCost: 100 }
    };
    this.usage = new Map();
  }

  async checkLimit(model, estimatedTokens) {
    const limit = this.limits[model];
    if (!limit) return { allowed: true };

    const key = `${model}_${new Date().toISOString().slice(0, 10)}`;
    const current = this.usage.get(key) || { requests: 0, tokens: 0, cost: 0 };

    // Check rate limits
    if (current.requests >= limit.rpm) {
      return { allowed: false, reason: 'Rate limit exceeded', retryAfter: 60 };
    }

    if (current.tokens + estimatedTokens > limit.tpm) {
      return { allowed: false, reason: 'Token limit exceeded', retryAfter: 60 };
    }

    // Update usage
    current.requests++;
    current.tokens += estimatedTokens;
    current.cost += this.estimateCost(model, estimatedTokens);
    this.usage.set(key, current);

    // Store in database for persistent tracking
    await this.persistUsage(model, current);

    return { allowed: true, remaining: limit.rpm - current.requests };
  }

  estimateCost(model, tokens) {
    const costs = {
      'gpt-4': 0.03, // per 1k tokens
      'gpt-3.5-turbo': 0.002,
      'claude-3-opus': 0.015,
      'claude-3-sonnet': 0.003
    };
    return (tokens / 1000) * (costs[model] || 0.01);
  }

  async persistUsage(model, usage) {
    try {
      await supabase.from('ai_usage').upsert({
        model,
        date: new Date().toISOString().slice(0, 10),
        requests: usage.requests,
        tokens: usage.tokens,
        cost: usage.cost,
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to persist usage:', error);
    }
  }
}

const rateLimiter = new RateLimiter();

// Production AI Service
class AIService {
  constructor() {
    this.models = {
      fast: 'gpt-3.5-turbo',
      smart: 'gpt-4',
      creative: 'claude-3-opus',
      balanced: 'claude-3-sonnet'
    };
  }

  // Generate personalized sprint plan with real AI
  async generateSprintPlan(userData) {
    const { goal, stack, timeline, experience, constraints } = userData;

    // Check rate limits
    const limitCheck = await rateLimiter.checkLimit(this.models.smart, 2000);
    if (!limitCheck.allowed) {
      throw new Error(`Rate limit exceeded: ${limitCheck.reason}`);
    }

    try {
      const systemPrompt = `You are an expert technical strategist who creates highly specific, actionable 30-day sprint plans for building products. Your plans are realistic, detailed, and tailored to the user's exact situation.

Focus on:
1. Concrete daily tasks with clear deliverables
2. Realistic time estimates based on experience level
3. Specific tools and technologies for their stack
4. Risk mitigation strategies
5. Success metrics and checkpoints`;

      const userPrompt = `Create a personalized 30-day sprint plan for:
Goal: ${goal}
Tech Stack: ${stack}
Timeline: ${timeline}
Experience: ${experience}
Constraints: ${constraints}

Structure the plan with:
- Week 1: Foundation & Architecture (Days 1-7)
- Week 2: Core Features (Days 8-14)
- Week 3: Polish & Testing (Days 15-21)
- Week 4: Launch Preparation (Days 22-30)

For each day, provide:
1. Main Focus (1 sentence)
2. 3-4 specific tasks
3. Expected deliverable
4. Time estimate
5. Potential blockers

Make it highly specific to their stack and goal.`;

      const response = await openai.chat.completions.create({
        model: this.models.smart,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      const content = response.choices[0].message.content;
      
      // Parse and structure the response
      const sprintPlan = this.parseSprintPlan(content);
      
      // Generate additional resources
      const resources = await this.generateResources(stack, goal);
      
      return {
        success: true,
        plan: sprintPlan,
        resources,
        metadata: {
          generated_at: new Date().toISOString(),
          model_used: this.models.smart,
          personalized_for: userData
        }
      };

    } catch (error) {
      console.error('Sprint generation failed:', error);
      
      // Fallback to Claude if OpenAI fails
      return this.generateSprintPlanWithClaude(userData);
    }
  }

  // Fallback to Claude for redundancy
  async generateSprintPlanWithClaude(userData) {
    const { goal, stack, timeline, experience, constraints } = userData;

    try {
      const prompt = `Create a detailed 30-day sprint plan for building: ${goal}

User Context:
- Tech Stack: ${stack}
- Timeline: ${timeline}
- Experience Level: ${experience}
- Constraints: ${constraints}

Provide a day-by-day breakdown with specific tasks, deliverables, and time estimates. Make it actionable and realistic.`;

      const response = await anthropic.messages.create({
        model: this.models.creative,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.7
      });

      const content = response.content[0].text;
      const sprintPlan = this.parseSprintPlan(content);

      return {
        success: true,
        plan: sprintPlan,
        metadata: {
          generated_at: new Date().toISOString(),
          model_used: this.models.creative,
          fallback: true
        }
      };

    } catch (error) {
      console.error('Claude generation failed:', error);
      throw new Error('All AI services unavailable');
    }
  }

  // Generate automation scripts with actual code
  async generateAutomationScript(type, context) {
    const limitCheck = await rateLimiter.checkLimit(this.models.fast, 1500);
    if (!limitCheck.allowed) {
      throw new Error(`Rate limit exceeded: ${limitCheck.reason}`);
    }

    const templates = {
      'deployment': this.getDeploymentTemplate(context),
      'testing': this.getTestingTemplate(context),
      'monitoring': this.getMonitoringTemplate(context),
      'ci-cd': this.getCICDTemplate(context)
    };

    const template = templates[type] || templates['deployment'];

    try {
      const response = await openai.chat.completions.create({
        model: this.models.fast,
        messages: [
          {
            role: 'system',
            content: 'You are an expert DevOps engineer. Generate production-ready automation scripts with proper error handling, logging, and documentation.'
          },
          {
            role: 'user',
            content: template
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      });

      const script = response.choices[0].message.content;

      return {
        success: true,
        script,
        type,
        language: this.detectLanguage(script),
        tested: false,
        documentation: await this.generateDocumentation(script, type)
      };

    } catch (error) {
      console.error('Script generation failed:', error);
      throw error;
    }
  }

  // Parse sprint plan into structured format
  parseSprintPlan(content) {
    const weeks = [];
    const lines = content.split('\n');
    let currentWeek = null;
    let currentDay = null;

    for (const line of lines) {
      if (line.includes('Week')) {
        currentWeek = {
          title: line.trim(),
          days: []
        };
        weeks.push(currentWeek);
      } else if (line.includes('Day')) {
        currentDay = {
          day: line.trim(),
          focus: '',
          tasks: [],
          deliverable: '',
          timeEstimate: '',
          blockers: []
        };
        if (currentWeek) {
          currentWeek.days.push(currentDay);
        }
      } else if (currentDay) {
        // Parse day details
        if (line.includes('Focus:')) {
          currentDay.focus = line.replace('Focus:', '').trim();
        } else if (line.includes('Tasks:') || line.startsWith('-')) {
          if (line.startsWith('-')) {
            currentDay.tasks.push(line.substring(1).trim());
          }
        } else if (line.includes('Deliverable:')) {
          currentDay.deliverable = line.replace('Deliverable:', '').trim();
        } else if (line.includes('Time:')) {
          currentDay.timeEstimate = line.replace('Time:', '').trim();
        } else if (line.includes('Blockers:')) {
          currentDay.blockers.push(line.replace('Blockers:', '').trim());
        }
      }
    }

    return weeks;
  }

  // Generate additional resources
  async generateResources(stack, goal) {
    const resources = {
      tutorials: [],
      documentation: [],
      tools: [],
      communities: []
    };

    // Stack-specific resources
    const stackResources = {
      'react': {
        tutorials: ['React Docs', 'Epic React by Kent C. Dodds'],
        tools: ['React DevTools', 'Vite', 'React Query'],
        communities: ['r/reactjs', 'Reactiflux Discord']
      },
      'nextjs': {
        tutorials: ['Next.js Learn', 'Lee Robinson YouTube'],
        tools: ['Vercel', 'next-auth', 'Prisma'],
        communities: ['Next.js Discord', 'Vercel Community']
      },
      'vue': {
        tutorials: ['Vue Mastery', 'Vue School'],
        tools: ['Vue DevTools', 'Nuxt', 'Pinia'],
        communities: ['Vue Land Discord', 'r/vuejs']
      }
    };

    // Find matching resources
    for (const [key, value] of Object.entries(stackResources)) {
      if (stack.toLowerCase().includes(key)) {
        resources.tutorials.push(...value.tutorials);
        resources.tools.push(...value.tools);
        resources.communities.push(...value.communities);
      }
    }

    return resources;
  }

  // Template generators
  getDeploymentTemplate(context) {
    return `Generate a production deployment script for:
- Application: ${context.app_type}
- Platform: ${context.platform}
- Stack: ${context.stack}
- Environment: ${context.environment}

Include:
1. Pre-deployment checks
2. Build process
3. Database migrations
4. Asset optimization
5. Deployment steps
6. Post-deployment validation
7. Rollback procedure
8. Monitoring setup`;
  }

  getTestingTemplate(context) {
    return `Create a comprehensive testing automation script for:
- Stack: ${context.stack}
- Test Types: ${context.test_types}
- Coverage Target: ${context.coverage_target}

Include unit tests, integration tests, and E2E tests with proper setup and teardown.`;
  }

  getMonitoringTemplate(context) {
    return `Create monitoring and alerting setup for:
- Services: ${context.services}
- Metrics: ${context.metrics}
- Alert Channels: ${context.channels}

Include health checks, performance metrics, and incident response automation.`;
  }

  getCICDTemplate(context) {
    return `Generate a complete CI/CD pipeline configuration for:
- Platform: ${context.ci_platform}
- Branches: ${context.branches}
- Environments: ${context.environments}

Include build, test, security scanning, and deployment stages.`;
  }

  detectLanguage(script) {
    if (script.includes('#!/bin/bash')) return 'bash';
    if (script.includes('const') || script.includes('let')) return 'javascript';
    if (script.includes('def ') || script.includes('import ')) return 'python';
    if (script.includes('name:') && script.includes('steps:')) return 'yaml';
    return 'text';
  }

  async generateDocumentation(script, type) {
    // Generate concise documentation
    const response = await openai.chat.completions.create({
      model: this.models.fast,
      messages: [
        {
          role: 'system',
          content: 'Generate concise documentation for the provided script. Include purpose, usage, and requirements.'
        },
        {
          role: 'user',
          content: `Document this ${type} script:\n\n${script.substring(0, 500)}...`
        }
      ],
      temperature: 0.3,
      max_tokens: 300
    });

    return response.choices[0].message.content;
  }

  // Content generation for autopublisher
  async generateContent(topic, intent, researchData) {
    const limitCheck = await rateLimiter.checkLimit(this.models.smart, 3000);
    if (!limitCheck.allowed) {
      throw new Error(`Rate limit exceeded: ${limitCheck.reason}`);
    }

    try {
      const systemPrompt = this.getContentSystemPrompt(intent);
      const userPrompt = this.buildContentPrompt(topic, researchData);

      const response = await openai.chat.completions.create({
        model: this.models.smart,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 3000,
        presence_penalty: 0.3,
        frequency_penalty: 0.2
      });

      const content = response.choices[0].message.content;
      
      // Post-process for quality
      const processed = await this.postProcessContent(content, intent);
      
      return {
        success: true,
        content: processed,
        metadata: {
          topic,
          intent,
          word_count: this.countWords(processed),
          generated_at: new Date().toISOString(),
          model: this.models.smart
        }
      };

    } catch (error) {
      console.error('Content generation failed:', error);
      throw error;
    }
  }

  getContentSystemPrompt(intent) {
    const prompts = {
      'note': `You are Ivan Peycheff, a technical strategist who writes operator notes for builders. Your writing is:
- Direct and actionable
- Based on real experience
- Free of fluff and corporate speak
- Focused on what actually works
- Written in a conversational but professional tone

Format with clear sections, bullet points for key insights, and specific examples.`,
      
      'guide': `You are creating comprehensive technical guides that are:
- Step-by-step and implementable
- With code examples and configurations
- Including common pitfalls and solutions
- Production-ready, not toy examples
- With clear prerequisites and outcomes`,
      
      'analysis': `You are writing strategic analysis that:
- Provides unique insights
- Backed by data and examples
- Challenges conventional thinking
- Offers actionable recommendations
- Includes contrarian perspectives where valid`
    };

    return prompts[intent] || prompts['note'];
  }

  buildContentPrompt(topic, researchData) {
    return `Write a comprehensive piece on: ${topic}

Research findings:
${JSON.stringify(researchData, null, 2)}

Requirements:
1. 1200-1500 words
2. Clear structure with sections
3. Specific, actionable insights
4. Real examples and case studies
5. Contrarian takes where appropriate
6. Call-to-action at the end

Avoid:
- Generic advice
- Obvious statements
- Corporate jargon
- Filler content

Make it valuable enough that readers will want to share it.`;
  }

  async postProcessContent(content, intent) {
    // Clean up and format content
    let processed = content;
    
    // Add strategic CTA based on intent
    const ctas = {
      'note': '\n\n---\n\nWant to implement this in your organization? [Schedule a strategy call →](https://peycheff.com/advisory)',
      'guide': '\n\n---\n\nNeed help implementing this? [Get the complete automation kit →](https://peycheff.com/products/automation-kit)',
      'analysis': '\n\n---\n\nLet\'s discuss how this applies to your situation. [Book a sparring session →](https://peycheff.com/advisory)'
    };
    
    processed += ctas[intent] || ctas['note'];
    
    return processed;
  }

  countWords(text) {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  // Perplexity integration for research
  async conductResearch(topic) {
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'pplx-70b-online',
          messages: [
            {
              role: 'user',
              content: `Research the following topic with current information: ${topic}
              
              Provide:
              1. Current state and trends
              2. Key players and solutions
              3. Common challenges
              4. Best practices
              5. Future outlook
              6. Contrarian perspectives
              7. Data and statistics
              
              Focus on actionable, specific information from 2024-2025.`
            }
          ],
          temperature: 0.5,
          max_tokens: 2000
        })
      });

      const data = await response.json();
      
      return {
        success: true,
        findings: data.choices[0].message.content,
        sources: data.citations || [],
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Research failed:', error);
      
      // Fallback to OpenAI with web browsing
      return this.fallbackResearch(topic);
    }
  }

  async fallbackResearch(topic) {
    const response = await openai.chat.completions.create({
      model: this.models.smart,
      messages: [
        {
          role: 'system',
          content: 'You are a research assistant. Provide comprehensive, current information on the topic.'
        },
        {
          role: 'user',
          content: `Research: ${topic}\n\nProvide current insights, trends, challenges, and opportunities.`
        }
      ],
      temperature: 0.5,
      max_tokens: 1500
    });

    return {
      success: true,
      findings: response.choices[0].message.content,
      sources: [],
      timestamp: new Date().toISOString(),
      fallback: true
    };
  }
}

// Export singleton instance
module.exports = new AIService();
