import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard, Badge } from '../ui/LinearUI';
import { cn } from '../../utils/cn';

// Sophisticated order bump component - Linear-grade UI
export const OrderBump = ({ 
  product, 
  originalPrice, 
  bumpPrice, 
  savings,
  features = [],
  selected = false,
  onToggle,
  recommended = true
}) => {
  const [hovering, setHovering] = useState(false);
  const percentSaved = Math.round((savings / originalPrice) * 100);

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Recommended badge */}
      {recommended && (
        <motion.div
          className="absolute -top-3 left-4 z-20"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 500 }}
        >
          <Badge variant="primary" pulse>
            RECOMMENDED
          </Badge>
        </motion.div>
      )}

      <GlassCard 
        className={cn(
          'p-6 cursor-pointer transition-all duration-300',
          selected && 'ring-2 ring-blue-500 bg-blue-500/[0.05]'
        )}
        onClick={onToggle}
      >
        <div className="flex items-start gap-4">
          {/* Custom checkbox */}
          <div className="mt-1">
            <motion.div
              className={cn(
                'w-6 h-6 rounded-lg border-2 flex items-center justify-center',
                'transition-all duration-200',
                selected 
                  ? 'bg-blue-500 border-blue-500' 
                  : 'border-gray-600 hover:border-gray-400'
              )}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence>
                {selected && (
                  <motion.svg
                    className="w-4 h-4 text-white"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 90 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      stroke="currentColor"
                      fill="none"
                      d="M5 13l4 4L19 7"
                    />
                  </motion.svg>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Add {product}
                </h3>
                <p className="text-sm text-gray-400">
                  Perfect complement to your sprint plan
                </p>
              </div>
              
              {/* Pricing */}
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 line-through">
                    ${originalPrice}
                  </span>
                  <span className="text-2xl font-bold text-white">
                    ${bumpPrice}
                  </span>
                </div>
                <motion.div
                  className="text-xs text-green-400 font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Save ${savings} ({percentSaved}% OFF)
                </motion.div>
              </div>
            </div>

            {/* Features list with animations */}
            <AnimatePresence>
              {(selected || hovering) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 border-t border-white/[0.06]">
                    <div className="space-y-2">
                      {features.map((feature, index) => (
                        <motion.div
                          key={index}
                          className="flex items-center gap-2 text-sm text-gray-300"
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {feature}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Selection indicator */}
        <AnimatePresence>
          {selected && (
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-blue-500/10 rounded-2xl" />
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  );
};

// Checkout summary with bump integration
export const CheckoutSummary = ({ 
  items = [], 
  bump = null, 
  bumpSelected = false,
  className 
}) => {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const bumpAmount = bumpSelected && bump ? bump.bumpPrice : 0;
  const total = subtotal + bumpAmount;
  const savings = bumpSelected && bump ? bump.savings : 0;

  return (
    <GlassCard className={cn('p-6', className)}>
      <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
      
      {/* Line items */}
      <div className="space-y-3 mb-4">
        {items.map((item, index) => (
          <motion.div
            key={index}
            className="flex justify-between text-sm"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <span className="text-gray-300">{item.name}</span>
            <span className="text-white font-medium">${item.price}</span>
          </motion.div>
        ))}
        
        <AnimatePresence>
          {bumpSelected && bump && (
            <motion.div
              className="flex justify-between text-sm"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <span className="text-gray-300">
                {bump.product}
                <Badge variant="success" className="ml-2">ADDED</Badge>
              </span>
              <span className="text-white font-medium">${bump.bumpPrice}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Divider */}
      <div className="h-px bg-white/[0.08] mb-4" />
      
      {/* Subtotal */}
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-400">Subtotal</span>
        <span className="text-gray-300">${subtotal}</span>
      </div>
      
      {/* Savings */}
      <AnimatePresence>
        {savings > 0 && (
          <motion.div
            className="flex justify-between text-sm mb-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <span className="text-green-400">Total Savings</span>
            <span className="text-green-400 font-medium">-${savings}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Total */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/[0.08]">
        <span className="text-lg text-white font-medium">Total</span>
        <motion.span
          className="text-2xl font-bold text-white"
          key={total}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500 }}
        >
          ${total}
        </motion.span>
      </div>
      
      {/* Security badges */}
      <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-white/[0.08]">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Secure checkout
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
          </svg>
          Powered by Stripe
        </div>
      </div>
    </GlassCard>
  );
};

export default { OrderBump, CheckoutSummary };
