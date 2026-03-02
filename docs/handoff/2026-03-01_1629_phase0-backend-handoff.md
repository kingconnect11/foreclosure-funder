# Phase 0 Backend Foundation - Hand-Off Doc

**Date:** March 1, 2026, 4:29 PM CST
**Branch:** `main`
**Repo:** https://github.com/kingconnect11/foreclosure-funder
**Supabase Project:** `fgcwbrolnxpfihqkvmcn`

---

## What Was Completed

### 1. Supabase CLI Installed and Linked ✅
- Supabase CLI v2.75.0 installed to `~/bin/supabase`
- Project initialized (`supabase/config.toml`)
- Linked to remote project `fgcwbrolnxpfihqkvmcn`
- **Note:** CLI was installed via direct binary download (brew failed due to outdated Xcode CLT)

### 2. Migration: Enum Types ✅
- **File:** `supabase/migrations/20260301235354_enums_and_types.sql`
- **Applied to remote:** Yes
- 10 custom PostgreSQL enums created:
  - `user_role` (super_admin, admin, investor)
  - `subscription_tier` (free, standard, premium)
  - `subscription_status` (trial, active, canceled, expired)
  - `financing_method` (cash, loc, mortgage, mixed)
  - `condition_preference` (teardown_ok, needs_work, cosmetic_only, structurally_sound)
  - `title_status` (clean, clouded, complex)
  - `pipeline_stage` (12 stages from watching to passed)
  - `notice_type` (new_filing, scheduled_sale)
  - `property_stage` (6 stages from new_filing to canceled)
  - `outreach_status` (active, paused, completed)

### 3. Migration: Core Tables ✅
- **File:** `supabase/migrations/20260301235512_core_tables.sql`
- **Applied to remote:** Yes
- 9 tables created in FK dependency order:
  1. `markets` — geographic regions with scraper config
  2. `deal_rooms` — agent/group containers with branding
  3. `profiles` — extends auth.users (FK to deal_rooms)
  4. `investor_preferences` — onboarding interview data
  5. `properties` — core foreclosure property data
  6. `court_research` — liens, judgments, title status per property
  7. `investor_pipeline` — per-investor per-property tracking
  8. `recommendation_scores` — computed match scores
  9. `outreach_campaigns` — deal room automation touches
- Includes: `update_updated_at_column()` trigger function, 4 triggers, 5 indexes

### 4. Migration: Auth Trigger ✅
- **File:** `supabase/migrations/20260301235755_auth_trigger.sql`
- **Applied to remote:** Yes
- `handle_new_user()` function (SECURITY DEFINER)
- Trigger `on_auth_user_created` on `auth.users`
- Auto-creates profile row: role=investor, tier=free, status=trial, 60-day trial

### 5. Migration: RLS Policies ✅
- **File:** `supabase/migrations/20260301235841_rls_policies.sql`
- **Applied to remote:** Yes
- RLS enabled on all 9 tables
- 35 policies total:
  - `profiles`: 5 policies
  - `markets`: 2 policies
  - `deal_rooms`: 4 policies
  - `properties`: 2 policies
  - `court_research`: 2 policies
  - `investor_preferences`: 5 policies
  - `investor_pipeline`: 7 policies
  - `recommendation_scores`: 3 policies
  - `outreach_campaigns`: 5 policies
- Helper functions: `get_user_role()`, `get_user_deal_room_id()`
- Three-tier access: super_admin (everything), admin (deal room scope via JOINs), investor (own rows)

### 6. Migration: Seed Data ✅
- **File:** `supabase/migrations/20260302000119_seed_data.sql`
- **Applied to remote:** Yes
- Sedgwick County, KS market (UUID: `00000000-0000-0000-0000-000000000001`)
  - Includes scraper config: PDF URL, appraiser URL, manufactured home keywords
- Mike King Investment Group deal room (UUID: `00000000-0000-0000-0000-000000000002`)
  - Contact: mike.king@lptrealty.com
  - owner_id is NULL (set after Mike signs up)

