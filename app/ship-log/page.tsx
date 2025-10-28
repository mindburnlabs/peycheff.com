import Link from 'next/link'
import { ArrowLeft, Rocket, Calendar, ExternalLink } from 'lucide-react'

export default function ShipLogPage() {
  const ships = [
    {
      date: '2024-01-15',
      title: 'AI-Powered Analytics Dashboard',
      description: 'Launched real-time analytics platform with AI insights for e-commerce businesses.',
      result: '$50K MRR in 3 months',
      link: '#'
    },
    {
      date: '2024-01-08',
      title: 'Subscription Management System',
      description: 'Complete subscription billing and management solution for SaaS companies.',
      result: '200+ active subscriptions',
      link: '#'
    }
  ]

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
              <Rocket className="h-12 w-12 text-blue-400 mr-4" />
              <h1 className="text-h2 font-bold text-white">Ship Log</h1>
            </div>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Recent launches and projects that are generating real revenue.
            </p>
          </div>

          <div className="space-y-8">
            {ships.map((ship, index) => (
              <div key={index} className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center text-gray-400 text-sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    {ship.date}
                  </div>
                  {ship.link && (
                    <a href={ship.link} className="text-blue-400 hover:text-blue-300 transition-colors">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{ship.title}</h3>
                <p className="text-gray-400 mb-4">{ship.description}</p>
                <div className="inline-flex items-center px-3 py-1 bg-green-600/20 text-green-400 text-sm rounded-full">
                  {ship.result}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}