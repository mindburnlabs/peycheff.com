-- Enhanced Security Implementation for peycheff.com
-- This migration adds comprehensive security features and monitoring

-- Create security events table for detailed logging
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  ip_address INET,
  user_agent TEXT,
  url TEXT,
  method TEXT,
  request_headers JSONB,
  response_status INTEGER,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id)
);

-- Create IP reputation table
CREATE TABLE IF NOT EXISTS public.ip_reputation (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address INET UNIQUE NOT NULL,
  reputation_score INTEGER DEFAULT 0 CHECK (reputation_score >= 0 AND reputation_score <= 10),
  violations_count INTEGER DEFAULT 0,
  last_violation_at TIMESTAMP WITH TIME ZONE,
  blocked BOOLEAN DEFAULT FALSE,
  blocked_until TIMESTAMP WITH TIME ZONE,
  block_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rate limit tracking table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address INET NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  window_end TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '15 minutes'),
  violated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create security audit log table
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('system', 'user', 'admin')),
  actor_id UUID REFERENCES auth.users(id),
  resource_type TEXT,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create failed login attempts table
CREATE TABLE IF NOT EXISTS public.failed_login_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address INET NOT NULL,
  user_agent TEXT,
  attempt_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reason TEXT,
  blocked_until TIMESTAMP WITH TIME ZONE
);

-- Add security-related columns to existing tables
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS security_flags JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100);

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS fraud_score INTEGER DEFAULT 0 CHECK (fraud_score >= 0 AND fraud_score <= 100),
ADD COLUMN IF NOT EXISTS security_flags JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'flagged', 'rejected'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_events_ip_address ON public.security_events(ip_address);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON public.security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON public.security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON public.security_events(severity);

CREATE INDEX IF NOT EXISTS idx_ip_reputation_ip_address ON public.ip_reputation(ip_address);
CREATE INDEX IF NOT EXISTS idx_ip_reputation_score ON public.ip_reputation(reputation_score);
CREATE INDEX IF NOT EXISTS idx_ip_reputation_blocked ON public.ip_reputation(blocked);
CREATE INDEX IF NOT EXISTS idx_ip_reputation_last_violation ON public.ip_reputation(last_violation_at DESC);

CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_endpoint ON public.rate_limits(ip_address, endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_end ON public.rate_limits(window_end);
CREATE INDEX IF NOT EXISTS idx_rate_limits_violated ON public.rate_limits(violated);

CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON public.security_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_action ON public.security_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_actor ON public.security_audit_log(actor_type, actor_id);

CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_email ON public.failed_login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_ip ON public.failed_login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_time ON public.failed_login_attempts(attempt_time DESC);

-- Enable Row Level Security
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ip_reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.failed_login_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for security_events
CREATE POLICY "Security events are viewable by authenticated users" ON public.security_events
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Security events are insertable by system and admins" ON public.security_events
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    (auth.jwt() ->> 'role') = 'service_role'
  );

CREATE POLICY "Security events are updatable by admins" ON public.security_events
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    (auth.jwt() ->> 'role') = 'service_role'
  );

-- RLS Policies for ip_reputation
CREATE POLICY "IP reputation is viewable by authenticated users" ON public.ip_reputation
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "IP reputation is manageable by system" ON public.ip_reputation
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    (auth.jwt() ->> 'role') = 'service_role'
  );

-- RLS Policies for rate_limits
CREATE POLICY "Rate limits are viewable by authenticated users" ON public.rate_limits
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Rate limits are manageable by system" ON public.rate_limits
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    (auth.jwt() ->> 'role') = 'service_role'
  );

-- RLS Policies for security_audit_log
CREATE POLICY "Audit log is viewable by authenticated users" ON public.security_audit_log
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Audit log is insertable by system" ON public.security_audit_log
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    (auth.jwt() ->> 'role') = 'service_role'
  );

-- RLS Policies for failed_login_attempts
CREATE POLICY "Failed login attempts are viewable by authenticated users" ON public.failed_login_attempts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Failed login attempts are insertable by system" ON public.failed_login_attempts
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    (auth.jwt() ->> 'role') = 'service_role'
  );

-- Create functions for security operations

-- Function to update IP reputation
CREATE OR REPLACE FUNCTION update_ip_reputation(
  p_ip_address INET,
  p_violation_type TEXT DEFAULT 'generic',
  p_severity INTEGER DEFAULT 1
) RETURNS UUID AS $$
DECLARE
  reputation_id UUID;
  current_score INTEGER;
  current_violations INTEGER;
