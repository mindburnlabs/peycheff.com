import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackEvent } from '../lib/analytics';

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Available commands
  const commands = [
    // Navigation
    { id: 'home', label: 'Go to Home', action: () => navigate('/'), category: 'Navigation', icon: '🏠' },
    { id: 'about', label: 'Go to About', action: () => navigate('/about'), category: 'Navigation', icon: '👨‍💻' },
    { id: 'work', label: 'Go to Work', action: () => navigate('/work'), category: 'Navigation', icon: '💼' },
    { id: 'notes', label: 'Go to Notes', action: () => navigate('/notes'), category: 'Navigation', icon: '📝' },
    { id: 'products', label: 'Go to Products', action: () => navigate('/products'), category: 'Navigation', icon: '🛍️' },
    { id: 'services', label: 'Go to Services', action: () => navigate('/services'), category: 'Navigation', icon: '🎯' },
    { id: 'contact', label: 'Go to Contact', action: () => navigate('/contact'), category: 'Navigation', icon: '📧' },
    
    // Actions
    { id: 'newsletter', label: 'Subscribe to Newsletter', action: () => {
      const email = prompt('Enter your email:');
      if (email) {
        // Trigger newsletter subscription
        window.dispatchEvent(new CustomEvent('newsletter-subscribe', { detail: { email } }));
      }
    }, category: 'Actions', icon: '📬' },
    
    // Quick Actions
    { id: 'copy-email', label: 'Copy Email Address', action: () => {
      navigator.clipboard.writeText('ivan@peycheff.com');
      // Show toast notification
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Email copied to clipboard!', type: 'success' } 
      }));
    }, category: 'Quick Actions', icon: '📋' },
    
    { id: 'copy-url', label: 'Copy Current URL', action: () => {
      navigator.clipboard.writeText(window.location.href);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'URL copied to clipboard!', type: 'success' } 
      }));
    }, category: 'Quick Actions', icon: '🔗' },

    // External Links
    { id: 'github', label: 'Open GitHub', action: () => window.open('https://github.com/ipeychev', '_blank'), category: 'External', icon: '🐙' },
    { id: 'linkedin', label: 'Open LinkedIn', action: () => window.open('https://linkedin.com/in/peycheff', '_blank'), category: 'External', icon: '💼' },
    { id: 'twitter', label: 'Open Twitter', action: () => window.open('https://twitter.com/ipeychev', '_blank'), category: 'External', icon: '🐦' },
    
    // Theme (if implemented)
    { id: 'toggle-theme', label: 'Toggle Dark Mode', action: () => {
      document.documentElement.classList.toggle('dark');
      const isDark = document.documentElement.classList.contains('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Switched to ${isDark ? 'dark' : 'light'} mode`, type: 'info' } 
      }));
    }, category: 'Settings', icon: '🌙' },
  ];

  // Filter commands based on query
  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  // Group commands by category
  const groupedCommands = filteredCommands.reduce((groups, cmd) => {
    if (!groups[cmd.category]) groups[cmd.category] = [];
    groups[cmd.category].push(cmd);
    return groups;
  }, {});

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev === 0 ? filteredCommands.length - 1 : prev - 1);
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            executeCommand(filteredCommands[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const executeCommand = (command) => {
    // Track command usage
    trackEvent('command_palette_action', {
      command_id: command.id,
      command_label: command.label,
      category: command.category
    });

    command.action();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-xl"
        onClick={onClose}
      />
      
      {/* Command Palette */}
      <div className="relative w-full max-w-2xl mx-4 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center px-6 py-4 border-b border-border">
          <svg className="w-5 h-5 text-muted-foreground mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0); // Reset selection on new query
            }}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder-muted-foreground text-lg"
          />
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <kbd className="px-2 py-1 bg-muted rounded text-xs">ESC</kbd>
            <span>to close</span>
          </div>
        </div>
        
        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {Object.keys(groupedCommands).length === 0 ? (
            <div className="px-6 py-8 text-center text-muted-foreground">
              <div className="text-4xl mb-2">🔍</div>
              <div className="text-sm">No commands found</div>
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, categoryCommands]) => (
              <div key={category} className="py-2">
                <div className="px-6 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {category}
                </div>
                {categoryCommands.map((command, cmdIndex) => {
                  const globalIndex = filteredCommands.indexOf(command);
                  return (
                    <div
                      key={command.id}
                      className={`px-6 py-3 cursor-pointer transition-colors flex items-center gap-3 ${
                        selectedIndex === globalIndex 
                          ? 'bg-accent/10 text-accent' 
                          : 'text-foreground hover:bg-muted/50'
                      }`}
                      onClick={() => executeCommand(command)}
                    >
                      <span className="text-xl">{command.icon}</span>
                      <span className="flex-1">{command.label}</span>
                      {selectedIndex === globalIndex && (
                        <kbd className="px-2 py-1 bg-muted rounded text-xs">ENTER</kbd>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background rounded">↑↓</kbd>
                <span>navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background rounded">ENTER</kbd>
                <span>select</span>
              </span>
            </div>
            <div className="text-[10px] opacity-60">
              {filteredCommands.length} result{filteredCommands.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
