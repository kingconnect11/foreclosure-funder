-- Owned Properties foundation
-- Adds investor-owned asset tracking, optional cost line items, and chart preferences.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'owned_property_status'
      AND n.nspname = 'public'
  ) THEN
    CREATE TYPE owned_property_status AS ENUM ('active', 'sold');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'owned_cost_category'
      AND n.nspname = 'public'
  ) THEN
    CREATE TYPE owned_cost_category AS ENUM (
      'construction',
      'legal',
      'interest',
      'taxes',
      'insurance',
      'hoa',
      'utilities',
      'other'
    );
  END IF;
END$$;

-- ---------------------------------------------------------------------------
-- Pipeline marker: moved into Owned tab
-- ---------------------------------------------------------------------------

ALTER TABLE investor_pipeline
  ADD COLUMN IF NOT EXISTS moved_to_owned_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_investor_pipeline_moved_to_owned_at
  ON investor_pipeline(moved_to_owned_at);

-- ---------------------------------------------------------------------------
-- Owned properties
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS owned_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  deal_room_id UUID REFERENCES deal_rooms(id) ON DELETE SET NULL,
  source_property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  source_pipeline_id UUID REFERENCES investor_pipeline(id) ON DELETE SET NULL,
  address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  acquired_at DATE NOT NULL,
  status owned_property_status NOT NULL DEFAULT 'active',
  purchase_price NUMERIC NOT NULL DEFAULT 0,
  sale_price NUMERIC,
  sold_at DATE,
  current_value NUMERIC NOT NULL DEFAULT 0,
  construction_cost_total NUMERIC NOT NULL DEFAULT 0,
  legal_fees_total NUMERIC NOT NULL DEFAULT 0,
  interest_paid_total NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT owned_properties_sale_fields_check
    CHECK (
      (status = 'sold' AND sale_price IS NOT NULL AND sold_at IS NOT NULL)
      OR
      (status = 'active')
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_owned_properties_source_pipeline_unique
  ON owned_properties(source_pipeline_id)
  WHERE source_pipeline_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_owned_properties_investor_id
  ON owned_properties(investor_id);

CREATE INDEX IF NOT EXISTS idx_owned_properties_deal_room_id
  ON owned_properties(deal_room_id);

CREATE INDEX IF NOT EXISTS idx_owned_properties_status
  ON owned_properties(status);

CREATE INDEX IF NOT EXISTS idx_owned_properties_acquired_at
  ON owned_properties(acquired_at);

CREATE TABLE IF NOT EXISTS owned_property_cost_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owned_property_id UUID NOT NULL REFERENCES owned_properties(id) ON DELETE CASCADE,
  investor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category owned_cost_category NOT NULL,
  subcategory TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  incurred_on DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_owned_property_cost_items_owned_property_id
  ON owned_property_cost_items(owned_property_id);

CREATE INDEX IF NOT EXISTS idx_owned_property_cost_items_investor_id
  ON owned_property_cost_items(investor_id);

CREATE INDEX IF NOT EXISTS idx_owned_property_cost_items_category
  ON owned_property_cost_items(category);

CREATE INDEX IF NOT EXISTS idx_owned_property_cost_items_incurred_on
  ON owned_property_cost_items(incurred_on);

CREATE TABLE IF NOT EXISTS owned_chart_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  pinned_chart_ids TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- updated_at triggers
DROP TRIGGER IF EXISTS set_owned_properties_updated_at ON owned_properties;
CREATE TRIGGER set_owned_properties_updated_at
  BEFORE UPDATE ON owned_properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_owned_property_cost_items_updated_at ON owned_property_cost_items;
CREATE TRIGGER set_owned_property_cost_items_updated_at
  BEFORE UPDATE ON owned_property_cost_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_owned_chart_preferences_updated_at ON owned_chart_preferences;
CREATE TRIGGER set_owned_chart_preferences_updated_at
  BEFORE UPDATE ON owned_chart_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

ALTER TABLE owned_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE owned_property_cost_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE owned_chart_preferences ENABLE ROW LEVEL SECURITY;

-- owned_properties
DROP POLICY IF EXISTS "super_admin_all_owned_properties" ON owned_properties;
CREATE POLICY "super_admin_all_owned_properties" ON owned_properties
  FOR ALL USING (get_user_role() = 'super_admin');

DROP POLICY IF EXISTS "investor_read_own_owned_properties" ON owned_properties;
CREATE POLICY "investor_read_own_owned_properties" ON owned_properties
  FOR SELECT USING (investor_id = auth.uid());

DROP POLICY IF EXISTS "investor_insert_own_owned_properties" ON owned_properties;
CREATE POLICY "investor_insert_own_owned_properties" ON owned_properties
  FOR INSERT WITH CHECK (investor_id = auth.uid());

DROP POLICY IF EXISTS "investor_update_own_owned_properties" ON owned_properties;
CREATE POLICY "investor_update_own_owned_properties" ON owned_properties
  FOR UPDATE USING (investor_id = auth.uid())
  WITH CHECK (investor_id = auth.uid());

DROP POLICY IF EXISTS "investor_delete_own_owned_properties" ON owned_properties;
CREATE POLICY "investor_delete_own_owned_properties" ON owned_properties
  FOR DELETE USING (investor_id = auth.uid());

DROP POLICY IF EXISTS "admin_read_deal_room_owned_properties" ON owned_properties;
CREATE POLICY "admin_read_deal_room_owned_properties" ON owned_properties
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM profiles AS viewer
      JOIN profiles AS target ON target.deal_room_id = viewer.deal_room_id
      JOIN deal_rooms ON deal_rooms.id = viewer.deal_room_id
        AND deal_rooms.owner_id = viewer.id
      WHERE viewer.id = auth.uid()
        AND target.id = owned_properties.investor_id
    )
  );

