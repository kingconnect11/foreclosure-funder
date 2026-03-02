-- Foreclosure Funder: Row-Level Security Policies
-- Three-tier access: super_admin (everything), admin (deal room), investor (own rows)

-- Helper function: get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: get current user's deal_room_id
CREATE OR REPLACE FUNCTION get_user_deal_room_id()
RETURNS UUID AS $$
  SELECT deal_room_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- PROFILES
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Super admin: full access
CREATE POLICY "super_admin_all_profiles" ON profiles
  FOR ALL USING (get_user_role() = 'super_admin');

-- Admin: read profiles in their deal room
CREATE POLICY "admin_read_deal_room_profiles" ON profiles
  FOR SELECT USING (
    get_user_role() = 'admin'
    AND deal_room_id = get_user_deal_room_id()
  );

-- Admin: read their own profile (even if deal_room_id doesn't match yet)
CREATE POLICY "admin_read_own_profile" ON profiles
  FOR SELECT USING (
    get_user_role() = 'admin'
    AND id = auth.uid()
  );

-- Investor: read own profile
CREATE POLICY "investor_read_own_profile" ON profiles
  FOR SELECT USING (id = auth.uid());

-- Users: update own profile (but not role or subscription fields)
CREATE POLICY "user_update_own_profile" ON profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================================
-- MARKETS
-- ============================================================
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read markets
CREATE POLICY "authenticated_read_markets" ON markets
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Super admin: full CRUD
CREATE POLICY "super_admin_all_markets" ON markets
  FOR ALL USING (get_user_role() = 'super_admin');

-- ============================================================
-- DEAL ROOMS
-- ============================================================
ALTER TABLE deal_rooms ENABLE ROW LEVEL SECURITY;

-- Super admin: full access
CREATE POLICY "super_admin_all_deal_rooms" ON deal_rooms
  FOR ALL USING (get_user_role() = 'super_admin');

-- Admin: read/update own deal room
CREATE POLICY "admin_read_own_deal_room" ON deal_rooms
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "admin_update_own_deal_room" ON deal_rooms
  FOR UPDATE USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Investors: read their deal room (if they belong to one)
CREATE POLICY "investor_read_own_deal_room" ON deal_rooms
  FOR SELECT USING (
    id = get_user_deal_room_id()
  );

-- ============================================================
-- PROPERTIES
-- ============================================================
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read properties (tier gating at API level)
CREATE POLICY "authenticated_read_properties" ON properties
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Super admin: full CRUD (scraper uses service role key, bypasses RLS)
CREATE POLICY "super_admin_all_properties" ON properties
  FOR ALL USING (get_user_role() = 'super_admin');

-- ============================================================
-- COURT RESEARCH
-- ============================================================
ALTER TABLE court_research ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read (tier gating at API level)
CREATE POLICY "authenticated_read_court_research" ON court_research
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Super admin: full CRUD
CREATE POLICY "super_admin_all_court_research" ON court_research
  FOR ALL USING (get_user_role() = 'super_admin');

-- ============================================================
-- INVESTOR PREFERENCES
-- ============================================================
ALTER TABLE investor_preferences ENABLE ROW LEVEL SECURITY;

-- Super admin: full access
CREATE POLICY "super_admin_all_investor_preferences" ON investor_preferences
  FOR ALL USING (get_user_role() = 'super_admin');

-- Investor: read/write own preferences
CREATE POLICY "investor_read_own_preferences" ON investor_preferences
  FOR SELECT USING (investor_id = auth.uid());

CREATE POLICY "investor_insert_own_preferences" ON investor_preferences
  FOR INSERT WITH CHECK (investor_id = auth.uid());

CREATE POLICY "investor_update_own_preferences" ON investor_preferences
  FOR UPDATE USING (investor_id = auth.uid())
  WITH CHECK (investor_id = auth.uid());

-- Admin: read preferences for investors in their deal room (JOIN, not subquery)
CREATE POLICY "admin_read_deal_room_preferences" ON investor_preferences
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM profiles AS viewer
      JOIN profiles AS target ON target.deal_room_id = viewer.deal_room_id
      JOIN deal_rooms ON deal_rooms.id = viewer.deal_room_id
        AND deal_rooms.owner_id = viewer.id
      WHERE viewer.id = auth.uid()
        AND target.id = investor_preferences.investor_id
    )
  );

-- ============================================================
-- INVESTOR PIPELINE (critical - performance-sensitive)
-- ============================================================
ALTER TABLE investor_pipeline ENABLE ROW LEVEL SECURITY;

-- Super admin: full access
CREATE POLICY "super_admin_all_investor_pipeline" ON investor_pipeline
  FOR ALL USING (get_user_role() = 'super_admin');

