-- Create customers table for tracking customer data
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  company TEXT,
  phone TEXT,
  budget_range TEXT CHECK (budget_range IN ('<$5k', '$5-18k', '$18-45k', '>$45k')),
  timeline TEXT CHECK (timeline IN ('asap', '2-weeks', '1-month', '3-months', 'exploring')),
  project_description TEXT,
  source TEXT DEFAULT 'website',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_source ON public.customers(source);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON public.customers(created_at);

-- Create trigger for updated_at
CREATE TRIGGER handle_updated_at_customers
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();