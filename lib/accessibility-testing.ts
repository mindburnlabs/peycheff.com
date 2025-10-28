/**
 * Accessibility Testing Utilities
 * Provides automated testing functions for WCAG 2.1 AA compliance
 */

import axe from 'axe-core';

// Color contrast checking
export interface ContrastResult {
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
  isLargeText: boolean;
  foreground: string;
  background: string;
}

export function checkContrast(
  foregroundColor: string,
  backgroundColor: string,
  fontSize: number = 16,
  isBold: boolean = false
): ContrastResult {
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgb1 = hexToRgb(foregroundColor);
  const rgb2 = hexToRgb(backgroundColor);

  if (!rgb1 || !rgb2) {
    return {
      ratio: 0,
      passesAA: false,
      passesAAA: false,
      isLargeText: false,
      foreground: foregroundColor,
      background: backgroundColor
    };
  }

  // Calculate relative luminance
  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  const ratio = (lighter + 0.05) / (darker + 0.05);

  const isLargeText = fontSize >= 18 || (fontSize >= 14 && isBold);
  const passesAA = isLargeText ? ratio >= 3.0 : ratio >= 4.5;
  const passesAAA = isLargeText ? ratio >= 4.5 : ratio >= 7.0;

  return {
    ratio: Math.round(ratio * 100) / 100,
    passesAA,
    passesAAA,
    isLargeText,
    foreground: foregroundColor,
    background: backgroundColor
  };
}

