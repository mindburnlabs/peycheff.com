# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Development
```bash
# Start development server (runs on port 4028)
npm start

# Build for production
npm run build

# Preview production build
npm run serve
```

### Testing
```bash
# Run tests in watch mode
npm test

# Run tests with UI
npm test:ui

# Run tests once (CI mode)
npm test:run
```

### Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Required client-side environment variables:
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-key
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-key
VITE_GA_MEASUREMENT_ID=your-ga4-id

# Required serverless function environment variables (backend only):
RESEND_API_KEY=re_your_api_key_here
STRIPE_SECRET_KEY=sk_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Email Integration Testing
```bash
# Test email service setup
node test-email-integration.js
```

## Architecture Overview

### Tech Stack
- **React 18** with modern hooks and patterns
- **Vite** for blazing-fast development and builds
- **Tailwind CSS** with extensive Apple-grade design system
- **Supabase** for database (subscribers, inquiries)
- **Stripe** for payments (multiple products/subscriptions)
- **Resend** for email notifications (serverless functions)
- **Netlify Functions** for serverless backend
- **React Router DOM 6** for routing
- **Vitest** for testing

### Project Structure
```
src/
├── components/           # Reusable UI components
│   ├── layout/          # Header, Footer, Layout, NowBar
│   └── ui/              # Form components, buttons
├── pages/               # Route components organized by feature
│   ├── home-landing/    # Home page components
│   ├── about-profile/   # About page components  
│   ├── work-portfolio/  # Work portfolio components
│   ├── notes-content-hub/ # Notes/content components
│   ├── advisory-services/ # Advisory services components
│   └── contact-inquiry/ # Contact form components
├── lib/                 # Service integrations
│   ├── supabase.js      # Database client with helper functions
│   ├── stripe.js        # Payment processing with 11 product types
│   └── analytics.js     # GA4 tracking and events
├── utils/               # Utilities (cn.js, animations)
netlify/
└── functions/           # Serverless functions
    ├── contact-inquiry.js      # Contact form email notifications
    ├── newsletter-subscribe.js # Newsletter subscription with welcome emails
    ├── stripe-webhook.js       # Stripe webhook handler for purchase emails
    └── lib/
        └── email-service.js    # Email templates and sending utilities
```

### Key Architectural Decisions

#### Design System
- **Locked Visual System**: Single SF-first font stack, one accent color (#0A84FF)
- **Apple-grade Tailwind Config**: Custom color palette, typography scale, 8px baseline grid
- **Motion**: 120-160ms timing, opacity/translate only
- **Max Width**: 1080px container with responsive padding

#### Database Schema (Supabase)
- `subscribers` table: email, source, status, subscribed_at
- `inquiries` table: contact form submissions with all fields
- Both tables use UUID primary keys and RLS policies

#### Stripe Integration
- **11 Product Types**: Strategy calls, sparring sessions, digital products, subscriptions
- **Environment-based Price IDs**: Each product has a VITE_STRIPE_*_PRICE_ID env var
- **Client-side Checkout**: Uses Stripe's redirectToCheckout() method
- **Webhook Handler**: Serverless function processes successful payments
- **Purchase Confirmation Emails**: Automated via Resend API
- **Analytics Integration**: Tracks checkout starts/errors

#### Email Integration (Resend + Netlify Functions)
- **Contact Form Notifications**: Sends email to Ivan + confirmation to sender
- **Newsletter Subscriptions**: Welcome email with onboarding content
- **Purchase Confirmations**: Detailed receipts and next steps for customers
- **Service Bookings**: Automatic notifications for scheduling sessions
- **Apple-grade Email Templates**: Responsive HTML with consistent branding

#### Component Organization
- **Feature-based Pages**: Each major page has its own directory with components
- **Shared Layout**: Header/Footer/Layout components handle global UI
- **Route-level Components**: Main page components import from feature directories

## Development Guidelines

### Styling
- Use Tailwind utilities exclusively - no custom CSS
- Follow the locked color system (bg-background, text-foreground, accent)
- Stick to the typography scale (text-h1, text-h2, text-body, etc.)
- Use Apple-style animations (animate-fade-in, animate-slide-up)

### Components
- Keep components small and focused
- Use React hooks (useState, useEffect) over class components
- Implement error boundaries for robust error handling
- Follow the existing naming conventions (PascalCase for components)

### Services Integration
- **Supabase**: Use the helper functions in `src/lib/supabase.js` (addSubscriber, addInquiry)
- **Stripe**: Reference products via STRIPE_PRODUCTS keys, not hardcoded values
- **Analytics**: Use EVENTS constants and trackEvent() function

### Testing
- Tests are in `__tests__` directories adjacent to components
- Use React Testing Library patterns
- Test user interactions, not implementation details
- Run tests before committing changes

## Environment-Specific Notes

### Development
- Runs on port 4028 (configured in vite.config.mjs)
- Hot reload enabled for all file types
- Source maps generated for debugging

### Production
- Builds to `/build` directory (not `/dist`)
- Netlify deployment with automatic SSL
- Environment variables managed in Netlify dashboard
- Google Analytics 4 for tracking

### Critical Dependencies
The package.json includes a `rocketCritical` section marking dependencies that are **essential for app functionality**. Do not remove or modify:
- React ecosystem (@dhiwise/component-tagger, react, react-dom)
- State management (@reduxjs/toolkit, redux) 
- Routing (react-router-dom)
- Build tools (vite, @vitejs/plugin-react, tailwindcss)

## Service Dependencies

### Required External Services
- **Supabase**: Database for subscribers and inquiries
- **Stripe**: Payment processing for 11 different products
- **Resend**: Email notifications for form submissions
- **Google Analytics**: Event tracking and user analytics
- **Netlify**: Hosting and deployment

### Service Configuration
Each service requires specific environment variables. Missing variables will cause runtime errors. Check `.env.example` for the complete list.

## Performance Considerations
- Vite's chunk size warning limit set to 2000kb
- Component lazy loading not implemented (all routes load immediately)
- Images should be optimized and placed in `/public/images/`
- Tailwind CSS is purged automatically by Vite
