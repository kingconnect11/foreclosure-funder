# Phase 1 Backend Foundation -- Handoff for Frontend Bake-Off

**Date:** March 1, 2026
**Issued by:** Philip King, CTO
**Purpose:** This document tells you everything you need to know to build the visual UI on top of the backend foundation. The data layer, auth, middleware, queries, mutations, and route skeletons are all done. Your job is to replace the JSON dumps with production-quality UI components.

**Full design spec:** `FRONTEND_BRIEF_2026-03-02.md` (in the repo root) -- that is the definitive spec for what to build. This doc covers what already exists in code and how to use it.

---

## 1. Project Setup

### Clone and Install

```bash
git clone <repo-url>
cd Mike-King-Real-Estate
npm install
```

### Environment Variables

Create `.env.local` in the project root with these three variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key...
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key...
```

The first two are public (embedded in the browser bundle). The third is server-only and must NEVER be exposed client-side. Get all three from the Supabase project settings under "API".

### Dev Server

```bash
npm run dev
```

Runs on `http://localhost:3000`. Hot reload is enabled.

### Build and Deploy

```bash
npm run build     # TypeScript check + production build
npm run start     # Run production build locally
```

Deployment is via Vercel. The project is already connected:
- Vercel project: `prj_BNjPyPdakHg2XIeAEydWCltZpbNB`
- Team: `team_szHUxLiEU8TPvxtWXzIKqnd4`
- Environment variables are already set on Vercel

Push to `main` (or create a PR) and Vercel deploys automatically.

### Tech Stack (locked)

| Concern | Choice |
|---------|--------|
| Framework | Next.js 16 with App Router, TypeScript |
| Styling | Tailwind CSS v3 |
| Auth | `@supabase/ssr` |
| Database | `@supabase/supabase-js` v2, PostgreSQL via Supabase |
| Icons | `lucide-react` |
| Dates | `date-fns` |
| Classnames | `clsx` |
| Deployment | Vercel |

Do not add other packages without approval. See `FRONTEND_BRIEF_2026-03-02.md` section 2 for the rationale.

---

## 2. File Map -- What Exists

Every file in the foundation, with a one-line description:

### Root Config

| File | Description |
|------|-------------|
| `package.json` | Dependencies and scripts (`dev`, `build`, `start`, `lint`) |
| `tsconfig.json` | TypeScript config with `@/` path alias pointing to project root |
| `tailwind.config.ts` | Tailwind config -- content paths set, theme empty (you extend it) |
| `postcss.config.mjs` | PostCSS with Tailwind and Autoprefixer |
| `next.config.js` | Next.js config (empty -- no custom settings yet) |
| `middleware.ts` | Next.js middleware entry point -- delegates to Supabase session refresh |

### Supabase Clients (`lib/supabase/`)

| File | Description |
|------|-------------|
| `lib/supabase/server.ts` | Server-side Supabase client (RLS-aware) + service-role client |
| `lib/supabase/client.ts` | Browser-side Supabase client (for Client Components) |
| `lib/supabase/middleware.ts` | Auth session refresh + redirect logic (unauthenticated -> `/login`, authenticated away from auth pages -> `/dashboard`) |

### Library Code (`lib/`)

| File | Description |
|------|-------------|
| `lib/types.ts` | Generated TypeScript types from Supabase schema + convenience aliases (`Property`, `Profile`, `InvestorPipeline`, etc.) |
| `lib/utils.ts` | Formatting utilities: `formatCurrency`, `formatDate`, `formatNumber`, `saleDateUrgency`, `timeInStage`, `formatPropertyDetails` |
| `lib/queries.ts` | All server-side data fetching functions (14 functions) |

### Server Actions (`actions/`)

| File | Description |
|------|-------------|
| `actions/auth.ts` | Auth actions: `signIn`, `signUp`, `signOut` |
| `actions/pipeline.ts` | Pipeline mutations: `saveToPipeline`, `changeStage`, `updateNotes`, `removeFromPipeline` |
| `actions/admin.ts` | Admin mutations: `updateGroupNotes` |

### Routes (`app/`)

