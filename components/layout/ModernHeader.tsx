'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, Zap } from 'lucide-react'

export default function ModernHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigation = [
    { name: 'Home', href: '/', description: 'Navigate to the homepage' },
    { name: 'Shop', href: '/shop', description: 'Browse products and services' },
    { name: 'Playbooks', href: '/playbooks', description: 'View business playbooks and guides' },
    { name: 'Ship Log', href: '/ship-log', description: 'View recent work and projects' },
    { name: 'About', href: '/about', description: 'Learn about Ivan Peychev' },
    { name: 'Contact', href: '/contact', description: 'Get in touch with us' },
  ]

  useEffect(() => {
    // Close mobile menu when pressing Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
        // Return focus to menu button
        const menuButton = document.getElementById('mobile-menu-button');
        if (menuButton) {
          menuButton.focus();
        }
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <header className="fixed top-0 w-full glass-nav border-b border-gray-800/50 z-50" role="banner">
      <div className="mx-auto max-w-container px-6">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 rounded-lg p-2 group"
            aria-label="Ivan Peychev - Navigate to homepage"
          >
            <div className="w-10 h-10 glass-premium rounded-xl flex items-center justify-center group animate-glow-pulse" aria-hidden="true">
              <Zap className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-200" />
            </div>
            <span className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors duration-200">Ivan Peychev</span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center space-x-8"
            role="navigation"
            aria-label="Main navigation"
            id="navigation"
          >
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-300 hover:text-white transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 rounded-md px-3 py-2 relative group"
                aria-describedby={`${item.name.toLowerCase()}-desc`}
              >
                {item.name}
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  {item.description}
                </span>
              </Link>
            ))}
            <Link
              href="/shop"
              className="glass-button-cta px-6 py-3 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950"
              aria-label="Get started with our products and services"
            >
              Get Started
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            id="mobile-menu-button"
            className="md:hidden text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 rounded-lg p-2 min-w-[44px] min-h-[44px]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            aria-haspopup="true"
          >
            <span className="sr-only">{isMenuOpen ? "Close menu" : "Open menu"}</span>
            {isMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div
            className="md:hidden border-t border-gray-800/50 glass-dark py-6 animate-slide-in-glass"
            id="mobile-navigation"
            role="navigation"
            aria-label="Mobile navigation menu"
          >
            <nav className="flex flex-col space-y-4" aria-label="Mobile menu items">
              {navigation.map((item, index) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-300 hover:text-white transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 rounded-md px-4 py-3 text-lg min-h-[44px] flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                  aria-describedby={`mobile-${item.name.toLowerCase()}-desc`}
                >
                  {item.name}
                  <span className="sr-only" id={`mobile-${item.name.toLowerCase()}-desc`}>
                    {item.description}
                  </span>
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-700/50">
                <Link
                  href="/shop"
                  className="glass-button-cta px-6 py-3 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 text-center min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Get started with our products and services"
                >
                  Get Started
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}