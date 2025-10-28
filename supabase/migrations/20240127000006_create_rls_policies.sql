-- Row Level Security Policies for the revenue-first commerce hub

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Products table policies
CREATE POLICY "Products are viewable by everyone" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Products are insertable by authenticated users" ON public.products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Products are updatable by authenticated users" ON public.products
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Products are deletable by authenticated users" ON public.products
  FOR DELETE USING (auth.role() = 'authenticated');

-- Customers table policies
CREATE POLICY "Customers can view their own data" ON public.customers
  FOR SELECT USING (
    (email = auth.email() AND auth.role() = 'authenticated')
  );

CREATE POLICY "Customers can insert their own data" ON public.customers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Customers can update their own data" ON public.customers
  FOR UPDATE USING (
    (email = auth.email() AND auth.role() = 'authenticated')
  );

-- Orders table policies
CREATE POLICY "Orders are viewable by customers and authenticated users" ON public.orders
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    customer_email = auth.email()
  );

CREATE POLICY "Orders are insertable by authenticated users" ON public.orders
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    customer_email = auth.email()
  );

CREATE POLICY "Orders are updatable by authenticated users" ON public.orders
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    customer_email = auth.email()
  );

-- Analytics events table policies
CREATE POLICY "Analytics events are insertable by everyone" ON public.analytics_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Analytics events are viewable by authenticated users" ON public.analytics_events
  FOR SELECT USING (auth.role() = 'authenticated');