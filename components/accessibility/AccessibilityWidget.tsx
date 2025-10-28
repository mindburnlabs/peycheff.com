'use client';

import { useState, useEffect } from 'react';
import { Settings, Eye, Keyboard, Type, Moon, Sun, Contrast, X } from 'lucide-react';

interface AccessibilitySettings {
  fontSize: 'normal' | 'large' | 'extra-large';
  highContrast: boolean;
  reducedMotion: boolean;
  darkMode: boolean;
  underlineLinks: boolean;
  focusVisible: boolean;
}

export default function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 'normal',
    highContrast: false,
    reducedMotion: false,
    darkMode: true,
    underlineLinks: false,
    focusVisible: true
  });

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;

    // Font size
    root.classList.remove('text-size-normal', 'text-size-large', 'text-size-extra-large');
    root.classList.add(`text-size-${settings.fontSize}`);

    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.style.setProperty('--prefers-reduced-motion', 'reduce');
    } else {
      root.style.removeProperty('--prefers-reduced-motion');
    }

    // Dark mode
    if (settings.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Underline links
    if (settings.underlineLinks) {
      root.classList.add('underline-links');
    } else {
      root.classList.remove('underline-links');
    }

    // Focus visible
    if (settings.focusVisible) {
      root.classList.add('focus-visible-enabled');
    } else {
      root.classList.remove('focus-visible-enabled');
    }
  }, [settings]);

  // Detect user preferences on mount
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    setSettings(prev => ({
      ...prev,
      reducedMotion: prefersReducedMotion,
      darkMode: prefersDark
    }));
  }, []);

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));

    // Announce change to screen readers
    const announcement = getAnnouncementText(key, value);
    if (announcement) {
      announceToScreenReader(announcement);
    }
  };

  const getAnnouncementText = (key: keyof AccessibilitySettings, value: any): string => {
    switch (key) {
      case 'fontSize':
        return `Font size changed to ${value.replace('-', ' ')}`;
      case 'highContrast':
        return value ? 'High contrast mode enabled' : 'High contrast mode disabled';
      case 'reducedMotion':
        return value ? 'Reduced motion enabled' : 'Reduced motion disabled';
      case 'darkMode':
        return value ? 'Dark mode enabled' : 'Light mode enabled';
      case 'underlineLinks':
        return value ? 'Links are now underlined' : 'Link underlines disabled';
      case 'focusVisible':
        return value ? 'Focus indicators enhanced' : 'Focus indicators normal';
      default:
        return '';
    }
  };

  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  const resetSettings = () => {
    setSettings({
      fontSize: 'normal',
      highContrast: false,
      reducedMotion: false,
      darkMode: true,
      underlineLinks: false,
      focusVisible: true
    });

    announceToScreenReader('Accessibility settings reset to default');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass-button-cta p-3 rounded-full shadow-lg hover:scale-110 transition-transform duration-200 min-w-[48px] min-h-[48px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950"
        aria-label="Accessibility settings"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Settings className="h-6 w-6 text-white" aria-hidden="true" />
      </button>

      {/* Settings Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 glass-card rounded-2xl p-6 shadow-2xl animate-slide-in-glass" role="dialog" aria-modal="true" aria-labelledby="accessibility-title">
          <div className="flex items-center justify-between mb-6">
            <h2 id="accessibility-title" className="text-lg font-semibold text-white">
              Accessibility Settings
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[32px] min-h-[32px]"
              aria-label="Close accessibility settings"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Font Size */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white flex items-center">
                <Type className="h-4 w-4 mr-2" aria-hidden="true" />
                Text Size
              </label>
              <div className="flex gap-2">
                {(['normal', 'large', 'extra-large'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => updateSetting('fontSize', size)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      settings.fontSize === size
                        ? 'bg-blue-600 text-white'
                        : 'glass-card text-gray-300 hover:text-white'
                    }`}
                    aria-pressed={settings.fontSize === size}
                  >
                    {size === 'normal' ? 'A' : size === 'large' ? 'Aa' : 'Aaa'}
                  </button>
                ))}
              </div>
            </div>

            {/* High Contrast */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-white flex items-center">
                <Contrast className="h-4 w-4 mr-2" aria-hidden="true" />
                High Contrast
              </label>
              <button
                onClick={() => updateSetting('highContrast', !settings.highContrast)}
                className={`w-12 h-6 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[48px] min-h-[24px] ${
                  settings.highContrast ? 'bg-blue-600' : 'bg-gray-600'
                }`}
                role="switch"
                aria-checked={settings.highContrast}
              >
                <span
                  className={`inline-block w-5 h-5 bg-white rounded-full transition-all duration-200 ${
                    settings.highContrast ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                  aria-hidden="true"
                />
              </button>
            </div>

            {/* Reduced Motion */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-white flex items-center">
                <Eye className="h-4 w-4 mr-2" aria-hidden="true" />
                Reduce Motion
              </label>
              <button
                onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
                className={`w-12 h-6 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[48px] min-h-[24px] ${
                  settings.reducedMotion ? 'bg-blue-600' : 'bg-gray-600'
                }`}
                role="switch"
                aria-checked={settings.reducedMotion}
              >
                <span
                  className={`inline-block w-5 h-5 bg-white rounded-full transition-all duration-200 ${
                    settings.reducedMotion ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                  aria-hidden="true"
                />
              </button>
            </div>

            {/* Dark Mode */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-white flex items-center">
                {settings.darkMode ? (
                  <Moon className="h-4 w-4 mr-2" aria-hidden="true" />
                ) : (
                  <Sun className="h-4 w-4 mr-2" aria-hidden="true" />
                )}
                Dark Mode
              </label>
              <button
                onClick={() => updateSetting('darkMode', !settings.darkMode)}
                className={`w-12 h-6 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[48px] min-h-[24px] ${
                  settings.darkMode ? 'bg-blue-600' : 'bg-gray-600'
                }`}
                role="switch"
                aria-checked={settings.darkMode}
              >
                <span
                  className={`inline-block w-5 h-5 bg-white rounded-full transition-all duration-200 ${
                    settings.darkMode ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                  aria-hidden="true"
                />
              </button>
            </div>

            {/* Underline Links */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-white flex items-center">
                <Keyboard className="h-4 w-4 mr-2" aria-hidden="true" />
                Underline Links
              </label>
              <button
                onClick={() => updateSetting('underlineLinks', !settings.underlineLinks)}
                className={`w-12 h-6 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[48px] min-h-[24px] ${
                  settings.underlineLinks ? 'bg-blue-600' : 'bg-gray-600'
                }`}
                role="switch"
                aria-checked={settings.underlineLinks}
              >
                <span
                  className={`inline-block w-5 h-5 bg-white rounded-full transition-all duration-200 ${
                    settings.underlineLinks ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                  aria-hidden="true"
                />
              </button>
            </div>

            {/* Focus Visible */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-white flex items-center">
                <Eye className="h-4 w-4 mr-2" aria-hidden="true" />
                Focus Indicators
              </label>
              <button
                onClick={() => updateSetting('focusVisible', !settings.focusVisible)}
                className={`w-12 h-6 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[48px] min-h-[24px] ${
                  settings.focusVisible ? 'bg-blue-600' : 'bg-gray-600'
                }`}
                role="switch"
                aria-checked={settings.focusVisible}
              >
                <span
                  className={`inline-block w-5 h-5 bg-white rounded-full transition-all duration-200 ${
                    settings.focusVisible ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                  aria-hidden="true"
                />
              </button>
            </div>

            {/* Reset Button */}
            <div className="pt-4 border-t border-gray-700">
              <button
                onClick={resetSettings}
                className="w-full py-2 px-4 text-sm font-medium text-gray-300 hover:text-white transition-colors rounded-lg border border-gray-600 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[40px]"
              >
                Reset to Default
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}