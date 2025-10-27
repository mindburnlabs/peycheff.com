# 🚀 Vercel Deployment Guide

This guide will help you migrate from Netlify to Vercel and deploy your peycheff.com project.

## ✅ Migration Complete

The following migration steps have been completed:

- ✅ Created `vercel.json` configuration
- ✅ Set up API routes structure (`api/`)
- ✅ Migrated core functions (contact, webhook)
- ✅ Updated package.json scripts
- ✅ Created environment variables template

## 🛠️ Remaining Manual Steps

### 1. Deploy to Vercel

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with your GitHub account

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select your `peycheff.com` repository
   - Vercel will automatically detect the framework (Vite)

3. **Configure Build Settings**
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   Node Version: 20.x
   ```

### 2. Set Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add the variables from `.env.vercel.example`:

#### Required Variables:
```bash
# Client-side (NEXT_PUBLIC_*)
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_your_key
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Server-side
SUPABASE_SERVICE_ROLE_KEY=your-service-key
STRIPE_SECRET_KEY=sk_your_secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook
RESEND_API_KEY=re_your_key
CONTACT_EMAIL=your@email.com
OPENAI_API_KEY=sk-your-openai-key
```

### 3. Update API Endpoint References

Replace Netlify function URLs with Vercel API routes:

#### Before (Netlify):
```javascript
// Netlify Functions
fetch('/.netlify/functions/contact')
fetch('/.netlify/functions/stripe-webhook')
fetch('/.netlify/functions/sitemap')
```

#### After (Vercel):
```javascript
// Vercel API Routes
fetch('/api/contact')
fetch('/api/webhook-stripe')
fetch('/api/sitemap')
```

### 4. Update Stripe Webhook Endpoint

1. Go to Stripe Dashboard → Webhooks
2. Update webhook endpoint to: `https://your-domain.vercel.app/api/webhook-stripe`
3. Test the webhook to ensure it's working

### 5. Configure Custom Domain (Optional)

1. In Vercel Dashboard → Settings → Domains
2. Add your custom domain: `peycheff.com`
3. Update DNS records as instructed by Vercel
4. SSL certificate will be automatically provisioned

### 6. Test Everything

```bash
# Test locally with Vercel CLI
npm install -g vercel
vercel dev

# Run tests
npm test

# Build test
npm run build
```

## 🔄 API Routes Migration Status

### ✅ Migrated:
- `/api/contact` - Contact form handling
- `/api/webhook-stripe` - Stripe webhook processing

### 📋 To Migrate (as needed):
- `/api/newsletter-subscribe` - Newsletter signup
- `/api/generate-sprint` - Sprint generator
- `/api/utility-tools-api` - Utility tools
- `/api/sitemap` - Dynamic sitemap
- Other functions from `netlify/functions/`

## 🧹 Netlify Cleanup

After successful Vercel deployment:

1. **Delete Netlify Site**
   - Go to Netlify Dashboard
   - Delete the peycheff.com site
   - Remove custom domain from Netlify

2. **Update DNS**
   - Point nameservers to Vercel
   - Remove Netlify DNS records

3. **Cancel Netlify Subscription**
   - Ensure no charges will continue

## 📊 Environment Variables Reference

### Development (Local):
```bash
cp .env.vercel.example .env.local
# Edit .env.local with your values
npm run dev
```

### Production (Vercel):
- Add all variables to Vercel Dashboard
- Separate values for Production and Preview branches

### Variable Security:
- **NEXT_PUBLIC_***: Exposed to browser
- **Others**: Server-side only (API routes)

## 🚀 Deployment Commands

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# View deployment logs
vercel logs

# List deployments
vercel list
```

## 📱 Post-Deployment Checklist

- [ ] Contact form works and sends emails
- [ ] Stripe payments process correctly
- [ ] Webhooks are receiving events
- [ ] Environment variables are loaded
- [ ] Analytics tracking is working
- [ ] Custom domain is active (if configured)
- [ ] SSL certificate is valid
- [ ] Site loads quickly (Lighthouse test)

## 🔧 Troubleshooting

### Common Issues:

**API Routes Not Working:**
- Check environment variables in Vercel dashboard
- Verify function exports use `export default`
- Check Vercel function logs

**Build Failures:**
- Check Node version compatibility
- Verify all dependencies installed
- Check build logs for specific errors

**Environment Variables Missing:**
- Ensure variables are added to correct environment (Production/Preview)
- Check variable names match exactly
- Restart deployment after adding variables

**Stripe Webhook Issues:**
- Verify webhook endpoint URL is correct
- Check webhook secret matches
- Test webhook in Stripe dashboard

## 📞 Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Issues**: Create GitHub issue in repository

---

**Migration Status**: ✅ Configuration complete, ready for deployment