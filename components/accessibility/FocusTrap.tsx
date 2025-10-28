'use client';

import { useEffect, useRef } from 'react';
import { trapFocus } from '@/lib/accessibility';

interface FocusTrapProps {
  children: React.ReactNode;
  enabled?: boolean;
  className?: string;
}

export default function FocusTrap({ children, enabled = true, className = '' }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (containerRef.current) {
        cleanupRef.current = trapFocus(containerRef.current);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [enabled]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}