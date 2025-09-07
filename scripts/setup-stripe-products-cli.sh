#!/bin/bash

# Create Stripe Products and Prices via CLI
echo "🔧 Creating Stripe Products and Prices..."

# 30-Day Sprint Generator
echo "Creating Sprint Generator..."
SPRINT_PRODUCT=$(stripe products create \
  --name="30-Day Sprint Generator" \
  --description="AI-powered personalized 30-day sprint plan with PDF delivery" \
  --metadata="type=digital" \
  --metadata="delivery=instant" \
  --format=json | jq -r '.id')

SPRINT_PRICE=$(stripe prices create \
  --product="$SPRINT_PRODUCT" \
  --unit-amount=3900 \
  --currency=usd \
  --metadata="product_type=sprint_generator" \
  --format=json | jq -r '.id')

echo "Sprint Generator Price ID: $SPRINT_PRICE"

# Auto-Audit Pro
echo "Creating Auto-Audit Pro..."
AUDIT_PRODUCT=$(stripe products create \
  --name="Auto-Audit Pro" \
  --description="Instant website audit with 7-day action plan" \
  --metadata="type=digital" \
  --format=json | jq -r '.id')

AUDIT_PRICE=$(stripe prices create \
  --product="$AUDIT_PRODUCT" \
  --unit-amount=6900 \
  --currency=usd \
  --metadata="product_type=audit_pro" \
  --format=json | jq -r '.id')

echo "Auto-Audit Pro Price ID: $AUDIT_PRICE"

# Utility Pass Monthly
echo "Creating Utility Pass..."
UTILITY_PRODUCT=$(stripe products create \
  --name="Utility Pass" \
  --description="Access to all AI-powered utility tools" \
  --metadata="type=subscription" \
  --format=json | jq -r '.id')

UTILITY_PRICE=$(stripe prices create \
  --product="$UTILITY_PRODUCT" \
  --unit-amount=1200 \
  --currency=usd \
  --recurring="interval=month" \
  --metadata="product_type=utility_pass" \
  --format=json | jq -r '.id')

echo "Utility Pass Price ID: $UTILITY_PRICE"

# Strategy Call
echo "Creating Strategy Call..."
CALL_PRODUCT=$(stripe products create \
  --name="Strategy Call" \
  --description="60-90 minute strategy session with action plan" \
  --metadata="type=service" \
  --format=json | jq -r '.id')

CALL_PRICE=$(stripe prices create \
  --product="$CALL_PRODUCT" \
  --unit-amount=19900 \
  --currency=usd \
  --metadata="product_type=strategy_call" \
  --format=json | jq -r '.id')

echo "Strategy Call Price ID: $CALL_PRICE"

# Micro-Automation Kit
echo "Creating Automation Kit..."
KIT_PRODUCT=$(stripe products create \
  --name="Micro-Automation Kit" \
  --description="4 automation playbooks with scripts and templates" \
  --metadata="type=digital" \
  --format=json | jq -r '.id')

KIT_PRICE=$(stripe prices create \
  --product="$KIT_PRODUCT" \
  --unit-amount=7900 \
  --currency=usd \
  --metadata="product_type=automation_kit" \
  --format=json | jq -r '.id')

echo "Automation Kit Price ID: $KIT_PRICE"

# Build Notes Membership
echo "Creating Build Notes Membership..."
MEMBER_PRODUCT=$(stripe products create \
  --name="Build Notes Membership" \
  --description="2 operator memos per month + early access" \
  --metadata="type=subscription" \
  --format=json | jq -r '.id')

MEMBER_PRICE=$(stripe prices create \
  --product="$MEMBER_PRODUCT" \
  --unit-amount=900 \
  --currency=usd \
  --recurring="interval=month" \
  --metadata="product_type=membership" \
  --format=json | jq -r '.id')

echo "Membership Price ID: $MEMBER_PRICE"

# Output all price IDs for .env
echo ""
echo "✅ Add these to your .env file:"
echo ""
echo "VITE_STRIPE_SPRINT_GEN_PRICE_ID=$SPRINT_PRICE"
echo "VITE_STRIPE_AUDIT_PRO_PRICE_ID=$AUDIT_PRICE"
echo "VITE_STRIPE_UTIL_PASS_PRICE_ID=$UTILITY_PRICE"
echo "VITE_STRIPE_STRATEGY_CALL_PRICE_ID=$CALL_PRICE"
echo "VITE_STRIPE_KIT_AUTOMATION_PRICE_ID=$KIT_PRICE"
echo "VITE_STRIPE_MEMBER_MONTHLY_PRICE_ID=$MEMBER_PRICE"

# Save to file
cat > stripe-price-ids.txt << EOF
VITE_STRIPE_SPRINT_GEN_PRICE_ID=$SPRINT_PRICE
VITE_STRIPE_AUDIT_PRO_PRICE_ID=$AUDIT_PRICE
VITE_STRIPE_UTIL_PASS_PRICE_ID=$UTILITY_PRICE
VITE_STRIPE_STRATEGY_CALL_PRICE_ID=$CALL_PRICE
VITE_STRIPE_KIT_AUTOMATION_PRICE_ID=$KIT_PRICE
VITE_STRIPE_MEMBER_MONTHLY_PRICE_ID=$MEMBER_PRICE
EOF

echo ""
echo "Price IDs saved to stripe-price-ids.txt"