| File | Description |
|------|-------------|
| `app/layout.tsx` | Root layout -- metadata, `globals.css` import. **You add fonts here.** |
| `app/globals.css` | Tailwind directives only (`@tailwind base/components/utilities`) |
| `app/page.tsx` | Root `/` -- redirects to `/dashboard` |
| `app/(auth)/login/page.tsx` | Login page skeleton -- unstyled form wired to `signIn` action |
| `app/(auth)/signup/page.tsx` | Signup page skeleton -- unstyled form wired to `signUp` action |
| `app/(main)/layout.tsx` | Main app layout -- fetches `getCurrentUser()`, redirects if null. **You add `<Nav>` here.** |
| `app/(main)/dashboard/page.tsx` | Dashboard skeleton -- fetches stats, properties, cities. Outputs JSON. **Replace with UI.** |
| `app/(main)/property/[id]/page.tsx` | Property detail skeleton -- fetches property, court research, pipeline entry, watching count, deal room. Outputs JSON. **Replace with UI.** |
| `app/(main)/pipeline/page.tsx` | Pipeline skeleton -- fetches user pipeline, groups by stage, computes summary stats. Outputs JSON. **Replace with UI.** |
| `app/(main)/admin/page.tsx` | Admin skeleton -- checks role, fetches investors + activity. Outputs JSON. **Replace with UI.** |

### What Does NOT Exist (you build these)

| File | Description |
|------|-------------|
| `components/nav.tsx` | Top navigation bar |
| `components/property-card.tsx` | Card used on dashboard grid |
| `components/pipeline-card.tsx` | Compact card for kanban |
| `components/stage-badge.tsx` | Color-coded stage badge |
| `components/stat-card.tsx` | Dashboard stat box |
| `components/filter-bar.tsx` | Dashboard filter controls |
| `components/stage-progress.tsx` | Vertical stage indicator for property detail page |

---

## 3. Data Fetching Functions (API Contract)

All functions are in `lib/queries.ts`. They run server-side and respect RLS via the cookie-based Supabase client.

### `getCurrentUser()`

```typescript
async function getCurrentUser(): Promise<Profile | null>
```

- Calls `supabase.auth.getUser()`, then fetches the matching `profiles` row.
- Returns the full `Profile` object or `null` if not authenticated.
- Use this in layouts and pages to get the current user.

### `getProperties(filters)`

```typescript
async function getProperties(
  filters: PropertyFilters
): Promise<{ properties: Property[]; total: number }>
```

**Parameters:**
```typescript
interface PropertyFilters {
  stage?: string       // Filter by property stage
  city?: string        // Filter by city name
  sort?: string        // 'newest' (default) | 'sale_date' | 'value_high' | 'value_low'
  search?: string      // Searches address and case_number (ilike)
  page?: number        // 1-based page number (default: 1)
}
```

- Excludes `sold`, `redeemed`, `canceled` properties automatically.
- Returns 30 properties per page.
- `total` is the full count (for pagination math).

### `getDistinctCities()`

```typescript
async function getDistinctCities(): Promise<string[]>
```

- Returns a deduplicated, alphabetically sorted array of city names from active properties.
- Use this to populate the city filter dropdown.

### `getDashboardStats(userId)`

```typescript
async function getDashboardStats(userId: string): Promise<DashboardStats>
```

**Returns:**
```typescript
interface DashboardStats {
  totalActive: number      // Properties not sold/redeemed/canceled
  auctionScheduled: number // sale_date_assigned + upcoming
  newThisWeek: number      // Created in last 7 days
  inPipeline: number       // This user's pipeline entries
}
```

- Runs all four count queries in parallel.

### `getProperty(id)`

```typescript
async function getProperty(id: string): Promise<Property | null>
```

- Fetches a single property by UUID. Returns `null` if not found.

### `getCourtResearch(propertyId)`

```typescript
async function getCourtResearch(propertyId: string): Promise<CourtResearch | null>
```

- Fetches court research for a property. Returns `null` if none exists (most properties currently).
- The `liens` and `judgments` fields are JSON arrays.

### `getPipelineEntry(userId, propertyId)`

```typescript
async function getPipelineEntry(
  userId: string,
  propertyId: string
): Promise<InvestorPipeline | null>
```

