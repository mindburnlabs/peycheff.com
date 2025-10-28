-- Create orders table for tracking purchases
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  platform TEXT NOT NULL CHECK (platform IN ('etsy', 'whop', 'stripe')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  quantity INTEGER DEFAULT 1,
  payment_intent_id TEXT,
  payment_method TEXT,
  external_order_id TEXT, -- Etsy/Whop order ID
  external_transaction_id TEXT,
  customer_email TEXT,
  customer_name TEXT,
  metadata JSONB DEFAULT '{}',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON public.orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_platform ON public.orders(platform);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_external_order_id ON public.orders(external_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);

-- Create trigger for updated_at
CREATE TRIGGER handle_updated_at_orders
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();