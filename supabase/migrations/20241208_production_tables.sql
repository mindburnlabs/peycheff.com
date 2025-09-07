-- Production Tables for peycheff.com
-- Run this migration to set up all required tables

-- AI Usage Tracking
CREATE TABLE IF NOT EXISTS ai_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  model TEXT NOT NULL,
  date DATE NOT NULL,
  requests INTEGER DEFAULT 0,
  tokens INTEGER DEFAULT 0,
  cost DECIMAL(10,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(model, date)
);

-- Generated Content Storage
CREATE TABLE IF NOT EXISTS generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  purchase_id TEXT,
  type TEXT NOT NULL,
  metadata JSONB,
  file_url TEXT,
  ai_model TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchases tracking
CREATE TABLE IF NOT EXISTS purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_session_id TEXT UNIQUE,
  email TEXT NOT NULL,
  product_type TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  product_type TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Utility Tools Data
CREATE TABLE IF NOT EXISTS utm_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  original_url TEXT NOT NULL,
  tagged_url TEXT NOT NULL,
  campaign TEXT,
  source TEXT,
  medium TEXT,
  term TEXT,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS generated_threads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  original_note TEXT,
  threads JSONB,
  style TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  target TEXT,
  report JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS briefs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  project_name TEXT,
  document JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tool Usage Tracking
CREATE TABLE IF NOT EXISTS tool_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  tool TEXT NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Credits System
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  credits_remaining INTEGER DEFAULT 100,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage Counters for Rate Limiting
CREATE TABLE IF NOT EXISTS usage_counters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  sku TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  runs INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email, sku, window_start)
);

-- Research Queue for Autopublisher
CREATE TABLE IF NOT EXISTS research_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic TEXT NOT NULL,
  intent TEXT DEFAULT 'note',
  priority INTEGER DEFAULT 1,
  status TEXT DEFAULT 'queued',
  scheduled_for TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drafts for Content
CREATE TABLE IF NOT EXISTS drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  body_mdx TEXT,
  research_queue_id UUID REFERENCES research_queue(id),
  status TEXT DEFAULT 'draft',
  og_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Drip Queue for Email Automation
CREATE TABLE IF NOT EXISTS drip_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  template TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_usage_date ON ai_usage(date);
CREATE INDEX IF NOT EXISTS idx_generations_email ON generations(email);
CREATE INDEX IF NOT EXISTS idx_purchases_email ON purchases(email);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_utm_links_user ON utm_links(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_usage_user ON tool_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_counters_email ON usage_counters(email);
CREATE INDEX IF NOT EXISTS idx_research_queue_status ON research_queue(status);
CREATE INDEX IF NOT EXISTS idx_drafts_status ON drafts(status);
CREATE INDEX IF NOT EXISTS idx_drip_queue_scheduled ON drip_queue(scheduled_at);

-- RPC Functions

-- Increment usage counter with limit checking
CREATE OR REPLACE FUNCTION increment_usage(
  p_email TEXT,
  p_sku TEXT,
  p_window_start TIMESTAMPTZ,
  p_limit INTEGER
) RETURNS JSON AS $$
DECLARE
  v_current_runs INTEGER;
  v_result JSON;
BEGIN
  -- Get or create counter
  INSERT INTO usage_counters (email, sku, window_start, runs)
  VALUES (p_email, p_sku, p_window_start, 0)
  ON CONFLICT (email, sku, window_start) DO NOTHING;
  
  -- Get current runs
  SELECT runs INTO v_current_runs
  FROM usage_counters
  WHERE email = p_email 
    AND sku = p_sku 
    AND window_start = p_window_start;
  
  -- Check limit
  IF v_current_runs >= p_limit THEN
    RETURN json_build_object('success', false, 'runs', v_current_runs);
  END IF;
  
  -- Increment
  UPDATE usage_counters
  SET runs = runs + 1
  WHERE email = p_email 
    AND sku = p_sku 
    AND window_start = p_window_start
  RETURNING runs INTO v_current_runs;
  
  RETURN json_build_object('success', true, 'runs', v_current_runs);
END;
$$ LANGUAGE plpgsql;

-- Function to check subscription status
CREATE OR REPLACE FUNCTION check_subscription(p_user_id TEXT, p_product_type TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM subscriptions
    WHERE user_id = p_user_id
      AND product_type = p_product_type
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres;
