# CLAUDE.md -- Foreclosure Funder

## Rules (read before every task)

- No em dashes anywhere ever. Use "--" or rewrite the sentence.
- Before starting any task, re-read this file.
- After completing any task, update this file with what changed.
- When handing off work to Cursor, run `/handoff cursor` or write a HANDOFF.md manually with: goal, relevant files, context needed, what has been tried, and explicit instructions.
- When checking project status, run `/status` for a current snapshot.
- Never install packages outside the approved list without CTO approval.
- Never modify FOUNDING_ARCHITECTURE.md, BAKEOFF_PROMPT.md, or FUNCTIONAL_SPEC.md.
- Never modify the scraper or seed scripts unless explicitly told to.
- Always check AGENTS.md for shared conventions before writing code.
- Always check TODO.md for current priorities before starting new work.
- When reporting what's left to do, include tasks assigned to other agents (Kimi, Cursor) so the user knows they can prompt those tools separately.
- Reference docs/handoff/phase1-backend-foundation.md for the backend contract.
- Reference FUNCTIONAL_SPEC.md for what every page must do.

---

## Project Overview

**Foreclosure Funder** -- SaaS platform for real estate investors focused on foreclosure properties in Kansas. Two products under one roof:

1. **Investor Dashboard** -- Property listings, filters, CRM pipeline, deal analyzer
2. **Deal Room** -- Agent/admin tool for managing investors, activity feeds, group notes

**Founders:** Philip King (CTO, super_admin), Mike King (sales, admin)

**Current status (2026-03-07):** Alpha app includes Portfolio module (canonical `/portfolio` with `/owned` alias), owned analytics, pipeline-to-portfolio conversion, and admin member-switchable portfolio views. Marketing pages are live. Latest portfolio/chart restructuring is pushed and deployed to preview.

**Current phase:** Phase 1 Alpha Launch (see FOUNDING_ARCHITECTURE.md Section 19). Immediate focus: property intelligence PDF demo, plan-tier gating UX + backend enforcement, mobile/iOS strategy, and richer controls/chips/toggles across app surfaces.

**Pricing tiers (simplified for now):** Free ($0), Standard ($20/mo), Premium ($40/mo), Deal Room ($500/mo). See FOUNDING_ARCHITECTURE.md Section 5-6 for full feature breakdown.

**Multi-agent team:**
- **Claude Code** -- Backend, architecture, server actions, data layer, infrastructure, Supabase
- **Cursor** -- Frontend polish, loading states, responsive design, CSS fixes, component UI
- **Kimi** -- Landing page, marketing copy, pricing page (separate from app)
- **Human (Philip)** -- CTO decisions, Supabase admin, product direction
- **Human (Mike)** -- Onboarding questions (finalizing this weekend), investor feedback, sales

**Key docs:**
- `FOUNDING_ARCHITECTURE.md` -- Source of truth for all product/technical decisions
- `FUNCTIONAL_SPEC.md` -- What every page must do (the functional contract)
- `AGENTS.md` -- Shared conventions for all AI agents (Claude Code, Cursor, etc.)
- `TODO.md` -- Pre-alpha release plan with agent assignments and priorities
- `docs/handoff/phase1-backend-foundation.md` -- Backend contract for frontend work
- `docs/plans/` -- Design docs and implementation plans

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| Language | TypeScript (strict) | 5.9.3 |
| Styling | Tailwind CSS | 3.4.19 |
| Auth | @supabase/ssr | 0.8.0 |
| Database | Supabase (PostgreSQL) | supabase-js 2.98.0 |
| Icons | lucide-react | 0.575.0 |
| Dates | date-fns | 4.1.0 |
| Classnames | clsx + tailwind-merge | 2.1.1 / 3.5.0 |
| Animation | framer-motion | 12.35.0 |
| Charts | recharts | 3.7.0 |
| Deployment | Vercel | prj_BNjPyPdakHg2XIeAEydWCltZpbNB |

**Package policy:** Do not add packages without CTO approval. Banned: Material UI, Chakra UI, Ant Design.

---

## Architecture

