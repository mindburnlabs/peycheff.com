'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { CheckCircle2, Download, Mail, ArrowRight } from 'lucide-react'
import { ecommerceEvents } from '../../lib/analytics'

function SuccessPageContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams?.get('session_id')
  const [sessionData, setSessionData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sessionId) {
      // Fetch session data
      fetch(`/api/checkout?session_id=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setSessionData(data.session)
            // Track successful purchase
            ecommerceEvents.purchase(
              sessionId,
              [{
                id: data.session.metadata?.product_name || 'product',
                name: data.session.metadata?.product_name || 'Product',
                price: 0, // Would need to fetch from Stripe line items
                quantity: 1,
              }],
              0 // Would need to fetch from Stripe line items
            )
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading your order details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Purchase Successful!</h1>
          <p className="text-xl text-gray-300">
            Thank you for your purchase. Your order has been confirmed.
          </p>
        </div>

        {/* Order Details */}
        {sessionData && (
          <Card className="bg-gray-900 border-gray-800 mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Order Details</CardTitle>
              <CardDescription>
                Order ID: {sessionId}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Product</h3>
                  <p className="text-gray-300">
                    {sessionData.metadata?.product_name || 'Digital Product'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Email</h3>
                  <p className="text-gray-300">{sessionData.customer_email}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Payment Status</h3>
                  <p className="text-green-400 capitalize">{sessionData.payment_status}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Order Date</h3>
                  <p className="text-gray-300">
                    {new Date(sessionData.created * 1000).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Mail className="w-6 h-6 text-blue-400" />
                <CardTitle>Check Your Email</CardTitle>
              </div>
              <CardDescription>
                We've sent a confirmation email with your purchase details and access instructions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm">
                If you don't see the email within 5 minutes, please check your spam folder.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Download className="w-6 h-6 text-green-400" />
                <CardTitle>Instant Access</CardTitle>
              </div>
              <CardDescription>
                Your purchase is available immediately. Check your email for download links or access credentials.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm">
                For digital products, you'll receive download links. For services, we'll contact you within 24 hours.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
            <Link href="/shop" className="flex items-center gap-2">
              Continue Shopping
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg">
            <Link href="/contact">Get Support</Link>
          </Button>
        </div>

        {/* Additional Resources */}
        <div className="mt-16 pt-16 border-t border-gray-800">
          <h2 className="text-2xl font-bold mb-8 text-center">You might also like</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">Product Launch System</CardTitle>
                <CardDescription>
                  Step-by-step framework for launching digital products that generate revenue from day one.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Link href="/products/product-launch-system">Learn More</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">Revenue Growth Playbook</CardTitle>
                <CardDescription>
                  Proven strategies to scale your digital product from $0 to $10K MRR.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Link href="/products/revenue-growth-playbook">Learn More</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">1-on-1 Strategy Session</CardTitle>
                <CardDescription>
                  Personalized guidance to transform your idea into a revenue-generating product.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Link href="/products/strategy-session">Book Session</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  )
}