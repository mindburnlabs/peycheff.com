import React, { useState, useEffect } from 'react';
import { trackEvent } from '../lib/analytics';

const Toast = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToastEvent = (event) => {
      const { message, type = 'info', duration = 4000 } = event.detail;
      const id = Date.now() + Math.random();
      
      const toast = {
        id,
        message,
        type,
        duration,
        show: false // For animation
      };

      setToasts(prev => [...prev, toast]);

      // Show toast with animation delay
      setTimeout(() => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, show: true } : t));
      }, 50);

      // Auto remove after duration
      setTimeout(() => {
        hideToast(id);
      }, duration);

      // Track toast display
      trackEvent('toast_shown', {
        message: message.slice(0, 50), // Truncate for privacy
        type,
        duration
      });
    };

    window.addEventListener('show-toast', handleToastEvent);
    return () => window.removeEventListener('show-toast', handleToastEvent);
  }, []);

  const hideToast = (id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, show: false } : t));
    
    // Remove from array after animation
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  };

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white border-green-600';
      case 'error':
        return 'bg-red-500 text-white border-red-600';
      case 'warning':
        return 'bg-yellow-500 text-black border-yellow-600';
      case 'info':
      default:
        return 'bg-accent text-white border-accent';
    }
  };

  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-[250] space-y-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-sm
            transition-all duration-300 ease-out pointer-events-auto max-w-sm
            ${getToastStyles(toast.type)}
            ${toast.show 
              ? 'opacity-100 translate-x-0 scale-100' 
              : 'opacity-0 translate-x-8 scale-95'
            }
          `}
          onClick={() => hideToast(toast.id)}
        >
          <div className="flex-shrink-0">
            {getToastIcon(toast.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-tight">
              {toast.message}
            </p>
          </div>

          <button
            className="flex-shrink-0 ml-2 opacity-70 hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              hideToast(toast.id);
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

// Helper function to show toasts
export const showToast = (message, type = 'info', duration = 4000) => {
  window.dispatchEvent(new CustomEvent('show-toast', {
    detail: { message, type, duration }
  }));
};

export default Toast;
