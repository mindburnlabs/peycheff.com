# peycheff.com

> A hyper-clean personal OS for one thing: **convert serious attention into the right conversations**.

This is the source code for Ivan Peychev's personal website - a refined, Apple-grade portfolio built with modern web technologies.

## 🎯 Philosophy

No gimmicks. One font. One accent. One grid. Every line earns its keep.

## ⚡ Tech Stack

- **React 18** + **Vite** - Fast, modern development
- **Tailwind CSS** - Utility-first styling with custom design system
- **Supabase** - Database for subscribers & inquiries
- **Resend** - Email notifications
- **Stripe** - Advisory service payments
- **Google Analytics** - Privacy-focused tracking
- **Netlify** - Deployment & hosting

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## 🛠️ Environment Setup

Copy `.env` and update with your service keys:

```bash
# Core Services
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-key
VITE_RESEND_API_KEY=your-resend-key
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-key

# Analytics
VITE_GA_MEASUREMENT_ID=your-ga4-id
```

## 📁 Structure

```
src/
├── components/         # Reusable UI components
│   ├── layout/        # Header, Footer, Layout
│   └── SEO.jsx        # Structured data & meta tags
├── pages/             # Route components (Home, About, etc.)
├── lib/               # Service integrations
│   ├── supabase.js    # Database client
│   ├── stripe.js      # Payment processing  
│   └── analytics.js   # Tracking & events
└── styles/            # Tailwind CSS + custom styles
```

## 🎨 Design System

**Locked Visual System:**
- **Typeface:** SF-first system stack (falls back to Inter)
- **Accent:** macOS blue `#0A84FF` (links & primary CTAs only)
- **Palette:** bg `#0B0C0F`, surface `#0F1115`, text `#F2F3F5`, muted `#A5ABB3`
- **Grid:** 12-col, max-width 1080px, 8px baseline
- **Motion:** 120–160ms opacity/translate only

## 🔧 Services Setup

### Supabase Tables

Create these tables in your Supabase project:

```sql
-- Subscribers table
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'website',
  status TEXT DEFAULT 'active',
  subscribed_at TIMESTAMP DEFAULT NOW()
);

-- Inquiries table  
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  linkedin TEXT,
  company TEXT,
  problem TEXT NOT NULL,
  timeline TEXT NOT NULL,
  budget TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  submitted_at TIMESTAMP DEFAULT NOW()
);
```

### Stripe Products

Create a product in Stripe Dashboard:
- **Sparring Session (90 min)** - $500
- Update `STRIPE_PRODUCTS.SPARRING_SESSION.priceId` in `src/lib/stripe.js`

## 🚀 Deployment

1. **Connect to Netlify**
   - Link your repository
   - Set environment variables in Netlify dashboard
   - Deploy automatically on push to main

2. **Custom Domain**
   - Point `peycheff.com` to Netlify DNS
   - SSL automatically provisioned

3. **Analytics**
   - Create GA4 property
   - Add measurement ID to environment

## 📊 Tracking Events

- `cta_work` - Work with me clicks
- `cta_notes` - Read notes clicks  
- `cta_subscribe` - Newsletter signups
- `form_contact_submit` - Contact form submissions
- `stripe_checkout_start` - Payment flow initiations

---

**Built by Ivan Peychev** • [ivan@peycheff.com](mailto:ivan@peycheff.com) • [@ivanitrust](https://x.com/ivanitrust)

