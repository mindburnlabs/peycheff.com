-- Create subscribers table for peycheff.com newsletter
CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    source TEXT DEFAULT 'website',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'pending')),
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers (email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON public.subscribers (status);
CREATE INDEX IF NOT EXISTS idx_subscribers_subscribed_at ON public.subscribers (subscribed_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create policy for public inserts (newsletter signup)
CREATE POLICY "Allow public inserts" ON public.subscribers
    FOR INSERT WITH CHECK (true);

-- Create policy for authenticated reads (admin only)
CREATE POLICY "Allow authenticated reads" ON public.subscribers
    FOR SELECT USING (auth.role() = 'authenticated');

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscribers_updated_at 
    BEFORE UPDATE ON public.subscribers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
