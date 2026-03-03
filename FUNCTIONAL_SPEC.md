# FUNCTIONAL SPEC: Foreclosure Funder — Investor Dashboard

**Date:** March 3, 2026
**Issued by:** Philip King, CTO
**Purpose:** This document defines WHAT the application does — every page, data field, interaction, and behavior. It says nothing about how it looks. Visual design is the competing agent's decision.
**Reference:** `docs/handoff/phase1-backend-foundation.md` for the technical code contract.

---

## 1. PRODUCT CONTEXT

Foreclosure Funder is a SaaS platform for real estate investors who purchase foreclosure properties at auction. The frontend is a Next.js 14+ application with TypeScript that reads from a Supabase (PostgreSQL) backend. The database, auth, RLS policies, queries, server actions, and route skeletons are all complete. The skeleton pages output raw JSON. Your job: replace JSON with production UI.

### User Roles

**Investor (default):** Sees their personalized dashboard, property listings, property detail pages, and their own CRM pipeline. Cannot see other investors' data.

**Admin (deal room owner):** Sees everything an investor sees, plus an admin panel showing all investors in their deal room, pipeline activity, and the ability to add group notes. Mike King is the first admin.

**Super Admin:** Philip King only. Uses Supabase dashboard directly. No super admin panel in this phase.

### Existing Data

The Supabase backend has: `markets` (Sedgwick County, KS), `deal_rooms` (Mike King Investment Group), `profiles` (8 users), `properties` (81 foreclosure listings with address, city, zip, case number, beds, baths, sqft, county appraisal, sale date, stage, defendant name, foreclosure amount, attorney), `investor_pipeline` (active entries), `court_research` (empty — Phase 2), `recommendation_scores` (empty — Phase 3).

---

## 2. TECH STACK — NON-NEGOTIABLE

| Concern | Choice | Notes |
|---------|--------|-------|
| Framework | Next.js 14+ with App Router | TypeScript required |
| Styling | Tailwind CSS | No CSS-in-JS, no styled-components |
| Auth | `@supabase/ssr` | Server-side auth helpers |
| Database client | `@supabase/supabase-js` v2 | Server components use service role; client uses anon key with RLS |
| State management | React Server Components + URL state | No Redux, no Zustand. `useState` only for local UI (modals, dropdowns) |
| Deployment | Vercel | Existing project connected |

### Required packages

```
next @supabase/supabase-js @supabase/ssr
tailwindcss postcss autoprefixer
date-fns                         # Date formatting
clsx                             # Conditional classnames
```

You may install additional packages that serve the product: animation libraries, icon sets, charting libraries, component primitives (radix-ui, headless-ui, shadcn/ui). The only ban: no full opinionated UI kits (Material UI, Chakra UI, Ant Design).

---

## 3. PAGES AND ROUTES

### Authentication

**`/login`** — Email + password fields. "Sign in" button. Link to `/signup`. On success: redirect to `/dashboard`. Already authenticated: redirect to `/dashboard`.

**`/signup`** — Email, password, confirm password, full name. "Create account" button. Link to `/login`. Supabase trigger auto-creates the profile row. On success: redirect to `/dashboard`.

**Auth middleware:** All routes except `/login` and `/signup` require auth. Unauthenticated → redirect to `/login`.

### Main Application

- **`/dashboard`** — Property listings with stats and filters (Section 4)
- **`/property/[id]`** — Property detail page (Section 5)
- **`/pipeline`** — Investor's personal CRM pipeline (Section 6)
- **`/admin`** — Admin panel, admin+ only (Section 7)

### Navigation

Must include: "Foreclosure Funder" branding, links to Dashboard / Pipeline / Admin (admin+ only), current user's name or email, sign out action. Must work on mobile.

---

## 4. DASHBOARD PAGE (`/dashboard`)

### Stats — 4 metrics displayed prominently

| Stat | Source |
|------|--------|
| Total Active | Properties where stage NOT IN ('sold', 'redeemed', 'canceled') |
| Auction Scheduled | Properties where stage = 'upcoming' |
| New This Week | Properties where created_at within last 7 days |
| In Your Pipeline | Count of current user's investor_pipeline rows |

### Filters

All four filters in a single area. Filters update URL search params so filtered views are bookmarkable.

- **Stage:** All, New Filing, Sale Date Assigned, Upcoming Auction
- **City:** Populated from distinct cities in the data
- **Sort:** Newest First (default), Sale Date (soonest), Appraised Value (high→low), Appraised Value (low→high)
- **Search:** Text input filtering by address or case number

### Property Listings

Responsive layout. Each property displays:

1. **Stage badge** — visually distinguishable by urgency: NEW FILING (informational), SALE DATE SET (moderate), AUCTION SCHEDULED (urgent)
2. **Address** — full street address, prominent
3. **City, State ZIP**
4. **Property details** — beds, baths, sqft (omit any that are null)
5. **County Appraisal** — dollar amount
6. **Foreclosure Amount** — dollar amount
7. **Sale date** — if exists, with urgency indicator: within 14 days = danger, within 30 days = warning
8. **Case number**
9. **"Save to Pipeline" button** — or "In Pipeline" indicator if already saved

