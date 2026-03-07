-- Day 2 security hardening
-- 1) Prevent self-escalation on profiles role/subscription/deal_room fields
-- 2) Add missing index for investor_pipeline.deal_room_id
-- 3) Add explicit super_admin policy for pipeline_stage_history

CREATE OR REPLACE FUNCTION prevent_profile_privilege_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  viewer_role user_role;
BEGIN
  -- Service role is trusted automation (scraper, admin scripts, migrations)
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  viewer_role := get_user_role();
  IF viewer_role = 'super_admin' THEN
    RETURN NEW;
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role
    OR NEW.subscription_tier IS DISTINCT FROM OLD.subscription_tier
    OR NEW.subscription_status IS DISTINCT FROM OLD.subscription_status
    OR NEW.deal_room_id IS DISTINCT FROM OLD.deal_room_id THEN
    RAISE EXCEPTION 'Protected profile fields cannot be modified by this user';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_profile_privilege_escalation ON profiles;
CREATE TRIGGER trg_prevent_profile_privilege_escalation
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_profile_privilege_escalation();

CREATE INDEX IF NOT EXISTS idx_investor_pipeline_deal_room_id
  ON investor_pipeline(deal_room_id);

DROP POLICY IF EXISTS "super_admin_all_stage_history" ON pipeline_stage_history;
CREATE POLICY "super_admin_all_stage_history" ON pipeline_stage_history
  FOR ALL
  USING (get_user_role() = 'super_admin')
  WITH CHECK (get_user_role() = 'super_admin');
