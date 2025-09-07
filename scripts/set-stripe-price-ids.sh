#!/bin/bash

echo "🔐 Setting Stripe Price IDs in Netlify..."

# One-time products
netlify env:set VITE_STRIPE_SPRINT_GEN_PRICE_ID price_1S4qhr3b878SLCqi7wNvgbmc
netlify env:set VITE_STRIPE_AUDIT_PRO_PRICE_ID price_1S4qib3b878SLCqixpXsFRhg
netlify env:set VITE_STRIPE_AGENT_BUNDLE_PRICE_ID price_1S4qic3b878SLCqi3osZblBk
netlify env:set VITE_STRIPE_OPERATOR_PACK_PRICE_ID price_1S4qid3b878SLCqiCqWj4REr
netlify env:set VITE_STRIPE_FOUNDER_PACK_PRICE_ID price_1S4qie3b878SLCqiYFZy7kE2
netlify env:set VITE_STRIPE_STRATEGY_CALL_PRICE_ID price_1S4qii3b878SLCqiFzfiQHNB
netlify env:set VITE_STRIPE_SPARRING_SESSION_PRICE_ID price_1S4qij3b878SLCqiIk79ri3P

# Subscriptions
netlify env:set VITE_STRIPE_UTIL_PASS_PRICE_ID price_1S4qic3b878SLCqiQO73ne5M
netlify env:set VITE_STRIPE_MEMBER_MONTHLY_PRICE_ID price_1S4qif3b878SLCqi7O6r2kaN
netlify env:set VITE_STRIPE_MEMBER_ANNUAL_PRICE_ID price_1S4qig3b878SLCqi41jxM5to
netlify env:set VITE_STRIPE_MEMBER_PRO_PRICE_ID price_1S4qih3b878SLCqigsNqYps1

# Note: Stripe keys should be set separately via secure methods
# netlify env:set VITE_STRIPE_PUBLISHABLE_KEY your-publishable-key
# netlify env:set STRIPE_SECRET_KEY your-secret-key

echo "✅ All Stripe Price IDs set in Netlify!"