**Interactions:**
- "Save to Pipeline" creates a `watching` pipeline entry. Optimistic update — no confirmation dialog.
- Clicking a property card navigates to `/property/[id]`
- Pagination at 30 properties per page

### Pagination

Previous / Page X of Y / Next. No infinite scroll.

---

## 5. PROPERTY DETAIL PAGE (`/property/[id]`)

Two-column layout on desktop. Single column on mobile.

### Primary Content

**Header:** Address, city/state/zip, stage badge, case number

**Property Details** — key-value display of all fields:
- Bedrooms, Bathrooms, Square Feet, Property Type
- County Appraisal, Foreclosure Amount
- Sale Date (with urgency indicator)
- Attorney, Defendant

**Court Research Section** ("Title & Lien Research"):
- If data exists: title status badge (CLEAN/CLOUDED/COMPLEX), liens table (type, amount, creditor, filing date), judgments table, estimated offer range, AI research summary
- If no data: "Court research not yet available for this property."

**Notes Section** ("Your Notes"):
- Textarea, auto-saves on blur or after 2 seconds idle (debounced). "Saved" indicator after save.
- Only available if property is in user's pipeline. Otherwise: "Save this property to your pipeline to add notes."
- If user is in a deal room with group notes: separate read-only "Group Notes from [Deal Room Name]" section.

### Sidebar Content

**Pipeline Status:**
- If in pipeline: current stage indicator showing all 12 stages (watching, researching, site_visit, preparing_offer, offer_submitted, counter_offered, offer_accepted, in_closing, closed, rejected, no_response, passed). Current stage highlighted, completed stages marked, future stages dimmed. Control to change stage.
- If not in pipeline: "Add to Pipeline" button.

**Watching Count:** "X investors are watching this property" — count only, no names. Hide if count is 0 or 1.

**Contact Section:** For deal room investors: agent name, email (mailto), phone (tel). For independent investors: omit entirely.

---

## 6. PIPELINE PAGE (`/pipeline`)

The investor's personal CRM — saved properties organized by stage.

### Summary Stats

Single row: Total in Pipeline, Watching, Active (researching through in_closing), Closed, Passed/Rejected

### Kanban Layout

Horizontal columns, one per active stage (only show stages with entries). Each column: stage name with count.

**Pipeline Card** (compact):
- Address
- City, ZIP
- County appraisal
- Sale date with urgency indicator
- Time in stage ("3 days", "2 weeks")
- Truncated notes preview (first ~60 chars)

**Interactions:**
- Card click navigates to `/property/[id]`
- Drag-and-drop not required (stage changes via property detail page)
- Horizontal scroll when columns exceed viewport

---

## 7. ADMIN PANEL (`/admin`)

Visible only to admin/super_admin. Investors get redirected to `/dashboard`.

**This panel must be fully functional — not a placeholder or static mockup.**

### Investor Table

| Column | Data |
|--------|------|
| Name | profiles.full_name |
| Email | profiles.email |
| Subscription | profiles.subscription_tier |
| Properties Saved | count of investor_pipeline rows |
| Active Deals | count where stage between 'preparing_offer' and 'in_closing' |
| Last Active | most recent investor_pipeline.updated_at |

Click row to expand: per-investor pipeline summary (stage → count).

### Activity Feed

Reverse-chronological feed of pipeline activity across all investors in the deal room (limit 50):
- "[Name] saved [Address] to pipeline" — timestamp
- "[Name] moved [Address] to [Stage]" — timestamp
- "[Name] submitted offer on [Address] for $XX,XXX" — timestamp (if offer_amount set)

### Admin Notes

Admin can add group notes to any property. Stored in `investor_pipeline.group_notes`, visible to deal room investors who have that property saved.

---

## 8. DATA LAYER

### Pattern

Server Components fetch data via `lib/queries.ts`. Mutations via Server Actions in `actions/`. No dedicated API routes. No `useEffect` + `fetch`. No loading spinners for initial page load.

### Key Queries (all in `lib/queries.ts`)

- `getCurrentUser()` → Profile | null
- `getProperties(filters)` → { properties, total }
- `getDistinctCities()` → string[]
- `getDashboardStats(userId)` → { totalActive, auctionScheduled, newThisWeek, inPipeline }
- `getProperty(id)` → Property | null
- `getCourtResearch(propertyId)` → CourtResearch | null
- `getPipelineEntry(userId, propertyId)` → InvestorPipeline | null
- `getWatchingCount(propertyId)` → number
- `getDealRoom(dealRoomId)` → DealRoom | null
- `getUserPipeline(userId)` → PipelineEntryWithProperty[]
- `getDealRoomInvestors(dealRoomId)` → Profile[]
- `getDealRoomActivity(dealRoomId)` → DealRoomActivityEntry[]
- `getInvestorPipelineSummary(investorId)` → Record<string, number>

