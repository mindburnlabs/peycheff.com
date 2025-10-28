import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://peycheff.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/about',
          '/shop',
          '/contact',
          '/playbooks',
          '/ship-log',
          '/products',
          '/api/og',
        ],
        disallow: [
          '/api/',
          '/_next/',
          '/admin/',
          '/studio/',
          '/.well-known/',
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: '/',
      },
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
      {
        userAgent: 'anthropic-ai',
        disallow: '/',
      },
      {
        userAgent: 'Claude-Web',
        disallow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}