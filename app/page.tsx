import Link from 'next/link'
import { ArrowRight, Star, TrendingUp, Zap, Shield, Clock } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950/20 to-gray-950 relative overflow-hidden">
      {/* Premium background mesh gradient */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-40" aria-hidden="true" />

      {/* Advanced particle system */}
      <div className="particle-system" aria-hidden="true">
        <div className="particle particle-1" />
        <div className="particle particle-2" />
        <div className="particle particle-3" />
        <div className="particle particle-4" />
        <div className="particle particle-5" />
      </div>

      {/* Enhanced animated floating elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl animate-float" aria-hidden="true" />
      <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/12 rounded-full blur-3xl animate-float animate-delay-200" aria-hidden="true" />
      <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-float animate-delay-400" aria-hidden="true" />
      <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-pink-500/08 rounded-full blur-3xl animate-float animate-delay-600" aria-hidden="true" />
      {/* Hero Section */}
      <section className="relative px-6 py-24 md:py-32 z-10" aria-labelledby="hero-heading">
        <div className="mx-auto max-w-container">
          <div className="text-center animate-premium-reveal gpu-accelerated">
            <h1 id="hero-heading" className="mb-6 text-h1 font-bold text-white leading-tight will-change-transform">
              Transform Ideas Into{' '}
              <span className="text-gradient-premium animate-glass-shimmer">
                Revenue-Generating Products
              </span>
            </h1>
            <p className="mb-8 text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              I help founders and product teams ship digital products that actually make money.
              Through AI-powered development, strategic guidance, and battle-tested playbooks,
              we'll turn your vision into a profitable reality.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12" role="group" aria-label="Primary actions">
              <Link
                href="/shop"
                className="glass-button-cta inline-flex items-center px-8 py-4 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 animate-delay-200 group min-h-[48px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950"
                aria-label="Start building revenue with our products and services"
              >
                <span>Start Building Revenue</span>
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true" />
              </Link>
              <Link
                href="/playbooks"
                className="glass-card-3d inline-flex items-center px-8 py-4 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 animate-delay-300 group min-h-[48px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950"
                aria-label="Browse our collection of business and development playbooks"
              >
                <span>Browse Playbooks</span>
                <Star className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-200" aria-hidden="true" />
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 text-sm animate-delay-400" role="list" aria-label="Social proof metrics">
              <div className="text-glass flex items-center gap-2 px-4 py-2 rounded-full" role="listitem">
                <div className="flex -space-x-2" aria-label="Founders served">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full border-2 border-gray-900 animate-pulse-slow" aria-hidden="true" />
                  ))}
                </div>
                <span className="text-white font-medium">50+ founders served</span>
              </div>
              <div className="text-glass flex items-center gap-1 px-4 py-2 rounded-full" role="listitem">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500 animate-pulse-slow" aria-hidden="true" />
                <span className="text-white font-medium">4.9/5 rating</span>
              </div>
              <div className="text-glass flex items-center gap-1 px-4 py-2 rounded-full" role="listitem">
                <TrendingUp className="h-4 w-4 text-green-500 animate-pulse-slow" aria-hidden="true" />
                <span className="text-white font-medium">$2M+ revenue generated</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 px-6 border-t border-gray-800/50 relative z-10" aria-labelledby="value-prop-heading">
        <div className="mx-auto max-w-container">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 id="value-prop-heading" className="text-h2 font-bold text-white mb-4">
              Why Most Digital Products Fail
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              90% of digital products never generate meaningful revenue. Here's how I help you join the successful 10%:
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8" role="list">
            <article className="glass-card-3d rounded-2xl p-8 group animate-delay-100 animate-fade-in-up focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-900" role="listitem">
              <div className="w-14 h-14 glass-premium rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 animate-glow-pulse" aria-hidden="true">
                <Zap className="h-7 w-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-300 transition-colors duration-300">AI-Powered Development</h3>
              <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                Leverage cutting-edge AI tools and methodologies to build products 10x faster than traditional development,
                without compromising on quality or scalability.
              </p>
            </article>

            <article className="glass-card-3d rounded-2xl p-8 group animate-delay-200 animate-fade-in-up focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-900" role="listitem">
              <div className="w-14 h-14 glass-premium rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 animate-glow-pulse" aria-hidden="true">
                <TrendingUp className="h-7 w-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-300 transition-colors duration-300">Revenue-First Strategy</h3>
              <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                Every feature, design decision, and line of code is optimized for revenue generation from day one.
                No vanity metrics—just sustainable growth.
              </p>
            </article>

            <article className="glass-card-3d rounded-2xl p-8 group animate-delay-300 animate-fade-in-up focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-900" role="listitem">
              <div className="w-14 h-14 glass-premium rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 animate-glow-pulse" aria-hidden="true">
                <Shield className="h-7 w-7 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-green-300 transition-colors duration-300">Battle-Tested Playbooks</h3>
              <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                Access proven frameworks and strategies that have helped dozens of products achieve product-market fit
                and scale to millions in revenue.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 px-6 relative z-10" aria-labelledby="products-heading">
        <div className="mx-auto max-w-container">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 id="products-heading" className="text-h2 font-bold text-white mb-4">
              Ready-To-Use Solutions
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Skip the learning curve and start generating revenue immediately with these proven digital products and playbooks.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12" role="list">
            <Link
              href="/shop"
              className="block group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-xl animate-delay-100"
              aria-labelledby="product-1-title"
            >
              <div className="glass-card-3d rounded-2xl p-6 group-hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-glass px-3 py-1 bg-blue-600/20 text-blue-300 text-sm rounded-full font-medium">Product</span>
                  <span className="text-glass px-3 py-1 text-white text-sm font-bold">$497</span>
                </div>
                <h3 id="product-1-title" className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors duration-300">AI SaaS Starter Kit</h3>
                <p className="text-gray-400 text-sm mb-4 group-hover:text-gray-300 transition-colors duration-300">Complete SaaS foundation with AI integration, payment processing, and user management.</p>
                <div className="flex items-center text-blue-400 text-sm font-medium group-hover:text-blue-300 transition-colors duration-300">
                  Learn more <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true" />
                </div>
              </div>
            </Link>

            <Link
              href="/shop"
              className="block group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-xl animate-delay-200"
              aria-labelledby="product-2-title"
            >
              <div className="glass-card-3d rounded-2xl p-6 group-hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-glass px-3 py-1 bg-purple-600/20 text-purple-300 text-sm rounded-full font-medium">Playbook</span>
                  <span className="text-glass px-3 py-1 text-white text-sm font-bold">$197</span>
                </div>
                <h3 id="product-2-title" className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors duration-300">Product Launch System</h3>
                <p className="text-gray-400 text-sm mb-4 group-hover:text-gray-300 transition-colors duration-300">Step-by-step framework for launching digital products that generate revenue from day one.</p>
                <div className="flex items-center text-blue-400 text-sm font-medium group-hover:text-blue-300 transition-colors duration-300">
                  Learn more <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true" />
                </div>
              </div>
            </Link>

            <Link
              href="/shop"
              className="block group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-xl animate-delay-300"
              aria-labelledby="product-3-title"
            >
              <div className="glass-card-3d rounded-2xl p-6 group-hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-glass px-3 py-1 bg-green-600/20 text-green-300 text-sm rounded-full font-medium">Service</span>
                  <span className="text-glass px-3 py-1 text-white text-sm font-bold">Custom</span>
                </div>
                <h3 id="product-3-title" className="text-lg font-semibold text-white mb-2 group-hover:text-green-300 transition-colors duration-300">1-on-1 Strategy Session</h3>
                <p className="text-gray-400 text-sm mb-4 group-hover:text-gray-300 transition-colors duration-300">Personalized guidance to transform your idea into a revenue-generating product.</p>
                <div className="flex items-center text-blue-400 text-sm font-medium group-hover:text-blue-300 transition-colors duration-300">
                  Learn more <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true" />
                </div>
              </div>
            </Link>
          </div>

          <div className="text-center">
            <Link
              href="/shop"
              className="glass-card-3d inline-flex items-center px-6 py-3 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 animate-delay-400 group"
              aria-label="View all products and playbooks available for purchase"
            >
              View All Products & Playbooks
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 border-t border-gray-800/50 relative z-10" aria-labelledby="cta-heading">
        <div className="mx-auto max-w-container text-center">
          <div className="glass-premium rounded-3xl p-12 max-w-4xl mx-auto animate-glow-pulse">
            <h2 id="cta-heading" className="text-h2 font-bold text-white mb-4">
              Ready to Build Something That Makes Money?
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Stop wasting time on products that don't generate revenue. Let's build something that actually works.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="glass-button-cta inline-flex items-center px-8 py-4 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 animate-delay-200 group"
                aria-label="Book a free consultation to discuss your project"
              >
                Book a Free Consultation
                <Clock className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-200" aria-hidden="true" />
              </Link>
              <Link
                href="/ship-log"
                className="glass-card-3d inline-flex items-center px-8 py-4 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 animate-delay-300 group"
                aria-label="View recent work and project examples"
              >
                See Recent Work
                <TrendingUp className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}