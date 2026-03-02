-- Foreclosure Funder: Enum Types
-- All custom PostgreSQL enums used across the schema

CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'investor');

CREATE TYPE subscription_tier AS ENUM ('free', 'standard', 'premium');

CREATE TYPE subscription_status AS ENUM ('trial', 'active', 'canceled', 'expired');

CREATE TYPE financing_method AS ENUM ('cash', 'loc', 'mortgage', 'mixed');

CREATE TYPE condition_preference AS ENUM ('teardown_ok', 'needs_work', 'cosmetic_only', 'structurally_sound');

CREATE TYPE title_status AS ENUM ('clean', 'clouded', 'complex');

CREATE TYPE pipeline_stage AS ENUM (
  'watching', 'researching', 'site_visit', 'preparing_offer',
  'offer_submitted', 'counter_offered', 'offer_accepted',
  'in_closing', 'closed', 'rejected', 'no_response', 'passed'
);

CREATE TYPE notice_type AS ENUM ('new_filing', 'scheduled_sale');

CREATE TYPE property_stage AS ENUM (
  'new_filing', 'sale_date_assigned', 'upcoming',
  'sold', 'redeemed', 'canceled'
);

CREATE TYPE outreach_status AS ENUM ('active', 'paused', 'completed');
