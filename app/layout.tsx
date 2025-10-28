import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'
import ModernHeader from '../components/layout/ModernHeader'
import ModernFooter from '../components/layout/ModernFooter'
import SkipNavigation from '../components/accessibility/SkipNavigation'
import AccessibilityWidget from '../components/accessibility/AccessibilityWidget'
import { initializeAnalytics } from '../lib/analytics'
import Script from 'next/script'

// Premium font stack for sophisticated typography
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'Ivan Peychev - Revenue Engineering & Digital Products',
  description: 'Helping founders and product teams transform ideas into revenue-generating digital products through AI-powered development, strategic guidance, and battle-tested playbooks.',
  keywords: [
    'revenue engineering',
    'digital products',
    'AI development',
    'product strategy',
    'startup consulting',
    'technical due diligence',
    'M&A technical readiness',
    'product development'
  ],
  authors: [{ name: 'Ivan Peychev' }],
  openGraph: {
    title: 'Ivan Peychev - Revenue Engineering & Digital Products',
    description: 'Transform ideas into revenue-generating digital products through AI-powered development and strategic guidance.',
    type: 'website',
    locale: 'en_US',
    url: 'https://peycheff.com',
    siteName: 'Ivan Peychev Consulting',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ivan Peychev - Revenue Engineering & Digital Products',
    description: 'Transform ideas into revenue-generating digital products through AI-powered development and strategic guidance.',
    creator: '@ivanpeychev',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || '',
    other: {
      'facebook-domain-verification': process.env.FACEBOOK_DOMAIN_VERIFICATION || '',
    },
  },
  other: {
    'msvalidate.01': process.env.BING_SITE_VERIFICATION || '',
    // Accessibility metadata
    'theme-color': '#0B0C0F',
    'color-scheme': 'dark',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* DNS prefetch for analytics domains */}
        {process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID && (
          <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        )}
        {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
          <link rel="dns-prefetch" href="//connect.facebook.net" />
        )}

        {/* Accessibility meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="color-scheme" content="dark" />

        {/* Structured data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Ivan Peychev",
              "url": "https://peycheff.com",
              "sameAs": [
                "https://twitter.com/ivanpeychev",
                "https://linkedin.com/in/ivanpeychev",
                "https://github.com/ivanpeychev"
              ],
              "jobTitle": "Revenue Engineering Consultant",
              "description": "Helping founders and product teams transform ideas into revenue-generating digital products",
              "knowsAbout": [
                "Revenue Engineering",
                "Digital Product Development",
                "AI Integration",
                "Technical Due Diligence",
                "Product Strategy",
                "Startup Consulting"
              ],
              "offers": {
                "@type": "Offer",
                "description": "Consulting services for digital product development and revenue engineering",
                "areasServed": "Worldwide"
              },
              "accessibilityFeature": [
                "alternativeText",
                "fullKeyboardControl",
                "highContrastDisplay",
                "largePrint",
                "readingOrder"
              ],
              "accessibilityHazard": "none"
            })
          }}
        />
      </head>
      <body className={`${inter.className} ${spaceGrotesk.variable}`} style={{ fontFamily: 'var(--font-inter), var(--font-space-grotesk), system-ui, sans-serif' }}>
        {/* Analytics initialization */}
        <Script
          id="analytics-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                // Initialize analytics
                ${initializeAnalytics.toString()}
                initializeAnalytics();
              }
            `,
          }}
        />

        {/* Google Analytics 4 */}
        {process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script
              id="ga4-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}', {
                    page_location: window.location.href,
                    send_page_view: false
                  });
                `,
              }}
            />
          </>
        )}

        {/* Meta Pixel */}
        {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
          <Script
            id="meta-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
                fbq('track', 'PageView');
              `,
            }}
          />
        )}

        {/* Enhanced Skip Navigation */}
        <SkipNavigation />

        {/* Header with proper landmark */}
        <ModernHeader />

        {/* Main content with proper landmark and focus management */}
        <main
          id="main-content"
          className="min-h-screen"
          role="main"
          tabIndex={-1}
        >
          {children}
        </main>

        {/* Footer with proper landmark */}
        <ModernFooter />

        {/* Accessibility Widget */}
        <AccessibilityWidget />
      </body>
    </html>
  )
}