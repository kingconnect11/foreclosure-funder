# Cowork Handoff — March 3, 2026

**Project:** Foreclosure Funder
**CTO:** Philip King (kingconnection@icloud.com)
**Status:** Phase 1 frontend bake-off in progress, backend bugs identified, scraper needs Supabase integration

---

## WHERE WE ARE

Foreclosure Funder is a SaaS platform for real estate investors buying foreclosure properties at county auctions. It has two products: an investor-facing dashboard (SaaS subscription) and a Deal Room product for real estate agents who manage groups of investors.

**Phase 0 is complete:** Supabase backend (PostgreSQL, Auth, RLS, 35 policies, 9 tables), Next.js 14+ scaffold, all data queries, server actions, auth middleware, and route skeletons. Deployed on Vercel.

**Phase 1 is in progress:** Frontend design bake-off — multiple AI agents building competing UI implementations from the same functional spec. Several versions have been built and deployed. None have been impressive so far. The bake-off process itself had problems (explained below).

---

## WHAT WENT WRONG WITH THE BAKE-OFF

The original `FRONTEND_BRIEF_2026-03-02.md` was written as a prescriptive engineering spec with exact hex codes (#0B1928, #112240, #D4952A), exact font names (Playfair Display, DM Sans, DM Mono), exact spacing (4px base unit, 20px card padding), exact component patterns (flat cards, 1px borders, no shadows, max 6px border-radius), and language like "don't improvise." Every competing agent read this spec and produced essentially identical outputs — same navy-and-amber palette, same fonts, same flat-card aesthetic. The "competition" produced three copies of the same app.

**The fix (already done):** Created two new documents that replace the old brief:

1. **`FUNCTIONAL_SPEC.md`** — Pure functional requirements. Every page, data field, interaction, query, and server action. Zero colors, zero fonts, zero spacing values. This is what agents must BUILD.

2. **`BAKEOFF_PROMPT.md`** — The creative prompt pasted into each agent. Gives full creative control over colors, typography, layout, animation, and component design. Only fixed constraints: dark mode default, monospace for financial data, responsive to 375px, no full UI kits. Explicitly tells agents NOT to read the old brief.

The old `FRONTEND_BRIEF_2026-03-02.md` still exists in the repo for reference but agents are told to ignore it. The handoff doc (`docs/handoff/phase1-backend-foundation.md`) was also updated to strip out all prescriptive design values and point to the new docs.

**Philip's frustration was justified** — the architect (me, Claude) made the error of embedding an entire design system into what was supposed to be an open competition brief, then failed to ensure the edits actually propagated to the copies the agents used.

---

## BUGS TO FIX BEFORE NEXT BAKE-OFF ROUND

### BUG 1: Page 1 of properties is always empty (CRITICAL)

**Root cause identified:** The dashboard page (`app/(main)/dashboard/page.tsx`) uses 0-based pagination but the query function (`lib/queries.ts`) uses 1-based. On initial load with no `?page=` param, the dashboard sends `page: 0` to `getProperties()`. The query calculates `from = (0-1) * 30 = -30`, `to = -1`, which returns zero results.

**Fix:** In `app/(main)/dashboard/page.tsx`, line 34, change:
```
page: params.page ? parseInt(params.page) : 0
```
to:
```
page: params.page ? parseInt(params.page) : 1
```

Also update the pagination display logic (lines 44, 87, 99, 102) to use 1-based indexing consistently. Currently `currentPage` starts at 0 and the display adds 1, but the URL param and query need to agree on 1-based.

### BUG 2: Search doesn't work

The search query in `lib/queries.ts` looks correct (lines 55-59 use `.or()` with `address.ilike` and `case_number.ilike`). The likely issue is in the frontend FilterBar component — it may not be passing the search value to URL params, or the dashboard page may not be reading it correctly. Needs investigation of the `components/filter-bar.tsx` implementation.

### BUG 3: Most property data fields are blank

The 81 seeded properties came from a Google Sheets import that only had: case_number, address, city, zip, state, defendant_name, plaintiff_name, attorney_name, foreclosure_amount, sale_date, notice_type, stage. The fields bedrooms, bathrooms, sqft, county_appraisal, property_type, and rpr_value are all NULL because the scraper hasn't been updated to write appraiser data to Supabase yet.

**Fix (two parts):**
1. Create 10 fully populated sample entries with ALL fields filled in (beds, baths, sqft, county_appraisal, property_type, sale_date, etc.) so we can see what the UI looks like with real data.
2. Update the scraper to write appraiser data to Supabase (Phase 1 task, see scraper section below).

---

## PHILIP'S NEW REQUIREMENTS

These are features Philip wants prioritized, mapped to what the architecture already covers:

### 1. Per-stage notes in the pipeline

**What Philip wants:** When an investor moves a property through pipeline stages, they should be able to add notes at each stage. The notes should show up in the pipeline stage chart. Clicking a pipeline stage should either (a) confirm moving to that stage, or (b) if it's a past stage, show the details/notes from that stage.

**Current architecture:** The `investor_pipeline` table has a single `notes` TEXT field and a single `group_notes` field. There is NO per-stage note history. When an investor moves from "watching" to "researching," the previous stage's notes are just... the same notes field.

**Schema change needed:** Add a `stage_history` JSONB column to `investor_pipeline`, or create a new `pipeline_stage_history` table:
```sql
CREATE TABLE pipeline_stage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id UUID NOT NULL REFERENCES investor_pipeline(id) ON DELETE CASCADE,
  stage pipeline_stage NOT NULL,
  notes TEXT,
  entered_at TIMESTAMPTZ DEFAULT now(),
  exited_at TIMESTAMPTZ
);
```
This is a schema addition, not a change to the existing architecture. The `FOUNDING_ARCHITECTURE.md` doesn't explicitly cover per-stage notes but doesn't contradict it either.

### 2. Google Street View / Maps on property cards

**What Philip wants:** Street View image thumbnail and a Google Maps map on property detail pages and as a small icon on property cards in the dashboard grid.

**Current architecture:** `FOUNDING_ARCHITECTURE.md` Section 13 lists "Google Maps / Street View / satellite imagery per property" as Phase 3+ under Source 5 (Visual Data). The properties table doesn't have a `google_maps_url` or `latitude`/`longitude` column.

**What's needed:**
- Add `latitude` and `longitude` columns to properties table (or a JSONB `location` field)
- Geocode addresses using Google Geocoding API (or embed Google Maps with address-based lookup)
- Google Street View Static API for thumbnail images (requires API key, ~$7 per 1000 requests)
- Google Maps Embed API for interactive maps (free with API key)
- This is achievable in Phase 1 if we add the columns and use address-based embeds without pre-geocoding

### 3. Deal room admin can view all member pipelines filtered by stage

**Current architecture:** Already accounted for. `FUNCTIONAL_SPEC.md` Section 7 (Admin Panel) has the investor table with expandable per-investor pipeline summaries, plus the activity feed. The queries `getDealRoomInvestors()` and `getDealRoomActivity()` already exist. `getInvestorPipelineSummary()` returns stage→count maps. What's missing is a filter-by-stage view in the admin panel — the current spec shows a table + feed but not a stage-filtered view across all investors.

**Fix:** Add a stage filter dropdown to the admin panel that queries all `investor_pipeline` entries for the deal room filtered by stage. This is a frontend addition using existing query patterns.

### 4. Branding for Mike King's deal room

**What Philip wants:** The deal room product view should show Mike King Real Estate / LPT Realty branding. The product is "Foreclosure Funder" but branded for the deal room owner.

**Current architecture:** The `deal_rooms` table already has `brand_logo_url`, `brand_colors` (JSONB), and `website_url` columns. The architecture plan (Section 4) describes the Deal Room product as white-labelable. This is a frontend implementation task — read the deal room's branding fields and apply them in the admin/deal-room views.

### 5. Landing page

**What Philip wants:** A marketing/landing page for Foreclosure Funder. Lower priority than the dashboard bugs and data fixes.

**Current architecture:** Not in the current phase plan. This would be a new `app/(marketing)/page.tsx` with route group separation from the authenticated app.

---

## PRIORITY ORDER (from Philip)

1. **Fix page 1 empty bug** + **fix search** — backend/frontend bugs blocking every implementation
2. **Create 10 fully populated sample properties** — with all fields including beds, baths, sqft, county_appraisal, sale_date, property_type. Include Google Maps links in a new column if possible.
3. **Brand the deal room view** for Mike King Real Estate
4. **Per-stage pipeline notes** — schema addition + UI for notes at each pipeline stage, clickable stage indicators
5. **Google Street View / Maps** on property cards and detail pages
6. **Admin stage filter** — deal room owners can filter all member pipelines by stage
7. **Landing page** — lowest priority, easy to build later

---

## THE SCRAPER

### Current state

The scraper (`scraper/foreclosure_scraper.py`, 511 lines) is built and tested. It:
- Downloads the Sedgwick County Post PDF (weekly foreclosure publication)
- Uses Claude API (Sonnet) for visual PDF extraction → structured JSON
- Looks up each property on the Sedgwick County Appraiser website (BeautifulSoup)
- Gets: bedrooms, bathrooms, sqft, county appraisal, property type
- Filters out manufactured homes
- **Currently writes to Google Sheets only** — needs to be updated to write to Supabase as primary destination

### What needs to happen

1. **Add Supabase write** — the scraper should upsert into the `properties` table (match on case_number + market_id). Google Sheets becomes the secondary sync target.
2. **Add Google Maps geocoding** — when the scraper processes a property, geocode the address and store lat/lng (once the columns exist).
3. **Schedule it** — currently runs manually. Needs to run every Wednesday at 9am CT when the Post publishes.
4. **Error handling** — the scraper needs to handle: PDF download failures, Claude API rate limits, appraiser website being down, duplicate properties (upsert logic).

### Scraper planning prompt (for a coding agent)

See the `SCRAPER_PLANNING_PROMPT` section at the bottom of this document.

---

## KEY FILES

| File | What it is |
|------|-----------|
| `FOUNDING_ARCHITECTURE.md` | Primary source of truth — 22-section architecture doc. DO NOT REWRITE. |
| `FUNCTIONAL_SPEC.md` | Pure functional spec for frontend (no design prescriptions) |
| `BAKEOFF_PROMPT.md` | Creative prompt for frontend bake-off agents |
| `FRONTEND_BRIEF_2026-03-02.md` | OLD prescriptive brief — kept for reference, agents told to ignore |
| `HANDOFF_2026-03-01.md` | Phase 0 handoff (historical) |
| `docs/handoff/phase1-backend-foundation.md` | Technical handoff — every function, type, file in the codebase |
| `lib/queries.ts` | All Supabase queries (14 functions) |
| `lib/types.ts` | TypeScript types from DB schema |
| `lib/utils.ts` | Formatting utilities |
| `actions/pipeline.ts` | Pipeline mutations (save, stage change, notes) |
| `actions/admin.ts` | Admin mutations (group notes) |
| `actions/auth.ts` | Auth actions (sign in, sign up, sign out) |
| `scraper/foreclosure_scraper.py` | PDF scraper + appraiser lookup (writes to Sheets, needs Supabase) |
| `supabase/migrations/` | 7 migration files (enums, tables, triggers, RLS, seed data, RPC) |

---

## WHAT NOT TO DO

- **Do NOT rewrite FOUNDING_ARCHITECTURE.md** — make surgical edits only if schema changes are needed
- **Do NOT use the old FRONTEND_BRIEF_2026-03-02.md** for any new frontend work — use FUNCTIONAL_SPEC.md
- **Do NOT delete any files** without Philip's approval
- **Do NOT add a light mode** — the app is dark mode only
- **Do NOT build features from Phase 3+** unless Philip explicitly asks (recommendation engine, onboarding flow, Stripe, AI voice agent)
- **Do NOT use Material UI, Chakra UI, Ant Design, or shadcn/ui** in frontend implementations

---

## SCRAPER PLANNING PROMPT

Copy this into a coding agent to plan and implement the scraper update:

---

**TASK: Update the Foreclosure Funder scraper to write to Supabase**

You are updating an existing Python scraper that extracts foreclosure property data from a weekly PDF publication and enriches it with county appraiser data. The scraper currently writes to Google Sheets. It needs to write to Supabase (PostgreSQL) as its primary destination, with Google Sheets as a secondary sync target.

**Read these files first:**

1. `scraper/foreclosure_scraper.py` — The existing 511-line scraper. Understand its full flow before changing anything.
2. `scraper/requirements.txt` — Current dependencies
3. `supabase/migrations/20260301235512_core_tables.sql` — The `properties` table schema you're writing to
4. `supabase/migrations/20260301235354_enums_and_types.sql` — The enum types (property_stage, notice_type)
5. `FOUNDING_ARCHITECTURE.md` Section 13 (Data Pipeline) — Context on all data sources

**What the scraper currently does:**

1. Downloads the Sedgwick County Post PDF from a configured URL
2. Sends each page to Claude API (Sonnet) for visual extraction → gets structured JSON with: case_number, plaintiff, defendant, address, city, zip, sale_date, notice_type, foreclosure_amount, attorney
3. For each property, looks up the Sedgwick County Appraiser website → gets: bedrooms, bathrooms, sqft, county_appraisal, property_type
4. Filters out manufactured homes (MANUFACTURED, MOBILE HOME, MODULAR, HUD CODE)
5. Writes all results to a Google Sheet

**What needs to change:**

1. **Add Supabase client** — Use `supabase-py` (Python Supabase client). Upsert into the `properties` table matching on `(market_id, case_number)`. The Sedgwick County market UUID needs to be looked up or configured.

2. **Map scraper output to DB columns:**
   - case_number → case_number
   - address → address
   - city → city
   - zip → zip_code
   - state → 'KS' (hardcoded for now)
   - defendant → defendant_name
   - plaintiff → plaintiff_name
   - notice_type → notice_type (must match enum: 'new_filing' or 'scheduled_sale')
   - foreclosure_amount → foreclosure_amount
   - sale_date → sale_date (DATE format)
   - attorney → attorney_name
   - bedrooms → bedrooms
   - bathrooms → bathrooms
   - sqft → sqft
   - county_appraisal → county_appraisal
   - property_type → property_type
   - source_url → the PDF URL
   - scraped_at → now()
   - stage → determine from notice_type: 'new_filing' for new notices, 'sale_date_assigned' if sale_date exists

3. **Keep Google Sheets write** as secondary — don't remove it, just make it run after Supabase write. If Sheets write fails, log the error but don't fail the whole run.

4. **Add latitude/longitude geocoding** (optional, if adding those columns) — Use Google Geocoding API or a free alternative to geocode the address. Store in new `latitude` and `longitude` columns on the properties table.

5. **Error handling:**
   - If a single property fails to insert, log it and continue with the next
   - If the PDF download fails, exit with clear error message
   - If Claude API hits rate limits, implement exponential backoff
   - If appraiser website is down, insert the property with NULL appraiser fields rather than skipping it

6. **Environment variables needed:**
   - `SUPABASE_URL` — project URL
   - `SUPABASE_SERVICE_ROLE_KEY` — service role key (not anon, because the scraper runs server-side without a user session)
   - `SEDGWICK_MARKET_ID` — UUID of the Sedgwick County market row
   - Existing: `ANTHROPIC_API_KEY`, Google Sheets credentials

7. **Do NOT:**
   - Rewrite the Claude API extraction logic — it works
   - Change the appraiser lookup logic — it works
   - Remove the manufactured home filter — it's intentional
   - Change the Google Sheets write format — Mike depends on it

**Deliverables:**
- Updated `scraper/foreclosure_scraper.py` with Supabase upsert
- Updated `scraper/requirements.txt` with new dependencies
- A migration file for any new columns (latitude, longitude if adding geocoding)
- Updated `.env.example` with new environment variables
- A test script or instructions for running the scraper against the dev database

---

*End of handoff document.*