BEGIN
  -- Insert or update IP reputation
  INSERT INTO public.ip_reputation (ip_address, reputation_score, violations_count, last_violation_at)
  VALUES (p_ip_address, p_severity, 1, NOW())
  ON CONFLICT (ip_address)
  DO UPDATE SET
    reputation_score = LEAST(10, ip_reputation.reputation_score + p_severity),
    violations_count = ip_reputation.violations_count + 1,
    last_violation_at = NOW(),
    updated_at = NOW()
  RETURNING id INTO reputation_id;

  -- Auto-block if score is high
  SELECT reputation_score, violations_count INTO current_score, current_violations
  FROM public.ip_reputation
  WHERE ip_address = p_ip_address;

  IF current_score >= 7 OR current_violations >= 10 THEN
    UPDATE public.ip_reputation
    SET
      blocked = TRUE,
      blocked_until = NOW() + INTERVAL '1 hour',
      block_reason = 'Auto-blocked: High reputation score or violation count',
      updated_at = NOW()
    WHERE ip_address = p_ip_address;
  END IF;

  -- Log the reputation update
  INSERT INTO public.security_audit_log (
    action, actor_type, resource_type, details, ip_address
  ) VALUES (
    'update_ip_reputation', 'system', 'ip_reputation',
    jsonb_build_object(
      'ip_address', p_ip_address,
      'violation_type', p_violation_type,
      'severity', p_severity,
      'new_score', current_score,
      'violations', current_violations
    ),
    p_ip_address
  );

  RETURN reputation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old security data
CREATE OR REPLACE FUNCTION cleanup_security_data() RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
  cutoff_date TIMESTAMP WITH TIME ZONE := NOW() - INTERVAL '30 days';
BEGIN
  -- Clean up old security events (keep high severity ones longer)
  DELETE FROM public.security_events
  WHERE created_at < cutoff_date
  AND severity IN ('low', 'medium');
  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  -- Clean up old rate limit entries
  DELETE FROM public.rate_limits
  WHERE window_end < NOW() - INTERVAL '1 hour';

  -- Clean up old failed login attempts (keep recent ones)
  DELETE FROM public.failed_login_attempts
  WHERE attempt_time < NOW() - INTERVAL '7 days';

  -- Log the cleanup
  INSERT INTO public.security_audit_log (
    action, actor_type, details
  ) VALUES (
    'cleanup_security_data', 'system',
    jsonb_build_object('deleted_records', deleted_count, 'cutoff_date', cutoff_date)
  );

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get security statistics
CREATE OR REPLACE FUNCTION get_security_statistics() RETURNS JSONB AS $$
DECLARE
  stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_security_events', (SELECT COUNT(*) FROM public.security_events WHERE created_at > NOW() - INTERVAL '24 hours'),
    'high_severity_events', (SELECT COUNT(*) FROM public.security_events WHERE severity = 'high' AND created_at > NOW() - INTERVAL '24 hours'),
    'critical_severity_events', (SELECT COUNT(*) FROM public.security_events WHERE severity = 'critical' AND created_at > NOW() - INTERVAL '24 hours'),
    'blocked_ips', (SELECT COUNT(*) FROM public.ip_reputation WHERE blocked = TRUE),
    'high_risk_ips', (SELECT COUNT(*) FROM public.ip_reputation WHERE reputation_score >= 5),
    'average_reputation_score', COALESCE((SELECT AVG(reputation_score) FROM public.ip_reputation), 0),
    'total_violations', (SELECT SUM(violations_count) FROM public.ip_reputation),
    'recent_failed_logins', (SELECT COUNT(*) FROM public.failed_login_attempts WHERE attempt_time > NOW() - INTERVAL '24 hours'),
    'audit_entries_today', (SELECT COUNT(*) FROM public.security_audit_log WHERE created_at > NOW() - INTERVAL '24 hours')
  ) INTO stats;

  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ip_reputation_updated_at
  BEFORE UPDATE ON public.ip_reputation
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rate_limits_updated_at
  BEFORE UPDATE ON public.rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION update_ip_reputation TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_security_data TO authenticated;
GRANT EXECUTE ON FUNCTION get_security_statistics TO authenticated;
GRANT EXECUTE ON FUNCTION update_updated_at_column TO authenticated;

-- Create security view for dashboard
CREATE OR REPLACE VIEW public.security_dashboard AS
SELECT
  'summary' as type,
  jsonb_build_object(
    'events_24h', (SELECT COUNT(*) FROM public.security_events WHERE created_at > NOW() - INTERVAL '24 hours'),
    'events_critical_24h', (SELECT COUNT(*) FROM public.security_events WHERE severity = 'critical' AND created_at > NOW() - INTERVAL '24 hours'),
    'blocked_ips', (SELECT COUNT(*) FROM public.ip_reputation WHERE blocked = TRUE),
    'high_risk_ips', (SELECT COUNT(*) FROM public.ip_reputation WHERE reputation_score >= 5),
    'failed_logins_24h', (SELECT COUNT(*) FROM public.failed_login_attempts WHERE attempt_time > NOW() - INTERVAL '24 hours')
  ) as data;

GRANT SELECT ON public.security_dashboard TO authenticated;

-- Add comment
COMMENT ON TABLE public.security_events IS 'Logs all security-related events for monitoring and analysis';
COMMENT ON TABLE public.ip_reputation IS 'Tracks IP address reputation and blocking status';
COMMENT ON TABLE public.rate_limits IS 'Tracks rate limiting violations per IP and endpoint';
COMMENT ON TABLE public.security_audit_log IS 'Audit trail for all security-related actions';
COMMENT ON TABLE public.failed_login_attempts IS 'Tracks failed login attempts for brute force detection';