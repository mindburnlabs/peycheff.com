// Pack template definitions with structured content and fallbacks
const PACK_TEMPLATES = {
  'PACK_30DAY': {
    id: 'PACK_30DAY',
    name: '30-Day Idea→Product Sprint',
    description: 'Turn your idea into a shipped product in 30 days with a personalized step-by-step plan.',
    price: '$297',
    estimatedTime: '30 days',
    deliveryFormat: ['PDF Guide', 'Action Checklists', 'Resource Library'],
    
    // AI system prompt for content generation
    systemPrompt: `You are an expert product strategist helping someone turn their idea into a shipped product in 30 days. 
    Generate a comprehensive, actionable plan that is specifically tailored to their idea, industry, and constraints.
    Focus on practical steps, realistic timelines, and proven frameworks.
    Include specific tools, resources, and checkpoints.
    Be encouraging but realistic about challenges and timeline.`,
    
    // Required input fields for personalization
    requiredInputs: ['name', 'email', 'idea', 'timeline', 'technical_level'],
    optionalInputs: ['company', 'industry', 'budget', 'team_size', 'target_market', 'biggest_challenge', 'success_criteria'],
    
    // Template sections with fallback content
    sections: [
      {
        id: 'executive-summary',
        title: 'Executive Summary',
        description: 'Your personalized roadmap overview',
        aiPrompt: 'Create a compelling executive summary that outlines the personalized approach for turning their specific idea into a product. Include key milestones and expected outcomes.',
        fallbackContent: `# Executive Summary

**Your 30-Day Product Sprint**

This personalized guide will take you from idea to shipped product in 30 days. Based on your specific situation, we've created a tailored approach that considers your timeline, technical background, and business goals.

**Key Milestones:**
- Week 1: Validate your idea and understand your market
- Week 2: Define your MVP and create a design plan
- Week 3: Build and test your minimum viable product
- Week 4: Launch, gather feedback, and plan next steps

**Expected Outcomes:**
- A validated product idea with proven market demand
- A working MVP that solves a real problem
- Initial customer feedback and validation
- A clear roadmap for scaling and growth

Let's turn your idea into reality.`,
        estimatedReadTime: '5 minutes'
      },
      
      {
        id: 'week-1-validation',
        title: 'Week 1: Validation & Research',
        description: 'Validate your idea through targeted research',
        aiPrompt: 'Create a detailed Week 1 plan focused on validating their specific idea through research. Include specific research methods, target customer interviews, and validation metrics relevant to their industry.',
        fallbackContent: `# Week 1: Validation & Research

**Goal:** Prove there's real demand for your product idea

## Day 1-2: Problem Definition
- Define the exact problem you're solving
- Identify who experiences this problem most acutely
- Document your assumptions about the problem and solution

## Day 3-4: Market Research
- Research existing solutions and competitors
- Analyze market size and trends
- Identify gaps in current offerings

## Day 5-7: Customer Interviews
- Create interview questions focused on the problem
- Conduct 10-15 interviews with potential customers
- Look for patterns in pain points and desired solutions

**Validation Metrics:**
- 70%+ of interviewees confirm the problem exists
- 50%+ would pay for a solution
- Clear patterns emerge in desired features

**Key Deliverables:**
- Problem/solution hypothesis
- Customer interview notes and insights
- Validation report with go/no-go decision`,
        estimatedReadTime: '10 minutes'
      },
      
      {
        id: 'week-2-mvp-design',
        title: 'Week 2: MVP Definition & Design',
        description: 'Define and design your minimum viable product',
        aiPrompt: 'Create a Week 2 plan for defining and designing their MVP. Include feature prioritization, user flow design, and technical architecture decisions specific to their idea and constraints.',
        fallbackContent: `# Week 2: MVP Definition & Design

**Goal:** Design the simplest version that solves the core problem

## Day 8-9: Feature Prioritization
- List all possible features
- Use MoSCoW method (Must, Should, Could, Won't)
- Focus on 3-5 core features maximum

## Day 10-11: User Experience Design
- Map user journey from problem to solution
- Create wireframes for key screens/interactions
- Design for mobile-first experience

## Day 12-14: Technical Planning
- Choose your tech stack based on skills and timeline
- Plan database structure and API endpoints
- Set up development environment and tools

**Key Decisions:**
- Core feature set (maximum 5 features)
- Technical architecture and tools
- User interface and experience approach

**Key Deliverables:**
- Feature specification document
- User flow diagrams and wireframes
- Technical architecture plan`,
        estimatedReadTime: '12 minutes'
      },
      
      {
        id: 'week-3-build-test',
        title: 'Week 3: Build & Test',
        description: 'Build your MVP and test with real users',
        aiPrompt: 'Create a Week 3 build and test plan. Include development approach, testing strategies, and iteration cycles tailored to their technical constraints and timeline.',
        fallbackContent: `# Week 3: Build & Test

**Goal:** Build a working MVP and validate it with users

## Day 15-17: Core Development
- Start with the most critical feature
- Build in small, testable increments
- Focus on functionality over polish

## Day 18-19: Internal Testing
- Test all user flows and edge cases
- Fix critical bugs and usability issues
- Prepare for user testing

## Day 20-21: User Testing
- Test with 5-8 potential customers
- Focus on core user journey
- Gather feedback on usability and value

**Development Principles:**
- Build the smallest thing that works
- Test early and often
- Don't over-engineer or polish prematurely

**Key Deliverables:**
- Working MVP with core functionality
- Test results and user feedback
- Bug fixes and iteration plan`,
        estimatedReadTime: '15 minutes'
      },
      
      {
        id: 'week-4-launch',
        title: 'Week 4: Launch & Scale',
        description: 'Launch your product and plan for growth',
        aiPrompt: 'Create a Week 4 launch and scale plan. Include launch strategy, marketing approach, and initial scaling decisions relevant to their target market and goals.',
        fallbackContent: `# Week 4: Launch & Scale

**Goal:** Launch publicly and start building momentum

## Day 22-23: Pre-Launch Preparation
- Finalize landing page and onboarding
- Set up analytics and user tracking
- Prepare launch announcement and messaging

## Day 24-25: Soft Launch
- Launch to small group of early supporters
- Monitor usage and gather initial feedback
- Fix any immediate issues

## Day 26-28: Public Launch
- Announce on your chosen channels
- Reach out to your network for support
- Begin customer acquisition activities

**Launch Channels:**
- Personal and professional network
- Relevant online communities
- Social media platforms
- Industry publications (if applicable)

**Success Metrics:**
- User signups and activation
- Customer feedback and satisfaction
- Revenue (if monetized)
- Product-market fit indicators

**Key Deliverables:**
- Live product accessible to users
- Launch metrics and performance data
- Customer feedback and testimonials
- 30-60-90 day growth plan`,
        estimatedReadTime: '12 minutes'
      },
      
      {
        id: 'tools-resources',
        title: 'Tools & Resources',
        description: 'Recommended tools and resources for your journey',
        aiPrompt: 'Recommend specific tools and resources tailored to their needs, budget, and technical skill level. Include both free and paid options with implementation guidance.',
        fallbackContent: `# Tools & Resources

## Development Tools

**No-Code/Low-Code Options:**
- Webflow or Framer for landing pages
- Airtable or Notion for databases
- Zapier for automation and integrations

**Code-Based Options:**
- React/Next.js for web applications
- Supabase or Firebase for backend
- Vercel or Netlify for deployment

## Design Tools
- Figma for UI/UX design (free tier available)
- Canva for marketing materials
- Unsplash for stock photography

## Analytics & Testing
- Google Analytics for website tracking
- Hotjar for user behavior analysis
- Typeform for surveys and feedback

## Marketing & Communication
- Mailchimp for email marketing
- Buffer for social media scheduling
- Calendly for booking meetings

## Project Management
- Notion for documentation and planning
- Trello for task management
- Slack for team communication

**Budget Considerations:**
- Start with free tiers and upgrade as needed
- Prioritize tools that integrate well together
- Consider bundled solutions for cost efficiency`,
        estimatedReadTime: '8 minutes'
      },
      
      {
        id: 'success-metrics',
        title: 'Success Metrics',
        description: 'How to measure progress and success',
        aiPrompt: 'Define specific, measurable success metrics for their product launch. Include leading and lagging indicators relevant to their industry and goals.',
        fallbackContent: `# Success Metrics & KPIs

## Week 1 Success Metrics
- Completed customer interviews: 10-15
- Problem validation rate: >70%
- Solution interest rate: >50%

## Week 2 Success Metrics  
- Feature specification completed
- Wireframes and user flows documented
- Technical architecture defined

## Week 3 Success Metrics
- Core MVP functionality working
- Internal testing completed
- User testing sessions: 5-8 completed

## Week 4 Success Metrics
- Product launched publicly
- Initial users acquired: 10-50
- Feedback collected and analyzed

## Long-term Success Indicators

**User Metrics:**
- Monthly active users (MAU)
- User retention rates
- Customer acquisition cost (CAC)

**Business Metrics:**
- Revenue growth (if monetized)
- Customer lifetime value (LTV)
- Product-market fit score

**Product Metrics:**
- Feature usage and adoption
- Time to value for new users
- Customer satisfaction scores

**Growth Metrics:**
- Organic growth rate
- Referral rates
- Market share in target segment

## Measurement Tools
- Google Analytics for user behavior
- Customer surveys for satisfaction
- Revenue tracking for business metrics
- Cohort analysis for retention`,
        estimatedReadTime: '10 minutes'
      },
      
      {
        id: 'risk-mitigation',
        title: 'Risk Mitigation',
        description: 'Common risks and how to avoid them',
        aiPrompt: 'Identify potential risks specific to their idea and industry, along with concrete mitigation strategies and contingency plans.',
        fallbackContent: `# Risk Mitigation & Contingency Planning

## Common Product Development Risks

### Risk 1: No Market Demand
**Mitigation:**
- Extensive customer validation in Week 1
- Build only validated features
- Start with a very specific niche

**Contingency:**
- Pivot based on customer feedback
- Adjust target market or positioning
- Consider different pricing models

### Risk 2: Technical Challenges
**Mitigation:**
- Choose familiar tech stack
- Start with simplest possible implementation
- Budget extra time for technical issues

**Contingency:**
- Use no-code alternatives
- Find technical co-founder or contractor
- Reduce scope to core functionality

### Risk 3: Timeline Overruns
**Mitigation:**
- Break work into small daily tasks
- Focus on MVP features only
- Build accountability system

**Contingency:**
- Extend timeline by 1-2 weeks
- Launch with fewer features
- Focus on core value proposition

### Risk 4: Competitor Launch
**Mitigation:**
- Monitor competitor activity
- Focus on unique differentiation
- Build relationships with customers

**Contingency:**
- Emphasize your unique advantages
- Consider partnership opportunities
- Double down on customer service

### Risk 5: Resource Constraints
**Mitigation:**
- Use free/cheap tools initially
- Focus on revenue-generating activities
- Build lean and iterate

**Contingency:**
- Seek angel investment or loans
- Partner with others for resources
- Consider bootstrapping approach

## Weekly Risk Assessments
- Review risks each Friday
- Adjust plans based on new information
- Communicate risks with stakeholders`,
        estimatedReadTime: '12 minutes'
      }
    ],
    
    // Additional resources and next steps
    nextSteps: {
      immediate: [
        'Book a strategy session to refine your plan',
        'Join our community of product builders',
        'Set up weekly check-ins for accountability'
      ],
      ongoing: [
        'Monthly progress review sessions',
        'Access to updated templates and tools',
        'Peer feedback and networking opportunities'
      ]
    },
    
    // Pricing and upsells
    pricing: {
      base: 297,
      currency: 'USD',
      upsells: [
        {
          name: '1-on-1 Strategy Session',
          description: '90-minute personalized strategy session to refine your plan',
          price: 497
        },
        {
          name: 'Weekly Office Hours',
          description: 'Monthly group calls for questions and accountability',
          price: 97
        }
      ]
    }
  },

  'KIT_AUTOMATION': {
    id: 'KIT_AUTOMATION',
    name: 'Micro-Automation Kit',
    description: 'High-impact automation scripts and workflows tailored to your business and tools.',
    price: '$197',
    estimatedTime: '2-4 hours implementation',
    deliveryFormat: ['Script Library', 'Setup Guides', 'ROI Calculator'],
    
    systemPrompt: `You are an automation expert creating personalized micro-automation solutions.
    Generate specific, implementable automation scripts and workflows tailored to their business and tools.
    Focus on high-impact, low-effort automations that save time and reduce errors.
    Include code examples, setup instructions, and ROI calculations.`,
    
    requiredInputs: ['name', 'email', 'current_tools', 'biggest_challenge'],
    optionalInputs: ['company', 'industry', 'team_size', 'technical_level', 'time_spent', 'manual_processes'],
    
    sections: [
      {
        id: 'automation-audit',
        title: 'Your Automation Audit',
        description: 'Analysis of your current workflows and opportunities',
        aiPrompt: 'Analyze their current workflows and identify automation opportunities. Include ROI estimates and implementation difficulty for each opportunity.',
        fallbackContent: `# Your Automation Audit

## Current State Analysis
Based on your tools and processes, here are the automation opportunities we've identified:

### High-Impact Quick Wins (0-2 hours)
1. **Email Templates & Signatures**
   - Save 15 minutes/day
   - ROI: 65 hours/year saved

2. **File Organization Scripts**
   - Save 10 minutes/day  
   - ROI: 43 hours/year saved

3. **Calendar Automation**
   - Save 20 minutes/day
   - ROI: 87 hours/year saved

### Medium Impact (1-2 days)
1. **Data Backup Automation**
2. **Report Generation**
3. **Customer Onboarding Sequences**

### High Impact (1-2 weeks)
1. **CRM Integration Workflows**
2. **Marketing Automation Campaigns**
3. **Analytics Dashboards**

## Total Potential Savings
- **Time:** 195+ hours per year
- **Value:** $9,750+ annually (at $50/hour)
- **Stress Reduction:** Eliminate 90% of repetitive tasks`,
        estimatedReadTime: '8 minutes'
      }
      // Additional sections would follow similar pattern...
    ]
  },

  'KIT_DIAGRAMS': {
    id: 'KIT_DIAGRAMS',
    name: 'Visual Thinking Toolkit',
    description: 'Custom diagram templates and frameworks for your industry and challenges.',
    price: '$147',
    estimatedTime: '1-2 hours setup',
    deliveryFormat: ['Diagram Templates', 'Framework Library', 'Usage Guides'],
    
    systemPrompt: `You are a systems thinking expert creating visual frameworks for complex problems.
    Generate diagram templates and frameworks specifically relevant to their industry and challenges.
    Focus on actionable visual tools they can use immediately in their work.
    Include instructions for customization and implementation.`,
    
    requiredInputs: ['name', 'email', 'industry', 'team_size'],
    optionalInputs: ['company', 'role', 'biggest_challenge', 'decision_types', 'stakeholders'],
    
    sections: [
      {
        id: 'visual-thinking-framework',
        title: 'Visual Thinking Framework',
        description: 'Core methodology for using diagrams effectively',
        aiPrompt: 'Create a visual thinking framework specifically designed for their industry and common challenges. Include step-by-step usage instructions.',
        fallbackContent: `# Visual Thinking Framework

## The CLEAR Method

**C**larify the problem or decision
**L**ist all relevant factors and stakeholders  
**E**xplore relationships and dependencies
**A**nalyze patterns and insights
**R**each decisions and create action plans

## When to Use Visual Tools

### Process Mapping
- When workflows are unclear
- Before system changes
- During team onboarding

### Decision Trees
- For complex choices with multiple factors
- Risk assessment scenarios
- Strategic planning

### Stakeholder Maps
- Project planning and communication
- Change management
- Conflict resolution

## Visual Thinking Principles
1. Start simple, add complexity gradually
2. Use consistent symbols and colors
3. Focus on relationships, not just components
4. Iterate and refine based on feedback
5. Make it actionable, not just pretty`,
        estimatedReadTime: '6 minutes'
      }
      // Additional sections would follow similar pattern...
    ]
  }
};

