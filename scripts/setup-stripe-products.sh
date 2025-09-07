#!/bin/bash

# Setup Stripe Products for peycheff.com
# Run with: bash scripts/setup-stripe-products.sh

echo "🚀 Setting up Stripe products for peycheff.com..."

# Create Sprint Generator Product
echo "Creating Sprint Generator..."
SPRINT_GEN=$(stripe products create \
  --name="Auto-Sprint Plan Generator" \
  --description="Personalized 30-day sprint plan. AI-generated in 60 seconds." \
  --metadata[sku]="SPRINT_GEN" \
  --json | grep -o '"id": "[^"]*' | grep -o '[^"]*$' | head -1)

SPRINT_GEN_PRICE=$(stripe prices create \
  --product="$SPRINT_GEN" \
  --unit-amount=4900 \
  --currency=usd \
  --json | grep -o '"id": "[^"]*' | grep -o '[^"]*$' | head -1)

echo "Sprint Generator Price ID: $SPRINT_GEN_PRICE"

# Create Auto-Audit Pro Product
echo "Creating Auto-Audit Pro..."
AUDIT_PRO=$(stripe products create \
  --name="Auto-Audit Pro" \
  --description="URL analysis with AI-powered audit generation and shareable reports." \
  --metadata[sku]="AUDIT_PRO" \
  --json | grep -o '"id": "[^"]*' | grep -o '[^"]*$' | head -1)

AUDIT_PRO_PRICE=$(stripe prices create \
  --product="$AUDIT_PRO" \
  --unit-amount=9900 \
  --currency=usd \
  --json | grep -o '"id": "[^"]*' | grep -o '[^"]*$' | head -1)

echo "Audit Pro Price ID: $AUDIT_PRO_PRICE"

# Create Utility Pass Product (Subscription)
echo "Creating Utility Pass..."
UTIL_PASS=$(stripe products create \
  --name="Utility Pass" \
  --description="Access to all AI utility tools. Monthly subscription." \
  --metadata[sku]="UTIL_PASS" \
  --json | grep -o '"id": "[^"]*' | grep -o '[^"]*$' | head -1)

UTIL_PASS_PRICE=$(stripe prices create \
  --product="$UTIL_PASS" \
  --unit-amount=1200 \
  --currency=usd \
  --recurring[interval]=month \
  --json | grep -o '"id": "[^"]*' | grep -o '[^"]*$' | head -1)

echo "Utility Pass Price ID: $UTIL_PASS_PRICE"

# Create Agent Kit Bundle Product
echo "Creating Agent Kit Bundle..."
AGENT_BUNDLE=$(stripe products create \
  --name="Agent Kit Bundle" \
  --description="n8n templates + MCP connectors + automation flows." \
  --metadata[sku]="AGENT_BUNDLE" \
  --json | grep -o '"id": "[^"]*' | grep -o '[^"]*$' | head -1)

AGENT_BUNDLE_PRICE=$(stripe prices create \
  --product="$AGENT_BUNDLE" \
  --unit-amount=7900 \
  --currency=usd \
  --json | grep -o '"id": "[^"]*' | grep -o '[^"]*$' | head -1)

echo "Agent Bundle Price ID: $AGENT_BUNDLE_PRICE"

# Create Operator Pack Product
echo "Creating Operator Pack..."
OPERATOR_PACK=$(stripe products create \
  --name="Operator Pack" \
  --description="Canonical 30-day operating system. PDF/MDX." \
  --metadata[sku]="OPERATOR_PACK" \
  --json | grep -o '"id": "[^"]*' | grep -o '[^"]*$' | head -1)

OPERATOR_PACK_PRICE=$(stripe prices create \
  --product="$OPERATOR_PACK" \
  --unit-amount=3900 \
  --currency=usd \
  --json | grep -o '"id": "[^"]*' | grep -o '[^"]*$' | head -1)

echo "Operator Pack Price ID: $OPERATOR_PACK_PRICE"

