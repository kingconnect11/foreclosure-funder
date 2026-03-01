# Mike King Real Estate - Combined Architecture & Implementation Plan
## February 24, 2026

---

## CURRENT STATE

### LIVE
- Google Sheet v4 (3 tabs) - Mike using daily
- Lofty CRM Smart Plans (2 plans) - running
- Zapier Integration (2 Zaps) - running
- Homeowner Outreach Letters (4 letters) - in Lofty

### BUILT, NOT DEPLOYED
- Investor Dashboard (Next.js 14 / Vercel) - needs deploy + small fixes
- Weekly Investor Email (Google Apps Script) - needs installation
- PDF Scraper (Python, 632 lines) - regex approach, never tested against real PDF

### KEY INSIGHT FROM SCRAPER TESTING
The pdfplumber + regex approach failed against the real Sedgwick County Post PDF. The multi-column newspaper layout causes text from adjacent columns to merge when extracted as raw text. Out of 14 docket cases found, only 1 real address was extracted. **This approach is fundamentally broken and no amount of regex tuning will fix it.**

---

## THE FIX: CLAUDE API FOR PDF EXTRACTION

Instead of pdfplumber + regex, send the PDF to Claude's API. Claude reads PDFs visually (multimodal) and doesn't care about column boundaries. This replaces ~250 lines of fragile regex with ~30 lines of API code.

**Cost:** ~$0.50-1.50 per weekly run = $2-6/month
**Reliability:** Near-human accuracy on multi-column layouts, self-healing if newspaper changes format

This same API pipeline becomes the foundation for court research (Phase 2), investor matching (future), and any other document analysis.

---

## DIVISION OF LABOR

- **Claude Code**: Backend, Python scraper, API routes, data pipelines, Claude API integration, court research, database schema, architecture
- **Cursor**: Frontend UI, CSS, dashboard components, visual polish, responsive design
- **Review gates**: Each phase - Claude Code delivers backend, you and I review, then Cursor picks up frontend

---

## PHASE 1: FIX THE CORE + SHIP (Week 1)

**Goal:** Replace the broken scraper, fix dashboard bugs, deploy everything, go live.

### 1A - Replace PDF Extraction with Claude API [Claude Code]

**What changes:**
- Delete `extract_foreclosure_notices()` function (lines 80-342 of foreclosure_scraper.py)
- Replace with `extract_foreclosure_notices_via_claude()` (~30 lines)
- Install `anthropic` SDK, set `ANTHROPIC_API_KEY` env var

**What stays the same:**
- `download_pdf()` - still downloads the PDF
- `lookup_property_appraiser()` - still scrapes Sedgwick County Appraiser for beds/baths/sqft/county value
- Manufactured home filter - still critical
- `write_to_sheets()` - still writes to Google Sheets
- `connect_to_sheets()` - unchanged
- Duplicate detection - unchanged

**Bonus data we get for free from Claude API (same call, just add to the prompt):**
- **Zip code** - solves the Lofty mailing address gap immediately
- **Foreclosure amount** - the "praying for judgment in the amount of $X" is already in the PDF notice text. This is Phase 2 data we get for free in Phase 1
- **Attorney / law firm name** - useful later for partnership features
- **Parcel ID** - makes appraiser lookup more reliable (search by parcel instead of address)
- **Lender name (plaintiff)** - more reliable extraction than regex

**Updated Claude API prompt extracts:**
```
case_number, plaintiff, defendant, address, city, zip_code,
sale_date, notice_type, foreclosure_amount, attorney_name, parcel_id
```

**Setup required:**
1. Anthropic API account (console.anthropic.com)
2. Add credit card (pay-per-use)
3. Generate API key
4. `pip install anthropic`
5. Set env var: `export ANTHROPIC_API_KEY=sk-ant-...`

### 1B - Fix Dashboard Bugs [Claude Code]

- [ ] Fix em-dash on line 146 of page.js (`&mdash;` -> ` - `)
- [ ] Fix em-dash on line 228 of page.js (`&mdash;` -> ` - `)
- [ ] Verify API route CSV parsing handles edge cases (empty sheets, title row offset)
- [ ] Add proper error boundary component
- [ ] Ensure "isNew" detection works correctly with auto-imported notes

### 1C - Add New Sheet Columns [Claude Code]

Since Claude API now extracts more data, add these columns to the Google Sheet:

**Scheduled Sales - add after current column N (Notes):**
- O: Zip Code
- P: Foreclosure Amount
- Q: Attorney / Law Firm

