# 🚀 peycheff.com Deployment Guide

Your site is ready to deploy! Follow these steps to get everything live.

## ✅ Completed
- [x] **Supabase Database** - Tables created, connected
- [x] **GitHub Repository** - Code pushed to https://github.com/mindburnlabs/peycheff.com
- [x] **Site Build** - Compiles successfully, ready for production

## 🔧 Next Steps (15 minutes total)

### 1. Deploy to Netlify (3 minutes)

1. **Connect GitHub:**
   - Go to [netlify.com](https://netlify.com) 
   - Click "New site from Git"
   - Choose GitHub and select `mindburnlabs/peycheff.com`

2. **Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `20`
   *(These are already configured in `netlify.toml`)*

3. **Deploy:**
   - Click "Deploy site"
   - Your site will be live at a random Netlify URL

### 2. Set up Google Analytics (2 minutes)

1. **Create GA4 Property:**
   - Go to [analytics.google.com](https://analytics.google.com)
   - Create new property for "peycheff.com"
   - Copy the Measurement ID (format: G-XXXXXXXXXX)

2. **Add to Netlify:**
   - In Netlify dashboard → Site settings → Environment variables
   - Add: `VITE_GA_MEASUREMENT_ID` = your measurement ID

### 3. Set up Resend for Emails (3 minutes)

1. **Create Account:**
   - Go to [resend.com](https://resend.com)
   - Sign up and verify your account

2. **Get API Key:**
   - Go to API Keys section
   - Create new API key
   - Copy the key (starts with `re_`)

3. **Add to Netlify:**
   - Add environment variable: `VITE_RESEND_API_KEY` = your API key

### 4. Set up Stripe Payments (4 minutes)

1. **Create Stripe Account:**
   - Go to [stripe.com](https://stripe.com)
   - Create account (use test mode initially)

2. **Create Product:**
   - Dashboard → Products → Add product
   - Name: "Sparring Session (90 min)"
   - Price: $500 USD
   - Copy the Price ID (starts with `price_`)

3. **Get Keys:**
   - Dashboard → Developers → API Keys
   - Copy Publishable key (starts with `pk_test_` or `pk_live_`)

4. **Update Code & Netlify:**
   - Update `src/lib/stripe.js` - change `priceId` to your actual Price ID
   - Add to Netlify: `VITE_STRIPE_PUBLISHABLE_KEY` = your publishable key

### 5. Configure Custom Domain (3 minutes)

1. **In Netlify:**
   - Site settings → Domain management
   - Add custom domain: `peycheff.com`
   - Copy the Netlify DNS servers

2. **Update DNS:**
   - Go to your domain registrar
   - Point nameservers to Netlify's DNS servers
   - SSL will be automatically provisioned

## 🎯 Environment Variables Summary

Add these to Netlify → Site settings → Environment variables:

```
VITE_SUPABASE_URL=https://lddxeowqbjlakkosigss.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkZHhlb3dxYmpsYWtrb3NpZ3NzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxODk5MDUsImV4cCI6MjA3Mjc2NTkwNX0.QSzMeLKo5o6y6hTasV4PMqns0o3aW_rknZTlhM1FYQQ
VITE_RESEND_API_KEY=re_your_api_key_here
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_SITE_URL=https://peycheff.com
VITE_CONTACT_EMAIL=ivan@peycheff.com
VITE_TWITTER_HANDLE=@ivanitrust
VITE_INSTAGRAM_HANDLE=@ivanitrust
```

## 🧪 Testing Checklist

After deployment, test these features:

- [ ] **Contact form** - Submits to Supabase database
- [ ] **Newsletter signup** - Saves to subscribers table  
- [ ] **Navigation** - All pages load correctly
- [ ] **Analytics** - Events tracked in GA4
- [ ] **Payment** - Stripe checkout works (test mode)
- [ ] **Mobile** - Responsive design works
- [ ] **SEO** - Check meta tags, sitemap.xml

## 🎨 Optional: Add Your Photos

1. Convert 2 portrait photos to B/W
2. Save as `/public/images/portrait-1.jpg` and `/public/images/portrait-2.jpg`
3. Update image references in components (currently placeholders)

## 📊 Analytics Events Being Tracked

- `cta_work` - "Work with me" clicks
- `cta_notes` - "Read my notes" clicks  
- `cta_subscribe` - Newsletter signups
- `form_contact_submit` - Contact form submissions
- `stripe_checkout_start` - Payment flows

## 🔐 Security Features

- Row Level Security on all database tables
- HTTPS automatically enabled via Netlify
- Content Security Policy headers
- Input validation on all forms

---

**Need help?** The code is production-ready and following industry best practices. Each service has clear documentation and error handling.