-- Investor: full CRUD on own pipeline entries
CREATE POLICY "investor_read_own_pipeline" ON investor_pipeline
  FOR SELECT USING (investor_id = auth.uid());

CREATE POLICY "investor_insert_own_pipeline" ON investor_pipeline
  FOR INSERT WITH CHECK (investor_id = auth.uid());

CREATE POLICY "investor_update_own_pipeline" ON investor_pipeline
  FOR UPDATE USING (investor_id = auth.uid())
  WITH CHECK (investor_id = auth.uid());

CREATE POLICY "investor_delete_own_pipeline" ON investor_pipeline
  FOR DELETE USING (investor_id = auth.uid());

-- Admin: read all pipelines in their deal room
-- Uses JOIN (not subquery) for performance. Relies on idx_profiles_deal_room_id.
-- Join path: investor_pipeline.investor_id -> profiles.deal_room_id -> deal_rooms.owner_id
CREATE POLICY "admin_read_deal_room_pipelines" ON investor_pipeline
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM profiles AS viewer
      JOIN profiles AS target ON target.deal_room_id = viewer.deal_room_id
      JOIN deal_rooms ON deal_rooms.id = viewer.deal_room_id
        AND deal_rooms.owner_id = viewer.id
      WHERE viewer.id = auth.uid()
        AND target.id = investor_pipeline.investor_id
    )
  );

-- Admin: update group_notes for investors in their deal room
CREATE POLICY "admin_update_deal_room_pipeline_notes" ON investor_pipeline
  FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM profiles AS viewer
      JOIN profiles AS target ON target.deal_room_id = viewer.deal_room_id
      JOIN deal_rooms ON deal_rooms.id = viewer.deal_room_id
        AND deal_rooms.owner_id = viewer.id
      WHERE viewer.id = auth.uid()
        AND target.id = investor_pipeline.investor_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM profiles AS viewer
      JOIN profiles AS target ON target.deal_room_id = viewer.deal_room_id
      JOIN deal_rooms ON deal_rooms.id = viewer.deal_room_id
        AND deal_rooms.owner_id = viewer.id
      WHERE viewer.id = auth.uid()
        AND target.id = investor_pipeline.investor_id
    )
  );

-- ============================================================
-- RECOMMENDATION SCORES
-- ============================================================
ALTER TABLE recommendation_scores ENABLE ROW LEVEL SECURITY;

-- Super admin: full access
CREATE POLICY "super_admin_all_recommendation_scores" ON recommendation_scores
  FOR ALL USING (get_user_role() = 'super_admin');

-- Investor: read own scores
CREATE POLICY "investor_read_own_scores" ON recommendation_scores
  FOR SELECT USING (investor_id = auth.uid());

-- Admin: read scores for investors in their deal room (same JOIN pattern)
CREATE POLICY "admin_read_deal_room_scores" ON recommendation_scores
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM profiles AS viewer
      JOIN profiles AS target ON target.deal_room_id = viewer.deal_room_id
      JOIN deal_rooms ON deal_rooms.id = viewer.deal_room_id
        AND deal_rooms.owner_id = viewer.id
      WHERE viewer.id = auth.uid()
        AND target.id = recommendation_scores.investor_id
    )
  );

-- ============================================================
-- OUTREACH CAMPAIGNS
-- ============================================================
ALTER TABLE outreach_campaigns ENABLE ROW LEVEL SECURITY;

-- Super admin: full access
CREATE POLICY "super_admin_all_outreach_campaigns" ON outreach_campaigns
  FOR ALL USING (get_user_role() = 'super_admin');

-- Admin: full CRUD on own deal room's campaigns
CREATE POLICY "admin_read_own_deal_room_campaigns" ON outreach_campaigns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deal_rooms
      WHERE deal_rooms.id = outreach_campaigns.deal_room_id
        AND deal_rooms.owner_id = auth.uid()
    )
  );

CREATE POLICY "admin_insert_own_deal_room_campaigns" ON outreach_campaigns
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM deal_rooms
      WHERE deal_rooms.id = outreach_campaigns.deal_room_id
        AND deal_rooms.owner_id = auth.uid()
    )
  );

CREATE POLICY "admin_update_own_deal_room_campaigns" ON outreach_campaigns
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM deal_rooms
      WHERE deal_rooms.id = outreach_campaigns.deal_room_id
        AND deal_rooms.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM deal_rooms
      WHERE deal_rooms.id = outreach_campaigns.deal_room_id
        AND deal_rooms.owner_id = auth.uid()
    )
  );

CREATE POLICY "admin_delete_own_deal_room_campaigns" ON outreach_campaigns
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM deal_rooms
      WHERE deal_rooms.id = outreach_campaigns.deal_room_id
        AND deal_rooms.owner_id = auth.uid()
    )
  );
