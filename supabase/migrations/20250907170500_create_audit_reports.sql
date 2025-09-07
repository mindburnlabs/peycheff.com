-- Publicly shareable audit reports
CREATE TABLE IF NOT EXISTS public.audit_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  customer_email TEXT NOT NULL,
  url TEXT,
  goal TEXT,
  stack TEXT,
  issues JSONB NOT NULL DEFAULT '[]',
  summary TEXT,
  watermark TEXT DEFAULT 'Audit Preview',
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_reports_email ON public.audit_reports(customer_email);
CREATE INDEX IF NOT EXISTS idx_audit_reports_token ON public.audit_reports(token);

ALTER TABLE public.audit_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read by token" ON public.audit_reports FOR SELECT USING (is_public = true);
CREATE POLICY "Service role full access" ON public.audit_reports FOR ALL USING (true);