DROP POLICY IF EXISTS "admin_insert_deal_room_owned_properties" ON owned_properties;
CREATE POLICY "admin_insert_deal_room_owned_properties" ON owned_properties
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM profiles AS viewer
      JOIN profiles AS target ON target.deal_room_id = viewer.deal_room_id
      JOIN deal_rooms ON deal_rooms.id = viewer.deal_room_id
        AND deal_rooms.owner_id = viewer.id
      WHERE viewer.id = auth.uid()
        AND target.id = owned_properties.investor_id
    )
  );

DROP POLICY IF EXISTS "admin_update_deal_room_owned_properties" ON owned_properties;
CREATE POLICY "admin_update_deal_room_owned_properties" ON owned_properties
  FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM profiles AS viewer
      JOIN profiles AS target ON target.deal_room_id = viewer.deal_room_id
      JOIN deal_rooms ON deal_rooms.id = viewer.deal_room_id
        AND deal_rooms.owner_id = viewer.id
      WHERE viewer.id = auth.uid()
        AND target.id = owned_properties.investor_id
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
        AND target.id = owned_properties.investor_id
    )
  );

DROP POLICY IF EXISTS "admin_delete_deal_room_owned_properties" ON owned_properties;
CREATE POLICY "admin_delete_deal_room_owned_properties" ON owned_properties
  FOR DELETE USING (
    EXISTS (
      SELECT 1
      FROM profiles AS viewer
      JOIN profiles AS target ON target.deal_room_id = viewer.deal_room_id
      JOIN deal_rooms ON deal_rooms.id = viewer.deal_room_id
        AND deal_rooms.owner_id = viewer.id
      WHERE viewer.id = auth.uid()
        AND target.id = owned_properties.investor_id
    )
  );

-- owned_property_cost_items
DROP POLICY IF EXISTS "super_admin_all_owned_cost_items" ON owned_property_cost_items;
CREATE POLICY "super_admin_all_owned_cost_items" ON owned_property_cost_items
  FOR ALL USING (get_user_role() = 'super_admin');

DROP POLICY IF EXISTS "investor_read_own_owned_cost_items" ON owned_property_cost_items;
CREATE POLICY "investor_read_own_owned_cost_items" ON owned_property_cost_items
  FOR SELECT USING (investor_id = auth.uid());

DROP POLICY IF EXISTS "investor_insert_own_owned_cost_items" ON owned_property_cost_items;
CREATE POLICY "investor_insert_own_owned_cost_items" ON owned_property_cost_items
  FOR INSERT WITH CHECK (investor_id = auth.uid());

DROP POLICY IF EXISTS "investor_update_own_owned_cost_items" ON owned_property_cost_items;
CREATE POLICY "investor_update_own_owned_cost_items" ON owned_property_cost_items
  FOR UPDATE USING (investor_id = auth.uid())
  WITH CHECK (investor_id = auth.uid());