- Checks if a specific user has a specific property in their pipeline.
- Returns the pipeline row or `null`.
- Use this to show "In Pipeline" vs "Save to Pipeline" on property cards and detail pages.

### `getWatchingCount(propertyId)`

```typescript
async function getWatchingCount(propertyId: string): Promise<number>
```

- Returns the number of distinct investors watching a property.
- Uses a database RPC function (`get_watching_count`) to avoid exposing other investors' data.

### `getDealRoom(dealRoomId)`

```typescript
async function getDealRoom(dealRoomId: string): Promise<DealRoom | null>
```

- Fetches a deal room by ID. Used on property detail to show agent contact info.

### `getUserPipeline(userId)`

```typescript
async function getUserPipeline(
  userId: string
): Promise<PipelineEntryWithProperty[]>
```

**Returns:**
```typescript
type PipelineEntryWithProperty = InvestorPipeline & {
  properties: Property   // Full joined property data
}
```

- Fetches all pipeline entries for a user with full property details joined.
- Ordered by `updated_at DESC`.
- Use this for the pipeline/kanban page.

### `getDealRoomInvestors(dealRoomId)`

```typescript
async function getDealRoomInvestors(dealRoomId: string): Promise<Profile[]>
```

- Fetches all investors in a deal room (role = `investor`), ordered by name.
- Admin panel only.

### `getDealRoomActivity(dealRoomId)`

```typescript
async function getDealRoomActivity(
  dealRoomId: string
): Promise<DealRoomActivityEntry[]>
```

**Returns:**
```typescript
type DealRoomActivityEntry = InvestorPipeline & {
  profiles: { full_name: string | null }
  properties: { address: string | null; city: string | null }
}
```

- Fetches the 50 most recent pipeline activity entries across all investors in the deal room.
- Joins investor name and property address for display.

### `getInvestorPipelineSummary(investorId)`

```typescript
async function getInvestorPipelineSummary(
  investorId: string
): Promise<Record<string, number>>
```

- Returns a map of `stage -> count` for a single investor.
- Example: `{ watching: 4, researching: 2, offer_submitted: 1 }`.
- Used in the admin panel's investor detail expansion.

---

## 4. Server Actions (Mutation Contract)

All actions are in `actions/*.ts`. They use the `'use server'` directive and authenticate via the cookie-based Supabase client.

### `signIn(formData: FormData)`

**File:** `actions/auth.ts`

- Reads `email` and `password` from form data.
- Calls `supabase.auth.signInWithPassword()`.
- On success: redirects to `/dashboard`.
- On error: redirects to `/login?error=<message>`.

### `signUp(formData: FormData)`

**File:** `actions/auth.ts`

- Reads `email`, `password`, and `full_name` from form data.
- Calls `supabase.auth.signUp()` with `full_name` in user metadata.
- A database trigger automatically creates the `profiles` row on signup.
- On success: redirects to `/dashboard`.
- On error: redirects to `/signup?error=<message>`.

### `signOut()`

**File:** `actions/auth.ts`

- Calls `supabase.auth.signOut()`.
- Redirects to `/login`.

### `saveToPipeline(propertyId: string)`

**File:** `actions/pipeline.ts`

- Creates a new `investor_pipeline` row with `stage: 'watching'`.
- Automatically sets `deal_room_id` from the user's profile.
- Revalidates `/dashboard` and `/property/[id]`.

### `changeStage(pipelineId: string, newStage: string)`

**File:** `actions/pipeline.ts`

- Updates the `stage` and `stage_changed_at` on an existing pipeline entry.
- Only allows updates to rows owned by the authenticated user (via `investor_id` check).
- Revalidates `/pipeline`.

### `updateNotes(pipelineId: string, notes: string)`

**File:** `actions/pipeline.ts`

- Updates the `notes` field on a pipeline entry.
- Only allows updates to rows owned by the authenticated user.
- Does NOT revalidate any path (notes save silently).

### `removeFromPipeline(pipelineId: string)`

**File:** `actions/pipeline.ts`

- Deletes a pipeline entry.
- Only allows deletion of rows owned by the authenticated user.
- Revalidates `/pipeline` and `/dashboard`.

### `updateGroupNotes(pipelineId: string, groupNotes: string)`

