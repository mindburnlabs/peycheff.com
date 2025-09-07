import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

// Linear-grade glassmorphic card with depth
export const GlassCard = ({ children, className, hover = true, ...props }) => {
  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-2xl',
        'bg-gradient-to-b from-white/[0.08] to-white/[0.04]',
        'backdrop-blur-xl backdrop-saturate-150',
        'border border-white/[0.08]',
        'shadow-[0_8px_32px_rgba(0,0,0,0.12)]',
        hover && 'transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(0,0,0,0.2)]',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      {...props}
    >
      {/* Glassmorphic shine effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.05] via-transparent to-transparent pointer-events-none" />
      
      {/* Light leak on hover */}
      <motion.div
        className="absolute -inset-px bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 blur-xl"
        animate={{ opacity: hover ? [0, 0.5, 0] : 0 }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

// Premium button with Linear-style interactions
export const PremiumButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  loading = false,
  icon,
  ...props 
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-[0_4px_14px_rgba(10,132,255,0.4)] hover:shadow-[0_6px_20px_rgba(10,132,255,0.5)]',
    secondary: 'bg-white/[0.08] text-white backdrop-blur-xl border border-white/[0.08] hover:bg-white/[0.12]',
    ghost: 'text-gray-400 hover:text-white hover:bg-white/[0.05]',
    danger: 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-[0_4px_14px_rgba(239,68,68,0.4)]'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl'
  };

  return (
    <motion.button
      className={cn(
        'relative inline-flex items-center justify-center',
        'font-medium rounded-xl',
        'transition-all duration-200',
        'transform-gpu perspective-1000',
        'active:scale-[0.98]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      whileHover={{ scale: 1.02, rotateX: -5 }}
      whileTap={{ scale: 0.98 }}
      disabled={loading}
      {...props}
    >
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
      />
      
      <span className="relative z-10 flex items-center gap-2">
        {loading ? (
          <motion.div
            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        ) : icon}
        {children}
      </span>
    </motion.button>
  );
};

// Apple-style floating label input
export const FloatingInput = ({ label, type = 'text', value, onChange, className, ...props }) => {
  const [focused, setFocused] = React.useState(false);
  const hasValue = value && value.length > 0;

  return (
    <div className={cn('relative', className)}>
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          'w-full px-4 py-4 pt-6',
          'bg-white/[0.05] backdrop-blur-xl',
          'border border-white/[0.08] rounded-xl',
          'text-white placeholder-transparent',
          'transition-all duration-200',
          'focus:bg-white/[0.08] focus:border-blue-500/50',
          'focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]'
        )}
        placeholder={label}
        {...props}
      />
      <motion.label
        className={cn(
          'absolute left-4 text-gray-400',
          'pointer-events-none',
          'transition-all duration-200'
        )}
        animate={{
          top: focused || hasValue ? '8px' : '20px',
          fontSize: focused || hasValue ? '12px' : '16px',
          color: focused ? '#3B82F6' : '#9CA3AF'
        }}
      >
        {label}
      </motion.label>
    </div>
  );
};

// Linear-style toggle switch
export const ToggleSwitch = ({ checked, onChange, label, className }) => {
  return (
    <label className={cn('flex items-center gap-3 cursor-pointer', className)}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <motion.div
          className={cn(
            'w-11 h-6 rounded-full',
            'transition-colors duration-200',
            checked ? 'bg-blue-500' : 'bg-gray-700'
          )}
        >
          <motion.div
            className="w-5 h-5 bg-white rounded-full shadow-lg"
            animate={{ x: checked ? 20 : 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </motion.div>
      </div>
      {label && <span className="text-sm text-gray-300">{label}</span>}
    </label>
  );
};

// Sophisticated tooltip
export const Tooltip = ({ children, content, placement = 'top' }) => {
  const [visible, setVisible] = React.useState(false);

  const placements = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        {children}
      </div>
      <AnimatePresence>
        {visible && (
          <motion.div
            className={cn(
              'absolute z-50',
              'px-3 py-2 rounded-lg',
              'bg-gray-900/95 backdrop-blur-xl',
              'border border-white/[0.08]',
              'text-sm text-white',
              'whitespace-nowrap',
              'pointer-events-none',
              placements[placement]
            )}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Progress bar with glow effect
export const ProgressBar = ({ value, max = 100, className, showLabel = true }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('relative', className)}>
      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-blue-400/30 blur-md" />
        </motion.div>
      </div>
      {showLabel && (
        <div className="mt-2 text-sm text-gray-400">
          {value} / {max} ({percentage.toFixed(0)}%)
        </div>
      )}
    </div>
  );
};

// Badge with subtle animations
export const Badge = ({ children, variant = 'default', className, pulse = false }) => {
  const variants = {
    default: 'bg-gray-800 text-gray-300',
    primary: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    success: 'bg-green-500/20 text-green-400 border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    danger: 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  return (
    <motion.span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5',
        'text-xs font-medium rounded-full',
        'border',
        variants[variant],
        className
      )}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      {pulse && (
        <motion.span
          className="absolute inset-0 rounded-full bg-current opacity-20"
          animate={{ scale: [1, 1.5], opacity: [0.2, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
      <span className="relative">{children}</span>
    </motion.span>
  );
};

// Skeleton loader with shimmer
export const Skeleton = ({ className, variant = 'text' }) => {
  const variants = {
    text: 'h-4 w-full',
    title: 'h-8 w-3/4',
    avatar: 'h-12 w-12 rounded-full',
    card: 'h-32 w-full rounded-xl',
    button: 'h-10 w-24 rounded-lg'
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        'bg-gray-800/50',
        variants[variant],
        className
      )}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
};

export default {
  GlassCard,
  PremiumButton,
  FloatingInput,
  ToggleSwitch,
  Tooltip,
  ProgressBar,
  Badge,
  Skeleton
};
