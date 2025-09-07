const OpenAI = require('openai');

// Initialize AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Content generation templates for different pack types
const PACK_TEMPLATES = {
  'PACK_30DAY': {
    name: '30-Day Idea→Product Sprint',
    systemPrompt: `You are an expert product strategist helping someone turn their idea into a shipped product in 30 days. 
    Generate a comprehensive, actionable plan that is specifically tailored to their idea, industry, and constraints.
    Focus on practical steps, realistic timelines, and proven frameworks.
    Include specific tools, resources, and checkpoints.`,
    sections: [
      'Executive Summary',
      'Week 1: Validation & Research',
      'Week 2: MVP Definition & Design',
      'Week 3: Build & Test',
      'Week 4: Launch & Scale',
      'Tools & Resources',
      'Success Metrics',
      'Risk Mitigation'
    ]
  },
  
  'KIT_AUTOMATION': {
    name: 'Micro-Automation Kit',
    systemPrompt: `You are an automation expert creating personalized micro-automation solutions.
    Generate specific, implementable automation scripts and workflows tailored to their business and tools.
    Focus on high-impact, low-effort automations that save time and reduce errors.
    Include code examples, setup instructions, and ROI calculations.`,
    sections: [
      'Automation Audit',
      'Quick Wins (0-2 hours)',
      'Medium Impact (1-2 days)', 
      'High Impact (1-2 weeks)',
      'Tool Integrations',
      'Code Templates',
      'Monitoring & Optimization',
      'Scaling Your Automations'
    ]
  },
  
  'KIT_DIAGRAMS': {
    name: 'Diagram Library Kit',
    systemPrompt: `You are a systems thinking expert creating visual frameworks for complex problems.
    Generate diagram templates and frameworks specifically relevant to their industry and challenges.
    Focus on actionable visual tools they can use immediately in their work.
    Include instructions for customization and implementation.`,
    sections: [
      'Visual Thinking Framework',
      'Problem Mapping Diagrams',
      'Process Flow Templates',
      'System Architecture Views',
      'Decision Trees',
      'Stakeholder Maps',
      'Implementation Guides',
      'Customization Tips'
    ]
  }
};

// AI service functions
const aiService = {
  // Generate personalized content for a specific pack type
  generatePersonalizedPack: async (packType, userInputs) => {
    const template = PACK_TEMPLATES[packType];
    if (!template) {
      throw new Error(`Unknown pack type: ${packType}`);
    }

    try {
      const sections = {};
      
      // Generate each section with personalized content
      for (const sectionName of template.sections) {
        const sectionContent = await generateSection(template, sectionName, userInputs);
        sections[sectionName] = sectionContent;
      }

      return {
        success: true,
        packType,
        title: template.name,
        personalizedFor: userInputs.name || 'Valued Customer',
        generatedAt: new Date().toISOString(),
        sections
      };

    } catch (error) {
      console.error('Pack generation failed:', error);
      return {
        success: false,
        error: error.message,
        packType
      };
    }
  },

  // Generate specific content section
  generateSection: async (packType, sectionName, userInputs, customPrompt = null) => {
    const template = PACK_TEMPLATES[packType];
    if (!template) {
      throw new Error(`Unknown pack type: ${packType}`);
    }

    return generateSection(template, sectionName, userInputs, customPrompt);
  },

  // Generate automation scripts
  generateAutomationScript: async (automationType, userInputs) => {
    const prompt = buildAutomationPrompt(automationType, userInputs);
    
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert automation engineer. Generate practical, working code with clear documentation.'
          },
          {
            role: 'user', 
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      });

      return {
        success: true,
        script: response.choices[0].message.content,
        automationType,
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Script generation failed:', error);
      return {
        success: false,
        error: error.message,
        automationType
      };
    }
  },

  // Generate diagram templates
  generateDiagramTemplate: async (diagramType, userInputs) => {
    const prompt = buildDiagramPrompt(diagramType, userInputs);
    
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a visual thinking expert. Create detailed diagram templates and frameworks in Mermaid syntax.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.8
      });

      return {
        success: true,
        diagram: response.choices[0].message.content,
        diagramType,
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Diagram generation failed:', error);
      return {
        success: false,
        error: error.message,
        diagramType
      };
    }
  },

  // Validate user inputs
  validateInputs: (packType, userInputs) => {
    const requiredFields = getRequiredFields(packType);
    const missingFields = requiredFields.filter(field => !userInputs[field]);
    
    if (missingFields.length > 0) {
      return {
        valid: false,
        missingFields,
        message: `Missing required fields: ${missingFields.join(', ')}`
      };
    }

    return { valid: true };
  }
};

// Helper functions
async function generateSection(template, sectionName, userInputs, customPrompt = null) {
  const prompt = customPrompt || buildSectionPrompt(template, sectionName, userInputs);
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: template.systemPrompt
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7
    });

    return {
      title: sectionName,
      content: response.choices[0].message.content,
      generatedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error(`Section generation failed for ${sectionName}:`, error);
    return {
      title: sectionName,
      content: `Error generating content for ${sectionName}. Please contact support.`,
      error: error.message,
      generatedAt: new Date().toISOString()
    };
  }
}