**File:** `actions/admin.ts`

- Updates the `group_notes` field on any pipeline entry (RLS enforces admin-only).
- Revalidates `/admin`.

---

## 5. What Frontend Teams Build

Replace every skeleton page and build these components. Each task maps to a Stream B deliverable from the implementation plan.

### B1: Tailwind Design System Config

Extend `tailwind.config.ts` with the color palette, typography scale, and spacing system from the spec. All CSS custom properties and Tailwind theme tokens go here. See Section 6 of this doc for the exact values.

### B2: Google Fonts + Root Layout

Update `app/layout.tsx` to load Playfair Display (400, 700), DM Sans (400, 500, 600), and DM Mono (400) via Google Fonts. Set the dark background (`#0B1928`) on `<body>`. Apply the base font (DM Sans) globally.

### B3: Navigation Component

Create `components/nav.tsx`. Fixed top bar. Left: "Foreclosure Funder" logo text (Playfair Display 700, amber). Right: text links (Dashboard, Pipeline, Admin for admin+ only). Far right: user email + "Sign out". Mobile: hamburger menu sliding from right.

Wire it into `app/(main)/layout.tsx` -- the layout already fetches `getCurrentUser()` and passes it down.

### B4: Login / Signup Page Styling

Style the existing forms in `app/(auth)/login/page.tsx` and `app/(auth)/signup/page.tsx`. The forms already work -- they're wired to server actions. Just add the design system styling. Display error messages from `?error=` search params.

### B5-B7: Dashboard Page

Replace the JSON dump in `app/(main)/dashboard/page.tsx` with:
- **Stat cards** (4 across, using `stats` data)
- **Filter bar** (stage dropdown, city dropdown, sort dropdown, search input -- updating URL params)
- **Property grid** (responsive 3/2/1 column grid of `PropertyCard` components)
- **Pagination** (Previous / Page X of Y / Next)

All data is already fetched in the page component. You wire it to visual components.

### B8: Property Detail Page

Replace the JSON dump in `app/(main)/property/[id]/page.tsx` with:
- **Two-column layout** (65/35 on desktop, single column on mobile)
- **Left:** header, property details grid, court research section, notes section
- **Right:** pipeline status card with stage progress, watching count, agent contact

All data is already fetched. Wire `saveToPipeline`, `changeStage`, `updateNotes` actions to the UI.

### B9: Pipeline Kanban

Replace the JSON dump in `app/(main)/pipeline/page.tsx` with:
- **Summary stats row** (total, watching, active, closed, passed)
- **Kanban columns** grouped by stage, using `PipelineCard` components
- Horizontal scroll on overflow

The page already groups entries by stage and computes summary stats. Wire to visual components.

### B10: Admin Panel

Replace the JSON dump in `app/(main)/admin/page.tsx` with:
- **Investor table** (name, email, subscription, properties saved, active deals, last active)
- **Expandable row detail** showing per-investor pipeline summary
- **Activity feed** (reverse-chronological pipeline events)

Role gating is already implemented (redirects investors to `/dashboard`).

### B11: Responsive Design + Polish

- Ensure all pages work at 375px (iPhone SE) through 1440px+.
- Verify no TypeScript errors, no console errors, no hydration mismatches.
- Test the full auth flow: signup -> dashboard -> save property -> pipeline -> sign out -> sign in.

---

## 6. Design System Reference

The full design spec is in `FRONTEND_BRIEF_2026-03-02.md` sections 3-4. These values are reproduced here because they are critical for every component.

### Color Palette

```
--background:        #0B1928    /* Deep navy -- primary background */
--surface:           #112240    /* Slightly lighter -- cards, panels */
--surface-elevated:  #1A3050    /* Hover states, active elements */
--border:            #243B56    /* Subtle borders between elements */
--text-primary:      #E8EDF3    /* Primary text -- high contrast on dark */
--text-secondary:    #8899AA    /* Secondary text -- labels, metadata */
--text-muted:        #556677    /* Tertiary -- timestamps, fine print */
--accent:            #D4952A    /* Amber/gold -- CTAs, important badges, active states */
--accent-hover:      #E8A83E    /* Amber lighter -- hover state */
--success:           #2D8A5E    /* Green -- clean title, positive indicators */
--warning:           #C47A20    /* Orange -- clouded title, moderate risk */
--danger:            #B83A3A    /* Red -- complex title, high risk, urgent */
--info:              #3A7BD5    /* Blue -- informational badges */
```

