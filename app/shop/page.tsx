'use client'

import Link from 'next/link'
import { ArrowLeft, ShoppingCart, Star, Zap, Sparkles } from 'lucide-react'
import { products, type Product } from '../../data/skus'
import { formatPrice } from '../../lib/formatting'
import { Button } from '../../components/ui/button'
import { useAnalytics } from '../../lib/analytics'

export default function ShopPage() {
  const analytics = useAnalytics()

  const handleProductClick = (product: Product) => {
    analytics.trackProductView(product.id, product.name, product.price)
  }

  const handleGetStarted = async (product: Product) => {
    analytics.trackButtonClick('Get Instant Access', 'shop-page')

    if (product.type === 'service') {
      window.location.href = '/contact'
      return
    }

    // Handle Stripe checkout for products and playbooks
    if (product.stripePriceId) {
      try {
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            priceId: product.stripePriceId,
            productName: product.name,
          }),
        })

        const data = await response.json()

        if (data.success && data.checkoutUrl) {
          window.location.href = data.checkoutUrl
        } else {
          console.error('Checkout failed:', data.error)
          window.location.href = '/contact'
        }
      } catch (error) {
        console.error('Checkout error:', error)
        window.location.href = '/contact'
      }
    } else {
      // Fallback to contact page
      window.location.href = '/contact'
    }
  }

  const getProductIcon = (type: Product['type']) => {
    switch (type) {
      case 'product':
        return <Zap className="h-5 w-5" />
      case 'playbook':
        return <Star className="h-5 w-5" />
      case 'service':
        return <Sparkles className="h-5 w-5" />
      default:
        return <Zap className="h-5 w-5" />
    }
  }

  const getProductColor = (type: Product['type']) => {
    switch (type) {
      case 'product':
        return 'blue'
      case 'playbook':
        return 'purple'
      case 'service':
        return 'green'
      default:
        return 'blue'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <section className="py-20 px-6">
        <div className="mx-auto max-w-container">
          <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>

          <div className="text-center mb-16">
            <h1 className="text-h2 font-bold text-white mb-4">
              Revenue-Generating Products & Playbooks
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Proven solutions that help you skip the learning curve and start generating revenue immediately.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => {
              const color = getProductColor(product.type)
              return (
                <div
                  key={product.id}
                  className="bg-gray-900/50 rounded-xl p-8 border border-gray-800 hover:border-gray-700 transition-all card-hover"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`inline-flex items-center px-3 py-1 bg-${color}-600/20 text-${color}-400 text-sm rounded-full`}>
                      {getProductIcon(product.type)}
                      <span className="ml-2 capitalize">{product.type}</span>
                    </div>
                    <div className="text-right">
                      {product.popular && (
                        <span className="inline-block px-2 py-1 bg-yellow-600/20 text-yellow-400 text-xs rounded-full mb-1">
                          Popular
                        </span>
                      )}
                      <div className="text-2xl font-bold text-white">
                        {product.type === 'service' ? 'Custom' : formatPrice(product.price)}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-3">{product.name}</h3>
                  <p className="text-gray-400 mb-6">{product.description}</p>

                  <ul className="space-y-2 mb-8">
                    {product.features.slice(0, 4).map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-300 text-sm">
                        <Star className="mr-2 h-4 w-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                    {product.features.length > 4 && (
                      <li className="text-gray-500 text-sm italic">
                        +{product.features.length - 4} more features
                      </li>
                    )}
                  </ul>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleGetStarted(product)}
                    >
                      {product.type === 'service' ? 'Book Consultation' : 'Buy Now'}
                      <ShoppingCart className="ml-2 h-4 w-4" />
                    </Button>
                    <Link href={`/products/${product.id}`}>
                      <Button variant="outline" className="flex-1">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}