**New Filings - add after current column P (Notes):**
- Q: Zip Code
- R: Foreclosure Amount
- S: Attorney / Law Firm

Update `write_to_sheets()` to populate these new columns.
Update the Zapier Zap 1 mapping to include zip code for Lofty contacts.

### 1D - Deploy Infrastructure [Mike + Claude Code assist]

- [ ] Make Google Sheet publicly viewable (Share > Anyone with link > Viewer)
- [ ] Push dashboard code to GitHub private repo
- [ ] Connect to Vercel, add `SPREADSHEET_ID` env var, deploy
- [ ] Add CNAME record: `foreclosures` -> `cname.vercel-dns.com`
- [ ] Install Apps Script (Extensions > Apps Script, paste code, run `createWeeklyTrigger()`)
- [ ] Update Apps Script button URL to `foreclosures.mikekingrealestate.com`
- [ ] Test scraper end-to-end against real PDF
- [ ] Set up cron: Wednesday 9am (`0 9 * * 3`)

### 1E - Update Dashboard API to Serve New Fields [Claude Code]

- [ ] Update `/api/listings/route.js` to pass through foreclosure amount, zip, attorney
- [ ] These fields won't show in the UI yet (Phase 2 Cursor work), but the API returns them

### Phase 1 Deliverables
- Live dashboard at foreclosures.mikekingrealestate.com
- Scraper running weekly via Claude API (reliable, self-healing)
- Zip code flowing to Lofty (mailing gap fixed)
- Foreclosure amounts captured (head start on Phase 2)
- Weekly investor emails going out Fridays
- All existing Zapier + Lofty automation unchanged

---

## PHASE 2: COURT RESEARCH + DATA LAYER (Weeks 2-3)

**Goal:** Build the "huge" differentiator - automated lien/judgment research from public court records. Add Supabase as a faster, more capable data layer alongside Google Sheets.

### 2A - Kansas Court Records Research [Claude Code]

**How it works:**
```
Case number from Phase 1 extraction
        |
        v
Kansas Courts public website (district court portal)
  - Search by case number and/or defendant name
  - Download docket / case documents
        |
        v
Send documents to Claude API:
  "Extract: foreclosure amount, all liens, judgments,
   total encumbrances, title health assessment"
        |
        v
Structured data -> Google Sheets new columns + Supabase
```

**Build `court_research.py` module:**
- Input: case number (SG-YYYY-CV-XXXXXX) and defendant name
- Scrape Kansas public court records for all related cases
- Send docket/documents to Claude API for structured extraction
- Output per property:
  - Foreclosure suit amount (confirm/update from PDF extraction)
  - All liens: tax liens, mechanic's liens, HOA liens, judgment liens
  - Total encumbrance amount
  - Title health: Clean / Minor Liens / Heavily Clouded
  - Offer range estimate: `(county_appraisal * 0.7) - total_liens` (adjustable formula)
  - Plain-English "investor brief" - 2-3 sentence deal summary
  - Complexity score: simple (just the mortgage) vs. complex (multiple liens/parties)

**Cost:** ~$0.50-1.00 per property. For 15 properties/week = $7-15/month additional.

**Integration into scraper pipeline:**
- Court research runs automatically after PDF extraction
- Rate-limited to be respectful of court website
- Results written to Google Sheets AND Supabase
- Research date tracked so it can be refreshed

### 2B - New Google Sheet Columns for Court Research [Claude Code]

**Scheduled Sales - additional columns:**
- R: Total Liens ($)
- S: Lien Details (text summary)
- T: Title Status (Clean / Minor Liens / Clouded)
- U: Est. Offer Range
- V: Investor Brief (2-3 sentence summary)
- W: Research Date

**New Filings - additional columns:**
- T: Total Liens ($)
- U: Lien Details (text summary)
- V: Title Status (Clean / Minor Liens / Clouded)
- W: Est. Offer Range
- X: Investor Brief
- Y: Research Date

### 2C - Supabase: Parallel Data Layer [Claude Code]

**Why now (not later):**
- Court research adds 6+ columns per property - Google Sheets is getting wide
- The dashboard needs faster, more reliable reads than CSV export
- Real-time updates: when scraper writes new data, dashboard shows it instantly
- Row-level security: foundation for per-investor views in Phase 4
- Free tier is more than sufficient (500MB, 50K MAU)

