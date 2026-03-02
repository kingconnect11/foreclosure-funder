# FRONTEND BUILD BRIEF: Foreclosure Funder — Investor Dashboard

**Date:** March 2, 2026
**Issued by:** Philip King, CTO
**Purpose:** This document specifies exactly what to build for the Phase 1 frontend. It is a engineering spec, not a wishlist. Every page, component, data field, interaction pattern, and design constraint is defined here. Build what's specified. Don't improvise. Don't add features. Don't skip features.
**Reference:** `FOUNDING_ARCHITECTURE.md` for full product context.

---

## 1. PROJECT CONTEXT

Foreclosure Funder is a SaaS platform for real estate investors who purchase foreclosure properties. The frontend is a Next.js 14+ application with TypeScript that reads from a Supabase (PostgreSQL) backend. Phase 0 (database schema, auth, RLS, seed data) is complete. This brief covers Phase 1: the investor-facing dashboard, the CRM pipeline, and the admin panel.

### Who uses this

There are three user roles. The interface adapts based on role.

**Investor (default):** Sees their personalized dashboard, property listings, property detail pages, and their own CRM pipeline. Cannot see other investors' data. This is the primary user.

**Admin (deal room owner):** Sees everything an investor sees, plus an admin panel showing all investors in their deal room, all pipeline activity across those investors, and the ability to add notes visible to the group. Mike King is the first admin.

**Super Admin:** Sees everything an admin sees, plus system-level controls (user management, market configuration). Philip King is the only super admin. The super admin panel is not in scope for this brief — it will be built separately. For now, super admin uses the Supabase dashboard directly.

### What exists already

