import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load matrix data
const matricesPath = path.join(__dirname, '../src/data/programmatic-matrices.json');
const matrices = JSON.parse(await fs.readFile(matricesPath, 'utf8'));

// Output directory
const outputDir = path.join(__dirname, '../src/pages/programmatic');

// Template string replacement
const replaceTemplate = (template, variables) => {
  return template.replace(/\{(\w+)\}/g, (match, key) => variables[key] || match);
};

// Generate URL-safe slug
const createSlug = (text) => {
  return text.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Generate a single landing page component
const generatePageComponent = (role, stack, niche, pageData) => {
  const componentName = `${role.title.replace(/\s+/g, '')}${stack.title.replace(/[^a-zA-Z]/g, '')}${niche.title.replace(/\s+/g, '')}Page`;
  
  const template = `import React from 'react';
import { Helmet } from 'react-helmet';
import InteractivePreview from '../../home-landing/components/InteractivePreview';
import { trackEvent, EVENTS } from '../../../lib/analytics';

const ${componentName} = () => {
  React.useEffect(() => {
    // Track programmatic page view
    trackEvent(EVENTS.PROGRAMMATIC_PAGE_VIEW, {
      role: '${role.id}',
      stack: '${stack.id}',
      niche: '${niche.id}',
      page_url: window.location.pathname
    });
  }, []);

  const defaultFormData = {
    goal: '${niche.examples[0]}',
    stack: '${stack.id}'
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>${pageData.meta.title}</title>
        <meta name="description" content="${pageData.meta.description}" />
        <meta property="og:title" content="${pageData.meta.title}" />
        <meta property="og:description" content="${pageData.meta.description}" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${pageData.meta.title}" />
        <meta name="twitter:description" content="${pageData.meta.description}" />
        
        {/* Programmatic SEO markup */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "30-Day Sprint Plan for ${role.title}s",
            "description": "${pageData.meta.description}",
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "39",
              "priceCurrency": "USD"
            }
          })}
        </script>
      </Helmet>

      <main className="apple-container py-20">
        {/* Hero Section */}
        <section className="text-center space-y-8 mb-20">
          <div className="space-y-6">
            <div className="text-[14px] leading-[22px] text-[#0A84FF] font-medium">
              For ${role.title}s Building ${niche.title} Products
            </div>
            
            <h1 className="text-[48px] md:text-[56px] lg:text-[64px] leading-[56px] md:leading-[64px] lg:leading-[72px] font-semibold tracking-[-0.02em] text-[#F2F3F5] max-w-4xl mx-auto">
              ${pageData.headlines.primary}
            </h1>
            
            <p className="text-[18px] leading-[28px] text-[#A5ABB3] max-w-3xl mx-auto">
              ${pageData.headlines.secondary}. ${role.value_prop}.
            </p>
          </div>
          
          {/* Pain Point */}
          <div className="bg-[#1C1C1E] p-6 rounded-lg max-w-2xl mx-auto">
            <p className="text-[16px] leading-[24px] text-[#F2F3F5] font-medium">
              ${pageData.pain_point}
            </p>
            <p className="text-[14px] leading-[22px] text-[#A5ABB3] mt-2">
              ${pageData.urgency}
            </p>
          </div>
        </section>

        {/* Interactive Preview with Defaults */}
        <section className="mb-20">
          <InteractivePreview defaultFormData={defaultFormData} />
        </section>

        {/* Stack-Specific Benefits */}
        <section className="mb-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-[32px] leading-[40px] font-semibold text-[#F2F3F5] text-center mb-12">
              Perfect for ${stack.title} Development
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="apple-card">
                <h3 className="text-[18px] font-medium text-[#F2F3F5] mb-4">
                  Optimized Tech Stack
                </h3>
                <ul className="space-y-3 text-[14px] text-[#A5ABB3]">
                  <li>• ${stack.primary} architecture patterns</li>
                  <li>• ${stack.db} database design</li>
                  <li>• ${stack.deployment} deployment strategy</li>
                  <li>• ${stack.testing} testing approach</li>
                </ul>
              </div>
              
              <div className="apple-card">
                <h3 className="text-[18px] font-medium text-[#F2F3F5] mb-4">
                  ${niche.title} Essentials
                </h3>
                <ul className="space-y-3 text-[14px] text-[#A5ABB3]">
                  ${niche.key_features.map(feature => 
                    `<li>• ${feature.charAt(0).toUpperCase() + feature.slice(1)}</li>`
                  ).join('')}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <p className="text-[16px] leading-[24px] text-[#A5ABB3]">
              ${pageData.social_proof}
            </p>
            <p className="text-[14px] leading-[22px] text-[#666668]">
              ${pageData.authority}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ${componentName};`;

  return template;
};

// Generate all page combinations
const generateAllPages = async () => {
  const pages = [];
  const generatedFiles = [];

  console.log('🚀 Generating programmatic landing pages...');

  // Create output directory
  await fs.mkdir(outputDir, { recursive: true });

  // Generate combinations (limit to high-value combinations to avoid bloat)
  const priorityRoles = matrices.roles.slice(0, 4); // Top 4 roles
  const priorityStacks = matrices.stacks.slice(0, 4); // Top 4 stacks
  const priorityNiches = matrices.niches.slice(0, 6); // Top 6 niches

  for (const role of priorityRoles) {
    for (const stack of priorityStacks) {
      for (const niche of priorityNiches) {
        const variables = {
          role: role.title,
          stack: stack.title,
          niche: niche.title
        };

        const pageData = {
          meta: {
            title: replaceTemplate(matrices.templates.meta.title_pattern, variables),
            description: replaceTemplate(matrices.templates.meta.description_pattern, variables)
          },
          headlines: {
            primary: replaceTemplate(matrices.templates.headlines.primary, variables),
            secondary: replaceTemplate(matrices.templates.headlines.secondary, variables),
            cta: replaceTemplate(matrices.templates.headlines.cta, variables)
          },
          pain_point: matrices.templates.pain_points[role.id],
          urgency: matrices.content_variations.urgency[0].replace('{role}', role.title),
          social_proof: matrices.templates.social_proof[0].replace('{role}', role.title),
          authority: matrices.content_variations.authority[1].replace('{role}', role.title)
        };

        // Generate component
        const component = generatePageComponent(role, stack, niche, pageData);
        
        // Create file path
        const slug = \`\${createSlug(role.title)}-\${createSlug(stack.title)}-\${createSlug(niche.title)}\`;
        const fileName = \`\${slug}.jsx\`;
        const filePath = path.join(outputDir, fileName);
        
        // Write file
        await fs.writeFile(filePath, component);
        
        // Track generated page
        pages.push({
          slug,
          path: \`/\${slug}\`,
          role: role.id,
          stack: stack.id,
          niche: niche.id,
          meta: pageData.meta,
          component: fileName
        });
        
        generatedFiles.push(fileName);
      }
    }
  }

  console.log(\`✅ Generated \${pages.length} programmatic pages\`);

  // Generate index file with all routes
  const indexContent = \`// Auto-generated programmatic page routes
import { lazy } from 'react';

\${pages.map(page => 
  \`const \${page.slug.replace(/-/g, '')}Page = lazy(() => import('./${page.component.replace('.jsx', '')}'));\`
).join('\\n')}

export const PROGRAMMATIC_ROUTES = [
\${pages.map(page => 
  \`  {
    path: '${page.path}',
    component: \${page.slug.replace(/-/g, '')}Page,
    meta: ${JSON.stringify(page.meta, null, 4)}
  }\`
).join(',\\n')}
];

export const PROGRAMMATIC_PAGES = ${JSON.stringify(pages, null, 2)};
\`;

  await fs.writeFile(path.join(outputDir, 'index.js'), indexContent);

  // Generate sitemap data
  const sitemapData = pages.map(page => ({
    url: \`https://peycheff.com\${page.path}\`,
    lastmod: new Date().toISOString(),
    priority: 0.8,
    changefreq: 'weekly'
  }));

  await fs.writeFile(
    path.join(__dirname, '../public/programmatic-sitemap.json'),
    JSON.stringify(sitemapData, null, 2)
  );

  console.log(\`📄 Generated sitemap with \${sitemapData.length} URLs\`);
  console.log('🎯 High-priority combinations created for maximum SEO impact');

  return { pages, generatedFiles };
};

// Run generation
generateAllPages().catch(console.error);
