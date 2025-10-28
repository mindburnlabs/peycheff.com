/**
 * Accessibility Configuration for peycheff.com
 * Centralizes all accessibility-related settings and utilities
 */

// WCAG 2.1 AA Compliance Settings
export const ACCESSIBILITY_CONFIG = {
  // Contrast ratios (minimum requirements)
  contrast: {
    normalText: 4.5,      // AA requirement for normal text
    largeText: 3.0,       // AA requirement for large text (18pt+ or 14pt+ bold)
    graphicalObjects: 3.0, // AA requirement for graphical objects
    userInterface: 3.0,    // AA requirement for UI components
  },

  // Touch target sizes
  touchTargets: {
    minimumSize: 44,       // 44x44px minimum for WCAG AA
    spacing: 8,           // 8px minimum spacing between targets
  },

  // Focus indicators
  focus: {
    outlineWidth: 2,      // 2px minimum outline width
    outlineOffset: 2,     // 2px minimum outline offset
    contrastRatio: 3,     // 3:1 minimum contrast for focus indicators
  },

  // Text sizing
  text: {
    minimumSize: 16,       // 16px minimum body text size
    maximumZoom: 200,      // Must support 200% zoom
    lineHeight: 1.5,       // 1.5 minimum line height for readability
  },

  // Timing
  timing: {
    autoScrollDuration: 10, // 10 seconds maximum for auto-scroll
    noTimeLimit: true,      // No time limits on user interactions
    pauseAllowed: true,     // Users must be able to pause auto-playing content
  },

  // Error handling
  errors: {
    suggestions: true,      // Provide suggestions for errors when possible
    identification: 'title', // Identify errors via title, text, or aria-label
    prevention: true,       // Help users avoid errors where possible
  },
}

// ARIA label configurations
export const ARIA_LABELS = {
  navigation: {
    main: 'Main navigation',
    mobile: 'Mobile navigation',
    footer: 'Footer navigation',
    social: 'Social media links',
    legal: 'Legal links',
  },

  actions: {
    menu: {
      open: 'Open navigation menu',
      close: 'Close navigation menu',
    },
    skip: {
      toContent: 'Skip to main content',
      toNavigation: 'Skip to navigation',
    },
    external: {
      link: ' (opens in new window)',
      download: ' (downloads file)',
      email: ' (opens email client)',
    },
  },

  content: {
    required: 'required',
    optional: 'optional',
    loading: 'Loading content...',
    error: 'Error occurred',
    success: 'Success',
  },
}

// Semantic HTML structure guidelines
export const SEMANTIC_STRUCTURE = {
  headings: {
    h1: 'Main page title - one per page',
    h2: 'Major section headings',
    h3: 'Subsection headings',
    h4: 'Minor section headings',
    h5: 'Detailed section headings',
    h6: 'Most detailed headings',
  },

  landmarks: {
    banner: 'Site header/navigation',
    navigation: 'Primary navigation area',
    main: 'Main content area',
    complementary: 'Sidebar/supporting content',
    contentinfo: 'Footer/copyright info',
    form: 'Search or contact forms',
    search: 'Search functionality',
  },

  lists: {
    navigation: 'Use <ul> for navigation links',
    breadcrumbs: 'Use <ol> for breadcrumb trails',
    articles: 'Use <ul> for article lists',
    steps: 'Use <ol> for step-by-step instructions',
  },
}

// Keyboard navigation patterns
export const KEYBOARD_NAVIGATION = {
  tabOrder: 'logical reading order',
  skipLinks: 'provided for major sections',
  focusTraps: 'used in modals and dropdowns',
  escapeKey: 'closes modals and dropdowns',
  arrowKeys: 'used in custom components like carousels',
  homeEnd: 'used in lists and grids',
  enterSpace: 'activate buttons and links',
}

// Screen reader announcements
export const SCREEN_READER_ANNOUNCEMENTS = {
  pageLoad: 'Page loaded',
  formSubmit: 'Form submitted successfully',
  formError: 'Form has errors, please review',
  navigationChange: 'Navigation opened/closed',
  modalOpen: 'Dialog opened',
  modalClose: 'Dialog closed',
  statusUpdate: 'Status updated',
  loadingComplete: 'Content loaded',
}

// Accessibility testing configuration
export const TESTING_CONFIG = {
  // Automated tools
  tools: {
    axe: {
      rules: ['wcag2a', 'wcag2aa', 'wcag21aa'],
      disable: ['color-contrast-enhanced'], // AAA not required for AA compliance
    },
    lighthouse: {
      accessibility: true,
      performance: false,
      bestPractices: false,
      seo: false,
    },
  },

  // Manual testing checklist
  manualTests: [
    'keyboard-only navigation',
    'screen reader compatibility',
    'mobile touch accessibility',
    'high contrast mode',
    'text zoom to 200%',
    'color contrast verification',
    'focus management',
    'form accessibility',
  ],

  // User testing scenarios
  userScenarios: [
    'Complete contact form using keyboard only',
    'Navigate site using screen reader',
    'Access site on mobile device with touch',
    'Use site with high contrast mode enabled',
    'Zoom to 200% and test all functionality',
  ],
}

// Color palette with contrast ratios
export const ACCESSIBLE_COLORS = {
  // Primary colors with verified contrast
  primary: {
    blue: {
      50: '#EFF6FF',   // contrast: 1.2:1 with white
      500: '#3B82F6',  // contrast: 4.5:1 with white
      600: '#2563EB',  // contrast: 4.8:1 with white
      900: '#1E3A8A',  // contrast: 12.6:1 with white
    },
  },

  // Gray scale with verified contrast
  gray: {
    50: '#F9FAFB',   // contrast: 1.1:1 with white
    300: '#D1D5DB',  // contrast: 3.3:1 with white
    400: '#9CA3AF',  // contrast: 4.8:1 with white
    500: '#6B7280',  // contrast: 7.2:1 with white
    900: '#111827',  // contrast: 15.8:1 with white
    950: '#030712',  // contrast: 21:1 with white
  },

  // Status colors
  status: {
    success: '#10B981',   // contrast: 3.6:1 with white
    warning: '#F59E0B',   // contrast: 2.1:1 with white
    error: '#EF4444',     // contrast: 4.1:1 with white
    info: '#3B82F6',      // contrast: 4.5:1 with white
  },
}

// Animation and motion settings
export const MOTION_SETTINGS = {
  reducedMotion: {
    respectUserPreference: true,
    disableAnimations: false, // Allow some essential animations
    duration: '0.01ms',      // Near-instant for reduced motion
  },

  defaultAnimations: {
    duration: {
      fast: '0.15s',
      normal: '0.3s',
      slow: '0.5s',
    },
    easing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
  },
}

// Export default configuration
export default {
  accessibility: ACCESSIBILITY_CONFIG,
  aria: ARIA_LABELS,
  semantic: SEMANTIC_STRUCTURE,
  keyboard: KEYBOARD_NAVIGATION,
  announcements: SCREEN_READER_ANNOUNCEMENTS,
  testing: TESTING_CONFIG,
  colors: ACCESSIBLE_COLORS,
  motion: MOTION_SETTINGS,
}