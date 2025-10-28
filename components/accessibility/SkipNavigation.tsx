'use client';

import Link from 'next/link';
import { useEffect } from 'react';

interface SkipLink {
  href: string;
  text: string;
}

export default function SkipNavigation() {
  useEffect(() => {
    // Add keyboard navigation detection
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    };

    const handleMouseDown = () => {
      document.body.classList.remove('keyboard-navigation');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const skipLinks: SkipLink[] = [
    { href: '#main-content', text: 'Skip to main content' },
    { href: '#navigation', text: 'Skip to navigation' },
    { href: '#search', text: 'Skip to search' },
  ];

  return (
    <>
      {skipLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 transition-all duration-200 font-medium"
          onClick={(e) => {
            const target = document.querySelector(link.href);
            if (target) {
              e.preventDefault();
              (target as HTMLElement).focus();
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
        >
          {link.text}
        </Link>
      ))}
    </>
  );
}