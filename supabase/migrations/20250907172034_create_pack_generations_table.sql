-- Create pack_generations table to track AI-generated packs
CREATE TABLE pack_generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Pack details
  pack_type TEXT NOT NULL CHECK (pack_type IN ('PACK_30DAY', 'KIT_AUTOMATION', 'KIT_DIAGRAMS')),
  pack_title TEXT,
  
  -- User information
  user_email TEXT NOT NULL,
  user_name TEXT,
  user_inputs JSONB NOT NULL DEFAULT '{}',
  
  -- Generation results
  content_generated BOOLEAN DEFAULT FALSE,
  pdf_generated BOOLEAN DEFAULT FALSE,
  generated_at TIMESTAMP WITH TIME ZONE,
  sections_count INTEGER DEFAULT 0,
  content_size INTEGER DEFAULT 0,
  pdf_size INTEGER DEFAULT 0,
  
  -- Delivery tracking
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMP WITH TIME ZONE,
  
  -- Purchase integration
  stripe_payment_intent_id TEXT,
  purchase_amount INTEGER, -- in cents
  purchase_currency TEXT DEFAULT 'usd',
  
  -- AI generation metadata
  ai_model_used TEXT,
  generation_duration_ms INTEGER,
  generation_error TEXT,
  
  -- Content storage
  generated_content JSONB,
  pdf_url TEXT
);

-- Create indexes for pack_generations
CREATE INDEX pack_generations_user_email_idx ON pack_generations(user_email);
CREATE INDEX pack_generations_pack_type_idx ON pack_generations(pack_type);
CREATE INDEX pack_generations_created_at_idx ON pack_generations(created_at);
CREATE INDEX pack_generations_stripe_payment_intent_id_idx ON pack_generations(stripe_payment_intent_id);

-- Create updated_at trigger
CREATE TRIGGER pack_generations_updated_at
  BEFORE UPDATE ON pack_generations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE pack_generations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own pack generations
CREATE POLICY "Users can view their own pack generations" ON pack_generations
  FOR SELECT USING (auth.email() = user_email);

-- Policy: System can insert pack generations (for API usage)
CREATE POLICY "System can insert pack generations" ON pack_generations
  FOR INSERT WITH CHECK (true);

-- Policy: System can update pack generations (for delivery tracking)
CREATE POLICY "System can update pack generations" ON pack_generations
  FOR UPDATE USING (true);

-- Create pack_purchases table to track Stripe payments
CREATE TABLE pack_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Stripe data
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  stripe_checkout_session_id TEXT,
  
  -- Purchase details
  pack_type TEXT NOT NULL CHECK (pack_type IN ('PACK_30DAY', 'KIT_AUTOMATION', 'KIT_DIAGRAMS')),
  amount INTEGER NOT NULL, -- in cents
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  
  -- Customer data
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  customer_metadata JSONB DEFAULT '{}',
  
  -- Fulfillment tracking
  fulfilled BOOLEAN DEFAULT FALSE,
  fulfilled_at TIMESTAMP WITH TIME ZONE,
  pack_generation_id UUID REFERENCES pack_generations(id)
);

-- Create indexes for pack_purchases
CREATE INDEX pack_purchases_stripe_payment_intent_id_idx ON pack_purchases(stripe_payment_intent_id);
CREATE INDEX pack_purchases_customer_email_idx ON pack_purchases(customer_email);
CREATE INDEX pack_purchases_pack_type_idx ON pack_purchases(pack_type);
CREATE INDEX pack_purchases_status_idx ON pack_purchases(status);
CREATE INDEX pack_purchases_created_at_idx ON pack_purchases(created_at);

-- Create updated_at trigger for pack_purchases
CREATE TRIGGER pack_purchases_updated_at
  BEFORE UPDATE ON pack_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for pack_purchases
ALTER TABLE pack_purchases ENABLE ROW LEVEL SECURITY;

-- RLS policies for pack_purchases
CREATE POLICY "Users can view their own purchases" ON pack_purchases
  FOR SELECT USING (auth.email() = customer_email);

CREATE POLICY "System can manage pack purchases" ON pack_purchases
  FOR ALL USING (true);

-- Create analytics views
CREATE VIEW pack_analytics AS
SELECT 
  pack_type,
  COUNT(*) as total_generated,
  COUNT(*) FILTER (WHERE content_generated = true) as successful_generations,
  COUNT(*) FILTER (WHERE pdf_generated = true) as pdf_generations,
  COUNT(*) FILTER (WHERE email_sent = true) as email_deliveries,
  AVG(generation_duration_ms) as avg_generation_time_ms,
  AVG(sections_count) as avg_sections_count,
  AVG(content_size) as avg_content_size,
  AVG(pdf_size) as avg_pdf_size,
  DATE_TRUNC('day', created_at) as date
FROM pack_generations
GROUP BY pack_type, DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Create revenue analytics view
CREATE VIEW pack_revenue_analytics AS
SELECT 
  pack_type,
  COUNT(*) as total_purchases,
  COUNT(*) FILTER (WHERE status = 'paid') as paid_purchases,
  SUM(amount) FILTER (WHERE status = 'paid') as total_revenue_cents,
  AVG(amount) FILTER (WHERE status = 'paid') as avg_purchase_amount_cents,
  COUNT(*) FILTER (WHERE fulfilled = true) as fulfilled_purchases,
  DATE_TRUNC('day', created_at) as date
FROM pack_purchases
GROUP BY pack_type, DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Grant access to service role
GRANT ALL ON pack_generations TO service_role;
GRANT ALL ON pack_purchases TO service_role;
GRANT SELECT ON pack_analytics TO service_role;
GRANT SELECT ON pack_revenue_analytics TO service_role;
