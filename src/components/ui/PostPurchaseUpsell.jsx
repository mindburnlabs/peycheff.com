import React, { useState, useEffect } from 'react';
import { createCheckoutSession, STRIPE_PRODUCTS, formatPrice } from '../../lib/stripe';
import { trackEvent, EVENTS } from '../../lib/analytics';

const PostPurchaseUpsell = ({ purchaseData, onClose, onUpgrade }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  const founderPack = STRIPE_PRODUCTS.FOUNDER_PACK;
  const originalPurchase = STRIPE_PRODUCTS[purchaseData.productKey];

  useEffect(() => {
    // Track upsell view
    trackEvent(EVENTS.FOUNDER_PACK_VIEWED, {
      original_product: purchaseData.productKey,
      original_amount: originalPurchase?.price || 0,
      upsell_amount: founderPack.price,
      customer_email: purchaseData.customerEmail
    });

    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUpgrade = async () => {
    setIsLoading(true);

    try {
      // Track upgrade attempt
      trackEvent(EVENTS.FOUNDER_PACK_UPGRADE_CLICKED, {
        original_product: purchaseData.productKey,
        time_remaining: timeLeft
      });

      const result = await createCheckoutSession(
        'FOUNDER_PACK',
        purchaseData.customerEmail
      );

      if (result.success) {
        onUpgrade();
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('Upgrade error:', error);
      trackEvent('founder_pack_upgrade_error', {
        error: error.message,
        original_product: purchaseData.productKey
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = () => {
    trackEvent(EVENTS.FOUNDER_PACK_DECLINED, {
      original_product: purchaseData.productKey,
      time_remaining: timeLeft
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#0A0A0A] border border-[#38383A] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header with countdown */}
        <div className="sticky top-0 bg-gradient-to-r from-[#0A84FF] to-[#007AFF] p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-[24px] font-semibold text-white">
                🚀 Upgrade to Founder Pack
              </h2>
              <p className="text-white/80 text-[14px]">
                Limited time offer expires in {formatTime(timeLeft)}
              </p>
            </div>
            <button
              onClick={handleDecline}
              className="text-white/60 hover:text-white text-[24px] leading-none"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Success Message */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-[12px]">✓</span>
              </div>
              <div>
                <h3 className="text-[16px] font-medium text-[#F2F3F5]">
                  Your {originalPurchase?.name} is confirmed!
                </h3>
                <p className="text-[14px] text-[#A5ABB3]">
                  You'll receive your personalized plan within 24 hours.
                </p>
              </div>
            </div>
          </div>

          {/* Upgrade Offer */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-[20px] font-semibold text-[#F2F3F5] mb-2">
                Want Everything? Upgrade Now and Save {formatPrice(founderPack.savings)}
              </h3>
              <p className="text-[14px] text-[#A5ABB3]">
                Get the complete founder toolkit at a massive discount
              </p>
            </div>

            {/* Value Comparison */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-[#1C1C1E] p-4 rounded-lg">
                <h4 className="text-[16px] font-medium text-[#F2F3F5] mb-3">
                  What You Already Have
                </h4>
                <div className="space-y-2 text-[14px] text-[#A5ABB3]">
                  <div className="flex justify-between">
                    <span>{originalPurchase?.name}</span>
                    <span>{formatPrice(originalPurchase?.price || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#0A84FF]/10 to-[#007AFF]/10 border border-[#0A84FF]/20 p-4 rounded-lg">
                <h4 className="text-[16px] font-medium text-[#F2F3F5] mb-3">
                  Founder Pack Includes
                </h4>
                <div className="space-y-2 text-[14px] text-[#A5ABB3]">
                  {founderPack.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-[#0A84FF] mt-1">✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-[#1C1C1E] p-6 rounded-lg text-center">
              <div className="space-y-3">
                <div>
                  <div className="text-[14px] text-[#A5ABB3] line-through">
                    Regular Price: {formatPrice(founderPack.originalValue)}
                  </div>
                  <div className="text-[28px] font-bold text-[#F2F3F5]">
                    Today Only: {formatPrice(founderPack.price)}
                  </div>
                  <div className="text-[16px] text-[#10B981] font-medium">
                    Save {formatPrice(founderPack.savings)} ({Math.round((founderPack.savings / founderPack.originalValue) * 100)}% off)
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleUpgrade}
                disabled={isLoading}
                className="flex-1 apple-button disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Upgrading...
                  </div>
                ) : (
                  `Yes, Upgrade for ${formatPrice(founderPack.price)}`
                )}
              </button>
              
              <button
                onClick={handleDecline}
                className="flex-1 px-6 py-3 bg-[#1C1C1E] border border-[#38383A] text-[#A5ABB3] hover:text-[#F2F3F5] hover:border-[#0A84FF] rounded-lg apple-motion"
              >
                No thanks, I'm good
              </button>
            </div>

            {/* Trust Signals */}
            <div className="text-center">
              <p className="text-[12px] text-[#666668]">
                🔒 Secure checkout • 30-day money-back guarantee • Used by 200+ founders
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPurchaseUpsell;
