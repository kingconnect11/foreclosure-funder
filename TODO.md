# TODO.md -- Foreclosure Funder Pre-Alpha Release Plan

Last updated: 2026-03-07

This is the pre-alpha roadmap. Goal: working product for Mike + 1-2 investors within 4 weeks.
See `FOUNDING_ARCHITECTURE.md` Section 19 for the full multi-phase roadmap (living document.)

---

## How to Read This

- **Agent assignments:** Each task notes which AI tool should handle it
  - **Claude/ Claude Code** -- Backend, architecture, server actions, data layer, infrastructure, security and first pass security review
  - **Cursor / Codex** -- Frontend polish, loading states, responsive design, CSS fixes, security reviews
  - **Kimi** -- Landing page, marketing copy, pricing page, frontend redesigns/bakeoff
  - **Human (Philip)** -- Product decisions, Supabase admin, CTO approvals, design
  - **Human (Mike)** -- Onboarding questions, investor feedback, sales content
- **Phases** reference `FOUNDING_ARCHITECTURE.md` Section 19
- Items marked with priority: P0 = blocks alpha, P1 = should fix before alpha, P2 = important for alpha experience

---

## P0 -- Blocks Alpha Launch

### Onboarding Flow (Phase 1c per FOUNDING_ARCHITECTURE.md)

The onboarding form ships with alpha. Philip uses it during manual Zoom calls with investors.
See FOUNDING_ARCHITECTURE.md Section 10 for full spec.

- [x] **Build onboarding form page** -- Standalone page at `/onboarding` (accessible before and after login). Maps to `investor_preferences` table. Fillable by any admin for alpha. **Codex** delivered route + server action + Supabase integration + config-driven field rendering + save draft/submit modes + admin investor switcher (2026-03-06). **Cursor** polish pass still recommended.
  - Fields from Section 10: budget range, financing method, target counties/zips, property types (residential/commercial), contractor relationships (yes/no), lender for large transactions (optional), dream property description (free text with rotating placeholder suggestions), pain points, risk tolerance, experience level, deal-breakers, desired features (pool/basement/garage/lot size), timeline to close
  - Save draft / resume capability (use `investor_preferences` table with a `draft` boolean or `status` column)
  - Placeholder questions for now -- Mike will finalize this weekend
  - Must be easy to edit questions later (config-driven, not hardcoded JSX per question)
- [x] **No loading.tsx skeleton files** -- Added `loading.tsx` for dashboard, pipeline, admin, property detail, and deal-analyzer routes (2026-03-06). **Codex**
- [x] **Signup password confirmation not validated** -- Fixed server-side validation in `signUp` and added client-side mismatch blocking in signup form. **Claude Code/Codex** (completed 2026-03-06)
- [x] **Middleware blocks upcoming public pages** -- Updated auth middleware allowlist so unauthenticated users can access `/`, `/pricing`, and `/onboarding` while still protecting app routes. **Codex** (completed 2026-03-06)
- [ ] **No test suite** -- Zero tests. Need at minimum: build passes (current), unit tests for lib/utils and lib/deal-analyzer/calculations, integration tests for server actions, E2E for auth + pipeline flows. **Claude Code**

### Landing Page & Pricing (assigned to Kimi)

- [ ] **Landing page** -- Marketing site at `/` or separate subdomain. Must communicate what Foreclosure Funder does, who it's for, and why it's different. Include: hero section, feature highlights, pricing tiers, CTA to sign up, testimonial placeholder. **Kimi** builds this. Philip provides copy direction.
- [ ] **Pricing page / section** -- Show the four tiers with feature comparison:
  - **Free** ($0) -- 2-3 listings per session, address + sale date only, save up to 3 properties, no pipeline tracking, educational content
  - **Standard** ($20/mo) -- Full listings, court research, appraiser data, recommendation scores, full CRM pipeline, unlimited saves, property alerts, onboarding interview, mobile access
  - **Premium** ($40/mo) -- Everything in Standard + AI voice agent, priority notifications, comparable sales data, visual data (maps/satellite), document prep, automation setup, priority support
  - **Deal Room** ($500/mo) -- Agent admin panel, branded deal room, full onboarding meeting, up to 2 custom feature requests, homeowner outreach automation, weekly investor digests
  - Note: these are simplified display prices. Actual pricing in FOUNDING_ARCHITECTURE.md Section 6 is $29/$49 monthly with annual discounts. Use the simplified numbers ($20/$40/$500) for now -- Mike and Philip will finalize.
