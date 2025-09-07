#!/bin/bash

# Stripe Test API Key - Must be set as environment variable
API_KEY="${STRIPE_SECRET_KEY}"

echo "🚀 Creating Stripe products and prices..."

# Sprint Generator (already created)
echo "Sprint Generator Price: price_1S4qhr3b878SLCqi7wNvgbmc"

# Auto-Audit Pro
echo "Creating Auto-Audit Pro..."
AUDIT_PRODUCT=$(curl -s https://api.stripe.com/v1/products \
  -u $API_KEY: \
  -d name="Auto-Audit Pro" \
  -d description="Professional website audit with actionable recommendations" | jq -r '.id')
AUDIT_PRICE=$(curl -s https://api.stripe.com/v1/prices \
  -u $API_KEY: \
  -d product="$AUDIT_PRODUCT" \
  -d unit_amount=14700 \
  -d currency=usd | jq -r '.id')
echo "Audit Pro Price: $AUDIT_PRICE"

# Utility Pass Monthly
echo "Creating Utility Pass Monthly..."
UTIL_PRODUCT=$(curl -s https://api.stripe.com/v1/products \
  -u $API_KEY: \
  -d name="Utility Pass" \
  -d description="Monthly subscription to all utility tools" | jq -r '.id')
UTIL_PRICE=$(curl -s https://api.stripe.com/v1/prices \
  -u $API_KEY: \
  -d product="$UTIL_PRODUCT" \
  -d unit_amount=1900 \
  -d currency=usd \
  -d "recurring[interval]=month" | jq -r '.id')
echo "Utility Pass Price: $UTIL_PRICE"

# Agent Kit Bundle
echo "Creating Agent Kit Bundle..."
AGENT_PRODUCT=$(curl -s https://api.stripe.com/v1/products \
  -u $API_KEY: \
  -d name="Agent Kit Bundle" \
  -d description="Complete AI agent framework and templates" | jq -r '.id')
AGENT_PRICE=$(curl -s https://api.stripe.com/v1/prices \
  -u $API_KEY: \
  -d product="$AGENT_PRODUCT" \
  -d unit_amount=49700 \
  -d currency=usd | jq -r '.id')
echo "Agent Kit Price: $AGENT_PRICE"

# Operator Pack
echo "Creating Operator Pack..."
OPERATOR_PRODUCT=$(curl -s https://api.stripe.com/v1/products \
  -u $API_KEY: \
  -d name="Operator Pack" \
  -d description="Sprint Generator + Audit Pro bundle" | jq -r '.id')
OPERATOR_PRICE=$(curl -s https://api.stripe.com/v1/prices \
  -u $API_KEY: \
  -d product="$OPERATOR_PRODUCT" \
  -d unit_amount=19700 \
  -d currency=usd | jq -r '.id')
echo "Operator Pack Price: $OPERATOR_PRICE"

# Founder Pack
echo "Creating Founder Pack..."
FOUNDER_PRODUCT=$(curl -s https://api.stripe.com/v1/products \
  -u $API_KEY: \
  -d name="Founder Pack" \
  -d description="All tools + Agent Kit + lifetime updates" | jq -r '.id')
FOUNDER_PRICE=$(curl -s https://api.stripe.com/v1/prices \
  -u $API_KEY: \
  -d product="$FOUNDER_PRODUCT" \
  -d unit_amount=79700 \
  -d currency=usd | jq -r '.id')
echo "Founder Pack Price: $FOUNDER_PRICE"

# Build Notes Monthly
echo "Creating Build Notes Monthly..."
BUILD_MONTHLY_PRODUCT=$(curl -s https://api.stripe.com/v1/products \
  -u $API_KEY: \
  -d name="Build Notes Monthly" \
  -d description="Monthly Build Notes membership" | jq -r '.id')
BUILD_MONTHLY_PRICE=$(curl -s https://api.stripe.com/v1/prices \
  -u $API_KEY: \
  -d product="$BUILD_MONTHLY_PRODUCT" \
  -d unit_amount=3900 \
  -d currency=usd \
  -d "recurring[interval]=month" | jq -r '.id')