### 7. Seed Script ✅
- **File:** `scripts/seed_from_sheets.py`
- **File:** `scripts/requirements.txt`
- Reads from Google Sheet `1JCvukRernEhHJntzanSBk98UC6o6nuHPXvPF9buyu8w`
- Tabs: "Investors", "Scheduled Sales", "New Filings"
- Idempotent (skips existing case numbers/emails)
- **Not yet run** — needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars

### 8. Scraper Updated with Supabase Writes ✅
- **File:** `scraper/foreclosure_scraper.py` (modified)
- Added: `connect_to_supabase()`, `get_existing_supabase_cases()`, `write_to_supabase()`
- Integrated into `run_scraper()`:
  - Supabase connection after API key check (optional, continues without)
  - Dedup merges Supabase + Google Sheets case numbers
  - Writes to Supabase FIRST, then Google Sheets (secondary sync)
- Backward-compatible: works without Supabase env vars

### 9. Environment Config ✅
- **File:** `.env.example`
- Documents: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY, SPREADSHEET_ID

### 10. Final Verification ✅
- All 5 migrations synced (local = remote)
- All 9 tables confirmed via `inspect db table-stats`
- RLS ENABLED confirmed on all 9 tables via management API
- Auth trigger `on_auth_user_created` confirmed on `auth.users`
- 35 RLS policies confirmed with correct per-table counts
- Seed data verified: 1 market row, 1 deal room row
- Both Python files pass syntax check

---

## What's Left in Phase 0

### Manual Steps (Must Do Before Moving to Phase 1)

1. **Run the seed script** to backfill existing properties from Google Sheets:
   ```bash
   cd "/Users/iamtheking/Documents/Projects/Mike King Real Estate"
   export SUPABASE_URL=https://fgcwbrolnxpfihqkvmcn.supabase.co
   export SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   pip install supabase gspread google-auth
   python3 scripts/seed_from_sheets.py
   ```

2. **Test the auth trigger** — create a test user in Supabase dashboard (Authentication > Users > Add User) and confirm a `profiles` row auto-creates with role=investor, tier=free, status=trial.

3. **Promote Philip to super_admin** (after he signs up):
   ```sql
   UPDATE profiles SET role = 'super_admin' WHERE email = 'kingconnection@icloud.com';
   ```

4. **Promote Mike to admin and link deal room** (after he signs up):
   ```sql
   UPDATE profiles SET role = 'admin', deal_room_id = '00000000-0000-0000-0000-000000000002'
   WHERE email = 'mike.king@lptrealty.com';

   UPDATE deal_rooms SET owner_id = (SELECT id FROM profiles WHERE email = 'mike.king@lptrealty.com')
   WHERE id = '00000000-0000-0000-0000-000000000002';
   ```

5. **Add `supabase` to scraper pip dependencies** and set env vars on whatever machine runs the cron job.

6. **Update Xcode Command Line Tools** (optional but recommended):
   ```bash
   sudo rm -rf /Library/Developer/CommandLineTools
   sudo xcode-select --install
   ```
   This will fix the `brew install` issue encountered during setup.

### Not Started (Phase 1 and Beyond)

- Frontend dashboard (Next.js + Supabase client)
- Onboarding interview flow
- Recommendation engine
- Deal Room investor management UI
- Outreach campaign automation
- Subscription/tier gating at API level

---

## Key Files

| File | Purpose |
|------|---------|
| `supabase/config.toml` | Supabase CLI config |
| `supabase/migrations/*.sql` | 5 versioned migrations |
| `scripts/seed_from_sheets.py` | One-time backfill from Google Sheets |
| `scripts/requirements.txt` | Python deps for seed script |
| `scraper/foreclosure_scraper.py` | Scraper with Supabase + Sheets dual-write |
| `.env.example` | Environment variable template |

## Key UUIDs

| Entity | UUID |
|--------|------|
| Sedgwick County market | `00000000-0000-0000-0000-000000000001` |
| Mike King Investment Group deal room | `00000000-0000-0000-0000-000000000002` |

## Credentials Used (Rotate if Needed)

- Supabase access token was provided during CLI login
- Database password was provided during CLI link
- Service role key was used for verification
- All credentials were used in-session only, not stored in files