```
app/
  layout.tsx              # Root layout (Inter + JetBrains Mono fonts)
  page.tsx                # Redirects to /dashboard
  globals.css             # CSS variables, component classes
  (auth)/
    login/page.tsx        # Email/password sign in
    signup/page.tsx       # Email/password/name sign up
  (main)/
    layout.tsx            # Authenticated layout with Nav sidebar
    dashboard/page.tsx    # Property listings, stats, filters, pagination
    pipeline/page.tsx     # Kanban-style CRM pipeline
    portfolio/page.tsx    # Portfolio analytics + property management (canonical)
    owned/page.tsx        # Alias redirect to /portfolio
    property/[id]/page.tsx # Property detail with stage progress, notes, maps
    admin/page.tsx        # Admin panel (investor table + activity feed)
    deal-analyzer/page.tsx # Flip/rental/wholesale calculator

components/               # App-wide shared components + feature folders
lib/
  queries.ts              # Server-side data fetching (dashboard/pipeline/portfolio/admin)
  types.ts                # Generated Supabase types + convenience aliases
  utils.ts                # Formatting utilities (currency, date, urgency, cn)
  supabase/server.ts      # createClient() + createServiceClient()
  supabase/client.ts      # Browser-side createClient()
  supabase/middleware.ts   # Auth session refresh + route protection
  deal-analyzer/calculations.ts  # Flip, rental, wholesale engines
  owned/calculations.ts   # Portfolio KPIs + trend/category analytics
  owned/types.ts          # Portfolio domain types

actions/
  auth.ts                 # signIn, signUp, signOut
  pipeline.ts             # saveToPipeline + stage updates + convert-to-portfolio flow
  owned.ts                # Portfolio CRUD, CSV import, cost lines, chart prefs, backfill
  admin.ts                # updateGroupNotes

middleware.ts             # Root middleware (delegates to supabase/middleware.ts)
scraper/                  # Python foreclosure scraper (DO NOT MODIFY)
scripts/                  # Python seed scripts (DO NOT MODIFY)
supabase/migrations/      # versioned SQL migrations (includes security + portfolio schema)
```

### Data Flow

1. Middleware refreshes Supabase auth session on every request
2. Unauthenticated users redirect to `/login`
3. Server Components call `lib/queries.ts` (creates Supabase server client per request)
4. Mutations via Server Actions in `actions/` directory
5. After mutations, `revalidatePath()` triggers re-render
6. Client components use `'use client'` and call server actions directly

---

## Database

**Supabase project:** `fgcwbrolnxpfihqkvmcn`
**URL:** https://fgcwbrolnxpfihqkvmcn.supabase.co

### Tables

| Table | Purpose |
|-------|---------|
| profiles | User accounts (id = auth.uid), role, deal_room_id, subscription |
| properties | Foreclosure listings (81 seeded) -- address, stage, sale_date, appraisal |
| investor_pipeline | User's saved properties with CRM stage, notes, offer_amount, moved_to_owned_at |
| pipeline_stage_history | Stage transition log with notes and timestamps |
| owned_properties | Portfolio properties owned/closed by investor |
| owned_property_cost_items | Cost line-items per owned property (construction/legal/interest/etc) |
| owned_chart_preferences | Per-user favorite/pinned portfolio charts |
| deal_rooms | Agent organizations with branding and contact info |
| markets | Geographic markets (1: Sedgwick County, KS) |
| court_research | Title/lien research (empty -- Phase 2) |
| investor_preferences | Onboarding data (empty -- future) |
| recommendation_scores | AI recommendations (empty -- Phase 3) |
| outreach_campaigns | Deal room outreach (empty -- future) |

### Key Enums

- **property_stage:** new_filing, sale_date_assigned, upcoming, sold, redeemed, canceled
- **pipeline_stage:** watching, researching, site_visit, preparing_offer, offer_submitted, counter_offered, offer_accepted, in_closing, closed, rejected, no_response, passed
- **user_role:** super_admin, admin, investor

### RLS: policies enforced across pipeline, portfolio, and profile domains. Key patterns:
- Investors see only their own pipeline entries
- Admins see all entries in their deal room
- Properties readable by all authenticated users
- `get_watching_count` RPC bypasses RLS for anonymous count

