import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { trackEvent } from '../lib/analytics';
import Icon from '../components/AppIcon';
import SEO from '../components/SEO';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const productKey = searchParams.get('product');

  useEffect(() => {
    // Track successful checkout completion
    if (sessionId && productKey) {
      trackEvent('checkout_success', {
        session_id: sessionId,
        product_key: productKey
      });
    }
  }, [sessionId, productKey]);

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