echo "Build Notes Monthly Price: $BUILD_MONTHLY_PRICE"

# Build Notes Annual
echo "Creating Build Notes Annual..."
BUILD_ANNUAL_PRODUCT=$(curl -s https://api.stripe.com/v1/products \
  -u $API_KEY: \
  -d name="Build Notes Annual" \
  -d description="Annual Build Notes membership" | jq -r '.id')
BUILD_ANNUAL_PRICE=$(curl -s https://api.stripe.com/v1/prices \
  -u $API_KEY: \
  -d product="$BUILD_ANNUAL_PRODUCT" \
  -d unit_amount=39000 \
  -d currency=usd \
  -d "recurring[interval]=year" | jq -r '.id')
echo "Build Notes Annual Price: $BUILD_ANNUAL_PRICE"

# Build Notes Pro
echo "Creating Build Notes Pro..."
BUILD_PRO_PRODUCT=$(curl -s https://api.stripe.com/v1/products \
  -u $API_KEY: \
  -d name="Build Notes Pro" \
  -d description="Pro Build Notes membership with advisory access" | jq -r '.id')
BUILD_PRO_PRICE=$(curl -s https://api.stripe.com/v1/prices \
  -u $API_KEY: \
  -d product="$BUILD_PRO_PRODUCT" \
  -d unit_amount=29700 \
  -d currency=usd \
  -d "recurring[interval]=month" | jq -r '.id')
echo "Build Notes Pro Price: $BUILD_PRO_PRICE"

# Strategy Call
echo "Creating Strategy Call..."
STRATEGY_PRODUCT=$(curl -s https://api.stripe.com/v1/products \
  -u $API_KEY: \
  -d name="Strategy Call" \
  -d description="90-minute product strategy consultation" | jq -r '.id')
STRATEGY_PRICE=$(curl -s https://api.stripe.com/v1/prices \
  -u $API_KEY: \
  -d product="$STRATEGY_PRODUCT" \
  -d unit_amount=75000 \
  -d currency=usd | jq -r '.id')
echo "Strategy Call Price: $STRATEGY_PRICE"

# Sparring Session (Order Bump)
echo "Creating Sparring Session..."
SPARRING_PRODUCT=$(curl -s https://api.stripe.com/v1/products \
  -u $API_KEY: \
  -d name="Sparring Session" \
  -d description="60-minute product review and feedback session" | jq -r '.id')
SPARRING_PRICE=$(curl -s https://api.stripe.com/v1/prices \
  -u $API_KEY: \
  -d product="$SPARRING_PRODUCT" \
  -d unit_amount=29700 \
  -d currency=usd | jq -r '.id')
echo "Sparring Session Price: $SPARRING_PRICE"

echo ""
echo "✅ All products created!"
echo ""
echo "Add these to your .env file:"
echo ""
echo "# One-time products"
echo "VITE_STRIPE_SPRINT_GEN_PRICE_ID=price_1S4qhr3b878SLCqi7wNvgbmc"
echo "VITE_STRIPE_AUDIT_PRO_PRICE_ID=$AUDIT_PRICE"
echo "VITE_STRIPE_AGENT_BUNDLE_PRICE_ID=$AGENT_PRICE"
echo "VITE_STRIPE_OPERATOR_PACK_PRICE_ID=$OPERATOR_PRICE"
echo "VITE_STRIPE_FOUNDER_PACK_PRICE_ID=$FOUNDER_PRICE"
echo "VITE_STRIPE_STRATEGY_CALL_PRICE_ID=$STRATEGY_PRICE"
echo "VITE_STRIPE_SPARRING_SESSION_PRICE_ID=$SPARRING_PRICE"
echo ""
echo "# Subscriptions"
echo "VITE_STRIPE_UTIL_PASS_PRICE_ID=$UTIL_PRICE"
echo "VITE_STRIPE_MEMBER_MONTHLY_PRICE_ID=$BUILD_MONTHLY_PRICE"
echo "VITE_STRIPE_MEMBER_ANNUAL_PRICE_ID=$BUILD_ANNUAL_PRICE"
echo "VITE_STRIPE_MEMBER_PRO_PRICE_ID=$BUILD_PRO_PRICE"
