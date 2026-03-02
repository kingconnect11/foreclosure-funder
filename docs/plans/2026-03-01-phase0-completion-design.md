# Phase 0 Completion - Design Document

**Date:** March 1, 2026
**Scope:** Finish all remaining Phase 0 tasks — seed data, auth verification, account setup, scraper deps, handoff
**Reference:** `docs/handoff/2026-03-01_1629_phase0-backend-handoff.md` (what was completed), `FOUNDING_ARCHITECTURE.md` (source of truth)

---

## Context

Phase 0 backend foundation was built earlier today: 5 Supabase migrations (enums, core tables, auth trigger, RLS policies, seed data), a Google Sheets backfill script, and scraper updates for dual-write (Supabase + Sheets). All migrations are applied to remote project `fgcwbrolnxpfihqkvmcn`.

What remains: running the seed script, testing the auth trigger, creating founder accounts, fixing scraper dependencies, and writing a final handoff.

## Scope Decisions

- **Bidirectional sync (Supabase <-> Google Sheets):** Deferred. The scraper already dual-writes (Supabase first, Sheets second). Mike continues using Sheets day-to-day until the dashboard is live. If a Sheets -> Supabase sync is needed later, build a lightweight Apps Script or cron job. Documented in the handoff.
- **Domain registration (`foreclosurefunder.com`):** Deferred until beta launch.
- **PWA manifest + service worker:** Deferred to Phase 1 (requires the Next.js app).

## Execution Approach

Script-first: everything runs through Python scripts, curl/API calls, and Supabase CLI. Reproducible and debuggable. No manual dashboard clicks.

---

## Section 1: Audit & Fix Seed Script

1. Read `scripts/seed_from_sheets.py` and verify column mappings match the actual migration schema
2. Fix any drift between script field names and migration column names
3. Add `supabase` to `scripts/requirements.txt` if missing
4. Verify `scraper/google_credentials.json` exists (needed by gspread)

## Section 2: Run Seed Script & Verify

1. Set env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
2. Install Python deps: `pip install supabase gspread google-auth`
3. Run: `python3 scripts/seed_from_sheets.py`
4. Verify via Supabase REST API (curl with service role key):
   - `properties` table has rows from Scheduled Sales + New Filings tabs
   - `profiles` table has placeholder investor rows
   - All investors linked to deal room `00000000-0000-0000-0000-000000000002`

## Section 3: Test Auth Trigger

1. Create test user via Supabase Auth admin API (`POST /auth/v1/admin/users`)
2. Query `profiles` to verify auto-created row:
   - Matching UUID
   - `role = 'investor'`
   - `subscription_tier = 'free'`
   - `subscription_status = 'trial'`
   - `trial_ends_at` ~60 days out
3. Delete test user after verification

## Section 4: Create Founder Accounts & Promote

### Philip King (super_admin)
1. Create via Auth admin API: `kingconnection@icloud.com`
2. Verify profile auto-created
3. Promote: `UPDATE profiles SET role = 'super_admin' WHERE email = 'kingconnection@icloud.com';`

### Mike King (admin)
1. Create via Auth admin API: `mike.king@lptrealty.com`
2. Verify profile auto-created
3. Promote + link deal room:
   ```sql
   UPDATE profiles SET role = 'admin', deal_room_id = '00000000-0000-0000-0000-000000000002'
   WHERE email = 'mike.king@lptrealty.com';

   UPDATE deal_rooms SET owner_id = (SELECT id FROM profiles WHERE email = 'mike.king@lptrealty.com')
   WHERE id = '00000000-0000-0000-0000-000000000002';
   ```

## Section 5: Fix Scraper Dependencies

1. Add `supabase` to `scraper/requirements.txt` (or create if absent)
2. Verify scraper env var names match `.env.example`

## Section 6: Write Final Handoff Doc

Create `docs/handoff/2026-03-01_phase0-completion-handoff.md`:
- Everything completed across both sessions
- Bidir sync status and future path
- Phase 0 officially closed
- Checklist of what Phase 1 picks up from

---

## Success Criteria

- [ ] Properties table populated from Google Sheets
- [ ] Auth trigger creates profile rows on user signup
- [ ] Philip has `super_admin` role
- [ ] Mike has `admin` role, linked to deal room, deal room `owner_id` set
- [ ] Scraper `requirements.txt` includes `supabase`
- [ ] Final handoff doc written and committed
