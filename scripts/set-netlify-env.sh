#!/bin/bash

echo "🔧 Setting Netlify Environment Variables..."

# Core Services (from .env)
netlify env:set SUPABASE_URL "https://lddxeowqbjlakkosigss.supabase.co"
netlify env:set SUPABASE_SERVICE_ROLE_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkZHhlb3dxYmpsYWtrb3NpZ3NzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzE4OTkwNSwiZXhwIjoyMDcyNzY1OTA1fQ.kQwgBwgFxe5QvDfA5JezGSRrrkRcGsAjqojEydBNUpk"
netlify env:set VITE_SUPABASE_URL "https://lddxeowqbjlakkosigss.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkZHhlb3dxYmpsYWtrb3NpZ3NzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxODk5MDUsImV4cCI6MjA3Mjc2NTkwNX0.QSzMeLKo5o6y6hTasV4PMqns0o3aW_rknZTlhM1FYQQ"

# Stripe (already configured)
netlify env:set STRIPE_SECRET_KEY "$STRIPE_SECRET_KEY" # Set from environment
netlify env:set VITE_STRIPE_PUBLISHABLE_KEY "pk_test_51S4TLQ3b878SLCqiPaVQBDVsVMdwPs9mrklvNJ8IyyQDKt4XVhODdEYXtjL1IJMPcw1K4JWl6YLe8wgmxTIY1hy700E2YehUc3"

# Stripe Webhook (needs to be created)
netlify env:set STRIPE_WEBHOOK_SECRET "whsec_test_placeholder"

# Stripe Price IDs (existing)
netlify env:set VITE_STRIPE_SPRINT_GEN_PRICE_ID "price_1S4qhr3b878SLCqi7wNvgbmc"
netlify env:set VITE_STRIPE_AUDIT_PRO_PRICE_ID "price_1S4qib3b878SLCqixpXsFRhg"
netlify env:set VITE_STRIPE_UTIL_PASS_PRICE_ID "price_1S4qic3b878SLCqiQO73ne5M"
netlify env:set VITE_STRIPE_STRATEGY_CALL_PRICE_ID "price_1S4qii3b878SLCqiFzfiQHNB"
netlify env:set VITE_STRIPE_KIT_AUTOMATION_PRICE_ID "price_1S4qic3b878SLCqi3osZblBk"
netlify env:set VITE_STRIPE_MEMBER_MONTHLY_PRICE_ID "price_1S4qif3b878SLCqi7O6r2kaN"

# AI Services - PLACEHOLDER (need real keys)
netlify env:set OPENAI_API_KEY "sk-proj-placeholder-get-real-key"
netlify env:set ANTHROPIC_API_KEY "sk-ant-placeholder-get-real-key"
netlify env:set PERPLEXITY_API_KEY "pplx-placeholder-get-real-key"

# Email Service - PLACEHOLDER (need real key)
netlify env:set RESEND_API_KEY "re_placeholder_get_real_key"

# Site Configuration
netlify env:set VITE_SITE_URL "https://peycheff.com"
netlify env:set VITE_CONTACT_EMAIL "ivan@peycheff.com"

# Analytics - PLACEHOLDER
netlify env:set VITE_GA_MEASUREMENT_ID "G-PLACEHOLDER"

# Rate Limiting
netlify env:set PREVIEW_DAILY_LIMIT "5"
netlify env:set TRIAL_WEEKLY_LIMIT "10"
netlify env:set AI_GENERATION_TIMEOUT "60000"
netlify env:set MAX_GENERATION_RETRIES "3"

# Cost Control
netlify env:set DAILY_AI_BUDGET_USD "200"
netlify env:set MONTHLY_AI_BUDGET_USD "5000"

# Feature Flags
netlify env:set ENABLE_AI_GENERATION "true"
netlify env:set ENABLE_AUTOPUBLISHER "true"
netlify env:set ENABLE_UTILITY_PASS "true"
netlify env:set ENABLE_PROGRAMMATIC_SEO "true"

echo ""
echo "✅ Environment variables set!"
echo ""
echo "⚠️  IMPORTANT: You need to update these placeholders with real values:"
echo "   - OPENAI_API_KEY"
echo "   - ANTHROPIC_API_KEY"
echo "   - PERPLEXITY_API_KEY"
echo "   - RESEND_API_KEY"
echo "   - STRIPE_WEBHOOK_SECRET"
echo "   - VITE_GA_MEASUREMENT_ID"
echo ""
echo "Use: netlify env:set KEY \"value\" to update each one"
