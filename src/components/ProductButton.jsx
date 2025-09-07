import React, { useState, useEffect } from 'react';
import { trackEvent, EVENTS, trackProductView, trackConversionStep } from '../lib/analytics';
import { STRIPE_PRODUCTS, createCheckoutSession, formatPrice, redirectToPaymentLink } from '../lib/stripe';
import Icon from './AppIcon';

const ProductButton = ({ 
  productKey, 
  variant = 'primary',
  size = 'medium',
  children,
  className = '',
  disabled = false,
  usePaymentLink = true, // Default to 1-click Payment Links
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const product = STRIPE_PRODUCTS[productKey];

  // Track product view on component mount
  useEffect(() => {
    if (product) {
      trackProductView({
        id: productKey,
        name: product.name,
        price: product.price,
        type: product.type
      });
    }
  }, [productKey, product]);

  if (!product) {
    console.error(`Product not found: ${productKey}`);
    return (
      <button disabled className="px-4 py-2 bg-red-100 text-red-600 rounded text-sm">
        Product Error
      </button>
    );
  }

  const handleClick = async () => {
    if (isLoading || disabled) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Track product CTA click
      trackEvent(EVENTS.PRODUCT_CTA_CLICK, {
        product_key: productKey,
        product_name: product.name,
        product_price: product.price,
        product_type: product.type,
        button_variant: variant,
        page_url: window.location.href
      });

      // Track conversion funnel step
      trackConversionStep('cta_click', {
        product_key: productKey,
        funnel: 'product_purchase'
      });

      if (usePaymentLink && product.paymentLink) {
        // Use 1-click Payment Link (autopilot UX)
        trackEvent(EVENTS.STRIPE_PAYMENT_LINK_CLICK, {
          product_key: productKey,
          payment_method: 'payment_link'
        });
        
        const result = redirectToPaymentLink(productKey);
        
        if (!result.success) {
          throw new Error(result.error || 'Payment link not available');
        }
      } else {
        // Fallback to traditional checkout
        trackEvent(EVENTS.STRIPE_CHECKOUT_START, {
          product_key: productKey,
          payment_method: 'checkout_session'
        });
        
        const result = await createCheckoutSession(productKey);
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to start checkout');
        }
      }
      
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message);
      
      // Track error with enhanced data
      trackEvent(EVENTS.ERROR_OCCURRED, {
        error_type: 'checkout_error',
        product_key: productKey,
        error_message: err.message,
        payment_method: usePaymentLink ? 'payment_link' : 'checkout_session',
        user_agent: navigator.userAgent,
        page_url: window.location.href
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Button styling variants
  const variants = {
    primary: 'bg-accent text-white hover:bg-accent/90 focus:ring-accent',
    secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus:ring-neutral-300',
    outline: 'border border-accent text-accent hover:bg-accent hover:text-white focus:ring-accent',
    ghost: 'text-accent hover:bg-accent/10 focus:ring-accent'
  };

  const sizes = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg'
  };

  const baseClasses = 'font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-offset-2 focus:outline-none';
  const variantClasses = variants[variant] || variants.primary;
  const sizeClasses = sizes[size] || sizes.medium;
  
  const isButtonDisabled = isLoading || disabled || !product.priceId;

  const buttonContent = children || (
    <>
      {isLoading ? (
        <Icon name="Loader2" size={16} className="animate-spin" />
      ) : (
        <Icon name="CreditCard" size={16} />
      )}
      {isLoading ? 'Loading...' : `Buy ${formatPrice(product.price)}`}
    </>
  );

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={isButtonDisabled}
        className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
        {...props}
      >
        {buttonContent}
      </button>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm flex items-center gap-2">
            <Icon name="AlertCircle" size={14} />
            {error}
          </p>
        </div>
      )}
      
      {!product.priceId && (
        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
          ⚠️ Price not configured
        </div>
      )}
    </div>
  );
};

export default ProductButton;

// ProductCard component for displaying product details
export const ProductCard = ({ productKey, featured = false, className = '' }) => {
  const product = STRIPE_PRODUCTS[productKey];

  if (!product) {
    console.error(`Product not found: ${productKey}`);
    return (
      <div className="p-6 border border-red-200 rounded-xl bg-red-50">
        <p className="text-red-600 text-sm">Product not found: {productKey}</p>
      </div>
    );
  }

  const showOriginalPrice = product.originalPrice && product.originalPrice > product.price;
  const isSubscription = product.type === 'subscription';

  return (
    <div className={`p-6 border rounded-xl transition-all duration-300 hover:-translate-y-1 ${
      featured 
        ? 'border-accent/20 shadow-lg ring-1 ring-accent/10' 
        : 'border-border hover:border-border/70'
    } ${className}`}>
      {featured && (
        <div className="text-xs font-medium text-accent mb-3 uppercase tracking-wide">
          ⭐ Most Popular
        </div>
      )}
      
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">
          {product.name}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {product.description}
        </p>
      </div>
      
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-bold">
            {formatPrice(product.price)}
          </div>
          {showOriginalPrice && (
            <div className="text-lg text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </div>
          )}
          {isSubscription && (
            <span className="text-base font-normal text-muted-foreground">
              {product.name.includes('Yearly') ? '/year' : '/month'}
            </span>
          )}
        </div>
        {showOriginalPrice && (
          <p className="text-sm text-green-400 font-medium mt-1">
            Save {formatPrice(product.originalPrice - product.price)}
          </p>
        )}
      </div>

      {/* Features list */}
      {product.features && product.features.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-neutral-700 mb-3">What's included:</h4>
          <ul className="space-y-2 text-sm text-neutral-600">
            {product.features.slice(0, 4).map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <Icon name="Check" size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
            {product.features.length > 4 && (
              <li className="text-xs text-neutral-500 pl-5">
                +{product.features.length - 4} more features
              </li>
            )}
          </ul>
        </div>
      )}
      
      <ProductButton 
        productKey={productKey}
        variant={featured ? 'primary' : 'outline'}
        className="w-full"
        size="medium"
      />
    </div>
  );
};

// QuickBuyButton component for inline purchase buttons
export const QuickBuyButton = ({ 
  productKey, 
  variant = 'outline',
  showPrice = true,
  className = '', 
  ...props 
}) => {
  const product = STRIPE_PRODUCTS[productKey];

  if (!product) {
    console.error(`Product not found: ${productKey}`);
    return (
      <button disabled className="px-4 py-2 bg-red-100 text-red-600 rounded text-sm">
        Product Error
      </button>
    );
  }

  const buttonText = showPrice 
    ? `${product.name} - ${formatPrice(product.price)}`
    : product.name;

  return (
    <ProductButton 
      productKey={productKey}
      variant={variant}
      className={className}
      {...props}
    >
      {buttonText}
    </ProductButton>
  );
};
