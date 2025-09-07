const BASE = process.env.URL || 'https://peycheff.com'

// Simple dynamic sitemap to include programmatic routes
export const handler = async () => {
  // Example role/stack/niche matrices (can be moved to storage/db later)
  const roles = ['founder','pm','engineer']
  const stacks = ['react-node-supabase','nextjs-postgres','python-fastapi']
  const niches = ['saas','ecommerce','ai-tools']

  const urls = []
  for (const r of roles) {
    for (const s of stacks) {
      for (const n of niches) {
        urls.push(`${BASE}/sprint/${r}/${s}/${n}`)
      }
    }
  }

  const staticUrls = ['/', '/about', '/work', '/notes', '/products', '/advisory', '/contact']
  const all = [...staticUrls.map(u=>`${BASE}${u}`), ...urls]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all.map(u=>`  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>`

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/xml' },
    body: xml
  }
}


