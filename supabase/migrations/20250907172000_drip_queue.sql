-- Drip queue and dispatcher
CREATE TABLE IF NOT EXISTS public.drip_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  template TEXT NOT NULL, -- e.g., 'DRIP_D1', 'DRIP_D3'
  payload JSONB DEFAULT '{}',
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.drip_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON public.drip_queue FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_drip_queue_sched ON public.drip_queue(scheduled_at);