### Server Actions

- `signIn(formData)`, `signUp(formData)`, `signOut()`
- `saveToPipeline(propertyId)` — creates entry with stage 'watching'
- `changeStage(pipelineId, newStage)` — updates stage + stage_changed_at
- `updateNotes(pipelineId, notes)` — silent save, no revalidation
- `removeFromPipeline(pipelineId)`
- `updateGroupNotes(pipelineId, groupNotes)` — admin only

### Utility Functions (`lib/utils.ts`)

- `formatCurrency(amount)` → "$127,000" or "--"
- `formatDate(date)` → "Fri, Mar 14, 2026" or "--"
- `formatNumber(n)` → "1,450" or "--"
- `saleDateUrgency(saleDate)` → 'danger' | 'warning' | 'normal'
- `timeInStage(stageChangedAt)` → "3 days" or "--"
- `formatPropertyDetails(beds, baths, sqft)` → "3 BD · 2 BA · 1,450 sqft"

---

## 9. FILE STRUCTURE

```
app/
├── (auth)/login/page.tsx, signup/page.tsx
├── (main)/layout.tsx, dashboard/page.tsx, property/[id]/page.tsx, pipeline/page.tsx, admin/page.tsx
├── layout.tsx, globals.css, page.tsx, middleware.ts
components/           # You create these
lib/supabase/         # server.ts, client.ts, middleware.ts (exist)
lib/types.ts          # TypeScript types (exists)
lib/utils.ts          # Formatting utilities (exist)
lib/queries.ts        # All data fetching (exists)
actions/              # auth.ts, pipeline.ts, admin.ts (exist)
```

---

## 10. PERFORMANCE

- Server-side rendering for initial page loads.
- Optimistic updates for pipeline saves and stage changes.
- Google Maps address-based embeds allowed on property cards and detail pages (optional).

---

## 10a. UI STATES — REQUIRED FOR EVERY PAGE

Every page and data-dependent section must handle three states beyond the happy path:

### Loading states
Use skeleton screens that match the layout shape of the content they replace. Skeletons must maintain the same spatial layout as the loaded content so there's no layout shift.

- Dashboard: skeleton cards in the property grid, skeleton stat cards
- Property detail: skeleton for header, details section, notes area
- Pipeline: skeleton columns with placeholder cards
- Admin: skeleton table rows, skeleton activity feed items

### Empty states
When there is no data to display, show a designed empty state — not a blank area.

| Location | When empty | Message guidance |
|----------|-----------|-----------------|
| Dashboard property grid | No properties match current filters | "No properties match your filters. Try adjusting your search or stage filter." |
| Pipeline page | User has zero saved properties | "Your pipeline is empty. Browse the dashboard to save your first property." |
| Pipeline column | A stage has no entries (hide the column entirely) | N/A — just don't show empty columns |
| Admin activity feed | No pipeline activity yet | "No activity yet. Investors will appear here once they start saving properties." |
| Admin investor table | No investors in deal room | "No investors have joined this deal room yet." |
| Property detail notes | Property not in pipeline | "Save this property to your pipeline to add notes." (already in spec) |
| Court research section | No court research data | "Court research not yet available for this property." (already in spec) |

### Error states
When a Supabase query fails or returns an unexpected error, show a clear error message with a retry action. Never show a blank page, a raw error string, or only a console error.

- Include a "Try again" button that reloads the page or retries the query

---

## 11. NOT IN SCOPE

Do not build: recommendation engine, onboarding flow, Stripe/payments, Deal Room setup, push notifications, AI voice agent, social login, super admin panel, onboarding wizard, analytics/tracking, email notifications.

**Allowed but optional:** Google Maps address-based embeds on property cards and detail pages (Maps Embed API and Street View Static API both accept raw addresses — no geocoding or lat/lng columns needed).

---

## 12. FUNCTIONAL ACCEPTANCE CRITERIA

All must pass:

1. Unauthenticated users redirect to `/login`
2. Sign up, sign in, sign out all work
3. Dashboard loads properties from Supabase
4. Filters work and persist in URL params
5. "Save to Pipeline" creates entry with stage `watching`
6. Property detail shows all data fields
7. Notes auto-save (debounced)
8. Pipeline page organizes properties by stage
9. Admin panel shows investor table + activity feed (admin+ only) — **must be fully functional**
10. Watching count displays on property detail
11. Responsive down to 375px (iPhone SE)
12. No TypeScript errors, no console errors, no hydration mismatches
13. Loading skeletons appear during any client-side data fetching (no blank screens, no spinners)
14. Empty states are designed and helpful (not blank areas)
15. Error states include a retry action

---

## 13. CREDENTIALS

```
NEXT_PUBLIC_SUPABASE_URL=        [from Supabase project settings]
NEXT_PUBLIC_SUPABASE_ANON_KEY=   [from Supabase project settings → API]
SUPABASE_SERVICE_ROLE_KEY=       [from Supabase project settings → API — NEVER expose client-side]
```
