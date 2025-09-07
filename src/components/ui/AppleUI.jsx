import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useTransform, useMotionValue } from 'framer-motion';
import { cn } from '../../utils/cn';

/**
 * Apple-Grade UI Component Library
 * Implements 2026 design trends with glassmorphism, micro-interactions, and fluid animations
 */

// Custom cursor that responds to hover states
export const AppleCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const updateCursorType = () => {
      const hoveredElement = document.elementFromPoint(mousePosition.x, mousePosition.y);
      const isInteractive = hoveredElement?.matches('button, a, input, textarea, [role="button"]');
      setIsPointer(isInteractive);
    };

    const handleMouseDown = () => setIsPressed(true);
    const handleMouseUp = () => setIsPressed(false);

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', updateCursorType);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', updateCursorType);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [mousePosition.x, mousePosition.y]);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        animate={{
          x: mousePosition.x - 4,
          y: mousePosition.y - 4,
          scale: isPressed ? 0.9 : isPointer ? 1.2 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
          mass: 0.5
        }}
      >
        <div className="w-2 h-2 bg-white rounded-full" />
      </motion.div>
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998]"
        animate={{
          x: mousePosition.x - 20,
          y: mousePosition.y - 20,
          scale: isPressed ? 0.8 : isPointer ? 1.5 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 15,
          mass: 0.1
        }}
      >
        <div className="w-10 h-10 border border-white/30 rounded-full" />
      </motion.div>
    </>
  );
};

