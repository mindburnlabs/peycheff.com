import Link from 'next/link'
import { Zap, Mail, Twitter, Linkedin, Github } from 'lucide-react'

export default function ModernFooter() {
  const currentYear = new Date().getFullYear()

  const navigation = {
    main: [
      { name: 'Home', href: '/' },
      { name: 'Shop', href: '/shop' },
      { name: 'Playbooks', href: '/playbooks' },
      { name: 'Ship Log', href: '/ship-log' },
      { name: 'About', href: '/about' },
      { name: 'Contact', href: '/contact' },
    ],
    social: [
      { name: 'Twitter', href: 'https://twitter.com/ivanpeychev', icon: Twitter },
      { name: 'LinkedIn', href: 'https://linkedin.com/in/ivanpeychev', icon: Linkedin },
      { name: 'GitHub', href: 'https://github.com/ivanpeychev', icon: Github },
      { name: 'Email', href: 'mailto:ivan@peycheff.com', icon: Mail },
    ],
  }

  return (
    <footer className="glass-nav border-t border-gray-800/50" role="contentinfo">
      <div className="mx-auto max-w-container px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 glass-premium rounded-xl flex items-center justify-center group" aria-hidden="true">
                <Zap className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-200" />
              </div>
              <span className="text-xl font-bold text-white">Ivan Peychev</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Transforming ideas into revenue-generating digital products through AI-powered development and strategic guidance.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold mb-4">Navigation</h3>
            <nav aria-label="Footer navigation">
              <ul className="space-y-2" role="list">
                {navigation.main.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 rounded-md px-2 py-1 min-h-[44px] flex items-center"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-white font-semibold mb-4">Products</h3>
            <nav aria-label="Footer products">
              <ul className="space-y-2 text-sm" role="list">
                <li>
                  <Link
                    href="/shop"
                    className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 rounded-md px-2 py-1 min-h-[44px] flex items-center"
                    aria-label="View AI SaaS Starter Kit product"
                  >
                    AI SaaS Starter Kit
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shop"
                    className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 rounded-md px-2 py-1 min-h-[44px] flex items-center"
                    aria-label="View AI Automation Kit product"
                  >
                    AI Automation Kit
                  </Link>
                </li>
                <li>
                  <Link
                    href="/playbooks"
                    className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 rounded-md px-2 py-1 min-h-[44px] flex items-center"
                    aria-label="View Product Launch System playbook"
                  >
                    Product Launch System
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 rounded-md px-2 py-1 min-h-[44px] flex items-center"
                    aria-label="Book 1-on-1 Strategy Session"
                  >
                    1-on-1 Strategy Session
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-white font-semibold mb-4">Connect</h3>
            <nav aria-label="Social links">
              <ul className="space-y-2 text-sm" role="list">
                {navigation.social.map((item) => {
                  const Icon = item.icon
                  return (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className="flex items-center text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 rounded-md px-2 py-1 min-h-[44px]"
                        target={item.name === 'Email' ? '_self' : '_blank'}
                        rel={item.name === 'Email' ? undefined : "noopener noreferrer"}
                        aria-label={`Visit ${item.name} profile${item.name === 'Email' ? ' to send email' : ' (opens in new window)'}`}
                      >
                        <Icon className="h-4 w-4 mr-2" aria-hidden="true" />
                        {item.name}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center" id="footer">
          <p className="text-gray-400 text-sm">
            © {currentYear} Ivan Peychev. All rights reserved.
          </p>
          <nav className="flex items-center space-x-6 mt-4 md:mt-0" aria-label="Legal links">
            <Link
              href="/privacy"
              className="text-gray-400 hover:text-white transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 rounded-md px-2 py-1 min-h-[44px] flex items-center"
              aria-label="View Privacy Policy"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-gray-400 hover:text-white transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 rounded-md px-2 py-1 min-h-[44px] flex items-center"
              aria-label="View Terms of Service"
            >
              Terms of Service
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}