-- Live Now Bar System
-- Allows real-time updates to the Now bar without redeployment

CREATE TABLE now_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  show_cta BOOLEAN DEFAULT FALSE,
  cta_text TEXT,
  cta_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE now_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON now_status FOR SELECT USING (true);
CREATE POLICY "Service role full access" ON now_status FOR ALL USING (true);

-- Indexes
CREATE INDEX idx_now_status_active ON now_status(is_active);
CREATE INDEX idx_now_status_updated ON now_status(updated_at DESC);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_now_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_now_status_updated_at
  BEFORE UPDATE ON now_status
  FOR EACH ROW
  EXECUTE FUNCTION update_now_status_updated_at();

-- Insert default status
INSERT INTO now_status (text, show_cta, cta_text, cta_url, is_active) VALUES
(
  'Building autopilot systems, shipping operator notes, and taking build sprints this month.',
  true,
  'Book a call',
  '/advisory',
  true
);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Live Now bar created successfully! Update via Supabase dashboard.';
END $$;
