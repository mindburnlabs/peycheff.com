import { createHash } from 'crypto'
import { createClient } from '@supabase/supabase-js'

/**
 * preview-sprint
 * POST { goal: string, stack: string }
 * Returns a watermarked Week-1 outline (preview only) derived from inputs.
 */
export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const { goal = '', stack = '' } = JSON.parse(event.body || '{}')

    // Basic validation and normalization
    const clean = (s) => String(s || '').trim().slice(0, 200)
    const userGoal = clean(goal)
    const userStack = clean(stack)

    if (!userGoal || !userStack) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Both goal and stack are required.' })
      }
    }

    // Deterministic preview id
    const id = createHash('sha256')
      .update(`${userGoal}|${userStack}`)
      .digest('hex')
      .slice(0, 16)

    // Enforce preview usage limits (per-IP per-day)
    const forwarded = event.headers['x-forwarded-for'] || event.headers['client-ip'] || ''
    const ip = forwarded.split(',')[0].trim()
    const ipHash = createHash('sha256').update(ip || 'unknown').digest('hex').slice(0, 24)
    const counterEmail = `ip:${ipHash}`
    const windowStart = new Date()
    windowStart.setUTCHours(0,0,0,0)

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    const limit = parseInt(process.env.PREVIEW_DAILY_LIMIT || '5', 10)

    const { data: incResult, error: incError } = await supabase
      .rpc('increment_usage', {
        p_email: counterEmail,
        p_sku: 'PREVIEW_SPRINT',
        p_window_start: windowStart.toISOString(),
        p_limit: limit
      })

    if (incError) {
      console.error('increment_usage error', incError)
    } else if (incResult && incResult.success === false) {
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({ error: 'Daily preview limit reached. Try again tomorrow or purchase the full plan.' })
      }
    }

    const week1 = buildWeekOneOutline(userGoal, userStack)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        id,
        goal: userGoal,
        stack: userStack,
        watermark: 'Preview — Week 1 only',
        week1,
      })
    }
  } catch (error) {
    console.error('preview-sprint error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to generate preview.' })
    }
  }
}

function buildWeekOneOutline(goal, stack) {
  const title = (d, t) => `${d}: ${t}`
  const day = (name, bullets) => ({ name, bullets })
  const bullets = (...items) => items

  const stackHint = stack.toLowerCase()
  const isReact = stackHint.includes('react')
  const isPython = stackHint.includes('python')
  const isNode = stackHint.includes('node') || stackHint.includes('typescript') || stackHint.includes('js')

  const ci = isPython ? 'pytest + GitHub Actions' : isNode ? 'Vitest + GitHub Actions' : 'CI pipeline'
  const api = isPython ? 'FastAPI' : isNode ? 'Express/Next API routes' : 'API layer'

  return [
    day(title('Day 1', 'Define the operating spine'), bullets(
      `Write the one-sentence outcome: “${goal}.”`,
      'Lock scope: 1 core flow, 3 screens, one datasource.',
      `Set up repo, ${ci}, Prettier, commit hooks, env scaffolding.`,
    )),
    day(title('Day 2', 'Data model + contracts'), bullets(
      'Define entities and relations (draw as text, not a diagram).',
      `Write API contracts (${api}); document success/error shapes.`,
      'Create seed data fixtures; wire a local .env.*'
    )),
    day(title('Day 3', 'Happy path end‑to‑end'), bullets(
      `${isReact ? 'Ship a minimal React flow' : 'Ship the minimal UI flow'} with static data to prove the path.`,
      'Replace stubs with live API for the main path only.',
      'Track basic events (view → CTA → checkout start).'
    )),
    day(title('Day 4', 'Guardrails and polish'), bullets(
      'Add input validation, empty states, and failure messages.',
      'Protect critical actions with optimistic UI + rollback.',
      'Measure LCP/INP and fix any >3s interactions.'
    )),
    day(title('Day 5', 'Proof + publish'), bullets(
      'Record a 60s screen capture of the happy path (no edits).',
      'Write a 3‑bullet “how to use it” and a single CTA.',
      'Ship the preview to a public, watermarked link.'
    )),
  ]
}

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// SHA-256 email hashing for privacy
const hashEmail = (email) => {
  return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
};

// Usage limit enforcement
const checkUsageLimit = async (email, sku = 'PREVIEW_SPRINT', maxRuns = 5) => {
  try {
    const windowStart = new Date();
    windowStart.setHours(windowStart.getHours() - 24); // 24-hour window
    
    const { data, error } = await supabase
      .from('usage_counters')
      .select('runs')
      .eq('email', hashEmail(email))
      .eq('sku', sku)
      .gte('window_start', windowStart.toISOString())
      .order('window_start', { ascending: false })
      .limit(1);

    if (error) throw error;
    
    const currentRuns = data?.[0]?.runs || 0;
    return {
      success: true,
      allowed: currentRuns < maxRuns,
      remaining: Math.max(0, maxRuns - currentRuns),
      currentRuns
    };
  } catch (error) {
    console.error('Error checking usage limit:', error);
    return { success: false, error: error.message };
  }
};

const incrementUsageCounter = async (email, sku = 'PREVIEW_SPRINT') => {
  try {
    const hashedEmail = hashEmail(email);
    const windowStart = new Date();
    windowStart.setMinutes(0, 0, 0); // Round to nearest hour
    
    // Try to increment existing counter
    const { data: existing, error: fetchError } = await supabase
      .from('usage_counters')
      .select('id, runs')
      .eq('email', hashedEmail)
      .eq('sku', sku)
      .eq('window_start', windowStart.toISOString())
      .single();
    
    if (existing && !fetchError) {
      const { data, error } = await supabase
        .from('usage_counters')
        .update({ runs: existing.runs + 1 })
        .eq('id', existing.id)
        .select();
      
      if (error) throw error;
      return { success: true, data };
    } else {
      const { data, error } = await supabase
        .from('usage_counters')
        .insert([{
          email: hashedEmail,
          sku,
          window_start: windowStart.toISOString(),
          runs: 1
        }])
        .select();
      
      if (error) throw error;
      return { success: true, data };
    }
  } catch (error) {
    console.error('Error incrementing usage counter:', error);
    return { success: false, error: error.message };
  }
};

