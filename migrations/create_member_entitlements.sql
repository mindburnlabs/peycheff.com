-- Create member_entitlements table for tracking Pro membership benefits
CREATE TABLE IF NOT EXISTS member_entitlements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL, -- SHA-256 hashed email for privacy
  subscription_id VARCHAR(255), -- Stripe subscription ID
  membership_type VARCHAR(50) NOT NULL CHECK (membership_type IN ('MEMBER_MONTHLY', 'MEMBER_ANNUAL', 'MEMBER_PRO')),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'paused')),
  
  -- Entitlements
  unlimited_regens BOOLEAN DEFAULT false,
  pro_utilities_access BOOLEAN DEFAULT false,
  daily_regen_limit INTEGER DEFAULT 0, -- 0 means unlimited
  daily_utility_limit INTEGER DEFAULT 0, -- 0 means unlimited
  
  -- Usage tracking for day-throttled features
  last_regen_date DATE,
  regens_today INTEGER DEFAULT 0,
  last_utility_date DATE, 
  utilities_today INTEGER DEFAULT 0,
  
  -- Subscription metadata
  billing_cycle VARCHAR(20), -- monthly, annual
  next_billing_date DATE,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_member_entitlements_email ON member_entitlements(email);
CREATE INDEX IF NOT EXISTS idx_member_entitlements_subscription ON member_entitlements(subscription_id);
CREATE INDEX IF NOT EXISTS idx_member_entitlements_status ON member_entitlements(status);
CREATE INDEX IF NOT EXISTS idx_member_entitlements_type ON member_entitlements(membership_type);
CREATE INDEX IF NOT EXISTS idx_member_entitlements_expires ON member_entitlements(expires_at);

-- Enable Row Level Security
ALTER TABLE member_entitlements ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access (for serverless functions)
CREATE POLICY "Service role can manage member entitlements" ON member_entitlements
  FOR ALL USING (auth.role() = 'service_role');

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_member_entitlements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_member_entitlements_updated_at
  BEFORE UPDATE ON member_entitlements
  FOR EACH ROW
  EXECUTE FUNCTION update_member_entitlements_updated_at();

-- Function to reset daily counters
CREATE OR REPLACE FUNCTION reset_daily_usage_counters()
RETURNS void AS $$
BEGIN
  UPDATE member_entitlements 
  SET 
    regens_today = 0,
    utilities_today = 0
  WHERE 
    (last_regen_date < CURRENT_DATE AND regens_today > 0)
    OR 
    (last_utility_date < CURRENT_DATE AND utilities_today > 0);
END;
$$ language 'plpgsql';

-- Create a view for easy entitlement checking
CREATE OR REPLACE VIEW active_member_entitlements AS
SELECT 
  email,
  membership_type,
  unlimited_regens,
  pro_utilities_access,
  daily_regen_limit,
  daily_utility_limit,
  CASE 
    WHEN last_regen_date = CURRENT_DATE THEN regens_today 
    ELSE 0 
  END as regens_used_today,
  CASE 
    WHEN last_utility_date = CURRENT_DATE THEN utilities_today 
    ELSE 0 
  END as utilities_used_today,
  expires_at
FROM member_entitlements 
WHERE 
  status = 'active' 
  AND (expires_at IS NULL OR expires_at > NOW());
