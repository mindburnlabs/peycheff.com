-- Create audit_reports table for storing shareable audit reports
CREATE TABLE IF NOT EXISTS audit_reports (
  id UUID PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  industry VARCHAR(100) NOT NULL,
  tech_stack VARCHAR(100) NOT NULL,
  team_size VARCHAR(50),
  email VARCHAR(255), -- SHA-256 hashed email for privacy
  report_data JSONB NOT NULL,
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  is_public BOOLEAN DEFAULT true,
  share_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_audit_reports_id ON audit_reports(id);
CREATE INDEX IF NOT EXISTS idx_audit_reports_public ON audit_reports(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_audit_reports_industry ON audit_reports(industry);
CREATE INDEX IF NOT EXISTS idx_audit_reports_tech_stack ON audit_reports(tech_stack);
CREATE INDEX IF NOT EXISTS idx_audit_reports_score ON audit_reports(overall_score);
CREATE INDEX IF NOT EXISTS idx_audit_reports_created ON audit_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_reports_share_count ON audit_reports(share_count);

-- Enable Row Level Security
ALTER TABLE audit_reports ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access (for serverless functions)
CREATE POLICY "Service role can manage audit reports" ON audit_reports
  FOR ALL USING (auth.role() = 'service_role');

-- Create policy for public read access to public reports
CREATE POLICY "Public can read public audit reports" ON audit_reports
  FOR SELECT USING (is_public = true);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_audit_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_audit_reports_updated_at
  BEFORE UPDATE ON audit_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_audit_reports_updated_at();
