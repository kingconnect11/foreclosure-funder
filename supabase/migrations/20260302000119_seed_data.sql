-- Foreclosure Funder: Seed Data
-- Sedgwick County market and Mike's deal room

-- Sedgwick County, KS market
INSERT INTO markets (id, name, state, county, scraper_config, is_active) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Sedgwick County, KS',
  'KS',
  'Sedgwick',
  '{
    "pdf_url": "https://thesedgwickcountypost.com/POST.pdf",
    "appraiser_url": "https://www.sedgwickcounty.org/assessor/property-search/",
    "court_url": null,
    "schedule": "wednesday_9am",
    "manufactured_keywords": ["MANUFACTURED", "MOBILE HOME", "MODULAR", "HUD CODE", "MANUFACTURED HOUSING", "MH -", "MOBILE PARK"]
  }'::jsonb,
  true
);

-- Mike's deal room (owner_id is null until Mike signs up and is linked)
INSERT INTO deal_rooms (id, name, contact_email, contact_phone, settings) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Mike King Investment Group',
  'mike.king@lptrealty.com',
  NULL,
  '{"inter_investor_visibility": false}'::jsonb
);