**Implementation (non-disruptive):**
1. Set up Supabase project (free tier)
2. Create tables mirroring Google Sheet structure + court research fields
3. Scraper writes to BOTH Google Sheets AND Supabase (dual-write)
4. Dashboard API switches from CSV export to Supabase REST API (faster, more reliable)
5. Google Sheets remains Mike's view/edit interface - he doesn't have to change anything
6. Zapier still triggers from Google Sheets (unchanged)

**Supabase schema:**
```sql
-- Properties table (replaces CSV export for dashboard reads)
properties (
  id              serial primary key,
  case_number     text unique not null,
  source_tab      text not null,  -- 'scheduled_sales' or 'new_filings'
  address         text,
  city            text,
  zip_code        text,
  sale_date       date,
  defendant       text,
  beds            int,
  baths           numeric,
  sqft            int,
  county_appraisal int,
  rpr_value       int,
  opening_bid     int,
  auction_price   int,
  stage           text,
  date_filed      date,
  foreclosure_amount int,
  attorney        text,
  -- Court research fields
  total_liens     int,
  lien_details    text,
  title_status    text,  -- 'Clean', 'Minor Liens', 'Clouded'
  offer_range_low int,
  offer_range_high int,
  investor_brief  text,
  complexity_score int,  -- 1-5
  research_date   timestamp,
  -- Metadata
  notes           text,
  is_manufactured boolean default false,
  created_at      timestamp default now(),
  updated_at      timestamp default now()
)
```

### 2D - Enhanced Dashboard API [Claude Code]

