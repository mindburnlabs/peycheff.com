-- Update existing schedule_slots table with missing columns and constraints
-- This migration safely adds columns that may not exist

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add service_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'schedule_slots' AND column_name = 'service_type') THEN
        ALTER TABLE schedule_slots ADD COLUMN service_type TEXT NOT NULL DEFAULT 'CALL_60';
    END IF;
    
    -- Add timezone column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'schedule_slots' AND column_name = 'timezone') THEN
        ALTER TABLE schedule_slots ADD COLUMN timezone TEXT NOT NULL DEFAULT 'America/Los_Angeles';
    END IF;
    
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'schedule_slots' AND column_name = 'status') THEN
        ALTER TABLE schedule_slots ADD COLUMN status TEXT NOT NULL DEFAULT 'available';
    END IF;
    
    -- Add booking information columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'schedule_slots' AND column_name = 'customer_email') THEN
        ALTER TABLE schedule_slots ADD COLUMN customer_email TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'schedule_slots' AND column_name = 'customer_name') THEN
        ALTER TABLE schedule_slots ADD COLUMN customer_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'schedule_slots' AND column_name = 'order_id') THEN
        ALTER TABLE schedule_slots ADD COLUMN order_id TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'schedule_slots' AND column_name = 'notes') THEN
        ALTER TABLE schedule_slots ADD COLUMN notes TEXT;
    END IF;
    
    -- Add timestamp columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'schedule_slots' AND column_name = 'booked_at') THEN
        ALTER TABLE schedule_slots ADD COLUMN booked_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'schedule_slots' AND column_name = 'cancelled_at') THEN
        ALTER TABLE schedule_slots ADD COLUMN cancelled_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'schedule_slots' AND column_name = 'cancellation_reason') THEN
        ALTER TABLE schedule_slots ADD COLUMN cancellation_reason TEXT;
    END IF;
END $$;

-- Add constraints if they don't exist
DO $$
BEGIN
    -- Add status constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'valid_status') THEN
        ALTER TABLE schedule_slots ADD CONSTRAINT valid_status 
        CHECK (status IN ('available', 'booked', 'blocked', 'cancelled'));
    END IF;
    
    -- Add service_type constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'valid_service_type') THEN
        ALTER TABLE schedule_slots ADD CONSTRAINT valid_service_type 
        CHECK (service_type IN ('CALL_60', 'CALL_30', 'SPARRING'));
    END IF;
    
    -- Add end_after_start constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'end_after_start') THEN
        ALTER TABLE schedule_slots ADD CONSTRAINT end_after_start 
        CHECK (end_time > start_time);
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- Ignore constraint errors if they already exist
        NULL;
END $$;

-- Create indexes if they don't exist
DO $$
BEGIN
    -- Service and status index
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_schedule_slots_service_status') THEN
        CREATE INDEX idx_schedule_slots_service_status ON schedule_slots (service_type, status);
    END IF;
    
    -- Start time index
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_schedule_slots_start_time') THEN
        CREATE INDEX idx_schedule_slots_start_time ON schedule_slots (start_time);
    END IF;
    
    -- Customer email index
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_schedule_slots_customer_email') THEN
        CREATE INDEX idx_schedule_slots_customer_email ON schedule_slots (customer_email);
    END IF;
    
    -- Order ID index
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_schedule_slots_order_id') THEN
        CREATE INDEX idx_schedule_slots_order_id ON schedule_slots (order_id);
    END IF;
    
    -- Unique time and service index
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_schedule_slots_unique_time_service') THEN
        CREATE UNIQUE INDEX idx_schedule_slots_unique_time_service ON schedule_slots (start_time, service_type);
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- Ignore index errors if they already exist
        NULL;
