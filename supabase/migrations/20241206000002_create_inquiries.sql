-- Create inquiries table for peycheff.com contact form
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    linkedin TEXT,
    company TEXT,
    problem TEXT NOT NULL,
    timeline TEXT NOT NULL,
    budget TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'responded', 'archived')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inquiries_email ON public.inquiries (email);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries (status);
CREATE INDEX IF NOT EXISTS idx_inquiries_submitted_at ON public.inquiries (submitted_at);
CREATE INDEX IF NOT EXISTS idx_inquiries_budget ON public.inquiries (budget);
CREATE INDEX IF NOT EXISTS idx_inquiries_timeline ON public.inquiries (timeline);

-- Enable RLS (Row Level Security)
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Create policy for public inserts (contact form)
CREATE POLICY "Allow public inserts" ON public.inquiries
    FOR INSERT WITH CHECK (true);

-- Create policy for authenticated reads (admin only)
CREATE POLICY "Allow authenticated reads" ON public.inquiries
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy for authenticated updates (admin only)
CREATE POLICY "Allow authenticated updates" ON public.inquiries
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_inquiries_updated_at 
    BEFORE UPDATE ON public.inquiries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a view for inquiry analytics
CREATE OR REPLACE VIEW public.inquiry_stats AS
SELECT 
    DATE_TRUNC('day', submitted_at) as date,
    COUNT(*) as total_inquiries,
    COUNT(CASE WHEN budget = '$500 - $5k' THEN 1 END) as budget_small,
    COUNT(CASE WHEN budget = '$5k - $25k' THEN 1 END) as budget_medium,
    COUNT(CASE WHEN budget = '$25k - $100k' THEN 1 END) as budget_large,
    COUNT(CASE WHEN budget = '$100k+' THEN 1 END) as budget_enterprise,
    COUNT(CASE WHEN timeline = 'ASAP' THEN 1 END) as urgent_requests
FROM public.inquiries
GROUP BY DATE_TRUNC('day', submitted_at)
ORDER BY date DESC;
