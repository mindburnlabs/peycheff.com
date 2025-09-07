-- Analytics System Tables and Indexes
-- Add comprehensive tracking for revenue, performance, and user behavior

-- =============================================================================
-- ANALYTICS TABLES
-- =============================================================================

-- Comprehensive event tracking
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'purchase', 'fulfillment', 'autopublish', etc.
  event_data JSONB NOT NULL, -- Flexible event properties
  user_id TEXT, -- Privacy-safe user identifier
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily metrics aggregation
CREATE TABLE daily_metrics (
  date DATE PRIMARY KEY,
  revenue_cents BIGINT DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  visitors_count INTEGER DEFAULT 0,
  signups_count INTEGER DEFAULT 0,
  conversions_count INTEGER DEFAULT 0,
  product_breakdown JSONB DEFAULT '{}',
  traffic_sources JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content performance metrics
CREATE TABLE content_metrics (
  date DATE PRIMARY KEY,
  notes_published INTEGER DEFAULT 0,
  total_words INTEGER DEFAULT 0,
  avg_quality_score DECIMAL(3,2),
  member_opens INTEGER DEFAULT 0,
  member_clicks INTEGER DEFAULT 0,
  topics TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversion funnel tracking
CREATE TABLE conversion_funnels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funnel_name TEXT NOT NULL, -- 'product_purchase', 'newsletter_signup', etc.
  step_name TEXT NOT NULL,
  user_id TEXT,
  session_id TEXT,
  step_data JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Performance monitoring
CREATE TABLE performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL, -- 'page_load', 'function_execution', 'api_response'
  metric_name TEXT NOT NULL,
  value_ms INTEGER NOT NULL,
  metadata JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- Service role policies
CREATE POLICY "Service role full access" ON analytics_events FOR ALL USING (true);
CREATE POLICY "Service role full access" ON daily_metrics FOR ALL USING (true);
CREATE POLICY "Service role full access" ON content_metrics FOR ALL USING (true);
CREATE POLICY "Service role full access" ON conversion_funnels FOR ALL USING (true);
CREATE POLICY "Service role full access" ON performance_metrics FOR ALL USING (true);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Analytics events
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);

-- Daily metrics
CREATE INDEX idx_daily_metrics_date ON daily_metrics(date DESC);
CREATE INDEX idx_daily_metrics_revenue ON daily_metrics(revenue_cents DESC);

-- Content metrics
CREATE INDEX idx_content_metrics_date ON content_metrics(date DESC);
CREATE INDEX idx_content_metrics_published ON content_metrics(notes_published DESC);

-- Conversion funnels
CREATE INDEX idx_conversion_funnels_name ON conversion_funnels(funnel_name);
CREATE INDEX idx_conversion_funnels_user_id ON conversion_funnels(user_id);
CREATE INDEX idx_conversion_funnels_timestamp ON conversion_funnels(timestamp DESC);

-- Performance metrics
CREATE INDEX idx_performance_metrics_type ON performance_metrics(metric_type);
CREATE INDEX idx_performance_metrics_name ON performance_metrics(metric_name);
CREATE INDEX idx_performance_metrics_timestamp ON performance_metrics(timestamp DESC);
