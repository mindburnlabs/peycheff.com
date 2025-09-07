-- peycheff.com Autopilot Schema
-- Drop-in SQL for complete automation system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS downloads CASCADE;
DROP TABLE IF EXISTS entitlements CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS drafts CASCADE;
DROP TABLE IF EXISTS research_queue CASCADE;
DROP VIEW IF EXISTS has_membership CASCADE;

-- =============================================================================
-- CORE TABLES
-- =============================================================================

-- Customer identities
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  handle TEXT, -- LinkedIn, Twitter, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Commerce orders from Stripe
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL REFERENCES customers(email) ON DELETE CASCADE,
  sku TEXT NOT NULL, -- CALL_60, PACK_30DAY, MEMBER_MONTHLY, etc.
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  source TEXT, -- UTM or referral source
  metadata JSONB DEFAULT '{}', -- Additional Stripe metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer entitlements (what they have access to)
CREATE TABLE entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL REFERENCES customers(email) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  expires_at TIMESTAMPTZ, -- NULL for lifetime access
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email, sku) -- One entitlement per SKU per customer
);

-- Download links with expiration
CREATE TABLE downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL REFERENCES customers(email) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Supabase Storage path
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  downloaded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- CONTENT AUTOMATION TABLES
-- =============================================================================

-- Research queue for autopilot content
CREATE TABLE research_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  intent TEXT CHECK (intent IN ('note', 'kit', 'diagram')) NOT NULL,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'researching', 'drafted', 'editing', 'ready', 'published')),
  research_data JSONB, -- Perplexity results
  priority INTEGER DEFAULT 0,
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content drafts
CREATE TABLE drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE,
  title TEXT,
  summary TEXT,
  body_mdx TEXT,
  og_path TEXT, -- Path to OG image in storage
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'published')),
  published_at TIMESTAMPTZ,
  research_queue_id UUID REFERENCES research_queue(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schedule slots for auto-scheduling
CREATE TABLE schedule_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'strategy_call', 'office_hours', etc.
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'America/New_York',
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'completed', 'cancelled')),
  customer_email TEXT REFERENCES customers(email) ON DELETE SET NULL,
  sku TEXT,
  reserved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personalization requests and responses
CREATE TABLE personalizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  sku TEXT NOT NULL,
  customer_email TEXT NOT NULL REFERENCES customers(email) ON DELETE CASCADE,
  order_id UUID,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  answers JSONB,
  delivered_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Intake forms for deposit services
CREATE TABLE intake_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  sku TEXT NOT NULL,
  customer_email TEXT NOT NULL REFERENCES customers(email) ON DELETE CASCADE,
  order_id UUID,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  responses JSONB,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- UTILITY VIEWS
-- =============================================================================

-- Membership status view
CREATE OR REPLACE VIEW has_membership AS
SELECT 
  email,
  BOOL_OR(sku IN ('MEMBER_MONTHLY', 'MEMBER_ANNUAL')) AS is_member,
  BOOL_OR(sku IN ('MEMBER_MONTHLY', 'MEMBER_ANNUAL') AND (expires_at IS NULL OR expires_at > NOW())) AS is_active_member
FROM entitlements 
GROUP BY email;

-- Active entitlements view
CREATE OR REPLACE VIEW active_entitlements AS
SELECT *
FROM entitlements 
WHERE expires_at IS NULL OR expires_at > NOW();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_forms ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (for backend functions)
CREATE POLICY "Service role full access" ON customers FOR ALL USING (true);
CREATE POLICY "Service role full access" ON orders FOR ALL USING (true);
CREATE POLICY "Service role full access" ON entitlements FOR ALL USING (true);
CREATE POLICY "Service role full access" ON downloads FOR ALL USING (true);
CREATE POLICY "Service role full access" ON research_queue FOR ALL USING (true);
CREATE POLICY "Service role full access" ON drafts FOR ALL USING (true);
CREATE POLICY "Service role full access" ON schedule_slots FOR ALL USING (true);
CREATE POLICY "Service role full access" ON personalizations FOR ALL USING (true);
CREATE POLICY "Service role full access" ON intake_forms FOR ALL USING (true);

-- Downloads restricted to owner's email
CREATE POLICY "Downloads own email only" ON downloads FOR SELECT USING (
  email = current_setting('request.jwt.claims', true)::json->>'email'
);

-- Drafts are publicly readable if published
CREATE POLICY "Published drafts public read" ON drafts FOR SELECT USING (status = 'published');

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Customers
CREATE INDEX idx_customers_email ON customers(email);

-- Orders
CREATE INDEX idx_orders_email ON orders(email);
CREATE INDEX idx_orders_sku ON orders(sku);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Entitlements
CREATE INDEX idx_entitlements_email ON entitlements(email);
CREATE INDEX idx_entitlements_sku ON entitlements(sku);
CREATE INDEX idx_entitlements_expires_at ON entitlements(expires_at) WHERE expires_at IS NOT NULL;

-- Downloads
CREATE INDEX idx_downloads_email ON downloads(email);
CREATE INDEX idx_downloads_token ON downloads(token);
CREATE INDEX idx_downloads_expires_at ON downloads(expires_at);

-- Research queue
CREATE INDEX idx_research_queue_status ON research_queue(status);
CREATE INDEX idx_research_queue_scheduled_for ON research_queue(scheduled_for);

-- Drafts
CREATE INDEX idx_drafts_slug ON drafts(slug);
CREATE INDEX idx_drafts_status ON drafts(status);
CREATE INDEX idx_drafts_published_at ON drafts(published_at) WHERE published_at IS NOT NULL;

-- Schedule slots
CREATE INDEX idx_schedule_slots_type ON schedule_slots(type);
CREATE INDEX idx_schedule_slots_status ON schedule_slots(status);
CREATE INDEX idx_schedule_slots_start_time ON schedule_slots(start_time);
CREATE INDEX idx_schedule_slots_customer_email ON schedule_slots(customer_email);

-- Personalizations
CREATE INDEX idx_personalizations_token ON personalizations(token);
CREATE INDEX idx_personalizations_customer_email ON personalizations(customer_email);
CREATE INDEX idx_personalizations_status ON personalizations(status);
CREATE INDEX idx_personalizations_expires_at ON personalizations(expires_at);

-- Intake forms
CREATE INDEX idx_intake_forms_token ON intake_forms(token);
CREATE INDEX idx_intake_forms_customer_email ON intake_forms(customer_email);
CREATE INDEX idx_intake_forms_status ON intake_forms(status);
CREATE INDEX idx_intake_forms_expires_at ON intake_forms(expires_at);

-- =============================================================================
-- FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Update updated_at timestamp for drafts
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_drafts_updated_at 
  BEFORE UPDATE ON drafts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- SAMPLE DATA (for development)
-- =============================================================================

-- Insert sample research topics
INSERT INTO research_queue (topic, intent) VALUES
  ('AI-First Product Development', 'note'),
  ('Founder Operating Systems', 'note'),
  ('Zero-Touch Automation Playbook', 'kit'),
  ('Revenue Architecture Diagrams', 'diagram')
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Autopilot schema created successfully! 🚀';
  RAISE NOTICE 'Tables: customers, orders, entitlements, downloads, research_queue, drafts';
  RAISE NOTICE 'Views: has_membership, active_entitlements';
  RAISE NOTICE 'RLS enabled with service role policies';
END $$;