- [ ] Switch dashboard API from Google Sheets CSV to Supabase
- [ ] Return court research fields in API response
- [ ] Add query params: `?sort=sale_date&filter=title_status:clean&city=wichita`
- [ ] Add `/api/property/[case_number]` detail endpoint
- [ ] Keep response shape backward-compatible (add new fields, don't change existing ones)

**Updated API response shape:**
```json
{
  "scheduled": [{
    "id": "SG-2026-CV-000123",
    "address": "1234 S Main St",
    "city": "Wichita",
    "zipCode": "67217",
    "saleDate": "03/12/2026",
    "defendant": "John Smith",
    "beds": 3, "baths": 2, "sqft": 1450,
    "countyAppraisal": 145000,
    "rprValue": 158000,
    "openingBid": 120000,
    "stage": "scheduled",
    "isNew": true,
    "foreclosureAmount": 135000,
    "attorney": "Smith & Associates",
    "totalLiens": 8500,
    "lienDetails": "Mechanic's lien: $8,500 (roof replacement)",
    "titleStatus": "Minor Liens",
    "offerRange": { "low": 90000, "high": 105000 },
    "investorBrief": "3bd/2ba ranch in south Wichita. Lender asking $135K, one mechanic's lien for $8.5K. Clean otherwise. County appraises at $145K, good margin for cash buyer.",
    "complexityScore": 2,
    "researchDate": "2026-02-25"
  }],
  "newFilings": [...],
  "stats": {
    "totalScheduled": 8,
    "totalNewFilings": 12,
    "newThisWeek": 5,
    "avgOfferRange": "$85,000 - $110,000",
    "cleanTitlePct": 65,
    "updatedAt": "2026-02-25T14:00:00Z"
  }
}
```

### 2E - Dashboard: Court Research Cards [Cursor]

After Claude Code delivers the backend + API contract, Cursor builds:

- [ ] Court research section on each property card:
  - Foreclosure amount
  - Total liens + lien type badges
  - Offer range bar (visual min-max range)
  - Title status badge: green (Clean), amber (Minor Liens), red (Clouded)
- [ ] Expandable detail panel: full lien breakdown + investor brief
- [ ] Updated stats hero: add "Avg Offer Range" and "Clean Title %" metrics
- [ ] Filter bar: by city, price range, title status
- [ ] Sort options: sale date, county appraisal, offer range, newest first
- [ ] Mobile-responsive for all new elements
- [ ] Design tokens: Navy #0f1e35, Amber #f0a500, Green #3ecf8e, Slate #a8bbd4
- [ ] Fonts: Playfair Display (headings), DM Mono (data/labels), Inter (body)
- [ ] NO EM-DASHES anywhere

**Review gate: Claude Code delivers backend + API. You and I review. Then Cursor builds the frontend.**

### Phase 2 Deliverables
- Automated court case research for every foreclosure property
- Liens, judgments, title health, offer ranges - all automated
- Supabase running alongside Google Sheets (faster dashboard, real-time updates)
- Enhanced API with filtering/sorting
- Dashboard showing court research data per property
- Dan Drake's #1 pain point solved

---

## PHASE 3: DASHBOARD V2 - FULL REDESIGN (Weeks 4-5)

### 3A - Backend [Claude Code]
- [ ] Property detail endpoint with full history
- [ ] Comp data endpoint (nearby sold properties from appraiser or public records)
- [ ] Supabase real-time subscriptions for live dashboard updates
- [ ] Admin endpoint for Mike to trigger manual scraper re-run

### 3B - Frontend [Cursor]
- [ ] Property detail page (click card -> full breakdown page)
- [ ] Table view toggle (card grid vs. data table)
- [ ] Advanced filters: beds/baths/sqft ranges, lien amount thresholds
- [ ] "Comps Nearby" section on detail page
- [ ] Website integration: embeddable CTA banner for mikekingrealestate.com (Lofty)
- [ ] Print-friendly property report (PDF export for investors to download)
- [ ] Empty state improvements + onboarding for new visitors

---

## PHASE 4: INVESTOR PROFILES + MATCHING (Weeks 6-7)

### 4A - Investor Profile Schema [Claude Code]
- [ ] Supabase `investors` table:
  - Budget range, funding type (cash vs. LOC)
  - Property preferences (type, area, beds/baths, condition)
  - Deal-breaker criteria
  - Match history
- [ ] Matching algorithm: weighted scoring (0-100) per property per investor
- [ ] 1-sentence match reasoning per property

### 4B - Onboarding + Personalized Views [Cursor]
- [ ] Investor onboarding form (captures preferences)
- [ ] Per-investor dashboard: "Your Matches" ranked by score
- [ ] Match score badges on property cards

### 4C - Personalized Weekly Email [Claude Code]
- [ ] Upgrade Apps Script or Edge Function to include "Top 3 matches for you"
- [ ] Per-investor email with match scores and reasoning

---

## FUTURE PHASES (Documented, Not Tackled Now)

| Phase | Feature | Why Later |
|-------|---------|-----------|
| 5 | Full AI Recommendation Engine | Needs real usage data. Simple scoring in Phase 4 is the right first step. |
| 6 | Expired/Withdrawn MLS Pipeline | Mike said "3 months down the line." Core system needs to be solid first. |
| 7 | Visual Data (Maps, Street View, Comps) | API integrations + significant frontend. Nice-to-have, not core. |
| 8 | RPR API Integration | Uncertain API access at Mike's NAR tier. Investigate later. |
| 9 | Partnership & Monetization | Needs traction, investor base, attorney/lender agreements. Value first, monetize second. |
| 10 | Multi-Market Expansion | Nail Wichita first. Each county has unique formats and court systems. |

---

## TECHNICAL ARCHITECTURE

```
                        PHASE 1
                        =======

  Sedgwick County Post PDF
           |
           v
  [Claude API - PDF Extraction]     <-- REPLACES pdfplumber+regex
     (case#, address, defendant,
      city, zip, sale_date, type,
      foreclosure_amount, attorney)
           |
           v
  [Python - Appraiser Lookup + Manufactured Filter]
           |
           v
  Google Sheets (write)    -->  Zapier -> Lofty (unchanged)
           |                    Apps Script -> Email (unchanged)
           v
  Dashboard (Next.js/Vercel, reads CSV)


                     PHASE 2
                     =======

  Sedgwick County Post PDF
           |
           v
  [Claude API - PDF Extraction]
           |
           v
  [Python - Appraiser Lookup]
           |
           v
  [Court Research Module]
     Kansas Courts -> Claude API
     (liens, judgments, title health,
      offer ranges, investor briefs)
           |
           v
  Google Sheets (write)  +  Supabase (parallel write)
           |                     |
           v                     v
  Zapier -> Lofty         Dashboard (reads Supabase now)
  (unchanged)              (filters, sorting, research cards)


                     PHASE 4+
                     ========

  [Same pipeline as Phase 2]
           |
           v
  Supabase (primary data layer)
     |
     +-->  Dashboard (per-investor views)
     +-->  Investor Matching (weighted scoring)
     +-->  Personalized Emails (top matches)
     +-->  Investor Onboarding (preferences form)
     |
  Google Sheets (sync for Mike's convenience)
  Zapier -> Lofty (still running from Sheets)
```

---

## COST SUMMARY

| Component | Monthly Cost | Phase |
|-----------|-------------|-------|
| Claude API (PDF extraction) | $2-6 | 1 |
| Claude API (court research) | $7-15 | 2 |
| Supabase | $0 (free tier) | 2 |
| Vercel | $0 (hobby plan) | 1 |
| Google Sheets | $0 (already has Workspace) | - |
| Zapier | $0 (free tier, 2 Zaps) | - |
| Lofty CRM | Already paying | - |
| **Total additional** | **$9-21/month** | |

Compare: Mike spends 4+ hours/week on manual entry + research. At any reasonable rate, that's $200-400+/month in time. The Claude API pays for itself in the first run.

---

## HOW I WOULD IMPLEMENT PHASES 1 AND 2

### Phase 1 - Concrete Steps (Claude Code does all of this)

**Step 1: Rewrite the scraper extraction** (~1 session)
- Keep `foreclosure_scraper.py` as the main file
- Delete `extract_foreclosure_notices()` (lines 80-342)
- Add `extract_via_claude()`: encode PDF as base64, send to Claude Sonnet API with structured extraction prompt, parse JSON response
- Add zip_code, foreclosure_amount, attorney, parcel_id to the extraction
- Update `write_to_sheets()` to write new columns
- Test against the real Sedgwick County Post PDF
- Verify manufactured home filter still works (appraiser lookup unchanged)
- Verify duplicate detection still works

**Step 2: Fix dashboard bugs** (~15 minutes)
- Replace both `&mdash;` with ` - ` in page.js
- Verify API route CSV parsing and column mapping

**Step 3: Update dashboard API for new fields** (~30 minutes)
- Add foreclosureAmount, zipCode, attorney to the API response transform
- Keep backward-compatible (existing frontend still works, new fields are bonus)

**Step 4: Deploy** (~1 hour, mostly Mike doing DNS/sharing)
- Push to GitHub
- Connect Vercel
- Set env vars (SPREADSHEET_ID, ANTHROPIC_API_KEY for scraper)
- CNAME record
- Test live

**Step 5: Install automation** (~30 minutes)
- Apps Script installed + trigger created
- Update email button URL
- Verify Zapier still triggering correctly with new columns
- Update Zapier Zap 1 to map zip code to Lofty contact

### Phase 2 - Concrete Steps (Claude Code does backend, then Cursor does frontend)

**Step 1: Research Kansas court system** (~1 session)
- Investigate ecf.kscourts.org structure
- Test searching by case number and defendant name
- Identify what data is publicly available
- Determine if documents are downloadable or just docket listings
- Build proof-of-concept scraper for a single case (e.g., the Denny / 2100 Somerset case Mike mentioned)

**Step 2: Build court_research.py** (~2 sessions)
- Scraper module that takes case number + defendant name
- Downloads docket / case documents from court portal
- Sends to Claude API for structured extraction
- Returns: liens, judgments, amounts, title health, offer range, investor brief
- Rate-limited, logged, error-handled
- Integrate into main scraper pipeline (runs after PDF extraction)

**Step 3: Set up Supabase** (~1 session)
- Create project on supabase.com
- Define schema (properties table with all fields)
- Generate API keys
- Add dual-write to scraper: Google Sheets + Supabase
- Test write/read cycle

**Step 4: Switch dashboard API to Supabase** (~1 session)
- Replace CSV fetch with Supabase client
- Add filtering/sorting query params
- Add property detail endpoint
- Test all endpoints

**Step 5: Hand off to Cursor for frontend** (Cursor does this after review)
- Provide: this plan + API contract (JSON shape above) + design tokens
- Cursor builds: court research cards, filter bar, sort options, hero stat updates
- We review before merge

---

## WHAT WE GET "FOR FREE" BY DOING IT THIS WAY

By using Claude API as the core extraction engine in Phase 1, several Phase 2+ features become trivially easy to add:

1. **Foreclosure amounts from the PDF** - the notices contain "judgment in the amount of $X." Claude extracts this in Phase 1, no court research needed for this specific data point
2. **Zip codes** - Claude reads the full address including zip. Solves Lofty gap immediately
3. **Attorney names** - every notice lists the filing attorney. Captured in Phase 1, useful for partnership features later
4. **Court research becomes an extension, not a rebuild** - same Claude API, different input (court docs instead of PDF). The pattern is already established
5. **Investor briefs** - once we have all the data, asking Claude to write a 2-sentence summary per property is a single additional API call with near-zero marginal cost
6. **Future document types** - MLS exports, court documents, appraiser records - all go through the same Claude API pipeline