DROP POLICY IF EXISTS "investor_delete_own_owned_cost_items" ON owned_property_cost_items;
CREATE POLICY "investor_delete_own_owned_cost_items" ON owned_property_cost_items
  FOR DELETE USING (investor_id = auth.uid());

DROP POLICY IF EXISTS "admin_read_deal_room_owned_cost_items" ON owned_property_cost_items;
CREATE POLICY "admin_read_deal_room_owned_cost_items" ON owned_property_cost_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM owned_properties op
      JOIN profiles AS viewer ON viewer.id = auth.uid()
      JOIN profiles AS target ON target.id = op.investor_id
      JOIN deal_rooms ON deal_rooms.id = viewer.deal_room_id
        AND deal_rooms.owner_id = viewer.id
      WHERE op.id = owned_property_cost_items.owned_property_id
        AND target.deal_room_id = viewer.deal_room_id
    )
  );

DROP POLICY IF EXISTS "admin_insert_deal_room_owned_cost_items" ON owned_property_cost_items;
CREATE POLICY "admin_insert_deal_room_owned_cost_items" ON owned_property_cost_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM owned_properties op
      JOIN profiles AS viewer ON viewer.id = auth.uid()
      JOIN profiles AS target ON target.id = op.investor_id
      JOIN deal_rooms ON deal_rooms.id = viewer.deal_room_id
        AND deal_rooms.owner_id = viewer.id
      WHERE op.id = owned_property_cost_items.owned_property_id
        AND target.deal_room_id = viewer.deal_room_id
    )
  );

DROP POLICY IF EXISTS "admin_update_deal_room_owned_cost_items" ON owned_property_cost_items;
CREATE POLICY "admin_update_deal_room_owned_cost_items" ON owned_property_cost_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM owned_properties op
      JOIN profiles AS viewer ON viewer.id = auth.uid()
      JOIN profiles AS target ON target.id = op.investor_id
      JOIN deal_rooms ON deal_rooms.id = viewer.deal_room_id
        AND deal_rooms.owner_id = viewer.id
      WHERE op.id = owned_property_cost_items.owned_property_id
        AND target.deal_room_id = viewer.deal_room_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM owned_properties op
      JOIN profiles AS viewer ON viewer.id = auth.uid()
      JOIN profiles AS target ON target.id = op.investor_id
      JOIN deal_rooms ON deal_rooms.id = viewer.deal_room_id
        AND deal_rooms.owner_id = viewer.id
      WHERE op.id = owned_property_cost_items.owned_property_id
        AND target.deal_room_id = viewer.deal_room_id
    )
  );

DROP POLICY IF EXISTS "admin_delete_deal_room_owned_cost_items" ON owned_property_cost_items;
CREATE POLICY "admin_delete_deal_room_owned_cost_items" ON owned_property_cost_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1
      FROM owned_properties op
      JOIN profiles AS viewer ON viewer.id = auth.uid()
      JOIN profiles AS target ON target.id = op.investor_id
      JOIN deal_rooms ON deal_rooms.id = viewer.deal_room_id
        AND deal_rooms.owner_id = viewer.id
      WHERE op.id = owned_property_cost_items.owned_property_id
        AND target.deal_room_id = viewer.deal_room_id
    )
  );

-- owned_chart_preferences
DROP POLICY IF EXISTS "super_admin_all_owned_chart_preferences" ON owned_chart_preferences;
CREATE POLICY "super_admin_all_owned_chart_preferences" ON owned_chart_preferences
  FOR ALL USING (get_user_role() = 'super_admin');

DROP POLICY IF EXISTS "user_read_own_owned_chart_preferences" ON owned_chart_preferences;
CREATE POLICY "user_read_own_owned_chart_preferences" ON owned_chart_preferences
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "user_insert_own_owned_chart_preferences" ON owned_chart_preferences;
CREATE POLICY "user_insert_own_owned_chart_preferences" ON owned_chart_preferences
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "user_update_own_owned_chart_preferences" ON owned_chart_preferences;
CREATE POLICY "user_update_own_owned_chart_preferences" ON owned_chart_preferences
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "user_delete_own_owned_chart_preferences" ON owned_chart_preferences;
CREATE POLICY "user_delete_own_owned_chart_preferences" ON owned_chart_preferences
  FOR DELETE USING (user_id = auth.uid());
