-- Create trial_entitlements table for managing utility pass trials
CREATE TABLE IF NOT EXISTS trial_entitlements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL, -- SHA-256 hashed email for privacy
  original_email VARCHAR(255), -- Plain email for sending emails (can be null for privacy)
  sku VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  usage_limit INTEGER DEFAULT 10,
  usage_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  source VARCHAR(100) DEFAULT 'website',
  trial_token UUID DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_trial_entitlements_email_sku ON trial_entitlements(email, sku);
CREATE INDEX IF NOT EXISTS idx_trial_entitlements_token ON trial_entitlements(trial_token);
CREATE INDEX IF NOT EXISTS idx_trial_entitlements_status ON trial_entitlements(status);
CREATE INDEX IF NOT EXISTS idx_trial_entitlements_expires_at ON trial_entitlements(expires_at);

-- Enable Row Level Security
ALTER TABLE trial_entitlements ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access (for serverless functions)
CREATE POLICY "Service role can manage trial entitlements" ON trial_entitlements
  FOR ALL USING (auth.role() = 'service_role');

-- Create policy for authenticated users to read their own data (if needed)
CREATE POLICY "Users can read their own trial entitlements" ON trial_entitlements
  FOR SELECT USING (auth.jwt() ->> 'email' = original_email);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_trial_entitlements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_trial_entitlements_updated_at
  BEFORE UPDATE ON trial_entitlements
  FOR EACH ROW
  EXECUTE FUNCTION update_trial_entitlements_updated_at();

-- Add constraint to ensure usage_count doesn't exceed usage_limit
ALTER TABLE trial_entitlements 
ADD CONSTRAINT check_usage_limit 
CHECK (usage_count <= usage_limit);

-- Add constraint for valid statuses
ALTER TABLE trial_entitlements 
ADD CONSTRAINT check_valid_status 
CHECK (status IN ('active', 'expired', 'cancelled', 'converted'));
