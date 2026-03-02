-- Update auth trigger to extract full_name from signup metadata
-- The signup action passes full_name in raw_user_meta_data,
-- but the original trigger didn't set it on the profile row.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, subscription_tier, subscription_status, trial_ends_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'investor',
    'free',
    'trial',
    now() + INTERVAL '60 days'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
