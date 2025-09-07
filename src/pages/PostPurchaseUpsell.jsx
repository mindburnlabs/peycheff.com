import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { GlassCard, PremiumButton, Badge } from '../components/ui/LinearUI';
import { createCheckoutSession } from '../lib/stripe';
import { trackEvent, EVENTS } from '../lib/analytics';
import confetti from 'canvas-confetti';

const PostPurchaseUpsell = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minute timer
  const [declining, setDeclining] = useState(false);
  
  const purchasedProduct = searchParams.get('product');
  const sessionId = searchParams.get('session_id');
  const customerEmail = searchParams.get('email');

  useEffect(() => {
    // Fire confetti on load
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Track upsell view
    trackEvent(EVENTS.UPSELL_VIEWED, {
      purchased_product: purchasedProduct,
      session_id: sessionId
    });

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAcceptUpsell = async () => {
    setLoading(true);
    trackEvent(EVENTS.UPSELL_ACCEPTED, {
      purchased_product: purchasedProduct,
      upsell: 'FOUNDER_PACK'
    });

    try {
      await createCheckoutSession('FOUNDER_PACK', {
        customer_email: customerEmail,
        metadata: {
          upsell_from: purchasedProduct,
          session_id: sessionId
        }
      });
    } catch (error) {
      console.error('Upsell checkout failed:', error);
      setLoading(false);
    }
  };

  const handleDecline = () => {
    setDeclining(true);
    trackEvent(EVENTS.UPSELL_DECLINED, {
      purchased_product: purchasedProduct,
      upsell: 'FOUNDER_PACK'
    });
    
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const savings = 149 - 39; // Founder Pack price minus what they paid

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full"
      >
        {/* Success Message */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full mb-4">
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-400 font-medium">Purchase Successful!</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Congratulations! Your Sprint Plan is Ready
          </h1>
          <p className="text-gray-400">
            Check your email for download links. But wait...
          </p>
        </motion.div>

        {/* Upsell Card */}
        <GlassCard className="p-8 relative overflow-hidden">
          {/* Timer Badge */}
          <motion.div
            className="absolute top-6 right-6"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Badge variant="danger" pulse>
              {formatTime(timeLeft)} left
            </Badge>
          </motion.div>

          {/* Exclusive Offer Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 500 }}
              className="inline-block mb-4"
            >
              <div className="px-6 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full">
                <span className="text-yellow-400 font-bold text-sm">
                  🎯 ONE-TIME EXCLUSIVE OFFER
                </span>
              </div>
            </motion.div>
            
            <h2 className="text-3xl font-bold text-white mb-4">
              Unlock the Complete Founder Pack
            </h2>
            <p className="text-xl text-gray-300">
              Get <span className="text-green-400 font-bold">everything you need</span> to ship your product successfully
            </p>
          </div>

          {/* What's Included */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">📦</span> What You Get
              </h3>
              <ul className="space-y-3">
                {[
                  'Auto-Audit Pro ($99 value)',
                  'Agent Kit Bundle ($79 value)',
                  'Operator Pack ($39 value)',
                  '3 Months Build Notes Pro ($87 value)',
                  'All future Utility Pass tools',
                  'Priority support & feedback',
                  'Lifetime updates to all products'
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex items-start gap-2"
                  >
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-300">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">💰</span> Exclusive Savings
              </h3>
              <div className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-white/10">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Value</span>
                    <span className="text-gray-400 line-through">$304</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">You Already Paid</span>
                    <span className="text-gray-400">-$39</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Remaining Value</span>
                    <span className="text-gray-400">$265</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-white">You Pay Now</span>
                    <div className="text-right">
                      <span className="text-3xl font-bold text-white">$110</span>
                      <div className="text-xs text-green-400 font-medium">
                        Save ${savings} (50% OFF)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Urgency Box */}
              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-400">
                  <strong>⚡ This offer expires when you leave this page</strong>
                  <br />
                  <span className="text-yellow-400/80">
                    You won't see this price again. Regular price: $149
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="mb-8 p-4 bg-white/[0.03] rounded-lg border border-white/[0.05]">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 border-2 border-background"
                  />
                ))}
              </div>
              <p className="text-sm text-gray-300">
                <span className="text-white font-medium">247 founders</span> upgraded to Founder Pack in the last 30 days
              </p>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <PremiumButton
              size="lg"
              onClick={handleAcceptUpsell}
              loading={loading}
              className="flex-1"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Yes! Upgrade to Founder Pack for $110
              </span>
            </PremiumButton>
            
            <AnimatePresence>
              {!declining ? (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={handleDecline}
                  className="px-8 py-4 text-gray-400 hover:text-white transition-colors"
                >
                  No thanks, I'll pass on this deal
                </motion.button>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-8 py-4 text-gray-500"
                >
                  Redirecting to dashboard...
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-white/[0.08]">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              30-day money back guarantee
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
              Secure checkout with Stripe
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Instant access
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default PostPurchaseUpsell;
