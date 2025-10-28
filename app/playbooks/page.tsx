'use client'

import Link from 'next/link'
import { ArrowLeft, BookOpen, Target, Users, Star } from 'lucide-react'
import { getProductsByType, type Product } from '../../data/skus'
import { formatPrice } from '../../lib/formatting'
import { Button } from '../../components/ui/button'
import { useAnalytics } from '../../lib/analytics'

export default function PlaybooksPage() {
  const analytics = useAnalytics()
  const playbooks = getProductsByType('playbook')

  const handlePlaybookClick = (playbook: Product) => {
    analytics.trackProductView(playbook.id, playbook.name, playbook.price)
  }

  const handleGetPlaybook = (playbook: Product) => {
    analytics.trackButtonClick('Get Playbook', 'playbooks-page')
    // TODO: Implement Stripe checkout
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
            <div className="flex items-center justify-center mb-4">
              <BookOpen className="h-12 w-12 text-purple-400 mr-4" />
              <h1 className="text-h2 font-bold text-white">Battle-Tested Playbooks</h1>
            </div>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Proven frameworks and strategies that have helped dozens of products achieve product-market fit and scale.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {playbooks.map((playbook) => (
              <div
                key={playbook.id}
                className="bg-gray-900/50 rounded-xl p-8 border border-gray-800 hover:border-gray-700 transition-all card-hover"
                onClick={() => handlePlaybookClick(playbook)}
              >
                <div className="w-16 h-16 bg-purple-600/20 rounded-lg flex items-center justify-center mb-6">
                  <Target className="h-8 w-8 text-purple-400" />
                </div>

                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">{playbook.name}</h3>
                  <div className="text-2xl font-bold text-white">{formatPrice(playbook.price)}</div>
                </div>

                <p className="text-gray-400 mb-6">{playbook.description}</p>

                <ul className="space-y-2 mb-8">
                  {playbook.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-300 text-sm">
                      <Star className="mr-2 h-4 w-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                  {playbook.features.length > 3 && (
                    <li className="text-gray-500 text-sm italic">
                      +{playbook.features.length - 3} more strategies
                    </li>
                  )}
                </ul>

                <Button
                  className="w-full"
                  variant="secondary"
                  onClick={() => handleGetPlaybook(playbook)}
                >
                  Get Playbook
                  <BookOpen className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800 max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-6">Why These Playbooks Work</h2>
              <div className="grid md:grid-cols-3 gap-8 text-left">
                <div>
                  <div className="flex items-center mb-3">
                    <Target className="h-6 w-6 text-purple-400 mr-3" />
                    <h3 className="text-lg font-semibold text-white">Proven Results</h3>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Every playbook is based on real-world experience from launching and scaling multiple products.
                  </p>
                </div>
                <div>
                  <div className="flex items-center mb-3">
                    <Users className="h-6 w-6 text-purple-400 mr-3" />
                    <h3 className="text-lg font-semibold text-white">Battle-Tested</h3>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Tested across different industries and business models to ensure they work in various contexts.
                  </p>
                </div>
                <div>
                  <div className="flex items-center mb-3">
                    <BookOpen className="h-6 w-6 text-purple-400 mr-3" />
                    <h3 className="text-lg font-semibold text-white">Step-by-Step</h3>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Clear, actionable steps with templates and examples you can implement immediately.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}