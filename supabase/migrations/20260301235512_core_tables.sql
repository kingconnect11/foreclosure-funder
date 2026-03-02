-- Foreclosure Funder: Core Tables
-- 9 tables in FK dependency order

-- Reusable updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Markets (geographic regions with scraper config)
CREATE TABLE markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  county TEXT NOT NULL,
  scraper_config JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Deal Rooms (agent/group containers)
CREATE TABLE deal_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID,  -- FK added after profiles table exists
  name TEXT NOT NULL,
  brand_logo_url TEXT,
  brand_colors JSONB DEFAULT '{}'::jsonb,
  contact_email TEXT,
  contact_phone TEXT,
  website_url TEXT,
  settings JSONB DEFAULT '{"inter_investor_visibility": false}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  role user_role DEFAULT 'investor',
  subscription_tier subscription_tier DEFAULT 'free',
  subscription_status subscription_status DEFAULT 'trial',
  trial_ends_at TIMESTAMPTZ,
  deal_room_id UUID REFERENCES deal_rooms(id) ON DELETE SET NULL,
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_transcript_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_profiles_deal_room_id ON profiles(deal_room_id);

-- Now add the FK from deal_rooms.owner_id -> profiles.id
ALTER TABLE deal_rooms
  ADD CONSTRAINT fk_deal_rooms_owner
  FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- 4. Investor Preferences (from onboarding interview)
CREATE TABLE investor_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  budget_min INTEGER,
  budget_max INTEGER,
  financing_method financing_method,
  risk_tolerance INTEGER CHECK (risk_tolerance BETWEEN 1 AND 10),
  property_types TEXT[],
  intended_use TEXT[],
  location_preferences JSONB,
  condition_preference condition_preference,
  timeline_preference TEXT,
  deal_breakers TEXT[],
  desired_features TEXT[],
  dream_property_description TEXT,
  raw_preferences_json JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(investor_id)
);

-- 5. Properties (the core data)
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID NOT NULL REFERENCES markets(id) ON DELETE RESTRICT,
  case_number TEXT NOT NULL,
  address TEXT,
  city TEXT,
  zip_code TEXT,
  state TEXT,
  defendant_name TEXT,
  plaintiff_name TEXT,
  property_type TEXT,
  bedrooms INTEGER,
  bathrooms NUMERIC,
  sqft INTEGER,
  county_appraisal NUMERIC,
  rpr_value NUMERIC,
  foreclosure_amount NUMERIC,
  sale_date DATE,
  notice_type notice_type,
  stage property_stage DEFAULT 'new_filing',
  attorney_name TEXT,
  source_url TEXT,
  scraped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(market_id, case_number)
);

CREATE INDEX idx_properties_market_id ON properties(market_id);
CREATE INDEX idx_properties_sale_date ON properties(sale_date);

-- 6. Court Research (per property)
CREATE TABLE court_research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  liens JSONB DEFAULT '[]'::jsonb,
  judgments JSONB DEFAULT '[]'::jsonb,
  title_status title_status,
  estimated_offer_min NUMERIC,
  estimated_offer_max NUMERIC,
  research_summary TEXT,
  researched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(property_id)
);

-- 7. Investor Pipeline (per investor per property)
CREATE TABLE investor_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  deal_room_id UUID REFERENCES deal_rooms(id) ON DELETE SET NULL,
  stage pipeline_stage DEFAULT 'watching',
  notes TEXT,
  group_notes TEXT,
  offer_amount NUMERIC,
  stage_changed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(investor_id, property_id)
);

CREATE INDEX idx_investor_pipeline_investor_id ON investor_pipeline(investor_id);
CREATE INDEX idx_investor_pipeline_property_id ON investor_pipeline(property_id);

-- 8. Recommendation Scores (computed)
CREATE TABLE recommendation_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  score NUMERIC CHECK (score BETWEEN 0 AND 100),
  reasons JSONB DEFAULT '[]'::jsonb,
  computed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(investor_id, property_id)
);

CREATE INDEX idx_recommendation_scores_investor ON recommendation_scores(investor_id, score DESC);

-- 9. Outreach Campaigns (for Deal Room automation)
CREATE TABLE outreach_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  deal_room_id UUID NOT NULL REFERENCES deal_rooms(id) ON DELETE CASCADE,
  touch1_sent BOOLEAN DEFAULT false,
  touch1_date DATE,
  touch2_sent BOOLEAN DEFAULT false,
  touch2_date DATE,
  touch3_sent BOOLEAN DEFAULT false,
  touch3_date DATE,
  touch3b_urgent_sent BOOLEAN DEFAULT false,
  touch3b_date DATE,
  status outreach_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(property_id, deal_room_id)
);

-- Apply updated_at triggers
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_investor_preferences_updated_at
  BEFORE UPDATE ON investor_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_investor_pipeline_updated_at
  BEFORE UPDATE ON investor_pipeline
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
