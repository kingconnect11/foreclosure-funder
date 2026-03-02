-- RPC: get anonymous watching count for a property
-- Returns just the count, no investor details. Safe for any authenticated user.
-- Needed because RLS on investor_pipeline restricts SELECT to own rows for investors,
-- but the frontend needs an aggregate count across all investors.

CREATE OR REPLACE FUNCTION get_watching_count(p_property_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(COUNT(DISTINCT investor_id)::INTEGER, 0)
  FROM investor_pipeline
  WHERE property_id = p_property_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION get_watching_count(UUID) TO authenticated;
