export interface Product {
  id: string
  name: string
  description: string
  price: number
  type: 'product' | 'playbook' | 'service'
  category: string
  features: string[]
  stripePriceId?: string
  image?: string
  popular?: boolean
}

export const products: Product[] = [
  {
    id: 'ai-saas-starter',
    name: 'AI SaaS Starter Kit',
    description: 'Complete SaaS foundation with AI integration, payment processing, and user management.',
    price: 497,
    type: 'product',
    category: 'Development Tools',
    features: [
      'AI-powered features out of the box',
      'Stripe payment integration',
      'User authentication & management',
      'Next.js 14 with App Router',
      'Database setup with Supabase',
      'Email notifications with Resend'
    ],
    stripePriceId: 'price_1OGqdGKZpZpZpZpZpZpZpZpZ',
    popular: true
  },
  {
    id: 'product-launch-system',
    name: 'Product Launch System',
    description: 'Step-by-step framework for launching digital products that generate revenue from day one.',
    price: 197,
    type: 'playbook',
    category: 'Strategy',
    features: [
      'Pre-launch checklist',
      'Launch day timeline',
      'Post-launch optimization',
      'Marketing templates',
      'Analytics setup guide',
      'Customer feedback loops'
    ],
    stripePriceId: 'price_1OGqdHKZpZpZpZpZpZpZpZpZ'
  },
  {
    id: 'revenue-growth-playbook',
    name: 'Revenue Growth Playbook',
    description: 'Proven strategies to scale your digital product from $0 to $10K MRR.',
    price: 297,
    type: 'playbook',
    category: 'Growth',
    features: [
      'Pricing strategy frameworks',
      'Customer acquisition tactics',
      'Conversion optimization',
      'Retention strategies',
      'Upsell & cross-sell techniques',
      'Financial modeling templates'
    ],
    stripePriceId: 'price_1OGqdIKZpZpZpZpZpZpZpZpZ'
  },
  {
    id: 'ai-automation-kit',
    name: 'AI Automation Kit',
    description: 'Ready-to-use AI workflows and automations for your business.',
    price: 397,
    type: 'product',
    category: 'Automation',
    features: [
      'ChatGPT integration templates',
      'Automated content generation',
      'Customer support automation',
      'Data analysis workflows',
      'API integration guides',
      'Custom AI model setup'
    ],
    stripePriceId: 'price_1OGqdJKZpZpZpZpZpZpZpZpZ'
  },
  {
    id: 'technical-due-diligence',
    name: 'Technical Due Diligence Checklist',
    description: 'Comprehensive technical audit framework for M&A and investment.',
    price: 997,
    type: 'playbook',
    category: 'Due Diligence',
    features: [
      'Code review framework',
      'Infrastructure assessment',
      'Security audit checklist',
      'Performance benchmarks',
      'Scalability analysis',
      'Risk assessment matrix'
    ],
    stripePriceId: 'price_1OGqdKKZpZpZpZpZpZpZpZpZ'
  },
  {
    id: 'strategy-session',
    name: '1-on-1 Strategy Session',
    description: 'Personalized guidance to transform your idea into a revenue-generating product.',
    price: 5000,
    type: 'service',
    category: 'Consulting',
    features: [
      '90-minute deep-dive session',
      'Custom roadmap development',
      'Technical architecture review',
      'Go-to-market strategy',
      'Resource optimization',
      '30-day follow-up support'
    ],
    popular: true
  }
]

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id)
}

export const getProductsByType = (type: Product['type']): Product[] => {
  return products.filter(product => product.type === type)
}

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter(product => product.category === category)
}

export const getPopularProducts = (): Product[] => {
  return products.filter(product => product.popular)
}