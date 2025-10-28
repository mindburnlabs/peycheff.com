import { notFound } from 'next/navigation'
import { getProductById, products } from '../../../data/skus'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { CheckCircle2, Star, Users, Clock, ArrowRight } from 'lucide-react'
import { Metadata } from 'next'

interface ProductPageProps {
  params: {
    id: string
  }
}

// Generate static params for all products
export async function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }))
}

// Generate metadata for each product
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = getProductById(params.id)

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  return {
    title: `${product.name} - Ivan Peycheff`,
    description: product.description,
    keywords: [
      product.name,
      product.category,
      ...product.features.slice(0, 3),
    ],
    openGraph: {
      title: product.name,
      description: product.description,
      type: 'article',
      url: `https://peycheff.com/products/${product.id}`,
      images: [
        {
          url: `https://peycheff.com/api/og?product=${product.id}`,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
      images: [`https://peycheff.com/api/og?product=${product.id}`],
    },
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = getProductById(params.id)

  if (!product) {
    notFound()
  }

  const relatedProducts = products
    .filter(p => p.id !== product.id && p.category === product.category)
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Breadcrumb */}
      <div className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex text-sm text-gray-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/shop" className="hover:text-white transition-colors">Shop</Link>
            <span className="mx-2">/</span>
            <span className="text-white">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <span className="text-4xl font-bold">
                    {product.type === 'product' ? '🚀' : product.type === 'playbook' ? '📖' : '💼'}
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
                <p className="text-gray-400">{product.category}</p>
              </div>
            </div>

            {product.popular && (
              <Badge className="absolute top-4 left-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <Star className="w-3 h-3 mr-1" />
                Popular
              </Badge>
            )}
          </div>

          {/* Product Details */}
          <div>
            <Badge variant="outline" className="mb-4 text-blue-400 border-blue-400">
              {product.category}
            </Badge>

            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
            <p className="text-xl text-gray-300 mb-6">{product.description}</p>

            <div className="flex items-center gap-4 mb-8">
              <div className="text-4xl font-bold text-green-400">${product.price}</div>
              {product.type === 'service' && (
                <span className="text-gray-400">per session</span>
              )}
            </div>

            {/* Features */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">What you'll get:</h3>
              <ul className="space-y-3">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              {product.type === 'service' ? (
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  <Link href="/contact" className="flex items-center gap-2">
                    Book Consultation
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              ) : product.stripePriceId ? (
                <form action={`/api/checkout` } method="POST">
                  <input type="hidden" name="priceId" value={product.stripePriceId} />
                  <input type="hidden" name="productName" value={product.name} />
                  <Button
                    type="submit"
                    size="lg"
                    className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                  >
                    Buy Now - ${product.price}
                  </Button>
                </form>
              ) : (
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  <Link href="/contact" className="flex items-center gap-2">
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              )}

              <Button variant="outline" size="lg">
                <Link href="/contact">Learn More</Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-800">
              <div className="text-center">
                <Users className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                <div className="text-sm text-gray-400">100+ Customers</div>
              </div>
              <div className="text-center">
                <Star className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                <div className="text-sm text-gray-400">5.0 Rating</div>
              </div>
              <div className="text-center">
                <Clock className="w-6 h-6 mx-auto mb-2 text-green-400" />
                <div className="text-sm text-gray-400">Instant Access</div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-20 border-t border-gray-800">
            <h2 className="text-3xl font-bold mb-8 text-center">Related Products</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedProducts.map((relatedProduct) => (
                <Card key={relatedProduct.id} className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="text-xs">
                        {relatedProduct.category}
                      </Badge>
                      <span className="text-2xl font-bold text-green-400">
                        ${relatedProduct.price}
                      </span>
                    </div>
                    <CardTitle className="text-xl">{relatedProduct.name}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {relatedProduct.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full">
                      <Link href={`/products/${relatedProduct.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}