-- Create usage_counters table for tracking API usage by email and SKU
CREATE TABLE IF NOT EXISTS usage_counters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NOT NULL,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  runs INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_usage_counters_email_sku ON usage_counters(email, sku);
CREATE INDEX IF NOT EXISTS idx_usage_counters_window_start ON usage_counters(window_start);
CREATE INDEX IF NOT EXISTS idx_usage_counters_email_sku_window ON usage_counters(email, sku, window_start);

-- Enable Row Level Security
ALTER TABLE usage_counters ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access (for serverless functions)
CREATE POLICY "Service role can manage usage counters" ON usage_counters
  FOR ALL USING (auth.role() = 'service_role');

-- Create policy for authenticated users to read their own data
CREATE POLICY "Users can read their own usage counters" ON usage_counters
  FOR SELECT USING (auth.jwt() ->> 'email' = email);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_usage_counters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_usage_counters_updated_at
  BEFORE UPDATE ON usage_counters
  FOR EACH ROW
  EXECUTE FUNCTION update_usage_counters_updated_at();