The Supabase backend is live with the following tables populated: `markets` (Sedgwick County, KS), `deal_rooms` (Mike King Investment Group), `profiles` (Philip, Mike, 6 beta investors), `properties` (seeded from Google Sheets — foreclosure listings with address, city, zip, case number, beds, baths, sqft, county appraisal, sale date, stage, defendant name, foreclosure amount, attorney), `investor_pipeline` (empty — investors haven't started using it yet), `investor_preferences` (empty), `court_research` (empty — Phase 2), `recommendation_scores` (empty — Phase 3).

---

## 2. TECH STACK — NON-NEGOTIABLE

| Concern | Choice | Notes |
|---------|--------|-------|
| Framework | Next.js 14+ with App Router | TypeScript, not JavaScript |
| Styling | Tailwind CSS | No CSS-in-JS, no globals.css component styles, no styled-components |
| Auth | `@supabase/ssr` | Use the server-side auth helpers, not the deprecated `@supabase/auth-helpers-nextjs` |
| Database client | `@supabase/supabase-js` v2 | Server components use service role key where needed; client components use anon key with RLS |
| State management | React Server Components + URL state | No Redux, no Zustand. Server components for data fetching. URL search params for filters. `useState` only for local UI state (modals, dropdowns). |
| Deployment | Vercel | Existing project: `prj_BNjPyPdakHg2XIeAEydWCltZpbNB` |

### Package whitelist

Install only these. Nothing else without explicit approval.

```
next @supabase/supabase-js @supabase/ssr
tailwindcss postcss autoprefixer
lucide-react                     # Icons — consistent, tree-shakeable
date-fns                         # Date formatting — no moment.js
clsx                             # Conditional classnames
```

---

## 3. DESIGN SYSTEM

### Philosophy

This is a financial data product for people who write six-figure checks. It should feel like a Bloomberg terminal crossed with a private wealth management portal — dense with information, confident in its typography, dark by default. It should NOT feel like a consumer app, a marketing site, or a template. No rounded-everything softness. No gratuitous gradients. No illustrations. No empty states with cute drawings. This is a tool for professionals who want data, fast.

### Color Palette

```
--background:        #0B1928    /* Deep navy — primary background */
--surface:           #112240    /* Slightly lighter — cards, panels */
--surface-elevated:  #1A3050    /* Hover states, active elements */
--border:            #243B56    /* Subtle borders between elements */
--text-primary:      #E8EDF3    /* Primary text — high contrast on dark */
--text-secondary:    #8899AA    /* Secondary text — labels, metadata */
--text-muted:        #556677    /* Tertiary — timestamps, fine print */
--accent:            #D4952A    /* Amber/gold — CTAs, important badges, active states */
--accent-hover:      #E8A83E    /* Amber lighter — hover state */
--success:           #2D8A5E    /* Green — clean title, positive indicators */
--warning:           #C47A20    /* Orange — clouded title, moderate risk */
--danger:            #B83A3A    /* Red — complex title, high risk, urgent */
--info:              #3A7BD5    /* Blue — informational badges */
```

### Typography

```
--font-display:  'Playfair Display', Georgia, serif    /* Page titles, section headers only */
--font-body:     'DM Sans', system-ui, sans-serif      /* Body text, labels, UI elements */
--font-data:     'DM Mono', 'Fira Code', monospace     /* Prices, case numbers, dates, stats */
```

Load via Google Fonts. Playfair Display weights 400 and 700. DM Sans weights 400, 500, 600. DM Mono weight 400.

### Typography Scale

```
Page title:      Playfair Display 700, 28px/1.2
Section header:  Playfair Display 400, 20px/1.3
Card title:      DM Sans 600, 15px/1.4       (property address)
Body:            DM Sans 400, 14px/1.5
Label:           DM Sans 500, 12px/1.4, uppercase, letter-spacing 0.05em
Data value:      DM Mono 400, 14px/1.4        (prices, case numbers, dates)
Stat number:     DM Mono 400, 32px/1.1        (dashboard stat cards)
```

### Spacing and Layout

- Base unit: 4px. All spacing is multiples of 4.
- Page max-width: 1440px, centered, with 24px horizontal padding.
- Card padding: 20px.
- Grid gap: 16px.
- Section spacing: 48px between major sections.
- No border-radius larger than 6px anywhere. Cards use 4px. Buttons use 4px. Badges use 2px.

### Component Patterns

**Cards:** Background `--surface`, 1px border `--border`, 4px radius, 20px padding. On hover: border shifts to `--surface-elevated`. No box-shadow. No elevation. Flat with borders.

**Badges:** Inline-block, uppercase, 10px font, letter-spacing 0.08em, 2px radius, padding 3px 8px. Color-coded by meaning (green for clean, amber for warning, red for danger, blue for info).

**Buttons — Primary:** Background `--accent`, text `#0B1928` (dark on gold), 4px radius, DM Sans 600 14px, padding 10px 20px. Hover: `--accent-hover`. No shadows.

**Buttons — Secondary:** Background transparent, border 1px `--border`, text `--text-secondary`, same sizing. Hover: border `--text-secondary`.

**Tables:** No zebra striping. 1px bottom border `--border` on each row. Header row uses `--text-muted` color, DM Sans 500 12px uppercase. Data cells use appropriate font (DM Mono for numbers/dates, DM Sans for text).

**Empty states:** Simple text: "No properties saved yet" or "Pipeline is empty." No illustrations, no icons, no CTAs in empty states.

---

## 4. PAGES AND ROUTES

### Authentication

**`/login`**

Email and password fields. "Sign in" button. Link to `/signup`. Nothing else. No social login buttons yet (those come with mobile app phase). On successful auth, redirect to `/dashboard`. If already authenticated, redirect to `/dashboard`.

**`/signup`**

Email, password, confirm password, full name. "Create account" button. Link to `/login`. On successful signup, Supabase trigger creates the profile row. Redirect to `/dashboard`.

**Auth middleware:** All routes except `/login` and `/signup` require authentication. Unauthenticated requests redirect to `/login`. Use Next.js middleware with `@supabase/ssr`.

### Main Application

**`/dashboard`** — The primary view. Details in Section 5.

**`/property/[id]`** — Property detail page. Details in Section 6.

**`/pipeline`** — Investor's personal CRM pipeline. Details in Section 7.

**`/admin`** — Admin panel (admin and super_admin only). Details in Section 8.

### Navigation

Top navigation bar, fixed. Left side: "Foreclosure Funder" text logo in Playfair Display 700, amber color. Right side: navigation links as text (not icons): Dashboard, Pipeline, Admin (admin+ only). Far right: user email displayed in `--text-muted`, and a "Sign out" link.

Mobile: hamburger menu that slides in a panel from the right. Same links.

---

## 5. DASHBOARD PAGE (`/dashboard`)

This is the investor's home screen. It shows a market overview and property listings.

### Stats Bar

A horizontal row of 4 stat cards at the top of the page.

| Stat | Value Source | Format |
|------|-------------|--------|
| Total Active | Count of all properties where stage is NOT 'sold', 'redeemed', 'canceled' | Number, DM Mono 32px |
| Auction Scheduled | Count where stage = 'upcoming' | Number |
| New This Week | Count where created_at > 7 days ago | Number |
| In Your Pipeline | Count of investor_pipeline rows for current user | Number |

Each stat card: `--surface` background, label on top in `--text-muted` uppercase 12px, value below in DM Mono 32px `--text-primary`. No icons. No decorative elements.

### Filter Bar

Below the stats. A single horizontal row with:
- **Stage filter:** Dropdown with options: All, New Filing, Sale Date Assigned, Upcoming Auction
- **City filter:** Dropdown populated from distinct cities in the data
- **Sort:** Dropdown: Newest First (default), Sale Date (soonest), Appraised Value (high to low), Appraised Value (low to high)
- **Search:** Text input that filters by address or case number (client-side filter on loaded data)

Filters update URL search params (`?stage=upcoming&city=Wichita&sort=sale_date`). Page reads from URL params on load. This means filtered views are shareable/bookmarkable.

### Property Grid

Below the filter bar. Responsive grid: 3 columns at 1440px+, 2 columns at 1024px+, 1 column below 1024px.

Each property is a card (component: `PropertyCard`). Card contents, top to bottom:

1. **Stage badge** — top-left corner of card. Color-coded:
   - "NEW FILING" — blue (`--info`)
   - "SALE DATE SET" — amber (`--warning`)
   - "AUCTION SCHEDULED" — red (`--danger`)

2. **Address** — DM Sans 600 15px, `--text-primary`. Full street address.

3. **City, State ZIP** — DM Sans 400 13px, `--text-secondary`. One line.

4. **Property details row** — horizontal, DM Mono 14px, `--text-secondary`, separated by middots:
   - `3 BD · 2 BA · 1,450 sqft`
   - If any value is null, omit that field (don't show "- BD")

5. **Financial row** — two columns:
   - Left: "County Appraisal" label in 11px muted + value in DM Mono 14px `--text-primary`
   - Right: "Foreclosure Amt" label + value in DM Mono 14px

6. **Sale date** (if exists) — "Sale: Fri, Mar 14, 2026" in DM Mono 13px. If sale date is within 14 days, text color is `--danger`. If within 30 days, `--warning`. Otherwise `--text-secondary`.

7. **Bottom row** — two elements:
   - Left: Case number in DM Mono 12px `--text-muted`
   - Right: "Save to Pipeline" button (secondary style) OR "In Pipeline ✓" indicator if already saved

**"Save to Pipeline" interaction:** Clicking creates a row in `investor_pipeline` with stage `watching`. Button immediately changes to "In Pipeline ✓" (optimistic update). No modal, no confirmation dialog. Single click to save.

**Card click:** Clicking anywhere on the card (except the save button) navigates to `/property/[id]`.

### Pagination

If more than 30 properties, paginate. Simple "Previous / Page X of Y / Next" at the bottom. No infinite scroll.

---

## 6. PROPERTY DETAIL PAGE (`/property/[id]`)

Full-page view of a single property. Two-column layout on desktop (65/35 split). Single column on mobile.

### Left Column (65%)

**Header:**
- Address in Playfair Display 700, 24px
- City, State ZIP in DM Sans 400, 16px `--text-secondary`
- Stage badge (same as card)
- Case number in DM Mono 13px `--text-muted`

**Property Details Section:**
Section header: "Property Details"
Two-column key-value grid:

| Field | Value |
|-------|-------|
| Bedrooms | 3 |
| Bathrooms | 2 |
| Square Feet | 1,450 |
| Property Type | Single Family |
| County Appraisal | $127,000 |
| Foreclosure Amount | $98,500 |
| Sale Date | Fri, Mar 14, 2026 |
| Attorney | Smith & Associates |
| Defendant | (show full name) |

All values in DM Mono. Labels in DM Sans 12px uppercase `--text-muted`.

**Court Research Section:**
Section header: "Title & Lien Research"

If `court_research` data exists for this property:
- Title status badge: "CLEAN TITLE" (green), "CLOUDED TITLE" (amber), "COMPLEX TITLE" (red)
- Liens listed as a table: Type, Amount, Creditor, Filing Date
- Judgments listed as a table: Type, Amount, Plaintiff, Filing Date
- Estimated offer range: "Estimated Bank Ask: $85,000 - $95,000" in DM Mono
- AI-generated research summary in a bordered panel

If no court research yet:
- Gray text: "Court research not yet available for this property. This feature is coming in the next update."
- No placeholder graphics. Just the text.

**Notes Section:**
Section header: "Your Notes"
A textarea where the investor can write and save notes about this property. Notes are private (stored in `investor_pipeline.notes` for this investor+property). Auto-saves on blur or after 2 seconds of inactivity (debounced). Show "Saved" indicator briefly after save. If the user hasn't added this property to their pipeline, show: "Save this property to your pipeline to add notes."

If the user is in a deal room and group notes exist (`investor_pipeline.group_notes`), show a separate read-only section: "Group Notes from [Deal Room Name]" with the admin's notes.

### Right Column (35%)

**Pipeline Status Card:**
If the property is in the user's pipeline: show current stage as a vertical progress indicator. Each of the 12 stages listed vertically. The current stage is highlighted in amber. Stages before it are marked with a subtle check. Stages after are dimmed. A dropdown or button to advance the stage.

If not in pipeline: a single "Add to Pipeline" primary button.

**Watching Indicator:**
"X investors are watching this property" — just the count, no names, no detail. Pull this from a count query on `investor_pipeline` where `property_id` matches. If count is 0 or 1 (just this user), don't show anything.

**Contact Section:**
For deal room investors: "Contact Your Agent" with Mike's name, email, and phone. The email is a mailto link, the phone is a tel link.
For independent investors (no deal room): omit this section entirely.

---

## 7. PIPELINE PAGE (`/pipeline`)

The investor's personal CRM — all properties they've saved, organized by stage.

### Layout: Kanban Board

Horizontal columns, one per active stage. Only show columns that have at least one property in them. Each column has:
- Header: stage name in DM Sans 600 14px uppercase, with a count badge
- Cards stacked vertically below

Horizontal scroll on mobile. On desktop, if more than 5 active stages, horizontal scroll activates.

### Pipeline Card (compact version of PropertyCard)

Each card in the kanban shows:
- Address (DM Sans 600 14px)
- City, ZIP (DM Sans 12px `--text-muted`)
- County appraisal in DM Mono 13px
- Sale date (if exists) with color coding same as dashboard
- Time in stage: "3 days" or "2 weeks" — how long since `stage_changed_at`
- Truncated notes preview (first 60 chars of `investor_pipeline.notes`, if any)

**Drag and drop:** Not required for v1. Stage changes happen via the property detail page dropdown. This keeps the pipeline view simple and avoids complex DnD implementation. If an agent later wants to add this, the kanban structure supports it.

**Card click:** navigates to `/property/[id]`.

### Pipeline Summary

Above the kanban, a single row of stats:
- Total in Pipeline: count
- Watching: count
- Active (researching through in_closing): count
- Closed: count
- Passed/Rejected: count

---

## 8. ADMIN PANEL (`/admin`)

Visible only to users with role `admin` or `super_admin`. If an `investor` role user navigates here, redirect to `/dashboard`.

### Investor Overview

A table listing all investors in the admin's deal room.

| Column | Data |
|--------|------|
| Name | profiles.full_name |
| Email | profiles.email |
| Subscription | profiles.subscription_tier (badge) |
| Properties Saved | count of investor_pipeline rows |
| Active Deals | count where stage is between 'preparing_offer' and 'in_closing' |
| Last Active | most recent investor_pipeline.updated_at |

Click a row to expand an inline detail showing that investor's pipeline stages as a summary (e.g., "Watching: 4, Researching: 2, Offer Submitted: 1").

### Property Activity Feed

Below the investor table. A reverse-chronological feed of pipeline activity across all investors in the deal room:
- "[Investor Name] saved [Address] to pipeline" — timestamp
- "[Investor Name] moved [Address] to Researching" — timestamp
- "[Investor Name] submitted offer on [Address] for $XX,XXX" — timestamp (if offer_amount is set)

This is a simple query on `investor_pipeline` joined with `profiles` and `properties`, ordered by `updated_at DESC`, limited to 50 rows.

### Admin Notes

The admin can add group notes to any property. This is a separate section or accessible from the activity feed. When the admin adds a group note, it's stored in `investor_pipeline.group_notes` and visible to all investors in the deal room who have that property in their pipeline (subject to the deal room's visibility settings).

For v1, keep this simple: a text area on the admin's view of any property detail page that writes to `group_notes`.

---

## 9. API LAYER

Use Next.js Server Components and Server Actions where possible. Minimize dedicated API routes.

### Data Fetching Pattern

- **Server Components** fetch data directly using the Supabase server client (created with `createServerClient` from `@supabase/ssr`). This runs on the server, respects RLS, and sends only rendered HTML to the client.
- **Mutations** (save to pipeline, change stage, update notes) use Server Actions. Define them in separate files with `'use server'` directive.
- **Real-time** is not needed for v1. Data freshness from server component re-rendering on navigation is sufficient.

### Key Queries

**Dashboard properties:**
```sql
SELECT * FROM properties
WHERE market_id = [user's market]
AND stage NOT IN ('sold', 'redeemed', 'canceled')
ORDER BY created_at DESC
LIMIT 30 OFFSET [page * 30]
```

**User's pipeline:**
```sql
SELECT ip.*, p.address, p.city, p.zip_code, p.county_appraisal, p.sale_date, p.stage as property_stage
FROM investor_pipeline ip
JOIN properties p ON ip.property_id = p.id
WHERE ip.investor_id = [current user id]
ORDER BY ip.updated_at DESC
```

**Admin activity feed:**
```sql
SELECT ip.*, pr.full_name, p.address
FROM investor_pipeline ip
JOIN profiles pr ON ip.investor_id = pr.id
JOIN properties p ON ip.property_id = p.id
WHERE pr.deal_room_id = [admin's deal room id]
ORDER BY ip.updated_at DESC
LIMIT 50
```

**Watching count (anonymous):**
```sql
SELECT COUNT(DISTINCT investor_id)
FROM investor_pipeline
WHERE property_id = [this property]
```

---

## 10. FILE STRUCTURE

```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   └── signup/
│       └── page.tsx
├── (main)/
│   ├── layout.tsx              # Navigation bar, auth check
│   ├── dashboard/
│   │   └── page.tsx            # Property grid with filters
│   ├── property/
│   │   └── [id]/
│   │       └── page.tsx        # Property detail
│   ├── pipeline/
│   │   └── page.tsx            # Kanban pipeline
│   └── admin/
│       └── page.tsx            # Admin panel (role-gated)
├── layout.tsx                  # Root layout: fonts, Tailwind, metadata
├── globals.css                 # Tailwind directives only
├── middleware.ts               # Auth redirect logic
├── components/
│   ├── nav.tsx                 # Top navigation bar
│   ├── property-card.tsx       # Card used on dashboard grid
│   ├── pipeline-card.tsx       # Compact card for kanban
│   ├── stage-badge.tsx         # Color-coded stage badge
│   ├── stat-card.tsx           # Dashboard stat box
│   ├── filter-bar.tsx          # Dashboard filter controls
│   └── stage-progress.tsx      # Vertical stage indicator for detail page
├── lib/
│   ├── supabase/
│   │   ├── server.ts           # createServerClient helper
│   │   ├── client.ts           # createBrowserClient helper
│   │   └── middleware.ts        # Middleware auth helper
│   ├── types.ts                # TypeScript types matching DB schema
│   └── utils.ts                # formatCurrency, formatDate, etc.
├── actions/
│   ├── pipeline.ts             # saveToPipeline, changeStage, updateNotes
│   └── admin.ts                # updateGroupNotes
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
├── package.json
└── .env.local                  # NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
```

---

## 11. PERFORMANCE REQUIREMENTS

- **First Contentful Paint:** Under 1.5 seconds on a standard connection.
- **Dashboard load:** Properties should render server-side. No loading spinner for initial page load. Filters can trigger client-side re-renders.
- **Mutations:** Optimistic updates for pipeline saves and stage changes. Show the updated state immediately, revert if the server action fails.
- **Images:** There are no images in v1. No property photos, no maps, no avatars. Don't add placeholder images.

---

## 12. WHAT IS NOT IN SCOPE

Do not build any of the following. They are planned for later phases.

- Recommendation scores or "recommended for you" sections (Phase 3)
- Onboarding interview flow or preference input forms (Phase 3)
- Stripe integration or payment UI (Phase 4)
- Free tier paywall or upgrade prompts (Phase 4)
- Deal Room setup/branding flow (Phase 4)
- Mobile-specific optimizations beyond responsive design (Phase 5)
- Push notifications (Phase 5)
- AI voice agent (Phase 6)
- Maps, street view, or satellite imagery (Phase 6)
- Social login (Apple, Google) — Phase 5
- Super admin panel — will be built separately
- Dark mode toggle — the app IS dark mode. There is no light mode.
- Onboarding wizard or tutorial — beta users will be walked through it on a call
- Analytics or tracking (Mixpanel, PostHog, etc.) — later
- Email notification system — the existing Apps Script handles weekly emails for now

---

## 13. ACCEPTANCE CRITERIA

The build is complete when:

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
11. All typography, colors, spacing, and component patterns match this spec.
12. The app is responsive down to 375px width (iPhone SE).
13. No TypeScript errors. No console errors. No hydration mismatches.
14. Deployed to Vercel and accessible via the project URL.

---

## 14. SUPABASE CREDENTIALS

```
NEXT_PUBLIC_SUPABASE_URL=        [from Supabase project settings]
NEXT_PUBLIC_SUPABASE_ANON_KEY=   [from Supabase project settings → API]
SUPABASE_SERVICE_ROLE_KEY=       [from Supabase project settings → API — NEVER expose client-side]
```

The coding agent should retrieve these from the Supabase dashboard or from the existing `.env` configuration established during Phase 0.

---

*This brief is the contract. Build to this spec. Deviations require explicit approval from Philip.*
