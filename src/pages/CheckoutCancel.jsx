import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { trackEvent } from '../lib/analytics';
import Icon from '../components/AppIcon';
import SEO from '../components/SEO';

const CheckoutCancel = () => {
  const [searchParams] = useSearchParams();
  const productKey = searchParams.get('product');

  useEffect(() => {
    // Track checkout cancellation
    if (productKey) {
      trackEvent('checkout_cancelled', {
        product_key: productKey
      });
    }
  }, [productKey]);

  return (
    <>
      <SEO 
        title="Checkout Cancelled"
        description="Your checkout was cancelled. You can try again anytime."
      />
      
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Cancel Icon */}
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="X" size={40} className="text-orange-600" />
          </div>
          
          {/* Cancel Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Checkout Cancelled
          </h1>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            No worries! Your checkout was cancelled and no payment was processed. 
            You can try again anytime or browse our other products.
          </p>
          
          {/* Reassurance */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Icon name="Shield" size={16} className="text-blue-600" />
              No charges made
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Your payment method was not charged</li>
              <li>• No personal information was stored</li>
              <li>• You can restart checkout anytime</li>
              <li>• All our products have a 30-day guarantee</li>
            </ul>
          </div>
          
          {/* Actions */}
          <div className="space-y-3">
            <Link
              to="/products"
              className="w-full bg-accent text-white py-3 px-6 rounded-lg font-medium hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="ShoppingCart" size={16} />
              Browse Products
            </Link>
            
            <Link
              to="/contact"
              className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="MessageCircle" size={16} />
              Ask a Question
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
            <p>
              Need help deciding? Email <a href="mailto:ivan@peycheff.com" className="text-accent hover:underline">ivan@peycheff.com</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutCancel;
