'use client';

import { useEffect, useRef } from 'react';
import { ARIALiveRegion } from '@/lib/accessibility';

interface ScreenReaderAnnouncerProps {
  message?: string;
  priority?: 'polite' | 'assertive';
  className?: string;
}

export default function ScreenReaderAnnouncer({
  message,
  priority = 'polite',
  className = ''
}: ScreenReaderAnnouncerProps) {
  const announcerRef = useRef<ARIALiveRegion | null>(null);

  useEffect(() => {
    announcerRef.current = new ARIALiveRegion(priority);

    return () => {
      if (announcerRef.current) {
        announcerRef.current.destroy();
      }
    };
  }, [priority]);

  useEffect(() => {
    if (message && announcerRef.current) {
      announcerRef.current.announce(message);
    }
  }, [message]);

  return (
    <div
      aria-live={priority}
      aria-atomic="true"
      className={`sr-only ${className}`}
    />
  );
}