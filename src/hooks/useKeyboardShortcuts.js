import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackEvent, EVENTS } from '../lib/analytics';

const useKeyboardShortcuts = (onShowCommandPalette) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyPress = (event) => {
      // Ignore if user is typing in an input field
      if (event.target.matches('input, textarea, [contenteditable]')) {
        return;
      }

      // Ignore if modifier keys are pressed (except for specific combos)
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      const key = event.key.toLowerCase();
      let destination = null;
      let label = null;

      switch (key) {
        case 'h':
          destination = '/';
          label = 'Home';
          break;
        case 'a':
          destination = '/about';
          label = 'About';
          break;
        case 'w':
          destination = '/work';
          label = 'Work';
          break;
        case 'n':
          destination = '/notes';
          label = 'Notes';
          break;
        case 'p':
          destination = '/products';
          label = 'Products';
          break;
        case 's':
          destination = '/advisory';
          label = 'Advisory';
          break;
        case 'c':
          destination = '/contact';
          label = 'Contact';
          break;
        case '/':
          // Focus search or command palette (future feature)
          event.preventDefault();
          showCommandPalette();
          return;
        case '?':
          // Show keyboard shortcuts help
          event.preventDefault();
          showShortcutsHelp();
          return;
        default:
          return;
      }

      if (destination) {
        event.preventDefault();
        
        // Track keyboard shortcut usage
        trackEvent('keyboard_shortcut_used', {
          key: key.toUpperCase(),
          destination,
          label
        });

        // Navigate with a subtle visual feedback
        showNavigationFeedback(label);
        navigate(destination);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);

  const showNavigationFeedback = (label) => {
    // Create a subtle toast-like feedback
    const feedback = document.createElement('div');
    feedback.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-foreground text-background px-4 py-2 rounded-lg text-sm font-medium shadow-lg z-[100] opacity-0 transition-all duration-200';
    feedback.textContent = `→ ${label}`;
    
    document.body.appendChild(feedback);
    
    // Animate in
    requestAnimationFrame(() => {
      feedback.style.opacity = '1';
      feedback.style.transform = 'translateX(-50%) translateY(8px)';
    });
    
    // Remove after animation
    setTimeout(() => {
      feedback.style.opacity = '0';
      feedback.style.transform = 'translateX(-50%) translateY(-8px)';
      setTimeout(() => {
        document.body.removeChild(feedback);
      }, 200);
    }, 1200);
  };

  const showCommandPalette = () => {
    trackEvent('command_palette_triggered', {
      trigger: 'keyboard_shortcut'
    });
    
    // Show the command palette if callback provided
    if (onShowCommandPalette) {
      onShowCommandPalette();
    } else {
      // Fallback toast for components that don't have command palette integration
      const toast = document.createElement('div');
      toast.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-foreground text-background px-6 py-4 rounded-xl text-center shadow-2xl z-[100]';
      toast.innerHTML = `
        <div class="font-semibold mb-2">Command Palette</div>
        <div class="text-sm opacity-80">Available in supported pages...</div>
      `;
      
      document.body.appendChild(toast);
      
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 2000);
    }
  };

  const showShortcutsHelp = () => {
    trackEvent('shortcuts_help_opened', {
      trigger: 'keyboard_shortcut'
    });

    // Create keyboard shortcuts overlay
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[100] opacity-0 transition-opacity duration-200';
    
    const shortcuts = [
      { key: 'H', action: 'Go to Home' },
      { key: 'A', action: 'Go to About' },
      { key: 'W', action: 'Go to Work' },
      { key: 'N', action: 'Go to Notes' },
      { key: 'P', action: 'Go to Products' },
      { key: 'S', action: 'Go to Advisory' },
      { key: 'C', action: 'Go to Contact' },
      { key: '/', action: 'Open Command Palette' },
      { key: '?', action: 'Show this help' }
    ];

    overlay.innerHTML = `
      <div class="bg-surface border border-border rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold">Keyboard Shortcuts</h2>
          <button class="close-shortcuts p-2 hover:bg-surface/50 rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        <div class="space-y-3">
          ${shortcuts.map(shortcut => `
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">${shortcut.action}</span>
              <kbd class="px-2 py-1 bg-muted text-muted-foreground text-sm font-mono rounded border">${shortcut.key}</kbd>
            </div>
          `).join('')}
        </div>
        <div class="mt-6 text-center">
          <p class="text-sm text-muted-foreground">Press any key to continue</p>
        </div>
      </div>
    `;
    
    const closeShortcuts = () => {
      overlay.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(overlay);
      }, 200);
      document.removeEventListener('keydown', handleCloseShortcuts);
      document.removeEventListener('click', handleClickOutside);
    };

    const handleCloseShortcuts = (e) => {
      e.preventDefault();
      closeShortcuts();
    };

    const handleClickOutside = (e) => {
      if (e.target === overlay) {
        closeShortcuts();
      }
    };

    document.body.appendChild(overlay);
    
    // Animate in
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
    });
    
    // Event listeners
    overlay.querySelector('.close-shortcuts').addEventListener('click', closeShortcuts);
    document.addEventListener('keydown', handleCloseShortcuts);
    document.addEventListener('click', handleClickOutside);
  };
};

export default useKeyboardShortcuts;