# Create Founder Pack Product
echo "Creating Founder Pack..."
FOUNDER_PACK=$(stripe products create \
  --name="Founder Pack" \
  --description="Everything you need to ship. Sprint + Audit + Tools + Membership." \
  --metadata[sku]="FOUNDER_PACK" \
  --json | grep -o '"id": "[^"]*' | grep -o '[^"]*$' | head -1)

FOUNDER_PACK_PRICE=$(stripe prices create \
  --product="$FOUNDER_PACK" \
  --unit-amount=14900 \
  --currency=usd \
  --json | grep -o '"id": "[^"]*' | grep -o '[^"]*$' | head -1)

echo "Founder Pack Price ID: $FOUNDER_PACK_PRICE"

# Create Build Notes Memberships
echo "Creating Build Notes Monthly..."
MEMBER_MONTHLY=$(stripe products create \
  --name="Build Notes Membership" \
  --description="2 operator memos/month + early access to Kits." \
  --metadata[sku]="MEMBER_MONTHLY" \
  --json | grep -o '"id": "[^"]*' | grep -o '[^"]*$' | head -1)

MEMBER_MONTHLY_PRICE=$(stripe prices create \
  --product="$MEMBER_MONTHLY" \
  --unit-amount=900 \
  --currency=usd \
  --recurring[interval]=month \
  --json | grep -o '"id": "[^"]*' | grep -o '[^"]*$' | head -1)

echo "Member Monthly Price ID: $MEMBER_MONTHLY_PRICE"

echo "Creating Build Notes Annual..."
MEMBER_ANNUAL=$(stripe products create \
  --name="Build Notes Membership (Annual)" \
  --description="2 operator memos/month + early Kit access. Save $18/year." \
  --metadata[sku]="MEMBER_ANNUAL" \
  --json | grep -o '"id": "[^"]*' | grep -o '[^"]*$' | head -1)

MEMBER_ANNUAL_PRICE=$(stripe prices create \
  --product="$MEMBER_ANNUAL" \
  --unit-amount=9000 \
  --currency=usd \
  --recurring[interval]=year \
  --json | grep -o '"id": "[^"]*' | grep -o '[^"]*$' | head -1)

echo "Member Annual Price ID: $MEMBER_ANNUAL_PRICE"

echo "Creating Build Notes Pro..."
MEMBER_PRO=$(stripe products create \
  --name="Build Notes Pro" \
  --description="2 operator memos/month + unlimited re-gens + Pro utilities." \
  --metadata[sku]="MEMBER_PRO" \
  --json | grep -o '"id": "[^"]*' | grep -o '[^"]*$' | head -1)

MEMBER_PRO_PRICE=$(stripe prices create \
  --product="$MEMBER_PRO" \
  --unit-amount=2900 \
  --currency=usd \
  --recurring[interval]=month \
  --json | grep -o '"id": "[^"]*' | grep -o '[^"]*$' | head -1)

echo "Member Pro Price ID: $MEMBER_PRO_PRICE"

# Output all price IDs for environment variables
echo ""
echo "✅ All products created! Add these to your .env file:"
echo ""
echo "# Stripe Product Price IDs"
echo "VITE_STRIPE_SPRINT_GEN_PRICE_ID=$SPRINT_GEN_PRICE"
echo "VITE_STRIPE_AUDIT_PRO_PRICE_ID=$AUDIT_PRO_PRICE"
echo "VITE_STRIPE_UTIL_PASS_PRICE_ID=$UTIL_PASS_PRICE"
echo "VITE_STRIPE_AGENT_BUNDLE_PRICE_ID=$AGENT_BUNDLE_PRICE"
echo "VITE_STRIPE_OPERATOR_PACK_PRICE_ID=$OPERATOR_PACK_PRICE"
echo "VITE_STRIPE_FOUNDER_PACK_PRICE_ID=$FOUNDER_PACK_PRICE"
echo "VITE_STRIPE_MEMBER_MONTHLY_PRICE_ID=$MEMBER_MONTHLY_PRICE"
echo "VITE_STRIPE_MEMBER_ANNUAL_PRICE_ID=$MEMBER_ANNUAL_PRICE"
echo "VITE_STRIPE_MEMBER_PRO_PRICE_ID=$MEMBER_PRO_PRICE"