// Generate sprint content based on inputs
const generateSprintContent = (goal, stack, email) => {
  const stacks = {
    'react-node': { 
      primary: 'React/Node.js', 
      db: 'PostgreSQL', 
      deployment: 'Vercel/Railway',
      testing: 'Jest/Vitest'
    },
    'nextjs': { 
      primary: 'Next.js', 
      db: 'Prisma/Supabase', 
      deployment: 'Vercel',
      testing: 'Jest/Playwright'
    },
    'python-django': { 
      primary: 'Python/Django', 
      db: 'PostgreSQL', 
      deployment: 'Railway/DigitalOcean',
      testing: 'pytest'
    },
    'ruby-rails': { 
      primary: 'Ruby on Rails', 
      db: 'PostgreSQL', 
      deployment: 'Heroku/Railway',
      testing: 'RSpec'
    },
    'vue-nuxt': { 
      primary: 'Vue.js/Nuxt', 
      db: 'Supabase', 
      deployment: 'Netlify/Vercel',
      testing: 'Vitest'
    }
  };

  const selectedStack = stacks[stack] || stacks['react-node'];
  
  // Personalized sprint content
  return {
    title: `30-Day ${goal} Sprint Plan`,
    subtitle: `Tailored for ${selectedStack.primary} • Generated for Week 1 Preview Only`,
    watermark: '🔒 PREVIEW VERSION - Purchase for complete 30-day framework',
    weeks: [
      {
        week: 1,
        title: 'Foundation & Setup',
        days: [
          {
            day: 1,
            focus: 'Project Architecture',
            tasks: [
              `Set up ${selectedStack.primary} project structure`,
              `Configure ${selectedStack.db} database schema`,
              'Define core entities and relationships',
              'Set up development environment'
            ],
            deliverable: 'Working dev environment + basic models'
          },
          {
            day: 2,
            focus: 'Authentication & Core Routes',
            tasks: [
              'Implement user authentication system',
              'Set up protected routes/middleware',
              'Create basic user registration flow',
              'Configure session management'
            ],
            deliverable: 'Users can sign up and authenticate'
          },
          {
            day: 3,
            focus: 'Database Design',
            tasks: [
              'Finalize database schema design',
              'Run migrations and seed data',
              'Set up database relationships',
              'Create initial data models'
            ],
            deliverable: 'Complete database structure'
          },
          {
            day: 4,
            focus: 'API Foundation',
            tasks: [
              'Create core API endpoints',
              'Set up request/response patterns',
              'Implement basic CRUD operations',
              'Add input validation'
            ],
            deliverable: 'Basic API with CRUD endpoints'
          },
          {
            day: 5,
            focus: 'Frontend Scaffold',
            tasks: [
              `Set up ${selectedStack.primary} components`,
              'Create basic routing structure',
              'Implement core UI components',
              'Connect frontend to API'
            ],
            deliverable: 'Working frontend skeleton'
          },
          {
            day: 6,
            focus: 'Testing Setup',
            tasks: [
              `Configure ${selectedStack.testing} testing framework`,
              'Write unit tests for core functions',
              'Set up integration test patterns',
              'Create test database setup'
            ],
            deliverable: 'Testing framework ready'
          },
          {
            day: 7,
            focus: 'Deployment Pipeline',
            tasks: [
              `Set up ${selectedStack.deployment} deployment`,
              'Configure environment variables',
              'Set up CI/CD basics',
              'Deploy first working version'
            ],
            deliverable: 'Live deployment of v0.1'
          }
        ]
      }
    ],
    nextSteps: [
      '🔥 Week 2: Core feature implementation',
      '🔥 Week 3: Advanced features & integrations',
      '🔥 Week 4: Polish, optimization & launch prep',
      '🔥 Bonus: Marketing & growth frameworks'
    ]
  };
};

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
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
    // Parse request body
    const { email, goal, stack } = JSON.parse(event.body || '{}');

    // Validate required fields
    if (!email || !goal || !stack) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required fields: email, goal, stack' 
        })
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid email format' })
      };
    }

    // Check usage limits (5 previews per 24 hours)
    const usageCheck = await checkUsageLimit(email);
    if (!usageCheck.success) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Usage check failed' })
      };
    }

    if (!usageCheck.allowed) {
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({ 
          error: 'Usage limit exceeded',
          message: 'You have reached the limit of 5 previews per day. Please try again tomorrow or purchase the full sprint plan.',
          remaining: usageCheck.remaining
        })
      };
    }

    // Increment usage counter
    const incrementResult = await incrementUsageCounter(email);
    if (!incrementResult.success) {
      console.warn('Failed to increment usage counter:', incrementResult.error);
      // Continue anyway - don't fail the request for tracking issues
    }

    // Generate sprint content
    const sprintContent = generateSprintContent(goal, stack, email);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: sprintContent,
        meta: {
          remaining: usageCheck.remaining - 1,
          isPreview: true,
          upgradeUrl: `/checkout?product=PACK_30DAY&email=${encodeURIComponent(email)}&goal=${encodeURIComponent(goal)}&stack=${stack}`
        }
      })
    };

  } catch (error) {
    console.error('Error in preview-sprint function:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: 'Something went wrong generating your preview. Please try again.'
      })
    };
  }
};
