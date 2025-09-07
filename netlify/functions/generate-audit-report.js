const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Generate audit report based on inputs
const generateAuditReport = (companyName, industry, techStack, teamSize) => {
  const reportId = crypto.randomUUID();
  const auditDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Generate industry-specific issues
  const industryIssues = {
    'saas': [
      { priority: 'critical', category: 'scalability', issue: 'Database queries not optimized for multi-tenant architecture' },
      { priority: 'high', category: 'security', issue: 'Missing row-level security for customer data isolation' },
      { priority: 'medium', category: 'performance', issue: 'Frontend bundle size exceeds 2MB, impacting load times' }
    ],
    'ecommerce': [
      { priority: 'critical', category: 'performance', issue: 'Product search queries taking >3 seconds on average' },
      { priority: 'high', category: 'conversion', issue: 'Checkout abandonment at 68% due to complex flow' },
      { priority: 'medium', category: 'inventory', issue: 'Real-time stock updates not implemented' }
    ],
    'fintech': [
      { priority: 'critical', category: 'security', issue: 'PCI compliance gaps in payment processing flow' },
      { priority: 'high', category: 'reliability', issue: 'No circuit breakers for external API dependencies' },
      { priority: 'medium', category: 'monitoring', issue: 'Insufficient fraud detection monitoring' }
    ],
    'healthcare': [
      { priority: 'critical', category: 'compliance', issue: 'HIPAA audit logs incomplete for data access' },
      { priority: 'high', category: 'security', issue: 'Patient data encryption at rest needs upgrading' },
      { priority: 'medium', category: 'integration', issue: 'HL7 FHIR standards not fully implemented' }
    ]
  };

  // Generate tech stack specific recommendations
  const stackRecommendations = {
    'react-node': [
      'Implement React Server Components for better performance',
      'Add database connection pooling with PgBouncer',
      'Set up ESLint rules for consistent code quality'
    ],
    'nextjs': [
      'Utilize Next.js Image optimization for better Core Web Vitals',
      'Implement ISR for frequently changing product pages',
      'Add Prisma migrations for schema version control'
    ],
    'python-django': [
      'Configure Django Channels for real-time features',
      'Add Celery for background task processing',
      'Implement Django REST framework pagination'
    ]
  };

  const issues = industryIssues[industry] || industryIssues['saas'];
  const recommendations = stackRecommendations[techStack] || stackRecommendations['react-node'];

  // Calculate priority scores
  const criticalCount = issues.filter(i => i.priority === 'critical').length;
  const highCount = issues.filter(i => i.priority === 'high').length;
  const mediumCount = issues.filter(i => i.priority === 'medium').length;

  const overallScore = Math.max(20, 85 - (criticalCount * 15) - (highCount * 8) - (mediumCount * 3));

  return {
    id: reportId,
    metadata: {
      companyName,
      industry,
      techStack,
      teamSize,
      auditDate,
      overallScore
    },
    summary: {
      totalIssues: issues.length,
      criticalIssues: criticalCount,
      highPriorityIssues: highCount,
      mediumPriorityIssues: mediumCount,
      estimatedFixTime: `${2 + (criticalCount * 3) + (highCount * 2) + mediumCount} weeks`
    },
    issues: issues.map((issue, index) => ({
      id: index + 1,
      ...issue,
      description: generateIssueDescription(issue),
      impact: generateImpactScore(issue.priority),
      effort: generateEffortEstimate(issue.category),
      recommendation: generateRecommendation(issue)
    })),
    recommendations: recommendations,
    nextSteps: [
      'Address critical security and performance issues first',
      'Implement monitoring and alerting for key metrics',
      'Establish code review process and automated testing',
      'Consider technical debt reduction sprint'
    ],
    watermark: {
      generated_by: 'Ivan Peycheff Systems Audit',
      note: 'This is a sample report. Get your complete audit at peycheff.com'
    }
  };
};

const generateIssueDescription = (issue) => {
  const descriptions = {
    'Database queries not optimized for multi-tenant architecture': 'Current query patterns don\'t leverage proper indexing for tenant isolation, leading to potential data leakage and performance degradation.',
    'Missing row-level security for customer data isolation': 'Without RLS policies, there\'s risk of customers accessing each other\'s data through API vulnerabilities.',
    'Frontend bundle size exceeds 2MB, impacting load times': 'Large JavaScript bundles delay Time to Interactive, directly impacting user experience and conversion rates.'
  };
  
  return descriptions[issue.issue] || `${issue.category} optimization needed to improve system reliability and performance.`;
};

const generateImpactScore = (priority) => {
  const scores = { critical: 9, high: 7, medium: 5, low: 3 };
  return scores[priority] || 5;
};

const generateEffortEstimate = (category) => {
  const estimates = {
    security: '2-3 weeks',
    performance: '1-2 weeks', 
    scalability: '3-4 weeks',
    compliance: '4-6 weeks',
    monitoring: '1 week'
  };
  return estimates[category] || '1-2 weeks';
};

const generateRecommendation = (issue) => {
  const recommendations = {
    'Database queries not optimized for multi-tenant architecture': 'Implement composite indexes on (tenant_id, created_at) and review all queries for tenant filtering.',
    'Missing row-level security for customer data isolation': 'Add RLS policies: CREATE POLICY tenant_isolation ON table_name FOR ALL TO app_user USING (tenant_id = current_tenant_id());',
    'Frontend bundle size exceeds 2MB, impacting load times': 'Implement code splitting with React.lazy() and analyze bundle with webpack-bundle-analyzer.'
  };
  
  return recommendations[issue.issue] || `Review ${issue.category} implementation and apply industry best practices.`;
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
    const { companyName, industry, techStack, teamSize, email } = JSON.parse(event.body || '{}');

    // Validate required fields
    if (!companyName || !industry || !techStack) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required fields: companyName, industry, techStack' 
        })
      };
    }

    // Generate audit report
    const auditReport = generateAuditReport(companyName, industry, techStack, teamSize);

    // Store report in database
    const { data: report, error } = await supabase
      .from('audit_reports')
      .insert([{
        id: auditReport.id,
        company_name: companyName,
        industry,
        tech_stack: techStack,
        team_size: teamSize,
        email: email ? crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex') : null,
        report_data: auditReport,
        overall_score: auditReport.metadata.overallScore,
        is_public: true,
        share_count: 0
      }])
      .select()
      .single();

    if (error) {
      console.error('Error storing audit report:', error);
      throw new Error('Failed to store audit report');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        reportId: auditReport.id,
        shareUrl: `${process.env.URL || 'https://peycheff.com'}/r/${auditReport.id}`,
        report: auditReport
      })
    };

  } catch (error) {
    console.error('Error generating audit report:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to generate audit report. Please try again.'
      })
    };
  }
};
