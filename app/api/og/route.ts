import { ImageResponse } from 'next/og'
import { getProductById } from '../../../data/skus'

// Route segment config
export const runtime = 'edge'

// Image metadata - these are for reference only, not exported

// Generate OG image for products
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('product')
    const title = searchParams.get('title') || 'Ivan Peycheff - Digital Products & Services'
    const description = searchParams.get('description') || 'Premium products, playbooks, and consulting for builders who ship.'

    let productTitle = title
    let productDescription = description
    let productPrice = null

    // If product ID is provided, fetch product data
    if (productId) {
      const product = getProductById(productId)
      if (product) {
        productTitle = product.name
        productDescription = product.description
        productPrice = `$${product.price}`
      }
    }

    // Create SVG as string
    const svg = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0a0a0a" />
            <stop offset="100%" style="stop-color:#1a1a1a" />
          </linearGradient>
          <linearGradient id="text" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#ffffff" />
            <stop offset="100%" style="stop-color:#d1d5db" />
          </linearGradient>
          <linearGradient id="bottom" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#10b981" />
            <stop offset="50%" style="stop-color:#059669" />
            <stop offset="100%" style="stop-color:#10b981" />
          </linearGradient>
        </defs>

        <!-- Background -->
        <rect width="1200" height="630" fill="url(#bg)" />

        <!-- Brand -->
        <text x="600" y="120" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              font-size="32" font-weight="700" fill="#10b981" text-anchor="middle" letter-spacing="-0.5">
          IVAN PEYCHEFF
        </text>

        <!-- Product Title -->
        <text x="600" y="${productPrice ? '280' : '260'}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              font-size="${productPrice ? '64' : '56'}" font-weight="700" fill="url(#text)" text-anchor="middle" letter-spacing="-1">
          ${productTitle}
        </text>

        <!-- Price (if product) -->
        ${productPrice ? `
          <rect x="${600 - 120}" y="320" width="240" height="80" rx="12" fill="rgba(16, 185, 129, 0.1)"
                stroke="rgba(16, 185, 129, 0.3)" stroke-width="2" />
          <text x="600" y="375" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                font-size="48" font-weight="700" fill="#10b981" text-anchor="middle">
            ${productPrice}
          </text>
        ` : ''}

        <!-- Description -->
        <text x="600" y="${productPrice ? '460' : '400'}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              font-size="24" fill="#9ca3af" text-anchor="middle">
          ${productDescription}
        </text>

        <!-- Call to action -->
        <rect x="${600 - 150}" y="${productPrice ? '520' : '460'}" width="300" height="60" rx="12"
              fill="rgba(16, 185, 129, 0.1)" stroke="rgba(16, 185, 129, 0.3)" stroke-width="1" />
        <circle cx="480" cy="${productPrice ? '550' : '490'}" r="6" fill="#10b981" />
        <text x="600" y="${productPrice ? '560' : '500'}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              font-size="18" font-weight="600" fill="#10b981" text-anchor="middle">
          peycheff.com
        </text>

        <!-- Bottom decoration -->
        <rect x="0" y="626" width="1200" height="4" fill="url(#bottom)" />
      </svg>
    `

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('OG generation error:', error)
    return new Response('Failed to generate OG image', { status: 500 })
  }
}