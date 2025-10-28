import Link from 'next/link'
import { ArrowLeft, User, Award, Target } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <section className="py-20 px-6">
        <div className="mx-auto max-w-container">
          <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>

          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <User className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-h2 font-bold text-white mb-4">About Ivan Peychev</h1>
              <p className="text-lg text-gray-300 leading-relaxed">
                Revenue engineer and product strategist helping founders build digital products that actually make money.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">50+ Products Launched</h3>
                <p className="text-gray-400 text-sm">Helped founders bring ideas to market and generate revenue</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">$2M+ Revenue Generated</h3>
                <p className="text-gray-400 text-sm">Total revenue across all products and clients</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">10+ Years Experience</h3>
                <p className="text-gray-400 text-sm">Building and scaling digital products</p>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <h2 className="text-xl font-semibold text-white mb-4">My Approach</h2>
              <p className="text-gray-300 leading-relaxed mb-6">
                I believe in building products that solve real problems and generate revenue from day one.
                Through AI-powered development methodologies and revenue-first thinking, I help founders skip
                the common pitfalls that cause 90% of digital products to fail.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Every project I work on is focused on three key outcomes: rapid development, sustainable revenue,
                and scalable growth. No vanity metrics, no complex features nobody uses—just products that
                customers love to pay for.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}