END $$;

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_schedule_slots_updated_at ON schedule_slots;
CREATE TRIGGER update_schedule_slots_updated_at
    BEFORE UPDATE ON schedule_slots
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS if not already enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'schedule_slots' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE schedule_slots ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create policies (drop and recreate to ensure they're current)
DROP POLICY IF EXISTS "Service role full access" ON schedule_slots;
CREATE POLICY "Service role full access" ON schedule_slots
    FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Public can read available slots" ON schedule_slots;
CREATE POLICY "Public can read available slots" ON schedule_slots
    FOR SELECT USING (status = 'available');

DROP POLICY IF EXISTS "Customers can read own bookings" ON schedule_slots;
CREATE POLICY "Customers can read own bookings" ON schedule_slots
    FOR SELECT USING (
        status = 'booked' AND 
        customer_email = auth.jwt() ->> 'email'
    );

-- Create or replace booking function with race condition protection
CREATE OR REPLACE FUNCTION check_and_book_slot(
    p_slot_id TEXT,
    p_customer_email TEXT,
    p_customer_name TEXT,
    p_order_id TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    result_slot schedule_slots%ROWTYPE;
    success BOOLEAN := FALSE;
BEGIN
    -- Attempt to book the slot with atomic update
    UPDATE schedule_slots
    SET 
        status = 'booked',
        customer_email = p_customer_email,
        customer_name = p_customer_name,
        order_id = p_order_id,
        notes = p_notes,
        booked_at = NOW(),
        updated_at = NOW()
    WHERE 
        id = p_slot_id 
        AND status = 'available'
    RETURNING * INTO result_slot;
    
    -- Check if the update was successful
    IF FOUND THEN
        success := TRUE;
    END IF;
    
    -- Return result
    RETURN json_build_object(
        'success', success,
        'slot', row_to_json(result_slot)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION check_and_book_slot TO authenticated;
GRANT EXECUTE ON FUNCTION check_and_book_slot TO anon;

-- Create or replace slot generation function
CREATE OR REPLACE FUNCTION generate_schedule_slots(
    p_start_date DATE DEFAULT CURRENT_DATE + INTERVAL '1 day',
    p_end_date DATE DEFAULT CURRENT_DATE + INTERVAL '60 days',
    p_service_types TEXT[] DEFAULT ARRAY['CALL_60', 'CALL_30', 'SPARRING']
) RETURNS JSON AS $$
DECLARE
    current_date DATE;
    current_hour INTEGER;
    slot_start TIMESTAMPTZ;
    slot_end TIMESTAMPTZ;
    slot_id TEXT;
    slot_duration INTEGER;
    generated_count INTEGER := 0;
    working_hours_start INTEGER := 9;  -- 9 AM PST
    working_hours_end INTEGER := 17;   -- 5 PM PST
    service_type TEXT;
    slot_durations JSON := '{"CALL_60": 60, "CALL_30": 30, "SPARRING": 60}';
BEGIN
    -- Loop through dates
    FOR current_date IN 
        SELECT generate_series(p_start_date, p_end_date, '1 day'::INTERVAL)::DATE
    LOOP
        -- Skip weekends (Monday = 1, Sunday = 7)
        IF EXTRACT(DOW FROM current_date) NOT IN (1, 2, 3, 4, 5) THEN
            CONTINUE;
        END IF;
        
        -- Loop through service types
        FOREACH service_type IN ARRAY p_service_types
        LOOP
            slot_duration := (slot_durations ->> service_type)::INTEGER;
            
            -- Loop through working hours
            FOR current_hour IN working_hours_start..working_hours_end-1
            LOOP
                -- Create slot timestamp in PST/PDT timezone
                slot_start := (current_date + (current_hour || ' hours')::INTERVAL) AT TIME ZONE 'America/Los_Angeles';
                slot_end := slot_start + (slot_duration || ' minutes')::INTERVAL;
                
                -- Don't create slots that extend beyond working hours
                IF EXTRACT(HOUR FROM slot_end AT TIME ZONE 'America/Los_Angeles') > working_hours_end THEN
                    CONTINUE;
                END IF;
                
                -- Generate unique slot ID
                slot_id := service_type || '_' || TO_CHAR(slot_start, 'YYYY-MM-DD"T"HH24:MI:SS"Z"');
                
                -- Insert slot (ignore if already exists)
                INSERT INTO schedule_slots (
                    id, service_type, start_time, end_time, 
                    timezone, status, created_at, updated_at
                ) VALUES (
                    slot_id, service_type, slot_start, slot_end,
                    'America/Los_Angeles', 'available', NOW(), NOW()
                ) ON CONFLICT (start_time, service_type) DO NOTHING;
                
                -- Count if we actually inserted
                IF FOUND THEN
                    generated_count := generated_count + 1;
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;
    
    RETURN json_build_object(
        'success', true,
        'generated_count', generated_count,
        'date_range', json_build_object(
            'start', p_start_date,
            'end', p_end_date
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution to service role
GRANT EXECUTE ON FUNCTION generate_schedule_slots TO service_role;

-- Create or replace available slots view
DROP VIEW IF EXISTS available_slots;
CREATE VIEW available_slots AS
SELECT 
    id,
    service_type,
    start_time,
    end_time,
    timezone,
    created_at
FROM schedule_slots
WHERE 
    status = 'available' 
    AND start_time > NOW() + INTERVAL '24 hours'; -- Minimum 24h notice

-- Grant select permissions on view
GRANT SELECT ON available_slots TO anon;
GRANT SELECT ON available_slots TO authenticated;

-- Update comments
COMMENT ON TABLE schedule_slots IS 'Auto-scheduler system for strategy calls and sparring sessions';
COMMENT ON COLUMN schedule_slots.service_type IS 'Type of service: CALL_60, CALL_30, or SPARRING';
COMMENT ON COLUMN schedule_slots.status IS 'Slot status: available, booked, blocked, or cancelled';
COMMENT ON FUNCTION check_and_book_slot IS 'Atomically books an available slot with race condition protection';
COMMENT ON FUNCTION generate_schedule_slots IS 'Generates available slots for a date range during working hours';
COMMENT ON VIEW available_slots IS 'Public view of available slots with minimum notice requirement';
