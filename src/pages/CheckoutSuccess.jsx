import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { trackEvent, EVENTS, trackConversionStep, identifyUser } from '../lib/analytics';
import { STRIPE_PRODUCTS } from '../lib/stripe';
import Icon from '../components/AppIcon';
import SEO from '../components/SEO';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const [isTracked, setIsTracked] = useState(false);
  const sessionId = searchParams.get('session_id');
  const productKey = searchParams.get('product');
  const customerEmail = searchParams.get('email'); // If passed via URL
  
  const product = productKey ? STRIPE_PRODUCTS[productKey] : null;

  useEffect(() => {
    // Comprehensive purchase success tracking
    if (sessionId && productKey && !isTracked) {
      setIsTracked(true);
      
      // Track purchase success event
      trackEvent(EVENTS.PURCHASE_SUCCESS, {
        session_id: sessionId,
        product_key: productKey,
        product_name: product?.name,
        product_price: product?.price,
        product_type: product?.type,
        conversion_source: 'checkout_session',
        timestamp: new Date().toISOString()
      });
      
      // Track conversion funnel completion
      trackConversionStep('purchase_complete', {
        product_key: productKey,
        session_id: sessionId,
        funnel: 'product_purchase',
        success: true
      });
      
      // Identify user if email available
      if (customerEmail) {
        identifyUser(customerEmail, {
          method: 'purchase',
          source: 'stripe_checkout',
          first_purchase: true // Could be enhanced with customer lookup
        });
      }
      
      // Track page performance
      setTimeout(() => {
        if (window.performance) {
          const navigation = window.performance.getEntriesByType('navigation')[0];
          if (navigation) {
            trackEvent(EVENTS.PERFORMANCE_ISSUE, {
              page: 'checkout_success',
              load_time_ms: navigation.loadEventEnd - navigation.loadEventStart,
              session_id: sessionId
            });
          }
        }
      }, 1000);
    }
  }, [sessionId, productKey, isTracked, product, customerEmail]);

  return (
    <>
      <SEO 
        title="Purchase Complete - Thank You!"
        description="Your purchase has been completed successfully."
      />
      
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="Check" size={40} className="text-green-600" />
          </div>
          
          {/* Success Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            Thank you for your purchase. You'll receive a confirmation email shortly with your receipt and next steps.
          </p>
          
          {/* Next Steps */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Icon name="Mail" size={16} className="text-blue-600" />
              What's next?
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Check your email for confirmation and details</li>
              <li>• For digital products, download links are included</li>
              <li>• For services, I'll reach out within 24 hours</li>
              <li>• Keep your receipt for your records</li>
            </ul>
          </div>
          
          {/* Actions */}
          <div className="space-y-3">
            <Link
              to="/products"
              className="w-full bg-accent text-white py-3 px-6 rounded-lg font-medium hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="ArrowLeft" size={16} />
              Browse More Products
            </Link>
            
            <Link
              to="/contact"
              className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="MessageCircle" size={16} />
              Have Questions?
            </Link>
            
            <Link
              to="/"
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              Back to Home
            </Link>
          </div>
          
          {/* Contact Info */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-xs text-gray-500">
            <p>Need help? Email <a href="mailto:ivan@peycheff.com" className="text-accent hover:underline">ivan@peycheff.com</a></p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutSuccess;
