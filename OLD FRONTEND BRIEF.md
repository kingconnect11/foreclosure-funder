# FRONTEND BUILD BRIEF: Foreclosure Funder — Investor Dashboard

**Date:** March 2, 2026
**Issued by:** Philip King, CTO
**Purpose:** This is a design competition brief. Multiple AI agents are building competing versions of this frontend. The winner will be selected based on visual impact, UX quality, and overall craft. The pages, data model, and Supabase integration are specified precisely — build exactly what's described functionally. The visual design, aesthetic direction, layout creativity, animations, and overall feel are WIDE OPEN. Surprise me. Make something I'd be proud to demo to investors. Make it visually stunning.
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

### Required packages

```
next @supabase/supabase-js @supabase/ssr
tailwindcss postcss autoprefixer
date-fns                         # Date formatting — no moment.js
clsx                             # Conditional classnames
```

### Encouraged additions

You are free to install additional packages that serve the design. Animation libraries (framer-motion, motion, GSAP), icon sets (lucide, phosphor, heroicons, tabler), charting libraries (recharts, visx, chart.js), mapping libraries if you want to show property locations, component primitives (radix-ui, headless-ui) — all fair game. Use your judgment. The only hard rule: no full UI kits that make every app look the same (no Material UI, no Chakra UI, no Ant Design). We want a custom look, not a template.

---

## 3. DESIGN DIRECTION

### This is a design competition. Read this section carefully.

You have full creative control over the visual design. Choose your own colors, typography, layout approach, animation strategy, and aesthetic philosophy. The constraints below are guardrails, not a paint-by-numbers kit.

### The audience

Real estate investors who write five- and six-figure checks. Some are 55-year-old contractors who've flipped 200 houses. Some are 30-year-old first-timers with a line of credit and ambition. The interface needs to feel credible and serious enough for the veterans without being intimidating to newcomers. Think "a tool built by people who understand money" — not "a dashboard template from a UI kit."

### Mood and tone

We've used the phrase "Bloomberg terminal crossed with a private wealth management portal" internally, but that's a starting point, not a ceiling. Here are qualities the design MUST have:

- **Data-dense but not cluttered.** Investors want information. Don't hide it behind clicks. But organize it so the eye knows where to go.
- **Confident typography.** The font choices should feel intentional and distinctive. Use a serif, a sans-serif, a monospace — whatever you want — but commit to them. Financial data (prices, case numbers, dates) should be in a monospace or tabular font so columns align.
- **Dark-mode primary.** The default theme should be dark. This is a tool people will spend hours in. Light backgrounds with black text get fatiguing. If you want to offer a light mode too, go ahead, but dark is the default.
- **Not boring.** This is where the previous version of this brief failed. Yes, it's a financial tool. No, it should not look like a government website from 2014. Use motion. Use interesting hover states. Use spatial composition that isn't just "cards in a grid." Think about how the data can be presented in ways that are genuinely beautiful — not decorated, but inherently well-designed. A well-crafted data table IS beautiful. A thoughtful stat card with perfect type hierarchy IS visually striking. You don't need gradients and particles. You need craft.

### What you can choose freely

- **Entire color palette.** Pick whatever works. Deep navy and amber is what the v0 prototype used — you can keep it, riff on it, or go a completely different direction. Jewel tones, earth tones, neon-on-black, muted and editorial — your call. The only requirement: status colors need to be distinguishable (something for "good/clean," something for "warning/moderate risk," something for "danger/urgent").
- **All typography.** Choose your own fonts. Display, body, data — pick a combination that gives the product a distinctive voice. Load them from Google Fonts or bundle them. Just make sure financial data is in a monospace or tabular-figure font.
- **Layout and composition.** Grid, flex, asymmetric, sidebar-driven, full-bleed — your call. The page structure (what data goes on which page) is defined in Sections 5-8. How you arrange that data on the screen is up to you.
- **Animation and interaction.** Page transitions, card hover effects, loading states, micro-interactions, scroll-triggered reveals — go for it if it serves the UX. Or go minimal if that's your aesthetic. Just don't default to "no animation because I wasn't told to animate."
- **Component styling.** Cards, badges, buttons, tables, inputs — design them from scratch. Make them feel like they belong to this product and no other.
- **Navigation pattern.** Top nav, side nav, command palette, tab bar — solve the information architecture however you think is best. The routes are defined. The navigation pattern is yours.
- **Bonus features that enhance the design.** A command palette (cmd+k) for power users? A map view of properties? A mini-chart showing property value trends on a card? Tasteful data visualizations? If it makes the product more compelling and you can build it within the functional spec, do it. Don't add backend features — but frontend enhancements that make the existing data shine are encouraged.

### What is fixed (don't change these)

- The product name is "Foreclosure Funder"
- Dark mode is the default
- The pages and their functional requirements (Sections 5-8) must be implemented as specified
- The data fields on each card/page are specified — display all of them
- The Supabase integration and auth flow must work as described in Sections 9-10
- Stage badges must be color-coded by severity/urgency (the exact colors are your choice)
- Financial numbers must use a monospace or tabular-figure font
- The app must be responsive down to 375px (iPhone SE)
- No full UI kits (Material UI, Chakra, Ant Design)

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

Must include: "Foreclosure Funder" branding, navigation links (Dashboard, Pipeline, Admin — admin+ only), user email, and a "Sign out" action. Mobile: responsive navigation pattern of your choice. The navigation pattern (top nav, side nav, tab bar, etc.) and its visual design are entirely up to you.

---

## 5. DASHBOARD PAGE (`/dashboard`)

> **DESIGN NOTE FOR SECTIONS 5-8:** The data fields, interactions, and page structure below are **functional requirements** — implement all of them. However, font names (DM Mono, DM Sans, Playfair Display), font sizes (32px, 15px, etc.), CSS variable names (`--surface`, `--text-muted`, etc.), and specific color values are **examples from a previous iteration**. Replace them with your own design system choices. The functional spec tells you WHAT to show. HOW it looks is your creative decision per Section 3.

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

### Functional (pass/fail — all must work)

1. An unauthenticated user is redirected to `/login` from any route.
2. A user can sign up, sign in, and sign out.
3. The dashboard loads properties from Supabase and displays them correctly.
4. Filters (stage, city, sort, search) work and persist in URL params.
5. Clicking "Save to Pipeline" creates a pipeline entry with stage `watching`.
6. The property detail page shows all data fields specified in Section 6.
7. Notes save on the property detail page (debounced auto-save).
8. The pipeline page organizes properties by stage.
9. The admin panel shows the investor table and activity feed (visible only to admin+ roles).
10. The watching count displays on property detail pages.
11. Responsive down to 375px width (iPhone SE).
12. No TypeScript errors. No console errors. No hydration mismatches.

### Design (judged by Philip — this is the competition)

13. Does the overall aesthetic feel professional, distinctive, and visually compelling?
14. Is the typography system intentional and well-executed?
15. Does the data hierarchy work — can you scan a property card and get the key info in 2 seconds?
16. Are the interactions polished — hover states, transitions, loading states?
17. Does it feel like a product someone would pay for, or a template someone downloaded?
18. Would an investor show this to a friend and say "look at this tool I'm using"?
19. Does it have at least one moment of genuine visual delight — something that makes you pause and think "that's well done"?

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
