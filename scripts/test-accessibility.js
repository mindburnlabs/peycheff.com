/**
 * Accessibility Testing Script
 * Run with: node scripts/test-accessibility.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, 'blue');
  log(`${title}`, 'blue');
  log(`${'='.repeat(60)}`, 'blue');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Check if development server is running
function checkDevServer() {
  try {
    const response = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:4028', {
      stdio: 'pipe',
      timeout: 5000
    });
    return response.toString() === '200';
  } catch {
    return false;
  }
}

// Run automated accessibility tests
async function runAutomatedTests() {
  logSection('Automated Accessibility Tests');

  // Check if dev server is running
  if (!checkDevServer()) {
    logError('Development server is not running on http://localhost:4028');
    logInfo('Please start the development server with: npm run dev');
    return false;
  }

  logSuccess('Development server is running');

  // Test with Lighthouse
  logInfo('Running Lighthouse accessibility audit...');
  try {
    const lighthouseResult = execSync(
      `npx lighthouse http://localhost:4028 --output=json --output-path=./lighthouse-accessibility.json --chrome-flags="--headless" --only-categories=accessibility`,
      { stdio: 'pipe', timeout: 60000 }
    );

    const result = JSON.parse(lighthouseResult.toString());
    const score = result.categories.accessibility.score * 100;

    if (score >= 90) {
      logSuccess(`Lighthouse accessibility score: ${score.toFixed(0)}/100`);
    } else if (score >= 70) {
      logWarning(`Lighthouse accessibility score: ${score.toFixed(0)}/100 (needs improvement)`);
    } else {
      logError(`Lighthouse accessibility score: ${score.toFixed(0)}/100 (significant issues)`);
    }

    // Log specific issues if any
    if (result.audits) {
      const failedAudits = Object.values(result.audits)
        .filter(audit => audit.score !== null && audit.score < 1)
        .map(audit => audit.title);

      if (failedAudits.length > 0) {
        logWarning(`Failed audits: ${failedAudits.length}`);
        failedAudits.forEach(audit => logWarning(`  - ${audit}`));
      }
    }
  } catch (error) {
    logError('Lighthouse audit failed');
    logInfo('Make sure you have Google Chrome installed');
  }

  // Test with axe-core CLI
  logInfo('Running axe-core accessibility tests...');
  try {
    execSync(
      `npx axe http://localhost:4028 --include "body" --tags wcag2a,wcag2aa,wcag21aa`,
      { stdio: 'inherit', timeout: 30000 }
    );
    logSuccess('No axe violations found');
  } catch (error) {
    logError('axe-core found accessibility violations');
  }

  return true;
}

// Check accessibility configuration files
function checkAccessibilityFiles() {
  logSection('Accessibility Configuration Files');

  const requiredFiles = [
    'ACCESSIBILITY_GUIDELINES.md',
    'lib/accessibility.ts',
    'lib/accessibility-testing.ts',
    'components/accessibility/SkipNavigation.tsx',
    'components/accessibility/FocusTrap.tsx',
    'components/accessibility/AccessibilityWidget.tsx',
    'components/ui/AccessibleForm.tsx'
  ];

  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      logSuccess(`Found: ${file}`);
    } else {
      logError(`Missing: ${file}`);
    }
  });
}

// Check CSS for accessibility patterns
function checkCSSAccessibility() {
  logSection('CSS Accessibility Patterns');

  try {
    const cssContent = fs.readFileSync('app/globals.css', 'utf8');

    // Check for screen reader only class
    if (cssContent.includes('.sr-only')) {
      logSuccess('Screen reader only utility class found');
    } else {
      logError('Screen reader only utility class missing');
    }

    // Check for focus styles
    if (cssContent.includes(':focus') || cssContent.includes('focus-visible')) {
      logSuccess('Focus styles defined');
    } else {
      logWarning('Focus styles may be insufficient');
    }

    // Check for reduced motion support
    if (cssContent.includes('prefers-reduced-motion')) {
      logSuccess('Reduced motion support implemented');
    } else {
      logWarning('Reduced motion support not found');
    }

    // Check for high contrast mode support
    if (cssContent.includes('prefers-contrast')) {
      logSuccess('High contrast mode support implemented');
    } else {
      logWarning('High contrast mode support not found');
    }

  } catch (error) {
    logError('Could not read globals.css file');
  }
}

// Check components for accessibility attributes
function checkComponentAccessibility() {
  logSection('Component Accessibility');

  const components = [
    'components/layout/ModernHeader.tsx',
    'components/layout/ModernFooter.tsx',
    'app/layout.tsx',
    'app/page.tsx',
    'app/contact/page.tsx'
  ];

  components.forEach(component => {
    if (fs.existsSync(component)) {
      try {
        const content = fs.readFileSync(component, 'utf8');

        let checks = {
          ariaLabels: content.includes('aria-'),
          semanticHtml: content.includes('<header>') || content.includes('<main>') || content.includes('<nav>'),
          focusManagement: content.includes('focus-visible') || content.includes('tabIndex'),
          screenReaderSupport: content.includes('sr-only') || content.includes('role=')
        };

        let passedChecks = Object.values(checks).filter(Boolean).length;
        let totalChecks = Object.keys(checks).length;

        if (passedChecks === totalChecks) {
          logSuccess(`${component} (${passedChecks}/${totalChecks} checks passed)`);
        } else {
          logWarning(`${component} (${passedChecks}/${totalChecks} checks passed)`);
        }

      } catch (error) {
        logError(`Could not read ${component}`);
      }
    } else {
      logWarning(`Component not found: ${component}`);
    }
  });
}

// Generate accessibility report
function generateReport() {
  logSection('Accessibility Report Summary');

  const report = {
    date: new Date().toISOString(),
    url: 'http://localhost:4028',
    compliance: 'WCAG 2.1 AA',
    status: 'In Progress',
    nextSteps: [
      'Run manual keyboard navigation tests',
      'Test with screen readers (NVDA, VoiceOver)',
      'Perform mobile accessibility testing',
      'Conduct user testing with people with disabilities'
    ]
  };

  try {
    fs.writeFileSync('./accessibility-report.json', JSON.stringify(report, null, 2));
    logSuccess('Accessibility report generated: accessibility-report.json');
  } catch (error) {
    logError('Failed to generate accessibility report');
  }
}

// Main test runner
async function runAccessibilityTests() {
  log(`${colors.bold}${colors.blue}Accessibility Testing Suite${colors.reset}`);
  log(`Testing peycheff.com for WCAG 2.1 AA compliance\n`);

  checkAccessibilityFiles();
  checkCSSAccessibility();
  checkComponentAccessibility();
  await runAutomatedTests();
  generateReport();

  logSection('Next Steps');
  logInfo('1. Review any errors or warnings above');
  logInfo('2. Run manual tests:');
  logInfo('   - Keyboard-only navigation (Tab, Shift+Tab, Enter, Space, Escape)');
  logInfo('   - Screen reader testing (NVDA, VoiceOver, TalkBack)');
  logInfo('   - Mobile touch accessibility (44px minimum targets)');
  logInfo('   - High contrast mode testing');
  logInfo('   - 200% text zoom testing');
  logInfo('3. Test with actual users with disabilities');
  logInfo('4. Update documentation as needed');

  logSection('Resources');
  logInfo('WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/');
  logInfo('axe Documentation: https://www.deque.com/axe/');
  logInfo('Lighthouse: https://developers.google.com/web/tools/lighthouse');
  logInfo('WebAIM: https://webaim.org/');
}

// Run tests
if (require.main === module) {
  runAccessibilityTests().catch(error => {
    logError(`Test execution failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runAccessibilityTests };