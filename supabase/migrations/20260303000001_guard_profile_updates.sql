-- Security fix: Prevent users from self-escalating role, subscription, or deal room assignment
-- via the profile update RLS policy.
--
-- The existing "user_update_own_profile" policy allows updating any column on own profile.
-- This trigger ensures that sensitive columns can only be changed by service_role (admin ops, scraper).
-- Regular authenticated users can still update: full_name, phone, onboarding_completed,
-- onboarding_transcript_url, email (if needed).

CREATE OR REPLACE FUNCTION prevent_profile_self_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- Service role bypasses this check (used for admin operations, scraper, etc.)
  IF current_setting('role') = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Block role changes
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Cannot change own role';
  END IF;

  -- Block subscription tier changes
  IF NEW.subscription_tier IS DISTINCT FROM OLD.subscription_tier THEN
    RAISE EXCEPTION 'Cannot change own subscription tier';
  END IF;

  -- Block subscription status changes
  IF NEW.subscription_status IS DISTINCT FROM OLD.subscription_status THEN
    RAISE EXCEPTION 'Cannot change own subscription status';
  END IF;

  -- Block deal room assignment changes
  IF NEW.deal_room_id IS DISTINCT FROM OLD.deal_room_id THEN
    RAISE EXCEPTION 'Cannot change own deal room assignment';
  END IF;

  -- Block trial_ends_at changes (related to subscription)
  IF NEW.trial_ends_at IS DISTINCT FROM OLD.trial_ends_at THEN
    RAISE EXCEPTION 'Cannot change own trial end date';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER guard_profile_updates
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_profile_self_escalation();
