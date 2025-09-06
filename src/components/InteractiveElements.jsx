import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Floating Action Button with Apple-style interactions
export const FloatingActionButton = ({ children, onClick, className = '', ...props }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      className={`fixed bottom-8 right-8 w-16 h-16 bg-accent rounded-full flex items-center justify-center text-white shadow-apple-lg z-50 ${className}`}
      whileHover={{ 
        scale: 1.05, 
        y: -2,
        boxShadow: "0 12px 32px rgba(10, 132, 255, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)"
      }}
      whileTap={{ scale: 0.95, y: 0 }}
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25
      }}
      {...props}
    >
      <motion.div
        animate={{ rotate: isHovered ? 90 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </motion.button>
  );
};

// Apple-style tooltip
export const Tooltip = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: 'bottom-full mb-2 left-1/2 transform -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 transform -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 transform -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 transform -translate-y-1/2'
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={`absolute ${positions[position]} px-3 py-2 bg-surface/90 backdrop-blur-sm border border-border/50 rounded-lg text-sm text-foreground whitespace-nowrap z-50 pointer-events-none`}
            initial={{ opacity: 0, scale: 0.8, y: position === 'top' ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: position === 'top' ? 10 : -10 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
              duration: 0.15
            }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Apple-style context menu
export const ContextMenu = ({ trigger, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleContextMenu = (e) => {
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
    setIsOpen(true);
  };

  const handleClickOutside = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <>
      <div onContextMenu={handleContextMenu}>
        {trigger}
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed glass rounded-xl p-2 z-50 min-w-[200px] shadow-apple-lg"
            style={{ left: position.x, top: position.y }}
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
              duration: 0.15
            }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Apple-style menu item
export const MenuItem = ({ children, onClick, icon, shortcut }) => (
  <motion.button
    className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-left text-foreground hover:bg-accent/10 transition-colors duration-150"
    whileHover={{ backgroundColor: 'rgba(10, 132, 255, 0.1)' }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
  >
    <div className="flex items-center gap-3">
      {icon && <span className="text-muted-foreground">{icon}</span>}
      <span>{children}</span>
    </div>
    {shortcut && (
      <span className="text-muted-foreground text-sm">{shortcut}</span>
    )}
  </motion.button>
);

// Apple-style notification/toast
export const Toast = ({ message, type = 'info', onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  const typeColors = {
    info: 'bg-accent',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed top-8 right-8 ${typeColors[type]} text-white px-6 py-4 rounded-xl shadow-apple-lg z-50 max-w-sm`}
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        >
          <div className="flex items-center justify-between">
            <span>{message}</span>
            <motion.button
              className="ml-4 text-white/80 hover:text-white"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsVisible(false)}
            >
              ✕
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Apple-style loading spinner
export const LoadingSpinner = ({ size = 24, color = 'currentColor' }) => (
  <motion.div
    className="inline-block"
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
  >
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="32"
        strokeDashoffset="8"
        opacity="0.3"
      />
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="8"
        strokeDashoffset="0"
      />
    </svg>
  </motion.div>
);

// Apple-style progress bar
export const ProgressBar = ({ progress, className = '' }) => (
  <div className={`w-full bg-surface rounded-full h-2 ${className}`}>
    <motion.div
      className="bg-accent h-2 rounded-full"
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 20
      }}
    />
  </div>
);
