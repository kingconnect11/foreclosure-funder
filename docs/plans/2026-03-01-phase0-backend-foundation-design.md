# Phase 0 Backend Foundation - Design Document

**Date:** March 1, 2026
**Scope:** Priorities 1-5 from HANDOFF_2026-03-01.md (backend only, no frontend)
**Reference:** FOUNDING_ARCHITECTURE.md (source of truth for all schema/business decisions)

---

## 1. Tooling & Project Setup

Install Supabase CLI via Homebrew. Initialize in project root, link to existing project `fgcwbrolnxpfihqkvmcn`.

```
Mike King Real Estate/
├── supabase/
│   ├── config.toml
│   └── migrations/
│       ├── <timestamp>_enums_and_types.sql
│       ├── <timestamp>_core_tables.sql
│       ├── <timestamp>_auth_trigger.sql
│       ├── <timestamp>_rls_policies.sql
│       └── <timestamp>_seed_data.sql
├── scripts/
│   └── seed_from_sheets.py
├── scraper/
│   └── foreclosure_scraper.py    # modified
├── FOUNDING_ARCHITECTURE.md
├── HANDOFF_2026-03-01.md
└── archive/
```

Workflow: `supabase migration new <name>`, `supabase db push`, `supabase db remote status`.

---

## 2. Migration 1: Enums & Types

8 custom PostgreSQL enum types:

| Enum | Values |
|------|--------|
| `user_role` | super_admin, admin, investor |
| `subscription_tier` | free, standard, premium |
| `subscription_status` | trial, active, canceled, expired |
| `financing_method` | cash, loc, mortgage, mixed |
| `condition_preference` | teardown_ok, needs_work, cosmetic_only, structurally_sound |
| `title_status` | clean, clouded, complex |
| `pipeline_stage` | watching, researching, site_visit, preparing_offer, offer_submitted, counter_offered, offer_accepted, in_closing, closed, rejected, no_response, passed |
| `notice_type` | new_filing, scheduled_sale |
| `property_stage` | new_filing, sale_date_assigned, upcoming, sold, redeemed, canceled |
| `outreach_status` | active, paused, completed |

---

## 3. Migration 2: Core Tables

9 tables in FK dependency order:

1. **markets** - geographic regions, `scraper_config` JSONB
2. **deal_rooms** - agent containers, `brand_colors` + `settings` JSONB, FK to owner profile
3. **profiles** - extends auth.users via `id UUID REFERENCES auth.users(id) ON DELETE CASCADE`. Role, tier, deal_room_id.
4. **investor_preferences** - budget, risk, property types (text[]), deal breakers (text[]), raw JSONB
5. **properties** - core data. `UNIQUE(market_id, case_number)`. FK to markets.
6. **court_research** - liens/judgments as JSONB[], title_status enum, offer range
7. **investor_pipeline** - per-investor per-property. 12 pipeline stages. FK to profiles + properties + deal_rooms.
8. **recommendation_scores** - computed score 0-100, reasons JSONB
9. **outreach_campaigns** - 4-touch letter tracking per property per deal room

### Key constraints:
- `profiles.id` = `auth.users.id` (not a separate serial)
- `UNIQUE(market_id, case_number)` on properties
- All tables: `created_at TIMESTAMPTZ DEFAULT now()`
- Mutable tables: `updated_at TIMESTAMPTZ DEFAULT now()` with auto-update trigger

### Indexes:
- `properties(market_id)`
- `properties(sale_date)`
- `profiles(deal_room_id)` - critical for RLS JOIN performance
- `investor_pipeline(investor_id)`
- `investor_pipeline(property_id)`
- `recommendation_scores(investor_id, score DESC)`

---

## 4. Migration 3: Auth Trigger

### Profile auto-creation:
Postgres trigger on `auth.users` INSERT that creates a `profiles` row:
- `id` = new auth.users.id
- `email` = new user's email
- `role` = 'investor' (default)
- `subscription_tier` = 'free' (default)
- `subscription_status` = 'trial'
- `trial_ends_at` = now() + 60 days (beta period)
- `onboarding_completed` = false

