-- Usage counters for trials/utility caps
CREATE TABLE IF NOT EXISTS public.usage_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  sku TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  runs INTEGER NOT NULL DEFAULT 0,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email, sku, window_start)
);

CREATE INDEX IF NOT EXISTS idx_usage_email ON public.usage_counters(email);
CREATE INDEX IF NOT EXISTS idx_usage_sku ON public.usage_counters(sku);
CREATE INDEX IF NOT EXISTS idx_usage_window ON public.usage_counters(window_start);

ALTER TABLE public.usage_counters ENABLE ROW LEVEL SECURITY;

-- Service role manages counters
CREATE POLICY "Service role full access" ON public.usage_counters FOR ALL USING (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_usage_counters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_usage_counters_updated_at ON public.usage_counters;
CREATE TRIGGER trg_usage_counters_updated_at
  BEFORE UPDATE ON public.usage_counters
  FOR EACH ROW EXECUTE FUNCTION update_usage_counters_updated_at();

-- Atomic increment with cap
CREATE OR REPLACE FUNCTION public.increment_usage(
  p_email TEXT,
  p_sku TEXT,
  p_window_start TIMESTAMPTZ,
  p_limit INTEGER
) RETURNS JSON AS $$
DECLARE
  v_runs INTEGER;
BEGIN
  INSERT INTO public.usage_counters(email, sku, window_start, runs, last_run_at)
  VALUES (p_email, p_sku, p_window_start, 1, NOW())
  ON CONFLICT (email, sku, window_start)
  DO UPDATE SET runs = CASE WHEN public.usage_counters.runs < p_limit THEN public.usage_counters.runs + 1 ELSE public.usage_counters.runs END,
                last_run_at = NOW(),
                updated_at = NOW()
  RETURNING runs INTO v_runs;

  RETURN json_build_object(
    'success', v_runs <= p_limit,
    'runs', v_runs,
    'limit', p_limit
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.increment_usage(TEXT, TEXT, TIMESTAMPTZ, INTEGER) TO anon, authenticated, service_role;


