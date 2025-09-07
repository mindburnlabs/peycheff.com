import React, { useState } from 'react';
import { createCheckoutSession, STRIPE_PRODUCTS, formatPrice } from '../../lib/stripe';
import { trackEvent, EVENTS } from '../../lib/analytics';

const CheckoutButton = ({ 
  productKey, 
  customerEmail = null, 
  children = 'Buy Now',
  className = 'apple-button',
  showOrderBump = false,
  orderBumpProduct = 'AUTO_AUDIT_PRO',
  disabled = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [includeOrderBump, setIncludeOrderBump] = useState(false);
  const [error, setError] = useState(null);

  const product = STRIPE_PRODUCTS[productKey];
  const bumpProduct = STRIPE_PRODUCTS[orderBumpProduct];

  if (!product) {
    console.error(`Product ${productKey} not found`);
    return null;
  }

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Track checkout attempt with bump info
      trackEvent(EVENTS.STRIPE_CHECKOUT_START, {
        product_key: productKey,
        product_name: product.name,
        product_price: product.price,
        order_bump: includeOrderBump ? orderBumpProduct : 'none',
        customer_email: customerEmail
      });

      const result = await createCheckoutSession(
        productKey, 
        customerEmail, 
        includeOrderBump ? orderBumpProduct : null
      );
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message);
      
      trackEvent('checkout_error', {
        product_key: productKey,
        order_bump: includeOrderBump ? orderBumpProduct : 'none',
        error: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalPrice = product.price + (includeOrderBump && bumpProduct ? bumpProduct.price : 0);

  return (
    <div className="space-y-4">
      {/* Order Bump */}
      {showOrderBump && bumpProduct && (
        <div className="apple-card">
          <div className="flex items-start gap-4">
            <div className="flex items-center h-5">
              <input
                id="order-bump"
                type="checkbox"
                checked={includeOrderBump}
                onChange={(e) => setIncludeOrderBump(e.target.checked)}
                className="w-4 h-4 text-[#0A84FF] bg-[#1C1C1E] border-[#38383A] rounded focus:ring-[#0A84FF] focus:ring-2 focus:border-[#0A84FF]"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <label 
                  htmlFor="order-bump" 
                  className="text-[16px] font-medium text-[#F2F3F5] cursor-pointer"
                >
                  Add {bumpProduct.name} for {formatPrice(bumpProduct.price)}
                </label>
                <span className="text-[12px] text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded">
                  Save $30
                </span>
              </div>
              <p className="text-[14px] text-[#A5ABB3] mt-1">
                {bumpProduct.description}
              </p>
              <ul className="text-[13px] text-[#A5ABB3] mt-2 space-y-1">
                {bumpProduct.features?.slice(0, 3).map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-[#0A84FF]">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-[14px]">{error}</p>
        </div>
      )}

      {/* Checkout Button */}
      <button
        onClick={handleCheckout}
        disabled={disabled || isLoading}
        className={`${className} w-full disabled:opacity-50`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            Processing...
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            {children}
            {showOrderBump && (
              <span className="text-[14px] opacity-90">
                • {formatPrice(totalPrice)}
              </span>
            )}
          </div>
        )}
      </button>

      {/* Price Breakdown */}
      {showOrderBump && includeOrderBump && bumpProduct && (
        <div className="text-[12px] text-[#A5ABB3] text-center space-y-1">
          <div className="flex justify-between">
            <span>{product.name}</span>
            <span>{formatPrice(product.price)}</span>
          </div>
          <div className="flex justify-between">
            <span>{bumpProduct.name}</span>
            <span>{formatPrice(bumpProduct.price)}</span>
          </div>
          <div className="border-t border-[#38383A] pt-1 mt-2">
            <div className="flex justify-between font-medium text-[#F2F3F5]">
              <span>Total</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutButton;
