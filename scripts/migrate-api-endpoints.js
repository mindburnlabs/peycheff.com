#!/usr/bin/env node

/**
 * Script to migrate Netlify function references to Vercel API routes
 */

const fs = require('fs');
const path = require('path');

// Mapping of Netlify functions to Vercel API routes
const endpointMappings = {
  '/.netlify/functions/contact-inquiry': '/api/contact',
  '/.netlify/functions/stripe-webhook': '/api/webhook-stripe',
  '/.netlify/functions/newsletter-subscribe': '/api/newsletter-subscribe',
  '/.netlify/functions/utility-trial-signup': '/api/utility-trial-signup',
  '/.netlify/functions/check-entitlements': '/api/check-entitlements',
  '/.netlify/functions/generate-audit-report': '/api/generate-audit-report',
  '/.netlify/functions/stripe-portal': '/api/stripe-portal',
  '/.netlify/functions/preview-sprint': '/api/preview-sprint',
  '/.netlify/functions/get-audit-report': '/api/get-audit-report',
  '/.netlify/functions/generate-sprint-production': '/api/generate-sprint-production',
  '/.netlify/functions/metrics-dashboard': '/api/metrics-dashboard',
  '/.netlify/functions/sitemap': '/api/sitemap'
};

function migrateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    for (const [netlifyEndpoint, vercelEndpoint] of Object.entries(endpointMappings)) {
      if (content.includes(netlifyEndpoint)) {
        content = content.replace(new RegExp(netlifyEndpoint.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), vercelEndpoint);
        modified = true;
        console.log(`✅ Updated ${filePath}: ${netlifyEndpoint} → ${vercelEndpoint}`);
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

function findAndMigrateFiles(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findAndMigrateFiles(filePath);
    } else if (stat.isFile() && (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx'))) {
      migrateFile(filePath);
    }
  }
}

// Main execution
console.log('🔄 Starting API endpoint migration from Netlify to Vercel...\n');

const srcDir = path.join(process.cwd(), 'src');
findAndMigrateFiles(srcDir);

console.log('\n✅ Migration complete!');
console.log('\n📝 Note: You may need to create the corresponding API routes in the /api directory.');
console.log('📋 See DEPLOYMENT_VERCEL.md for detailed instructions.');