### Typography

```
--font-display:  'Playfair Display', Georgia, serif    /* Page titles, section headers only */
--font-body:     'DM Sans', system-ui, sans-serif      /* Body text, labels, UI elements */
--font-data:     'DM Mono', 'Fira Code', monospace     /* Prices, case numbers, dates, stats */
```

Load via Google Fonts. Weights: Playfair Display 400 + 700, DM Sans 400 + 500 + 600, DM Mono 400.

### Typography Scale

| Usage | Font | Weight | Size/Line-height |
|-------|------|--------|------------------|
| Page title | Playfair Display | 700 | 28px / 1.2 |
| Section header | Playfair Display | 400 | 20px / 1.3 |
| Card title | DM Sans | 600 | 15px / 1.4 |
| Body | DM Sans | 400 | 14px / 1.5 |
| Label | DM Sans | 500 | 12px / 1.4, uppercase, letter-spacing 0.05em |
| Data value | DM Mono | 400 | 14px / 1.4 |
| Stat number | DM Mono | 400 | 32px / 1.1 |

### Spacing and Layout

- Base unit: 4px. All spacing in multiples of 4.
- Page max-width: 1440px, centered, 24px horizontal padding.
- Card padding: 20px.
- Grid gap: 16px.
- Section spacing: 48px between major sections.
- Border-radius: 4px for cards and buttons, 2px for badges. Never larger than 6px.

### Component Patterns

**Cards:** Background `--surface`, 1px border `--border`, 4px radius, 20px padding. Hover: border shifts to `--surface-elevated`. No shadows.

**Badges:** Inline-block, uppercase, 10px font, letter-spacing 0.08em, 2px radius, padding 3px 8px. Stage color coding:
| Stage | Color | Token |
|-------|-------|-------|
| NEW FILING | Blue | `--info` / `#3A7BD5` |
| SALE DATE SET | Amber | `--warning` / `#C47A20` |
| AUCTION SCHEDULED | Red | `--danger` / `#B83A3A` |

**Buttons -- Primary:** Background `--accent`, text `#0B1928`, 4px radius, DM Sans 600 14px, padding 10px 20px. Hover: `--accent-hover`.

**Buttons -- Secondary:** Transparent background, 1px border `--border`, text `--text-secondary`. Hover: border `--text-secondary`.

**Tables:** No zebra striping. 1px bottom border `--border` per row. Header: `--text-muted`, DM Sans 500 12px uppercase.

**Empty states:** Simple text only. No illustrations, no icons.

---

## 7. Acceptance Criteria

The build is complete when all 14 criteria are met:

1. An unauthenticated user is redirected to `/login` from any route.
2. A user can sign up, sign in, and sign out.
3. The dashboard loads properties from Supabase and displays them in the specified card format.
4. Filters (stage, city, sort, search) work and persist in URL params.
5. Clicking "Save to Pipeline" creates a pipeline entry with stage `watching`.
6. The property detail page shows all specified fields and the pipeline status.
7. Notes save on the property detail page (debounced auto-save).
8. The pipeline page shows a kanban layout organized by stage.
9. The admin panel shows the investor table and activity feed (visible only to admin+ roles).
10. The watching count displays on property detail pages.
11. All typography, colors, spacing, and component patterns match the spec.
12. The app is responsive down to 375px width (iPhone SE).
13. No TypeScript errors. No console errors. No hydration mismatches.
14. Deployed to Vercel and accessible via the project URL.

---

## 8. Database Schema Quick Reference

Nine tables in the `public` schema. RLS is enabled on all of them with 35 policies. Here is what matters for frontend development.

### `properties`

