/**
 * Accessibility Utilities for WCAG 2.1 AA Compliance
 * Provides helper functions for accessibility features
 */

// Announce messages to screen readers
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Trap focus within a container (for modals, dropdowns, etc.)
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>;

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  };

  element.addEventListener('keydown', handleTabKey);

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
}

// Check if user is navigating with keyboard
export function detectKeyboardNavigation() {
  let usingKeyboard = false;

  const handleMouseDown = () => {
    usingKeyboard = false;
    document.body.classList.remove('keyboard-navigation');
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      usingKeyboard = true;
      document.body.classList.add('keyboard-navigation');
    }
  };

  document.addEventListener('mousedown', handleMouseDown);
  document.addEventListener('keydown', handleKeyDown);

  return () => {
    document.removeEventListener('mousedown', handleMouseDown);
    document.removeEventListener('keydown', handleKeyDown);
  };
}

// Generate unique IDs for accessibility
let idCounter = 0;
export function generateId(prefix = 'accessible') {
  return `${prefix}-${++idCounter}`;
}

// Check color contrast ratio
export function getContrastRatio(color1: string, color2: string): number {
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

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

  return (lighter + 0.05) / (darker + 0.05);
}

// Check if contrast meets WCAG AA standards
export function meetsWCAG_AA(contrastRatio: number, isLargeText = false) {
  return isLargeText ? contrastRatio >= 3.0 : contrastRatio >= 4.5;
}

// Remove focus from all elements and set focus on specific element
export function setFocus(element: HTMLElement) {
  // Remove focus from any currently focused element
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  // Set focus on the target element
  element.focus();
}

// Check if element is visible to screen readers
export function isVisibleToScreenReaders(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  return (
    style.position !== 'absolute' ||
    (style.position === 'absolute' && style.display !== 'none')
  ) &&
  !element.getAttribute('aria-hidden') &&
  element.getAttribute('tabindex') !== '-1';
}

// Add proper ARIA attributes to dynamic content
export function updateARIA(element: HTMLElement, attributes: Record<string, string>) {
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}

// Validate form accessibility
export function validateFormAccessibility(form: HTMLFormElement): string[] {
  const issues: string[] = [];

  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach((input, index) => {
    const element = input as HTMLElement;

    // Check for labels
    const hasLabel =
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      form.querySelector(`label[for="${element.id}"]`);

    if (!hasLabel) {
      issues.push(`Input ${index + 1} missing accessible label`);
    }

    // Check for required attributes
    if (element.hasAttribute('required') && !element.getAttribute('aria-required')) {
      issues.push(`Required input ${index + 1} missing aria-required attribute`);
    }
  });

  return issues;
}

// Enhanced skip links functionality
export function createSkipLinks() {
  const skipLinks = [
    { href: '#main-content', text: 'Skip to main content' },
    { href: '#navigation', text: 'Skip to navigation' },
    { href: '#footer', text: 'Skip to footer' }
  ];

  return skipLinks;
}

// Manage ARIA live regions for dynamic content
export class ARIALiveRegion {
  private element: HTMLElement;

  constructor(priority: 'polite' | 'assertive' = 'polite') {
    this.element = document.createElement('div');
    this.element.setAttribute('aria-live', priority);
    this.element.setAttribute('aria-atomic', 'true');
    this.element.className = 'sr-only';
    document.body.appendChild(this.element);
  }

  announce(message: string) {
    this.element.textContent = '';
    setTimeout(() => {
      this.element.textContent = message;
    }, 100);
  }

  destroy() {
    if (document.body.contains(this.element)) {
      document.body.removeChild(this.element);
    }
  }
}

// Keyboard navigation helper
export class KeyboardNavigation {
  private static instance: KeyboardNavigation;
  private cleanup: (() => void) | null = null;

  static getInstance() {
    if (!KeyboardNavigation.instance) {
      KeyboardNavigation.instance = new KeyboardNavigation();
    }
    return KeyboardNavigation.instance;
  }

  init() {
    if (this.cleanup) return;
    this.cleanup = detectKeyboardNavigation();
  }

  destroy() {
    if (this.cleanup) {
      this.cleanup();
      this.cleanup = null;
    }
  }
}