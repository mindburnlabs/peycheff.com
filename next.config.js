/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image configuration
  images: {
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: [
      'localhost',
      'peycheff.com',
      'www.peycheff.com',
      'images.unsplash.com',
      'avatars.githubusercontent.com'
    ],
    minimumCacheTTL: 31536000, // 1 year cache
  },

  // Performance optimizations
  poweredByHeader: false,
  reactStrictMode: true,

  // Compression
  compress: true,

  // Static optimization
  trailingSlash: false,

  // Experimental features
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-slot',
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
      '@radix-ui/react-checkbox'
    ],
    // Enable webpack 5 optimizations
    optimizeCss: true,
    // Enable SWC minification
    swcMinify: true,
  },

  // Webpack configuration for bundle optimization
  webpack: (config, { isServer, dev }) => {
    // Basic fallbacks
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }

    // Production optimizations
    if (!dev) {
      // Enable chunk splitting for better caching
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      }

      // Reduce bundle size with tree shaking
      config.optimization.usedExports = true
      config.optimization.sideEffects = false

      // Compression for production
      config.optimization.minimize = true
    }

    return config
  },

  // Bundle analyzer configuration
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: true,
        })
      )
      return config
    },
  }),

  // Environment variables
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://peycheff.com',
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Basic security headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // Enhanced security headers
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), ambient-light-sensor=()'
          },
          // Enhanced Content Security Policy with nonce support
          {
            key: 'Content-Security-Policy',
            value: process.env.NODE_ENV === 'development'
              ? [
                  "default-src 'self'",
                  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.googletagmanager.com https://www.google-analytics.com https://cdn.jsdelivr.net ws://localhost:4028 ws://127.0.0.1:4028",
                  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
                  "img-src 'self' data: blob: https: *.unsplash.com avatars.githubusercontent.com",
                  "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
                  "connect-src 'self' https://api.stripe.com https://js.stripe.com https://www.google-analytics.com https://analytics.google.com https://your-project.supabase.co https://resend.com https://api.openai.com https://api.anthropic.com ws://localhost:4028 ws://127.0.0.1:4028",
                  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
                  "object-src 'none'",
                  "base-uri 'self'",
                  "form-action 'self'",
                  "frame-ancestors 'none'",
                  "upgrade-insecure-requests",
                  "require-trusted-types-for 'script'"
                ].join('; ')
              : [
                  "default-src 'self'",
                  "script-src 'self' https://js.stripe.com https://www.googletagmanager.com https://www.google-analytics.com https://cdn.jsdelivr.net",
                  "style-src 'self' https://fonts.googleapis.com https://cdn.jsdelivr.net",
                  "style-src-attr 'self' 'unsafe-inline'",
                  "img-src 'self' data: blob: https: *.unsplash.com avatars.githubusercontent.com",
                  "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
                  "connect-src 'self' https://api.stripe.com https://js.stripe.com https://www.google-analytics.com https://analytics.google.com https://your-project.supabase.co https://resend.com https://api.openai.com https://api.anthropic.com",
                  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
                  "object-src 'none'",
                  "base-uri 'self'",
                  "form-action 'self'",
                  "frame-ancestors 'none'",
                  "upgrade-insecure-requests",
                  "require-trusted-types-for 'script'",
                  "trusted-types default"
                ].join('; ')
          },
          // Additional security headers
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp'
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin'
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          },
          // Advanced security headers
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none'
          },
          {
            key: 'Expect-CT',
            value: 'max-age=86400, enforce'
          },
          {
            key: 'NEL',
            value: '{"report_to":"default","max_age":31536000,"include_subdomains":true}'
          },
          {
            key: 'Report-To',
            value: '{"group":"default","max_age":31536000,"endpoints":[{"url":"https://peycheff.com/api/security/reports"}]}'
          }
        ]
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate'
          },
          // API-specific security headers
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // Restrict CORS for API endpoints
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'development' ? 'http://localhost:4028,https://localhost:4028' : 'https://peycheff.com,https://www.peycheff.com'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With'
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true'
          },
          // Rate limiting headers
          {
            key: 'X-RateLimit-Limit',
            value: '100'
          },
          {
            key: 'X-RateLimit-Remaining',
            value: '99'
          },
          {
            key: 'X-RateLimit-Reset',
            value: new Date(Date.now() + 3600000).toISOString()
          }
        ]
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600'
          }
        ]
      }
    ]
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      }
    ]
  }
}

module.exports = nextConfig