### Key UUIDs
- Philip King: `ace8df94-11a6-4575-9264-bf8fd4c27e91`
- Mike King: `8863f547-e72a-48d8-8e52-96f885055c6f`
- Sedgwick County: `00000000-0000-0000-0000-000000000001`
- Deal Room: `00000000-0000-0000-0000-000000000002`

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=         # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Supabase anon key (safe for client)
SUPABASE_SERVICE_ROLE_KEY=        # Server only -- NEVER expose client-side
NEXT_PUBLIC_GOOGLE_MAPS_KEY=      # Google Maps Embed API key (optional)
```

---

## Commands

```bash
npm run dev          # Dev server
npm run build        # Production build (must pass zero TS errors)
npm run start        # Production server
npm run lint         # ESLint
npm run test         # Vitest unit tests (57 tests)
npm run test:watch   # Vitest in watch mode
```

---

## Design System (current working state)

The app currently uses a "Japanese Zen" light theme defined in `globals.css` and `tailwind.config.ts`. This is the working design as of today -- bake-off entries are still under review.

**CSS variables:** --background, --surface, --border, --accent (#E74C3C vermillion), --success, --warning, --danger
**Component classes:** .zen-card, .zen-card-interactive, .btn-primary, .btn-secondary, .btn-ghost, .input-zen
**Fonts:** font-display/font-body (Inter), font-mono (JetBrains Mono)

---

## Coding Conventions

See `AGENTS.md` for the full shared conventions. Key points:
- Server Components by default; `'use client'` only when needed
- All data fetching via `lib/queries.ts` -- no `useEffect` + `fetch`
- State: React Server Components + URL params. No Redux/Zustand.
- `cn()` from `lib/utils.ts` for conditional classnames
- `Promise.all` for parallel server-side data fetching
- Optimistic updates for pipeline saves
- Auto-save with 2s debounce for notes
- URL search params for filter state (bookmarkable)
- PAGE_SIZE = 30 for pagination

---

## Known Issues

See `TODO.md` for the complete prioritized list with agent assignments. Critical items:
1. Property Intelligence PDF report demo is not yet implemented (new top priority)
2. Plan-tier capability enforcement + lock-state UI is incomplete
3. Test suite foundation done (57 unit tests); integration + E2E tests still needed
4. No email verification on signup (Supabase auth config)
5. iOS path decision (native vs web-first) is still open

---

## Recent Changes (update after every task)

- 2026-03-07: Portfolio UX overhaul completed in `b9c4eec` -- introduced canonical `/portfolio` route + loading state, converted `/owned` to alias redirect with query preservation, added `components/owned/portfolio-charts.tsx` with featured/favorite star chart behavior, enlarged and color-enhanced chart visuals, moved CSV/manual entry sections to bottom of portfolio page, updated nav/dashboard links to `/portfolio`, and added `assets/portfolio-import-demo-10.csv` for import demos.
- 2026-03-07: Portfolio visibility and filtering fixes completed in `fb24a7d` -- admin/super_admin can switch across all deal room members (not only investor role), portfolio analytics are now filter-reactive (`status` + `search`), and related app/marketing copy was updated from Owned to Portfolio.
- 2026-03-07: Built Owned Properties capability end-to-end in `abb7e28` -- added migration `20260307020000_owned_properties.sql` (owned tables, enums, RLS, pipeline `moved_to_owned_at`), server actions in `actions/owned.ts` (manual CRUD, CSV import with row validation, cost line-item CRUD, chart preference persistence, closed-pipeline backfill), owned analytics engine in `lib/owned/calculations.ts`, original `/owned` route + loading state, dashboard KPI strip + link, and closed-stage conversion flow (`changeStageAndConvertToOwned`) that prompts for owned fields and moves closed deals out of active pipeline. Added tests in `__tests__/lib/owned-calculations.test.ts`.
- 2026-03-07: Operational data prep completed for demos -- seeded portfolio demo data for all profiles (3-15 properties each with varied values/types) and seeded cost-item depth for meaningful chart output.
- 2026-03-07: Test suite foundation -- vitest configured with 57 passing unit tests (24 for lib/utils, 30 for lib/deal-analyzer/calculations, 3 for lib/owned/calculations); `npm run test` and `npm run test:watch` scripts added
- 2026-03-07: Connected Deal Analyzer to property data -- accepts `?propertyId=` URL param; property detail page now has "Analyze This Deal" button; foreclosure amount maps to purchase price, county appraisal maps to ARV
- 2026-03-07: Quick wins -- fixed updateNotes missing revalidatePath, replaced hardcoded color in deal-analyzer error.tsx with text-foreground token, added personalized "Welcome back, {FirstName}" dashboard heading
- 2026-03-07: Committed all Codex work in 8 scoped batches -- auth hardening, onboarding form, loading skeletons, frontend polish, ESLint flat config, security migration, documentation, onboarding query
- 2026-03-07: Added `docs/plans/2026-03-07-philip-todo-api-and-ai.md` with a concrete operator checklist for Google Maps key setup, local vs Vercel env placement, API abuse controls, and Anthropic rollout plan for property descriptions
- 2026-03-07: Added `TODO.md` backlog item for Anthropic-powered 1-2 sentence AI property descriptions (server-side generation + cached storage + fallback behavior)
- 2026-03-07: Recreated root `HANDOFF.md` as the single canonical handoff doc after accidental deletion during doc edits; added detailed reviewer checklist, risk notes, deployment context, and explicit next build order for pipeline/design backlog
- 2026-03-07: Production deployment verified for commit `4ef0e92` (Deal Analyzer redesign + guided insights + chart polish + authenticated mobile QA fixes) on `https://foreclosure-funder.vercel.app`; Vercel deployment id `dpl_EdfNnFE1ePY7KpQmeU71V2bHA1UQ`
- 2026-03-07: Captured next-phase UX decisions from product review -- defer dashboard/pipeline Street View thumbnails until Google Maps API setup; keep pipeline color language to blues/greens/reds/orange/yellow (no pink/purple); prioritize pipeline visual enrichment and side-by-side Deal Analyzer compare mode; add closed-stage celebratory animation task
- 2026-03-07: Clarified `TODO.md` acceptance details for upcoming UX work -- pipeline enrichment now explicitly constrained to non-pink/non-purple color families, and Deal Analyzer compare mode now specifies two concurrent property cards with a comparison card beneath while preserving left-nav structure
- 2026-03-07: Updated `TODO.md` design backlog for next phase -- deferred dashboard/pipeline Street View thumbnails until Google Maps API setup, added pipeline visual enrichment pack (colored stage chips + denser card hierarchy), added Deal Analyzer side-by-side comparison mode, and added future settings/menu UX redesign task
- 2026-03-07: Deal Analyzer redesign pass completed -- upgraded visual hierarchy (studio-style header, richer strategy tabs, stronger card layering) and added a guided-insights playground with deterministic rules, severity-tagged recommendations, strategy filters, one-click assumption patches, single-step undo, and input highlight feedback; build passes with zero TypeScript errors
- 2026-03-07: Completed authenticated mobile QA matrix on `/dashboard`, `/pipeline`, `/admin` using a valid admin account across standard iPhone widths (320, 375, 390, 393, 414, 428, 430) and top Android profiles (Galaxy S24, Galaxy A15, Pixel 8, Galaxy S23, Redmi Note 13); patched authenticated-route controls to enforce 44px touch targets (`components/nav.tsx`, `components/filter-bar.tsx`, `components/property-card.tsx`, `app/(main)/dashboard/page.tsx`) and re-verified zero horizontal overflow
- 2026-03-07: Created root `HANDOFF.md` with required handoff sections (goal, relevant files, context, attempted work, explicit next instructions) and updated `TODO.md` with a new follow-up item for authenticated-route mobile QA on `/dashboard`, `/pipeline`, `/admin`
- 2026-03-06: Day 3 device compatibility hardening -- validated `/onboarding`, `/login`, and `/signup` on standard iPhone widths (320, 375, 390, 393, 414, 428, 430) plus top Android profiles (Galaxy S24, Galaxy A15, Pixel 8, Galaxy S23, Redmi Note 13); patched auth/onboarding form controls to enforce 44px touch targets (inputs/buttons/links + multi-select rows)
- 2026-03-06: Day 3 continued -- polished mobile UX: compact mobile pagination, improved dashboard/pipeline empty states with icons + CTAs, mobile nav/filter/table overflow hardening, and viewport checks across common iPhone/Android widths on accessible routes showed no horizontal overflow
- 2026-03-06: Day 3 in progress -- added route loading skeletons for dashboard/pipeline/admin/property/deal-analyzer, added `app/(main)/deal-analyzer/error.tsx`, fixed admin table expanded-row dark background, and updated `AdminGroupNotes` to zen text tokens
- 2026-03-06: Day 2 implemented -- added `/onboarding` route with config-driven form + draft/submit save modes + admin investor switcher + `saveOnboardingPreferences` server action; added migration `20260307000100_day2_security_hardening.sql` for profile escalation guard trigger, `investor_pipeline.deal_room_id` index, and `super_admin_all_stage_history` policy
- 2026-03-06: Day 1 started -- migrated lint to ESLint flat config (`npm run lint` now works on Next.js 16), added signup password confirmation checks (client + server), and updated middleware allowlist for `/`, `/pricing`, `/onboarding`
- 2026-03-06: Created CLAUDE.md, AGENTS.md, TODO.md, .cursor/rules, .claude/skills (handoff + status)
- 2026-03-05: Phase 1c hardening complete (stage history, error boundaries, deal room branding, Google Maps)
- 2026-03-04: Deal Analyzer shipped (flip/rental/wholesale with animated UI)
- 2026-03-03: Bake-off winner selected and integrated
- 2026-03-02: Phase 1 backend foundation complete, deployed to Vercel
