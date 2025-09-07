-- Publicly shareable audit reports (already exists, just add missing columns)
ALTER TABLE public.audit_reports 
ADD COLUMN IF NOT EXISTS token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS url TEXT,
ADD COLUMN IF NOT EXISTS goal TEXT,
ADD COLUMN IF NOT EXISTS stack TEXT,
ADD COLUMN IF NOT EXISTS issues JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS summary TEXT,
ADD COLUMN IF NOT EXISTS watermark TEXT DEFAULT 'Audit Preview',
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;

-- Create index only if customer_email column exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='audit_reports' AND column_name='customer_email') THEN
    CREATE INDEX IF NOT EXISTS idx_audit_reports_email ON public.audit_reports(customer_email);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_audit_reports_token ON public.audit_reports(token);

ALTER TABLE public.audit_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read by token" ON public.audit_reports FOR SELECT USING (is_public = true);
CREATE POLICY "Service role full access" ON public.audit_reports FOR ALL USING (true);