- [ ] **Walkthrough capability** -- A potential user should be able to see what each tier looks like in the app. Could be screenshots, demo mode, or a guided tour. Minimum: screenshots of dashboard, pipeline, deal analyzer, admin panel with labels showing which tier unlocks what. **Kimi** for the landing page version; **Cursor** for any in-app tour.

---

## P1 -- Should Fix Before Alpha

### Frontend Polish (Cursor/Codex)

- [x] **Admin investor table hardcoded dark bg** -- Replaced dark hardcoded expanded-row background with zen theme-compatible `bg-rice-50` (2026-03-06). **Codex**
- [x] **AdminGroupNotes uses old CSS variables** -- Updated to zen tokens (`text-ink-500`, `text-foreground`) in `components/admin-group-notes.tsx` (2026-03-06). **Codex**
- [x] **Empty states incomplete** -- Dashboard and pipeline empty states upgraded with icon + action CTA (2026-03-06). **Codex**
- [x] **Mobile responsiveness audit** -- Applied mobile hardening across nav/filter/table/card/pipeline column sizing, then validated `/onboarding`, `/login`, `/signup` against standard iPhone widths (320, 375, 390, 393, 414, 428, 430) and top Android profiles (Galaxy S24, Galaxy A15, Pixel 8, Galaxy S23, Redmi Note 13) with zero horizontal overflow. Follow-up patch raised form/button/link touch targets to 44px minimum for those routes (2026-03-06). **Codex**
- [x] **Authenticated-route mobile QA pass** -- Completed full authenticated matrix on `/dashboard`, `/pipeline`, `/admin` using a valid admin test account across standard iPhone widths (320, 375, 390, 393, 414, 428, 430) and top Android profiles (Galaxy S24, Galaxy A15, Pixel 8, Galaxy S23, Redmi Note 13). Follow-up patches enforced 44px touch targets for authenticated-route nav/search/filter/save/pagination controls. Verified zero horizontal overflow after fixes (2026-03-07). **Codex**
- [x] **Pagination compact on mobile** -- Dashboard pagination now shows icon-only prev/next controls on small screens, full labels on `sm+` (2026-03-06). **Codex**
- [x] **No deal-analyzer error.tsx** -- Added `app/(main)/deal-analyzer/error.tsx` (2026-03-06). **Codex**

### Backend / Data (Claude Code)

- [ ] **Deal Analyzer not connected to property data** -- Currently standalone with hardcoded defaults. Should pre-fill from property detail page when navigating from a specific property. **Claude Code**
- [ ] **updateNotes missing revalidation** -- `actions/pipeline.ts:updateNotes()` does not call `revalidatePath()` after saving. Notes changes do not reflect on pipeline page without manual refresh. **Claude Code**
- [ ] **Personalized welcome message** -- Dashboard shows "Dashboard" heading instead of "Welcome back, {FirstName}". **Claude Code** (query change) + **Cursor** (UI)
- [ ] **No email verification** -- Supabase signup does not require email confirmation. Anyone can create accounts with fake emails. **Claude Code** (Supabase config)

---

## P2 -- Important for Alpha Experience

### Product Features