// Glassmorphic card with depth and light refraction
export const GlassCard = ({ 
  children, 
  className,
  hover = true,
  blur = 20,
  opacity = 0.08,
  border = true,
  gradient = true
}) => {
  const cardRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-5, 5]);

  const handleMouseMove = (e) => {
    if (!hover || !cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: hover ? rotateX : 0,
        rotateY: hover ? rotateY : 0,
        transformPerspective: 1000,
      }}
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "transition-all duration-300",
        className
      )}
    >
      {/* Background blur layer */}
      <div 
        className="absolute inset-0"
        style={{
          backdropFilter: `blur(${blur}px) saturate(150%)`,
          WebkitBackdropFilter: `blur(${blur}px) saturate(150%)`,
          backgroundColor: `rgba(255, 255, 255, ${opacity})`,
        }}
      />
      
      {/* Gradient overlay */}
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-white/[0.05]" />
      )}
      
      {/* Border */}
      {border && (
        <div className="absolute inset-0 rounded-2xl border border-white/[0.1]" />
      )}
      
      {/* Light leak effect on hover */}
      <motion.div
        className="absolute -inset-[100%] opacity-0"
        animate={{
          opacity: hover ? [0, 0.5, 0] : 0,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        <div className="absolute inset-0 bg-gradient-radial from-blue-500/20 via-transparent to-transparent" />
      </motion.div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

// Premium button with magnetic hover effect
export const AppleButton = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  magnetic = true,
  onClick,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left'
}) => {
  const buttonRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const springConfig = { damping: 15, stiffness: 150 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  const handleMouseMove = (e) => {
    if (!magnetic || !buttonRef.current || disabled) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const distanceX = (e.clientX - centerX) * 0.1;
    const distanceY = (e.clientY - centerY) * 0.1;
    
    x.set(distanceX);
    y.set(distanceY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const variants = {
    primary: "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl",
    secondary: "bg-white/[0.08] backdrop-blur-md text-white border border-white/[0.1] hover:bg-white/[0.12]",
    ghost: "text-white/80 hover:text-white hover:bg-white/[0.05]",
    danger: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    xl: "px-10 py-5 text-xl"
  };

  return (
    <motion.button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onClick={onClick}
      disabled={disabled || loading}
      style={{ x, y }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className={cn(
        "relative inline-flex items-center justify-center",
        "rounded-xl font-medium",
        "transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 rounded-xl opacity-0"
        animate={{
          opacity: isHovered ? [0, 1, 0] : 0,
          x: isHovered ? ["-100%", "100%"] : "-100%",
        }}
        transition={{
          duration: 0.6,
          ease: "easeInOut",
        }}
      >
        <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
      </motion.div>

      {/* Loading spinner */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <motion.span
        animate={{ opacity: loading ? 0 : 1 }}
        className="relative z-10 flex items-center gap-2"
      >
        {icon && iconPosition === 'left' && <span>{icon}</span>}
        {children}
        {icon && iconPosition === 'right' && <span>{icon}</span>}
      </motion.span>
    </motion.button>
  );
};

// Floating input with sophisticated label animation
export const AppleInput = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  icon,
  className,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!value);

  useEffect(() => {
    setHasValue(!!value);
  }, [value]);

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        {/* Background layer */}
        <div className="absolute inset-0 bg-white/[0.05] rounded-xl backdrop-blur-md" />
        
        {/* Border with gradient */}
        <div className={cn(
          "absolute inset-0 rounded-xl",
          "bg-gradient-to-r from-white/[0.1] to-white/[0.05]",
          "p-[1px]",
          isFocused && "from-blue-500/50 to-purple-500/50",
          error && "from-red-500/50 to-red-500/50"
        )}>
          <div className="w-full h-full bg-black/50 rounded-xl" />
        </div>

        {/* Input field */}
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isFocused ? placeholder : ''}
          className={cn(
            "relative w-full px-4 py-4 bg-transparent rounded-xl",
            "text-white placeholder-white/30",
            "focus:outline-none",
            "transition-all duration-200",
            icon && "pl-12"
          )}
          {...props}
        />

        {/* Floating label */}
        <AnimatePresence>
          {label && (
            <motion.label
              initial={false}
              animate={{
                top: isFocused || hasValue ? -10 : 16,
                left: icon ? 48 : 16,
                fontSize: isFocused || hasValue ? 12 : 16,
                color: isFocused ? '#3b82f6' : 'rgba(255,255,255,0.5)',
              }}
              transition={{ duration: 0.2 }}
              className="absolute pointer-events-none bg-black/80 px-2"
            >
              {label}
            </motion.label>
          )}
        </AnimatePresence>

        {/* Icon */}
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
            {icon}
          </div>
        )}
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-sm text-red-400"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Progress bar with fluid animation
export const AppleProgress = ({ 
  value = 0, 
  max = 100, 
  className,
  showLabel = false,
  color = 'blue',
  size = 'md'
}) => {
  const percentage = (value / max) * 100;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayValue(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4'
  };

  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    gradient: 'from-blue-500 via-purple-500 to-pink-500'
  };

  return (
    <div className={cn("relative", className)}>
      <div className={cn(
        "w-full bg-white/[0.08] rounded-full overflow-hidden backdrop-blur-sm",
        sizes[size]
      )}>
        <motion.div
          className={cn(
            "h-full bg-gradient-to-r",
            colors[color],
            "relative overflow-hidden"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${displayValue}%` }}
          transition={{
            duration: 0.8,
            ease: [0.32, 0.72, 0, 1]
          }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </motion.div>
      </div>
      
      {showLabel && (
        <motion.div
          className="absolute -top-8 left-0 text-sm text-white/80"
          animate={{ left: `${displayValue}%` }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
        >
          {Math.round(displayValue)}%
        </motion.div>
      )}
    </div>
  );
};

// Sophisticated toggle switch
export const AppleToggle = ({ 
  checked = false, 
  onChange,
  label,
  disabled = false,
  size = 'md'
}) => {
  const sizes = {
    sm: { switch: 'w-8 h-4', ball: 'w-3 h-3', translate: 'translate-x-4' },
    md: { switch: 'w-12 h-6', ball: 'w-5 h-5', translate: 'translate-x-6' },
    lg: { switch: 'w-16 h-8', ball: 'w-7 h-7', translate: 'translate-x-8' }
  };

  const currentSize = sizes[size];

  return (
    <label className={cn(
      "inline-flex items-center gap-3",
      disabled && "opacity-50 cursor-not-allowed"
    )}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange?.(!checked)}
        className={cn(
          "relative inline-flex items-center rounded-full",
          "transition-colors duration-200",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/50",
          currentSize.switch,
          checked ? "bg-gradient-to-r from-blue-500 to-blue-600" : "bg-white/[0.1]"
        )}
      >
        <motion.div
          className={cn(
            "absolute left-0.5 rounded-full bg-white shadow-lg",
            currentSize.ball
          )}
          animate={{
            x: checked ? currentSize.translate.replace('translate-x-', '') : '0'
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        />
      </button>
      {label && (
        <span className="text-white/80 select-none">
          {label}
        </span>
      )}
    </label>
  );
};

// Notification toast with glass effect
export const AppleToast = ({ 
  message, 
  type = 'info',
  duration = 4000,
  onClose
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const types = {
    info: { icon: 'ℹ️', color: 'from-blue-500/20 to-blue-600/20' },
    success: { icon: '✅', color: 'from-green-500/20 to-green-600/20' },
    warning: { icon: '⚠️', color: 'from-yellow-500/20 to-yellow-600/20' },
    error: { icon: '❌', color: 'from-red-500/20 to-red-600/20' }
  };

  const config = types[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="fixed bottom-8 right-8 z-50"
    >
      <GlassCard className="px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{config.icon}</span>
          <p className="text-white/90">{message}</p>
          <button
            onClick={onClose}
            className="ml-4 text-white/50 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        
        {/* Progress bar */}
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-white/50 to-white/30"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
        />
      </GlassCard>
    </motion.div>
  );
};

// Export all components
export default {
  AppleCursor,
  GlassCard,
  AppleButton,
  AppleInput,
  AppleProgress,
  AppleToggle,
  AppleToast
};
