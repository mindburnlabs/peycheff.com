'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, Send, CheckCircle } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))

    setIsSubmitted(true)
    setIsSubmitting(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Message Sent!</h2>
          <p className="text-gray-300 mb-8">
            Thanks for reaching out. I'll get back to you within 24 hours.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <section className="py-20 px-6" aria-labelledby="contact-heading">
        <div className="mx-auto max-w-container">
          <Link
            href="/"
            className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 rounded-md px-2 py-1"
            aria-label="Navigate back to home page"
          >
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Back to Home
          </Link>

          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-16">
              <div className="w-16 h-16 bg-blue-600/20 rounded-lg flex items-center justify-center mx-auto mb-6" aria-hidden="true">
                <Mail className="h-8 w-8 text-blue-400" />
              </div>
              <h1 id="contact-heading" className="text-h2 font-bold text-white mb-4">Let's Build Something</h1>
              <p className="text-lg text-gray-300">
                Ready to transform your idea into a revenue-generating product?
                Book a free consultation to discuss your project.
              </p>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <form
                onSubmit={handleSubmit}
                className="space-y-6"
                noValidate
                aria-labelledby="contact-form-heading"
              >
                <h2 id="contact-form-heading" className="sr-only">Contact form</h2>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Name <span className="text-red-400" aria-label="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    aria-required="true"
                    aria-describedby="name-error"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:ring-offset-2 focus:ring-offset-gray-900"
                    placeholder="Your name"
                    autoComplete="name"
                  />
                  <div id="name-error" className="sr-only" aria-live="polite"></div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email <span className="text-red-400" aria-label="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    aria-required="true"
                    aria-describedby="email-error"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:ring-offset-2 focus:ring-offset-gray-900"
                    placeholder="your@email.com"
                    autoComplete="email"
                  />
                  <div id="email-error" className="sr-only" aria-live="polite"></div>
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
                    Company <span className="text-gray-500 text-xs">(optional)</span>
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    aria-describedby="company-help"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:ring-offset-2 focus:ring-offset-gray-900"
                    placeholder="Your company"
                    autoComplete="organization"
                  />
                  <div id="company-help" className="sr-only">Optional field for your company name</div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    Message <span className="text-red-400" aria-label="required">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    aria-required="true"
                    aria-describedby="message-error message-help"
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:ring-offset-2 focus:ring-offset-gray-900 resize-none"
                    placeholder="Tell me about your project and what you're trying to achieve..."
                  />
                  <div id="message-help" className="sr-only">Please provide details about your project</div>
                  <div id="message-error" className="sr-only" aria-live="polite"></div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  aria-describedby="submit-status"
                  className="w-full py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-blue-600 min-h-[56px]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" aria-hidden="true" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send className="ml-2 h-5 w-5" aria-hidden="true" />
                    </>
                  )}
                </button>
                <div id="submit-status" className="sr-only" aria-live="polite"></div>
              </form>
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-400 mb-4">Or schedule a call directly</p>
              <a
                href="https://cal.com/ivanpeychev"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-800 min-h-[48px]"
                aria-label="Schedule a consultation call with Ivan Peychev (opens in new window)"
              >
                <span>Schedule a Call</span>
                <Send className="ml-2 h-5 w-5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}