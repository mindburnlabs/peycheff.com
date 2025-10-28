'use client'

import { useEffect, useState } from 'react'

/**
 * Accessibility hook for detecting keyboard navigation and managing focus
 */
export function useAccessibility() {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Detect keyboard navigation
      if (e.key === 'Tab') {
        setIsKeyboardUser(true)
        document.body.classList.add('keyboard-navigation')
      }

      // Handle Escape key for modals/dropdowns
      if (e.key === 'Escape') {
        const activeElement = document.activeElement
        if (activeElement instanceof HTMLElement) {
          // Trigger custom escape event for components to listen to
          activeElement.dispatchEvent(new CustomEvent('escape'))
        }
      }
    }

    const handleMouseDown = () => {
      setIsKeyboardUser(false)
      document.body.classList.remove('keyboard-navigation')
    }

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
      document.body.classList.remove('keyboard-navigation')
    }
  }, [])

  return {
    isKeyboardUser,
    announceToScreenReader: (message: string) => {
      const announcement = document.createElement('div')
      announcement.setAttribute('role', 'status')
      announcement.setAttribute('aria-live', 'polite')
      announcement.className = 'sr-only'
      announcement.textContent = message

      document.body.appendChild(announcement)

      // Remove after announcement
      setTimeout(() => {
        document.body.removeChild(announcement)
      }, 1000)
    }
  }
}

/**
 * Hook for managing focus trap within a container
 */
export function useFocusTrap(isActive: boolean) {
  useEffect(() => {
    if (!isActive) return

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )

      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus()
          e.preventDefault()
        }
      }
    }

    document.addEventListener('keydown', handleTabKey)

    // Focus first element
    const firstElement = document.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement
    firstElement?.focus()

    return () => {
      document.removeEventListener('keydown', handleTabKey)
    }
  }, [isActive])
}

/**
 * Hook for managing reduced motion preferences
 */
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

/**
 * Hook for managing high contrast mode
 */
export function useHighContrast() {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)')
    setPrefersHighContrast(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersHighContrast(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersHighContrast
}

/**
 * Utility function for generating unique IDs
 */
export function generateId(prefix: string = 'accessible'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Utility function for validating color contrast
 */
export function validateColorContrast(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA'
): { passes: boolean; ratio: number } {
  // This is a simplified contrast calculation
  // In production, use a library like 'color-contrast-checker'

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 }
  }

  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  const fg = hexToRgb(foreground)
  const bg = hexToRgb(background)

  const fgLuminance = getLuminance(fg.r, fg.g, fg.b)
  const bgLuminance = getLuminance(bg.r, bg.g, bg.b)

  const ratio = (Math.max(fgLuminance, bgLuminance) + 0.05) /
                (Math.min(fgLuminance, bgLuminance) + 0.05)

  const threshold = level === 'AAA' ? 7 : 4.5

  return {
    passes: ratio >= threshold,
    ratio: Math.round(ratio * 100) / 100
  }
}