Philip and Mike promoted manually after signup.

### updated_at trigger:
Reusable function `update_updated_at_column()` applied to: profiles, investor_preferences, properties, investor_pipeline.

---

## 5. Migration 4: RLS Policies

### Helper function:
`get_user_role()` returns current user's role from profiles. Avoids repeated lookups.

### Policy summary:

| Table | Investor | Admin | Super Admin |
|-------|----------|-------|-------------|
| profiles | Read/update own | Read deal room members | Read/write all |
| markets | Read all | Read all | Full CRUD |
| deal_rooms | - | Read/update own | Full CRUD |
| properties | Read all | Read all | Full CRUD (scraper uses service role) |
| court_research | Read all | Read all | Full CRUD (automation uses service role) |
| investor_preferences | Read/write own | Read deal room members | Read/write all |
| investor_pipeline | Read/write own | Read deal room members | Full CRUD |
| recommendation_scores | Read own | Read deal room members | Full CRUD |
| outreach_campaigns | - | CRUD own deal room | Full CRUD |

### Critical: Admin pipeline policy

The admin read policy on investor_pipeline uses a two-hop JOIN (not a subquery) for performance:

```
investor_pipeline.investor_id -> profiles.deal_room_id -> deal_rooms.owner_id
```

Requires index on `profiles.deal_room_id`. The policy validates:
1. Current user is the deal room owner (deal_rooms.owner_id = auth.uid())
2. The pipeline's investor is in that same deal room (profiles.deal_room_id matches)

Same JOIN pattern reused for admin policies on investor_preferences and recommendation_scores.

### RLS bypass:
Scraper and seed scripts use service role key, which bypasses RLS entirely. This is intentional - backend processes need unrestricted write access.

---

## 6. Migration 5: Seed Data

SQL seed (runs via migration):
- 1 market row: Sedgwick County, KS with scraper_config JSONB (PDF URL, appraiser URL, court URL)
- 1 deal room: "Mike King Investment Group" (owner_id set after Mike signs up)

---

## 7. Python Script: Sheet Backfill

`scripts/seed_from_sheets.py` - run-once script:
- Reads Google Sheets (ID: 1JCvukRernEhHJntzanSBk98UC6o6nuHPXvPF9buyu8w)
- Investors tab -> placeholder profiles (generated UUIDs, linked to Mike's deal room)
- Scheduled Sales + New Filings tabs -> properties table (market_id = Sedgwick County)
- Uses supabase-py with service role key
- Merge-by-email strategy: when investors actually sign up, match by email and update the placeholder row

---

## 8. Scraper Update

Modify `scraper/foreclosure_scraper.py`:
- Add `supabase-py` dependency
- Init Supabase client with `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` env vars
- After extraction + appraiser lookup: write to Supabase `properties` table FIRST
- Dedup check: query properties for existing case_number in Sedgwick County market
- Map scraper fields to properties table columns, set market_id
- On Supabase failure: log error, continue to Google Sheets write (don't break existing workflow)
- Google Sheets write remains as secondary sync

No changes to: PDF download, Claude API extraction, appraiser lookup, manufactured home filter, Sheets write logic, logging.

---

## Execution Order

| Step | Description | Depends on |
|------|-------------|------------|
| 1 | Install Supabase CLI, init, link | - |
| 2 | Migration: enums & types | Step 1 |
| 3 | Migration: core tables | Step 2 |
| 4 | Migration: auth trigger + updated_at | Step 3 |
| 5 | Migration: RLS policies | Step 4 |
| 6 | Migration: seed data | Step 5 |
| 7 | Push all migrations to remote | Step 6 |
| 8 | Python seed script (sheets backfill) | Step 7 |
| 9 | Scraper update | Step 7 |
