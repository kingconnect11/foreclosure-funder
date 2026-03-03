-- Pipeline stage history: tracks per-stage notes when investors move properties through stages

CREATE TABLE pipeline_stage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id UUID NOT NULL REFERENCES investor_pipeline(id) ON DELETE CASCADE,
  stage pipeline_stage NOT NULL,
  notes TEXT,
  entered_at TIMESTAMPTZ DEFAULT now(),
  exited_at TIMESTAMPTZ
);

-- Index for fast lookups
CREATE INDEX idx_stage_history_pipeline ON pipeline_stage_history(pipeline_id);
CREATE INDEX idx_stage_history_stage ON pipeline_stage_history(stage);

-- RLS
ALTER TABLE pipeline_stage_history ENABLE ROW LEVEL SECURITY;

-- Investors can read their own stage history
CREATE POLICY "investors_read_own_stage_history" ON pipeline_stage_history
  FOR SELECT USING (
    pipeline_id IN (
      SELECT id FROM investor_pipeline WHERE investor_id = auth.uid()
    )
  );

-- Investors can insert into their own stage history
CREATE POLICY "investors_insert_own_stage_history" ON pipeline_stage_history
  FOR INSERT WITH CHECK (
    pipeline_id IN (
      SELECT id FROM investor_pipeline WHERE investor_id = auth.uid()
    )
  );

-- Investors can update their own stage history (for exited_at)
CREATE POLICY "investors_update_own_stage_history" ON pipeline_stage_history
  FOR UPDATE USING (
    pipeline_id IN (
      SELECT id FROM investor_pipeline WHERE investor_id = auth.uid()
    )
  );

-- Admin can read stage history for their deal room's investors
CREATE POLICY "admin_read_deal_room_stage_history" ON pipeline_stage_history
  FOR SELECT USING (
    pipeline_id IN (
      SELECT ip.id FROM investor_pipeline ip
      JOIN profiles p ON p.id = ip.investor_id
      WHERE p.deal_room_id = (SELECT get_user_deal_room_id())
    )
    AND get_user_role() IN ('admin', 'super_admin')
  );