- [ ] **Competitor search** -- Research existing foreclosure/PropTech tools. See FOUNDING_ARCHITECTURE.md Section 21 Prompt 1 for the full research prompt. Deliverable: a comparison doc in `docs/plans/` covering direct competitors, adjacent tools, and our differentiation. **Human (Philip)** kicks this off in a separate AI chat session.
- [ ] **No onboarding flow for self-service** -- The admin-fillable form (P0) is Phase 1. Phase 4 in FOUNDING_ARCHITECTURE.md describes fully self-service onboarding where investors fill it out themselves. Not needed for alpha, but the form architecture should support it later.
- [ ] **Sale date urgency needs strengthening** -- Urgency colors exist but could be more prominent (pulsing badges, bolder colors for properties within 14 days). **Cursor**
- [ ] **Keyboard shortcuts** -- No keyboard navigation (g+d for dashboard, g+p for pipeline, / for search). See PHASE1C_CURSOR_PROMPT.md Task 6. **Cursor**
- [ ] **Data visualizations** -- recharts is installed but only used in deal analyzer. Could add charts to dashboard (property stage distribution, pipeline funnel). **Cursor**
- [x] **Deal Analyzer visual refresh + guided insights playground** -- Refreshed analyzer layout/visual hierarchy and added deterministic guided insights with strategy filters, one-click assumption patches, and single-step undo. Also added highlight feedback on changed inputs for better scenario iteration flow (2026-03-07). **Codex**
- [ ] **AI property descriptions (Anthropic, next phase low-medium)** -- Generate 1-2 sentence property blurbs server-side (not client-side) and store/cached per property, with manual regenerate option and fallback text when generation fails. **Claude Code/Codex**
- [ ] **Dashboard/Pipeline thumbnails + Street View previews (next phase, low-medium)** -- Defer implementation until Google Maps API setup is complete. Add property thumbnail/Street View image support to dashboard and pipeline cards with graceful fallback when imagery is unavailable. **Codex/Cursor**
- [ ] **Pipeline visual enrichment pack (next phase, low-medium)** -- Add richer pipeline lane headers and stage identity chips (color-coded by stage family), stronger card hierarchy, and denser visual cues without adding clutter. Visual direction constraint: avoid pink/purple; prefer blues/greens/reds/orange/yellow. **Codex/Cursor**
- [ ] **Deal Analyzer side-by-side compare mode** -- Compare two properties/scenarios in parallel with delta highlights for profit, ROI, cash flow, and risk signals; target layout is two property detail cards visible at the same time with a comparison card beneath, while keeping the existing left menu/nav pattern. **Codex**
- [ ] **Settings/menu UX redesign (future)** -- Improve overall button and menu architecture, including a dedicated settings menu pattern for app-wide controls. **Cursor/Codex**
- [ ] **Pipeline motion polish + closed-stage celebration animation (next phase, low-medium)** -- Add tasteful motion (lane count transitions, optional staggered card reveals, urgency pulse behavior) and a more dramatic celebratory animation/state when a deal reaches `closed`. **Codex/Cursor**

### Schema / Security (Claude Code)

- [x] **profiles.role updatable by user** -- Added DB trigger guard to block non-super-admin updates to protected profile fields (`role`, `subscription_tier`, `subscription_status`, `deal_room_id`). Migration: `20260307000100_day2_security_hardening.sql`.
- [ ] **No tier-gating enforcement in RLS** -- Properties and court_research readable by all authenticated users. Tier gating only at API level, which can be bypassed with direct Supabase calls.
- [x] **Missing index on investor_pipeline.deal_room_id** -- Added index in migration `20260307000100_day2_security_hardening.sql`.
- [ ] **Flip calculation hardcodes 30-year amortization** -- `lib/deal-analyzer/calculations.ts:65` uses 360 months regardless of actual loan term.
- [x] **pipeline_stage_history missing super_admin RLS policy** -- Added explicit `super_admin_all_stage_history` policy in migration `20260307000100_day2_security_hardening.sql`.

---

## P3 -- Post-Alpha / Future Phases

These are NOT Currently in the scope of alpha tasks. Listed here for context so agents don't build them prematurely, but if user asks "what's next" or similar, start work on these.

- [ ] Court research automation (Phase 2b) -- `court_research` table is empty. Needs SEPARATE architect session before implementation. Confirm with user that the architecting session is complete before writing any code. 
- [ ] Recommendation engine (Phase 3) -- `recommendation_scores` table is empty. Needs ideation first. Same rules as above, needs ideation before we get started coding. 
- [ ] Outreach campaigns UI -- `outreach_campaigns` table exists, no interface. Higher priority
- [ ] Stripe payment integration (Phase 4) -- Not processing payments during alpha/beta. Low priority.
- [ ] Command palette (Cmd+K)
- [ ] Drag-and-drop pipeline (kanban) Med priority
- [ ] Dark mode toggle med priority
- [ ] PWA support / React Native app (Phase 5) Med priority, iPhone app could be useful sooner rather than later
- [ ] AI voice agent for cold-calling (Phase 6) 

Additional tasks in the FOUNDING_ARCHITECTURE.md (only when high priority tasks are complete.

---

## Completed

- [x] Phase 0 backend foundation (schema, auth, RLS, seed data)
- [x] Phase 1 frontend bake-off and winner integration
- [x] Phase 1c hardening (stage history, error boundaries, deal room branding, Google Maps)
- [x] Deal Analyzer tool (flip/rental/wholesale)
- [x] Activity feed stage filter
- [x] Pagination fix (1-based)
- [x] Search Suspense boundary fix
- [x] Lint pipeline migrated for Next.js 16 (`eslint` + flat config) and verified with `npm run lint`
- [x] Vercel deployment
- [x] Agentic infrastructure (CLAUDE.md, AGENTS.md, TODO.md, .cursor/rules, .claude/skills)