The main data table. 81 rows seeded.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `case_number` | text | Unique court case number (e.g., "2025-CV-001234") |
| `address` | text | Street address |
| `city` | text | City name |
| `state` | text | State abbreviation (KS) |
| `zip_code` | text | ZIP code |
| `bedrooms` | integer | Nullable |
| `bathrooms` | integer | Nullable |
| `sqft` | integer | Nullable |
| `property_type` | text | E.g., "Single Family" |
| `county_appraisal` | numeric | Dollar amount, nullable |
| `foreclosure_amount` | numeric | Dollar amount, nullable |
| `sale_date` | date | Nullable -- only set for sale_date_assigned/upcoming |
| `stage` | enum | `new_filing`, `sale_date_assigned`, `upcoming`, `sold`, `redeemed`, `canceled` |
| `defendant_name` | text | Person being foreclosed on |
| `attorney_name` | text | Foreclosing attorney |
| `plaintiff_name` | text | Foreclosing entity |
| `market_id` | uuid | FK to `markets` |
| `created_at` | timestamptz | When scraped/inserted |

### `profiles`

User accounts. Auto-created on signup via database trigger.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Matches Supabase auth.users.id |
| `email` | text | User email |
| `full_name` | text | Display name |
| `phone` | text | Nullable |
| `role` | enum | `super_admin`, `admin`, `investor` |
| `deal_room_id` | uuid | FK to `deal_rooms`, nullable |
| `subscription_tier` | enum | `free`, `standard`, `premium` |
| `subscription_status` | enum | `trial`, `active`, `canceled`, `expired` |
| `onboarding_completed` | boolean | |

### `investor_pipeline`

The investor's personal CRM. One row per investor-property pair.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `investor_id` | uuid | FK to `profiles` |
| `property_id` | uuid | FK to `properties` |
| `deal_room_id` | uuid | FK to `deal_rooms`, nullable |
| `stage` | enum | `watching`, `researching`, `site_visit`, `preparing_offer`, `offer_submitted`, `counter_offered`, `offer_accepted`, `in_closing`, `closed`, `rejected`, `no_response`, `passed` |
| `notes` | text | Private investor notes |
| `group_notes` | text | Admin-visible notes (set by deal room admin) |
| `offer_amount` | numeric | Dollar amount, nullable |
| `stage_changed_at` | timestamptz | When stage last changed |
| `created_at` | timestamptz | When added to pipeline |
| `updated_at` | timestamptz | Last modified |

### `court_research`

Title and lien research per property. Currently empty (Phase 2 feature), but the UI should handle it gracefully.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `property_id` | uuid | FK to `properties` (one-to-one) |
| `title_status` | enum | `clean`, `clouded`, `complex` |
| `liens` | jsonb | Array of lien objects |
| `judgments` | jsonb | Array of judgment objects |
| `estimated_offer_min` | numeric | Low end of bank ask |
| `estimated_offer_max` | numeric | High end of bank ask |
| `research_summary` | text | AI-generated research summary |

### `deal_rooms`

Agent/admin group. One exists: "Mike King Investment Group".

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `name` | text | Display name |
| `owner_id` | uuid | FK to `profiles` (the admin) |
| `contact_email` | text | Agent's email (for "Contact Your Agent") |
| `contact_phone` | text | Agent's phone |
| `website_url` | text | Nullable |
| `brand_colors` | jsonb | Nullable (Phase 4) |
| `brand_logo_url` | text | Nullable (Phase 4) |

### `markets`

Geographic markets. One exists: Sedgwick County, KS.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `name` | text | Display name |
| `county` | text | County name |
| `state` | text | State abbreviation |
| `is_active` | boolean | |

### `investor_preferences`

Investor onboarding data. Currently empty (Phase 3). Not used by the frontend in Phase 1.

### `recommendation_scores`

AI-generated property match scores. Currently empty (Phase 3). Not used in Phase 1.

### `outreach_campaigns`

Deal room outreach tracking. Not used in Phase 1 frontend.

---

## 9. Utility Functions Reference

All in `lib/utils.ts`. Import and use these -- do not reimplement formatting.

