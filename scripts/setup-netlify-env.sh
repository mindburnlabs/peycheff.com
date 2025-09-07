#!/bin/bash

# Set Netlify Environment Variables
# Note: Replace placeholder values with actual keys before running

echo "🔐 Setting Netlify environment variables..."

# Core API Keys (REPLACE WITH ACTUAL VALUES)
netlify env:set OPENAI_API_KEY "sk-proj-YOUR_OPENAI_KEY_HERE"
netlify env:set RESEND_API_KEY "re_YOUR_RESEND_KEY_HERE"
netlify env:set STRIPE_SECRET_KEY "sk_test_YOUR_STRIPE_SECRET_KEY"
netlify env:set STRIPE_WEBHOOK_SECRET "whsec_YOUR_WEBHOOK_SECRET"
netlify env:set SUPABASE_URL "https://lddxeowqbjlakkosigss.supabase.co"
netlify env:set SUPABASE_SERVICE_ROLE_KEY "YOUR_SUPABASE_SERVICE_ROLE_KEY"

# Public env vars (these are okay to be public)
netlify env:set VITE_SUPABASE_URL "https://lddxeowqbjlakkosigss.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkZHhlb3dxYmpsYWtrb3NpZ3NzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxODk5MDUsImV4cCI6MjA3Mjc2NTkwNX0.QSzMeLKo5o6y6hTasV4PMqns0o3aW_rknZTlhM1FYQQ"

# Site configuration
netlify env:set VITE_SITE_URL "https://peycheff.com"
netlify env:set URL "https://peycheff.com"
netlify env:set VITE_CONTACT_EMAIL "ivan@peycheff.com"

# Feature flags
netlify env:set PREVIEW_EMAIL_GATE "false"
netlify env:set PREVIEW_DAILY_LIMIT "10"

# Admin/Security
netlify env:set TRIGGER_SECRET "$(openssl rand -base64 32)"
netlify env:set ADMIN_KEY "$(openssl rand -base64 32)"

echo "✅ Environment variables set!"
echo ""
echo "⚠️  IMPORTANT: You still need to:"
echo "1. Add your actual API keys by replacing placeholder values"
echo "2. Add Stripe Price IDs after running setup-stripe-products.sh"
echo "3. Configure webhook endpoint in Stripe Dashboard: https://peycheff.com/.netlify/functions/stripe-webhook"