// Automated accessibility testing with axe-core
export async function runAxeTests(context: Element = document.documentElement) {
  try {
    const results = await axe.run(context, {
      rules: {
        // WCAG 2.1 AA specific rules
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
        'focus-order-semantics': { enabled: true },
        'aria-labels': { enabled: true },
        'heading-order': { enabled: true },
        'landmark-one-main': { enabled: true },
        'page-has-heading-one': { enabled: true },
        'region': { enabled: true },
        'skip-link': { enabled: true },
        'tabindex': { enabled: true },
      }
    });

    return {
      passes: results.passes,
      violations: results.violations,
      incomplete: results.incomplete,
      timestamp: results.timestamp
    };
  } catch (error) {
    console.error('Axe testing failed:', error);
    return {
      passes: [],
      violations: [],
      incomplete: [],
      timestamp: Date.now(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Keyboard navigation testing
export function testKeyboardNavigation(): {
  canAccessAllElements: boolean;
  focusOrder: string[];
  issues: string[];
} {
  const focusableElements = document.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const focusOrder: string[] = [];
  const issues: string[] = [];

  // Test if all interactive elements are focusable
  focusableElements.forEach((element, index) => {
    const tagName = element.tagName.toLowerCase();
    const hasTabIndex = element.hasAttribute('tabindex');
    const isDisabled = element.hasAttribute('disabled');

    focusOrder.push(`${tagName}${element.id ? '#' + element.id : ''}${element.className ? '.' + element.className.split(' ')[0] : ''}`);

    if (isDisabled && !hasTabIndex) {
      issues.push(`Disabled ${tagName} element should have tabindex="-1"`);
    }
  });

  // Check for skip links
  const skipLinks = document.querySelectorAll('a[href^="#"]');
  if (skipLinks.length === 0) {
    issues.push('No skip navigation links found');
  }

  // Check for main landmark
  const mainElement = document.querySelector('main, [role="main"]');
  if (!mainElement) {
    issues.push('No main landmark found');
  }

  // Check for proper heading structure
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const h1Elements = document.querySelectorAll('h1');

  if (h1Elements.length === 0) {
    issues.push('No h1 element found');
  } else if (h1Elements.length > 1) {
    issues.push('Multiple h1 elements found (should have exactly one)');
  }

  // Check heading order
  let previousLevel = 0;
  headings.forEach(heading => {
    const level = parseInt(heading.tagName.charAt(1));
    if (level > previousLevel + 1) {
      issues.push(`Heading level jump from h${previousLevel} to h${level}`);
    }
    previousLevel = level;
  });

  return {
    canAccessAllElements: issues.length === 0,
    focusOrder,
    issues
  };
}

// Screen reader testing utilities
export function testScreenReaderCompatibility(): {
  hasAltText: boolean;
  hasAriaLabels: boolean;
  hasLandmarks: boolean;
  hasProperStructure: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Test image alt text
  const images = document.querySelectorAll('img');
  let imagesWithoutAlt = 0;
  images.forEach(img => {
    if (!img.alt && !img.hasAttribute('aria-hidden')) {
      imagesWithoutAlt++;
    }
  });

  if (imagesWithoutAlt > 0) {
    issues.push(`${imagesWithoutAlt} images missing alt text`);
  }

  // Test ARIA labels
  const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
  let elementsWithoutLabels = 0;

  interactiveElements.forEach(element => {
    const hasLabel =
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      (element.id && document.querySelector(`label[for="${element.id}"]`)) ||
      element.textContent?.trim();

    if (!hasLabel) {
      elementsWithoutLabels++;
    }
  });

  if (elementsWithoutLabels > 0) {
    issues.push(`${elementsWithoutLabels} interactive elements missing accessible labels`);
  }

  // Test landmarks
  const landmarks = document.querySelectorAll('header, nav, main, footer, [role="banner"], [role="navigation"], [role="main"], [role="contentinfo"]');
  if (landmarks.length < 3) {
    issues.push('Insufficient ARIA landmarks found');
  }

  // Test form labels
  const formInputs = document.querySelectorAll('input, select, textarea');
  let inputsWithoutLabels = 0;

  formInputs.forEach(input => {
    const hasLabel =
      input.getAttribute('aria-label') ||
      input.getAttribute('aria-labelledby') ||
      (input.id && document.querySelector(`label[for="${input.id}"]`));

    if (!hasLabel) {
      inputsWithoutLabels++;
    }
  });

  if (inputsWithoutLabels > 0) {
    issues.push(`${inputsWithoutLabels} form inputs missing labels`);
  }

  return {
    hasAltText: imagesWithoutAlt === 0,
    hasAriaLabels: elementsWithoutLabels === 0,
    hasLandmarks: landmarks.length >= 3,
    hasProperStructure: issues.length === 0,
    issues
  };
}

// Touch target testing (mobile accessibility)
export function testTouchTargets(): {
  minSizeMet: boolean;
  properlySpaced: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  const touchTargets = document.querySelectorAll('button, a, input, select, textarea');

  touchTargets.forEach(element => {
    const rect = element.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const minSize = 44; // 44px minimum per WCAG

    if (width < minSize || height < minSize) {
      issues.push(`Touch target too small: ${width}x${height}px (minimum 44x44px)`);
    }

    // Check spacing between touch targets
    const nextElement = element.nextElementSibling;
    if (nextElement && Array.from(touchTargets).includes(nextElement as Element)) {
      const nextRect = nextElement.getBoundingClientRect();
      const horizontalSpacing = nextRect.left - rect.right;
      const verticalSpacing = nextRect.top - rect.bottom;

      if (horizontalSpacing < 8 && horizontalSpacing > -8) {
        issues.push('Touch targets too close horizontally (minimum 8px spacing)');
      }
      if (verticalSpacing < 8 && verticalSpacing > -8) {
        issues.push('Touch targets too close vertically (minimum 8px spacing)');
      }
    }
  });

  return {
    minSizeMet: issues.filter(issue => issue.includes('too small')).length === 0,
    properlySpaced: issues.filter(issue => issue.includes('too close')).length === 0,
    issues
  };
}

// Run comprehensive accessibility audit
export async function runAccessibilityAudit(): Promise<{
  overall: 'pass' | 'fail' | 'warning';
  axe: any;
  keyboard: any;
  screenReader: any;
  touchTargets: any;
  timestamp: number;
}> {
  const [axeResults, keyboardResults, screenReaderResults, touchTargetResults] = await Promise.all([
    runAxeTests(),
    Promise.resolve(testKeyboardNavigation()),
    Promise.resolve(testScreenReaderCompatibility()),
    Promise.resolve(testTouchTargets())
  ]);

  const hasViolations = axeResults.violations.length > 0;
  const hasKeyboardIssues = keyboardResults.issues.length > 0;
  const hasScreenReaderIssues = screenReaderResults.issues.length > 0;
  const hasTouchTargetIssues = touchTargetResults.issues.length > 0;

  let overall: 'pass' | 'fail' | 'warning' = 'pass';

  if (hasViolations || hasKeyboardIssues || hasScreenReaderIssues) {
    overall = 'fail';
  } else if (hasTouchTargetIssues) {
    overall = 'warning';
  }

  return {
    overall,
    axe: axeResults,
    keyboard: keyboardResults,
    screenReader: screenReaderResults,
    touchTargets: touchTargetResults,
    timestamp: Date.now()
  };
}

// Generate accessibility report
export function generateAccessibilityReport(auditResults: any): string {
  const { overall, axe, keyboard, screenReader, touchTargets } = auditResults;

  let report = `# Accessibility Audit Report\n\n`;
  report += `**Overall Status**: ${overall.toUpperCase()}\n`;
  report += `**Date**: ${new Date(auditResults.timestamp).toLocaleString()}\n\n`;

  // Axe results
  report += `## Automated Testing (axe-core)\n`;
  report += `- **Violations**: ${axe.violations.length}\n`;
  report += `- **Passes**: ${axe.passes.length}\n\n`;

  if (axe.violations.length > 0) {
    report += `### Violations:\n`;
    axe.violations.forEach((violation: any) => {
      report += `- **${violation.id}**: ${violation.description}\n`;
      report += `  - Impact: ${violation.impact}\n`;
      report += `  - Elements: ${violation.nodes.length}\n\n`;
    });
  }

  // Keyboard navigation
  report += `## Keyboard Navigation\n`;
  report += `- **Issues Found**: ${keyboard.issues.length}\n`;
  report += `- **Focusable Elements**: ${keyboard.focusOrder.length}\n\n`;

  if (keyboard.issues.length > 0) {
    report += `### Issues:\n`;
    keyboard.issues.forEach((issue: string) => {
      report += `- ${issue}\n`;
    });
    report += '\n';
  }

  // Screen reader compatibility
  report += `## Screen Reader Compatibility\n`;
  report += `- **Issues Found**: ${screenReader.issues.length}\n`;
  report += `- **Alt Text Coverage**: ${screenReader.hasAltText ? '✓' : '✗'}\n`;
  report += `- **ARIA Labels**: ${screenReader.hasAriaLabels ? '✓' : '✗'}\n`;
  report += `- **Landmarks**: ${screenReader.hasLandmarks ? '✓' : '✗'}\n\n`;

  if (screenReader.issues.length > 0) {
    report += `### Issues:\n`;
    screenReader.issues.forEach((issue: string) => {
      report += `- ${issue}\n`;
    });
    report += '\n';
  }

  // Touch targets
  report += `## Touch Target Accessibility\n`;
  report += `- **Issues Found**: ${touchTargets.issues.length}\n`;
  report += `- **Minimum Size**: ${touchTargets.minSizeMet ? '✓' : '✗'}\n`;
  report += `- **Proper Spacing**: ${touchTargets.properlySpaced ? '✓' : '✗'}\n\n`;

  if (touchTargets.issues.length > 0) {
    report += `### Issues:\n`;
    touchTargets.issues.forEach((issue: string) => {
      report += `- ${issue}\n`;
    });
  }

  return report;
}