| Function | Signature | Returns | Example |
|----------|-----------|---------|---------|
| `formatCurrency` | `(amount: number \| null) => string` | `"$127,000"` or `"--"` | `formatCurrency(127000)` |
| `formatDate` | `(date: string \| null) => string` | `"Fri, Mar 14, 2026"` or `"--"` | `formatDate(property.sale_date)` |
| `formatNumber` | `(n: number \| null) => string` | `"1,450"` or `"--"` | `formatNumber(property.sqft)` |
| `saleDateUrgency` | `(saleDate: string \| null) => 'danger' \| 'warning' \| 'normal'` | Urgency level | `saleDateUrgency(property.sale_date)` |
| `timeInStage` | `(stageChangedAt: string \| null) => string` | `"3 days"` or `"--"` | `timeInStage(entry.stage_changed_at)` |
| `formatPropertyDetails` | `(beds, baths, sqft) => string` | `"3 BD . 2 BA . 1,450 sqft"` | `formatPropertyDetails(3, 2, 1450)` |

---

## 10. TypeScript Type Quick Reference

All exported from `lib/types.ts`. These are generated from the database schema and kept in sync.

```typescript
// Row types (what you get back from queries)
type Property          // properties table row
type Profile           // profiles table row
type InvestorPipeline  // investor_pipeline table row
type CourtResearch     // court_research table row
type DealRoom          // deal_rooms table row
type Market            // markets table row

// Enum types
type PropertyStage     // 'new_filing' | 'sale_date_assigned' | 'upcoming' | 'sold' | 'redeemed' | 'canceled'
type PipelineStage     // 'watching' | 'researching' | 'site_visit' | ... | 'passed' (12 values)
type UserRole          // 'super_admin' | 'admin' | 'investor'
type TitleStatus       // 'clean' | 'clouded' | 'complex'
type SubscriptionTier  // 'free' | 'standard' | 'premium'

// Composite types from queries
type PipelineEntryWithProperty  // InvestorPipeline & { properties: Property }
type DealRoomActivityEntry      // InvestorPipeline & { profiles: {...}, properties: {...} }

// Query interfaces
interface PropertyFilters       // { stage?, city?, sort?, search?, page? }
interface DashboardStats        // { totalActive, auctionScheduled, newThisWeek, inPipeline }
```

---

## 11. Auth Flow Summary

1. **Middleware** (`middleware.ts` -> `lib/supabase/middleware.ts`): Runs on every request. Refreshes the Supabase session cookie. Redirects unauthenticated users to `/login`. Redirects authenticated users away from `/login` and `/signup` to `/dashboard`.

2. **Layout guard** (`app/(main)/layout.tsx`): Double-checks auth by calling `getCurrentUser()`. If null, redirects to `/login`. This ensures Server Components inside `(main)` always have a valid user.

3. **Role gating** (`app/(main)/admin/page.tsx`): Checks `user.role` and redirects investors to `/dashboard`.

4. **Auth actions**: Forms submit to server actions that call Supabase auth methods and redirect on completion.

The login/signup forms are already wired up and functional. You just need to style them and display error messages from the `?error=` URL parameter.

---

## 12. Key Patterns to Follow

### Server Components Fetch Data

Every page is a Server Component. Data is fetched at the page level and passed down as props. No `useEffect` + `fetch` patterns. No loading spinners for initial page load.

```tsx
// This is how every page works (dashboard example)
export default async function DashboardPage({ searchParams }) {
  const params = await searchParams
  const user = await getCurrentUser()
  const [{ properties, total }, cities, stats] = await Promise.all([
    getProperties({ ... }),
    getDistinctCities(),
    getDashboardStats(user.id),
  ])
  // Pass data to visual components
  return <DashboardUI stats={stats} properties={properties} ... />
}
```

### Client Components for Interactivity

Use `'use client'` only for components that need browser interactivity:
- Filter bar (URL param updates)
- "Save to Pipeline" button (optimistic update)
- Notes textarea (debounced auto-save)
- Stage change dropdown
- Mobile hamburger menu

### URL State for Filters

Dashboard filters are stored in URL search params. The page reads them on the server side. When a user changes a filter, update the URL with `useRouter().push()` or `useSearchParams()`.

### Optimistic Updates

For "Save to Pipeline" and stage changes, update the UI immediately and revert if the server action fails. The server actions call `revalidatePath()` to refresh the server-side data after mutation.

---

*Build to the spec in `FRONTEND_BRIEF_2026-03-02.md`. This handoff doc tells you what code exists. The brief tells you what it should look like. Good luck.*