// Helper functions for template management
const templateHelpers = {
  // Get template by ID
  getTemplate: (packType) => {
    return PACK_TEMPLATES[packType] || null;
  },

  // Get required inputs for a pack type
  getRequiredInputs: (packType) => {
    const template = PACK_TEMPLATES[packType];
    return template ? template.requiredInputs : [];
  },

  // Get all input fields for a pack type
  getAllInputs: (packType) => {
    const template = PACK_TEMPLATES[packType];
    if (!template) return [];
    
    return [
      ...template.requiredInputs,
      ...template.optionalInputs
    ];
  },

  // Get section by ID
  getSection: (packType, sectionId) => {
    const template = PACK_TEMPLATES[packType];
    if (!template) return null;
    
    return template.sections.find(section => section.id === sectionId);
  },

  // Get fallback content for a section
  getFallbackContent: (packType, sectionId) => {
    const section = templateHelpers.getSection(packType, sectionId);
    return section ? section.fallbackContent : '';
  },

  // Validate user inputs against template requirements
  validateInputs: (packType, userInputs) => {
    const template = PACK_TEMPLATES[packType];
    if (!template) {
      return {
        valid: false,
        error: `Unknown pack type: ${packType}`
      };
    }

    const missingFields = template.requiredInputs.filter(
      field => !userInputs[field] || userInputs[field].trim() === ''
    );

    if (missingFields.length > 0) {
      return {
        valid: false,
        missingFields,
        error: `Missing required fields: ${missingFields.join(', ')}`
      };
    }

    return { valid: true };
  },

  // Get personalization context prompt
  getContextPrompt: (userInputs) => {
    const context = Object.entries(userInputs)
      .filter(([key, value]) => value && value.toString().trim() !== '')
      .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${value}`)
      .join('\n');

    return `CONTEXT:\n${context}`;
  },

  // Calculate estimated reading time
  calculateReadingTime: (content) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }
};

module.exports = {
  PACK_TEMPLATES,
  templateHelpers
};
