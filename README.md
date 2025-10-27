# Peycheff.com - Revenue-First Commerce Hub

> Ship revenue with AI templates, agents & micro-SaaS. Downloads today, weekly drops via membership, or start a 10-day automation sprint.

## 🚀 Live Demo

👉 [peycheff.com](https://peycheff.com)

## 📋 What This Is

A **production-ready**, **SEO-optimized**, **revenue-first** commerce hub built with:

- **Next.js 15** (App Router)
- **TypeScript** for type safety
- **TailwindCSS** with custom branding
- **MDX** for content management
- **Vercel** deployment ready

## 🎯 Key Features

### 📊 Revenue Streams
- **Etsy Downloads** - Instant template delivery
- **Whop Starters** - Complete SaaS foundations
- **10-Day Sprints** - Custom automation builds

### 🔧 Technical Features
- **GA4 + Meta Pixel** with server-side CAPI
- **UTM tracking** on all outbound links
- **Dynamic OG images** for every product
- **SEO-optimized** with JSON-LD structured data
- **Lighthouse ≥95** on all metrics
- **Mobile-first** responsive design

### 📈 Analytics & Tracking
- **Complete purchase tracking** via webhooks
- **Lead form submissions** with budget tracking
- **Product impressions** and click tracking
- **Server-side attribution** for better accuracy

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + custom design system
- **Content**: MDX with frontmatter
- **Analytics**: GA4 + Meta Pixel + CAPI
- **Deployment**: Vercel (ready)
- **Database**: Supabase (optional)

## 📦 Project Structure

```
├── app/                    # Next.js app router
│   ├── (site)/            # Marketing pages
│   ├── api/               # API routes
│   ├── shop/              # E-commerce
│   ├── playbooks/         # Content hub
│   └── ship-log/          # Development log
├── components/            # React components
├── lib/                   # Utilities
├── data/                  # Product catalog
├── content/               # MDX content
└── public/                # Static assets
```

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd peycheff.com
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```bash
# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Analytics
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=your-pixel-id

# Email (Resend)
RESEND_API_KEY=your-resend-key
CONTACT_EMAIL=your@email.com

# Whop (optional)
WHOP_WEBHOOK_SECRET=your-webhook-secret
```

### 3. Run Development

```bash
npm run dev
```

Visit `http://localhost:3000`

## 📊 Adding Products

Edit `/data/skus.ts`:

```typescript
{
  id: 'product-id',
  slug: 'product-slug',
  title: 'Product Title',
  price: 99,
  platform: 'etsy' | 'whop',
  promise: 'What it delivers',
  url: 'https://product-url.com',
  bullets: ['Benefit 1', 'Benefit 2'],
  included: ['Feature 1', 'Feature 2'],
  category: 'template' | 'starter',
  tags: ['tag1', 'tag2']
}
```

Products automatically appear in:
- Shop grid with filters
- Individual product pages
- Home page (if featured)
- Search and discovery

## 📝 Content Management

### Playbooks

Create `/content/playbooks/your-guide.mdx`:

```mdx
---
title: 'Your Guide Title'
description: 'What this guide teaches'
date: '2024-01-15'
category: 'monetization'
difficulty: 'beginner'
readTime: 30
tags: ['automation', 'revenue']
---

# Your content here
```

### Ship Log

Create `/content/ship-log/weekly-update.mdx`:

```mdx
---
title: 'What Shipped This Week'
date: '2024-01-15'
category: 'product'
tags: ['launch', 'revenue']
---

# Weekly progress and learnings
```

## 🔗 Analytics Setup

### Google Analytics 4

1. Create GA4 property → Get Measurement ID
2. Create API Secret for server-side tracking
3. Add to environment variables

### Meta Pixel & CAPI

1. Create Meta Pixel → Get Pixel ID
2. Generate CAPI token
3. Add webhook verification token

### Whop Integration

1. Set up products in Whop
2. Configure webhook: `https://yoursite.com/api/whop`
3. Add webhook secret to environment

## 🚀 Deployment

### Vercel (Recommended)

1. Connect repository to [Vercel](https://vercel.com)
2. Add environment variables
3. Deploy automatically on push

### Required Vercel Variables

```bash
NEXT_PUBLIC_GA4_ID
NEXT_PUBLIC_SITE_URL
RESEND_API_KEY
CONTACT_EMAIL
```

## 📈 Performance

### Lighthouse Scores
- **Performance**: ≥95
- **Accessibility**: ≥95
- **Best Practices**: ≥95
- **SEO**: ≥95

### SEO Features
- **Dynamic sitemap** at `/sitemap.xml`
- **Robots.txt** configured
- **JSON-LD** structured data
- **Meta tags** optimized
- **OG images** for all content

## 🧪 Testing

```bash
# Run tests
npm run test

# Lighthouse audit
npm run lighthouse

# Type checking
npm run type-check
```

## 🎨 Customization

### Branding

Edit `/tailwind.config.ts`:

```typescript
colors: {
  charcoal: "#0A0A0A",
  pearl: "#F5F5F5",
  champagne: "#E5CBA8",
  midnight: "#111827"
}
```

### Typography

Default font: **Inter** (can be changed in `layout.tsx`)

### Components

All components are in `/components`:
- `ProductCard.tsx` - Product display
- `CTAGroup.tsx` - Revenue CTAs
- `ContactForm.tsx` - Lead capture
- `MindburnBadge.tsx` - Footer attribution

## 📞 Support

### Documentation
- Check inline code comments
- Review this README
- Explore component files

### Get Help
1. **Issues**: Create GitHub issue
2. **Email**: Use contact form
3. **Consultation**: Book a sprint

## 📄 License

MIT License - use for commercial projects

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [Vercel](https://vercel.com/) - Hosting
- [Lucide](https://lucide.dev/) - Icons

---

**Built by** [Mindburn Labs](https://mindburnlabs.com)

💝 **Star this repo** if it helps you build your revenue hub!