function buildSectionPrompt(template, sectionName, userInputs) {
  const contextPrompt = buildContextPrompt(userInputs);
  
  const sectionPrompts = {
    'Executive Summary': `${contextPrompt}\n\nCreate a compelling executive summary that outlines the personalized approach for turning their specific idea into a product. Include key milestones and expected outcomes.`,
    
    'Week 1: Validation & Research': `${contextPrompt}\n\nCreate a detailed Week 1 plan focused on validating their specific idea through research. Include specific research methods, target customer interviews, and validation metrics relevant to their industry.`,
    
    'Week 2: MVP Definition & Design': `${contextPrompt}\n\nCreate a Week 2 plan for defining and designing their MVP. Include feature prioritization, user flow design, and technical architecture decisions specific to their idea and constraints.`,
    
    'Week 3: Build & Test': `${contextPrompt}\n\nCreate a Week 3 build and test plan. Include development approach, testing strategies, and iteration cycles tailored to their technical constraints and timeline.`,
    
    'Week 4: Launch & Scale': `${contextPrompt}\n\nCreate a Week 4 launch and scale plan. Include launch strategy, marketing approach, and initial scaling decisions relevant to their target market and goals.`,
    
    'Tools & Resources': `${contextPrompt}\n\nRecommend specific tools and resources tailored to their needs, budget, and technical skill level. Include both free and paid options with implementation guidance.`,
    
    'Success Metrics': `${contextPrompt}\n\nDefine specific, measurable success metrics for their product launch. Include leading and lagging indicators relevant to their industry and goals.`,
    
    'Risk Mitigation': `${contextPrompt}\n\nIdentify potential risks specific to their idea and industry, along with concrete mitigation strategies and contingency plans.`,
    
    'Automation Audit': `${contextPrompt}\n\nAnalyze their current workflows and identify automation opportunities. Include ROI estimates and implementation difficulty for each opportunity.`,
    
    'Quick Wins (0-2 hours)': `${contextPrompt}\n\nProvide 3-5 automation scripts they can implement in 0-2 hours. Include complete code and setup instructions.`,
    
    'Visual Thinking Framework': `${contextPrompt}\n\nCreate a visual thinking framework specifically designed for their industry and common challenges. Include step-by-step usage instructions.`
  };

  return sectionPrompts[sectionName] || `${contextPrompt}\n\nGenerate comprehensive content for the "${sectionName}" section, tailored specifically to their needs and context.`;
}

function buildContextPrompt(userInputs) {
  return `
CONTEXT:
- Name: ${userInputs.name || 'Customer'}
- Company: ${userInputs.company || 'Not specified'}
- Industry: ${userInputs.industry || 'General'}
- Idea/Goal: ${userInputs.idea || userInputs.goal || 'Not specified'}
- Timeline: ${userInputs.timeline || 'Standard'}
- Budget: ${userInputs.budget || 'Not specified'}
- Technical Level: ${userInputs.technical_level || 'Intermediate'}
- Team Size: ${userInputs.team_size || 'Solo'}
- Current Tools: ${userInputs.current_tools || 'Standard suite'}
- Biggest Challenge: ${userInputs.biggest_challenge || 'Not specified'}
- Success Criteria: ${userInputs.success_criteria || 'Not specified'}

Additional Context: ${userInputs.additional_context || 'None provided'}
  `.trim();
}

function buildAutomationPrompt(automationType, userInputs) {
  const contextPrompt = buildContextPrompt(userInputs);
  
  return `${contextPrompt}

Generate a ${automationType} automation script with the following requirements:
- Complete, working code with error handling
- Clear documentation and setup instructions
- Specific to their tools and workflow
- Include ROI calculation and time savings estimate
- Provide customization options

Make it immediately actionable and valuable.`;
}

function buildDiagramPrompt(diagramType, userInputs) {
  const contextPrompt = buildContextPrompt(userInputs);
  
  return `${contextPrompt}

Create a ${diagramType} diagram template using Mermaid syntax that is:
- Specifically relevant to their industry and challenges
- Immediately usable with their context
- Includes placeholders they can customize
- Has clear instructions for modification and implementation
- Focuses on actionable insights

Include both the Mermaid code and usage instructions.`;
}

function getRequiredFields(packType) {
  const commonFields = ['name', 'email'];
  
  const packSpecificFields = {
    'PACK_30DAY': [...commonFields, 'idea', 'timeline', 'technical_level'],
    'KIT_AUTOMATION': [...commonFields, 'current_tools', 'biggest_challenge'],
    'KIT_DIAGRAMS': [...commonFields, 'industry', 'team_size']
  };
  
  return packSpecificFields[packType] || commonFields;
}

// Export the service
module.exports = {
  aiService,
  PACK_TEMPLATES
};
