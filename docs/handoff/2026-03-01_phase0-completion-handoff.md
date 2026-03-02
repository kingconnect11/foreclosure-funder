# Phase 0 Completion — Hand-Off Doc

**Date:** March 1, 2026
**Branch:** `main`
**Repo:** https://github.com/kingconnect11/foreclosure-funder
**Supabase Project:** `fgcwbrolnxpfihqkvmcn`

---

## Phase 0 Status: COMPLETE

All Phase 0 backend tasks are finished across two sessions today. The Supabase backend is fully operational with schema, auth, RLS, seed data, and founder accounts.

---

## What Was Completed (Session 2 — This Session)

### 1. Seed Script Fixed and Executed ✅
- **Problem:** The original `seed_investors()` called a nonexistent RPC (`create_placeholder_investor`). The Google Sheets also had inconsistent formatting — title rows, duplicate empty headers, and the Scheduled Sales tab had no header row at all.
- **Fix:** Rewrote `scripts/seed_from_sheets.py` to handle real Sheet structure:
  - `seed_investors()` — uses `find_header_row()` to locate the "Email" column, handles "First Name"/"Last Name" columns, logs investors who need to sign up
  - `seed_scheduled_sales()` — handles NO-header-row format, positional column mapping, skips title rows by detecting case number pattern
  - `seed_new_filings()` — finds "Case Number" header row, maps column names to DB fields
- **Result:** 81 properties inserted (49 new_filing, 14 sale_date_assigned, 12 upcoming, 6 sold), 2 duplicates skipped
- **Python venv:** Created `.venv/` in project root for dependencies

### 2. Auth Trigger Verified ✅
- Created test user via Auth admin API
- Confirmed profile auto-creates with: `role=investor`, `tier=free`, `status=trial`, `trial_ends_at=~60 days`
- Confirmed cascade delete works (`ON DELETE CASCADE` from auth.users to profiles)
- Test user cleaned up

### 3. Philip King Account Created ✅
- **Email:** kingconnection@icloud.com
- **Auth ID:** `ace8df94-11a6-4575-9264-bf8fd4c27e91`
- **Role:** `super_admin`
- **Password:** Temporary (change on first login)

### 4. Mike King Account Created ✅
- **Email:** mike.king@lptrealty.com
- **Auth ID:** `8863f547-e72a-48d8-8e52-96f885055c6f`
- **Role:** `admin`
- **Deal Room:** `00000000-0000-0000-0000-000000000002` (Mike King Investment Group)
- **Deal Room Owner:** Set to Mike's profile ID
- **Password:** Temporary (change on first login)

### 5. Scraper Requirements File Created ✅
- **File:** `scraper/requirements.txt`
- Dependencies: `anthropic>=0.40.0`, `supabase>=2.0.0`, `gspread>=6.0.0`, `google-auth>=2.0.0`

### 6. Final Verification ✅
- 81 properties across 4 stages
- 2 profiles (Philip=super_admin, Mike=admin)
- 1 market (Sedgwick County, KS)
- 1 deal room (Mike King Investment Group, owner=Mike)
- All 6 acceptance checks passed

---

## What Was Completed (Session 1 — Earlier Today)

See `docs/handoff/2026-03-01_1629_phase0-backend-handoff.md` for full details:
- Supabase CLI installed and linked
- 5 migrations applied (enums, core tables, auth trigger, RLS policies, seed data)
- 35 RLS policies across 9 tables
- Scraper updated with dual-write (Supabase first, Sheets second)
- `.env.example` created

---

## Current Database State

| Table | Rows | Notes |
|-------|------|-------|
| markets | 1 | Sedgwick County, KS |
| deal_rooms | 1 | Mike King Investment Group |
| profiles | 2 | Philip (super_admin), Mike (admin) |
| properties | 81 | 49 new_filing, 14 sale_date_assigned, 12 upcoming, 6 sold |
| investor_preferences | 0 | Populated during onboarding (Phase 3) |
| investor_pipeline | 0 | Populated when investors save properties |
| court_research | 0 | Phase 2 |
| recommendation_scores | 0 | Phase 3 |
| outreach_campaigns | 0 | Phase 4 |

---

## Bidirectional Sync Decision

**Status:** Not built. Not needed right now.

**What exists:**
- The scraper dual-writes: Supabase (primary) → Google Sheets (secondary)
- The seed script did a one-time Sheets → Supabase backfill

**What this means for Mike:**
- Mike can continue using Google Sheets day-to-day — the scraper keeps it updated
- When the dashboard goes live (Phase 1), Mike transitions to using the dashboard
- If Mike manually edits data in Sheets (e.g., adding RPR values, notes), those edits stay in Sheets only — they don't flow to Supabase

**If a Sheets → Supabase sync is needed later:**
- **Option A:** Google Apps Script that triggers on sheet edit, POSTs changes to Supabase REST API
- **Option B:** Scheduled Python cron that diffs Sheets vs Supabase and reconciles
- Both are ~2 hours of work. Build only if Mike needs it after the dashboard is live.

---

## Beta Investor Onboarding

12 investors identified from Google Sheets:
- Rene Rodriguez, Miles Milspaugh, Dan Drake, Brian Brundage, Ahmad Azimi, David Alvarado, Tony Resnik, David Vonfeldt, Logan Caldarera, Tom Caldarera, David Cruz, Mike King (already has account)

**How to onboard each investor:**
1. Investor signs up via the app (email + password)
2. Auth trigger auto-creates profile with `role=investor, tier=free, status=trial`
3. Admin (Mike or Philip) links them to the deal room:
   ```sql
   UPDATE profiles
   SET deal_room_id = '00000000-0000-0000-0000-000000000002'
   WHERE email = '<investor-email>';
   ```

---

## Deferred Items

| Item | Deferred To | Notes |
|------|-------------|-------|
| Domain registration (foreclosurefunder.com) | Beta launch | Register when ready to go live |
| PWA manifest + service worker | Phase 1 | Requires the Next.js app to exist |
| Bidirectional Sheets sync | If needed | Scraper dual-write is sufficient |
| Super admin panel | Separate build | Philip uses Supabase dashboard for now |

---

## What Phase 1 Picks Up

Phase 1 is the frontend dashboard build. Everything it needs is in place:

1. **Spec:** `FRONTEND_BRIEF_2026-03-02.md` (complete engineering spec)
2. **Backend:** Schema, auth, RLS, seed data — all operational
3. **Accounts:** Philip (super_admin) and Mike (admin) can log in
4. **Data:** 81 properties ready to display
5. **Stack:** Next.js 14+ with App Router, TypeScript, Tailwind, `@supabase/ssr`
6. **Deployment:** Vercel project exists (`prj_BNjPyPdakHg2XIeAEydWCltZpbNB`)

---

## Key Files Changed This Session

| File | Change |
|------|--------|
| `scripts/seed_from_sheets.py` | Rewrote to handle real Google Sheets formatting |
| `scraper/requirements.txt` | Created — was missing |
| `docs/plans/2026-03-01-phase0-completion-design.md` | Design doc for this session |
| `docs/plans/2026-03-01-phase0-completion-implementation.md` | Implementation plan |
| `docs/handoff/2026-03-01_phase0-completion-handoff.md` | This file |

## Key UUIDs

| Entity | UUID |
|--------|------|
| Sedgwick County market | `00000000-0000-0000-0000-000000000001` |
| Mike King Investment Group deal room | `00000000-0000-0000-0000-000000000002` |
| Philip King profile | `ace8df94-11a6-4575-9264-bf8fd4c27e91` |
| Mike King profile | `8863f547-e72a-48d8-8e52-96f885055c6f` |
