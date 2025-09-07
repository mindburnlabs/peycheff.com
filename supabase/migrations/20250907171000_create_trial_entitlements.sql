-- Create trial_entitlements table for managing Utility Pass trials
CREATE TABLE IF NOT EXISTS public.trial_entitlements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL, -- SHA-256 hashed email for privacy
  original_email VARCHAR(255), -- Plain email for sending emails (optional)
  sku VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  usage_limit INTEGER DEFAULT 10,
  usage_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  source VARCHAR(100) DEFAULT 'website',
  trial_token UUID DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trial_entitlements_email_sku ON public.trial_entitlements(email, sku);
CREATE INDEX IF NOT EXISTS idx_trial_entitlements_token ON public.trial_entitlements(trial_token);
CREATE INDEX IF NOT EXISTS idx_trial_entitlements_status ON public.trial_entitlements(status);
CREATE INDEX IF NOT EXISTS idx_trial_entitlements_expires_at ON public.trial_entitlements(expires_at);

-- RLS
ALTER TABLE public.trial_entitlements ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role can manage trial entitlements" ON public.trial_entitlements
  FOR ALL USING (auth.role() = 'service_role');

-- Optional: authenticated users can read their own trial (if auth is used)
CREATE POLICY "Users can read their own trial entitlements" ON public.trial_entitlements
  FOR SELECT USING (auth.jwt() ->> 'email' = original_email);

-- Trigger to maintain updated_at
CREATE OR REPLACE FUNCTION public.update_trial_entitlements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_trial_entitlements ON public.trial_entitlements;
CREATE TRIGGER trg_update_trial_entitlements
  BEFORE UPDATE ON public.trial_entitlements
  FOR EACH ROW EXECUTE FUNCTION public.update_trial_entitlements_updated_at();

-- Constraints
ALTER TABLE public.trial_entitlements 
  ADD CONSTRAINT trial_usage_within_limit CHECK (usage_count <= usage_limit);

ALTER TABLE public.trial_entitlements 
  ADD CONSTRAINT trial_valid_status CHECK (status IN ('active', 'expired', 'cancelled', 'converted'));


