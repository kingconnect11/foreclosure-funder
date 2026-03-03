# HANDOFF: March 3, 2026 — Planning Session

**Purpose:** Any new chat (Claude Code, Cursor, Cowork, or human developer) can read this document and understand where the project stands, what decisions have been made, and what to do next.

**This document references source files rather than duplicating their content.** Read the referenced files.

---

## HOW THIS PROJECT USES AI AGENTS

This project is built entirely by AI coding agents, coordinated by Philip (CTO) through planning chats like the one that produced this document.

**Cowork (this chat type):** Planning, architecture decisions, prompt writing, task assignment. Never writes code directly.

**Claude Code:** Complex/architectural coding tasks — schema changes, RLS policies, server actions, multi-file refactors. Expensive per-token; use for things that need to be right the first time.

**Cursor:** Small, verifiable frontend tasks. Philip has unlimited Cursor credits. Use for anything where the output is easy to visually check. **However:** if there's even a remote chance Cursor will mess something up, use Claude Code instead.

**Bakeoff agents:** Multiple AI agents (various tools) given the same prompt to build competing frontends. CTO picks the winner.

**Lesson learned from this session:** Don't assign the same task to both Claude Code and Cursor. Claude Code completed Tasks 1-2 from `CLAUDE_CODE_PROMPT.md` before the Cursor prompt was even used, making `CURSOR_PROMPT.md` redundant. Assign each task to one agent only.

**Speed calibration:** Philip reviews PRs in ~15 minutes. Bakeoff results come in ~90 minutes. A full bakeoff round including review takes half a day, not a week. Plan in hours and days, not weeks.

---

## SOURCE OF TRUTH HIERARCHY

1. **`FOUNDING_ARCHITECTURE.md`** — Product vision, personas, database schema, full roadmap. ~1000 lines. Read the whole thing. (Updated March 3, 2026 — Sections 7, 8, 10, 12, 13, 17, 18, 19, 22 all reflect decisions from this planning session.)
2. **`FUNCTIONAL_SPEC.md`** — What the current frontend build must do. Every page, data field, interaction.
3. **`BAKEOFF_PROMPT.md`** — Design competition prompt for competing AI agents building the frontend.
4. **`docs/handoff/2026-03-01_phase0-completion-handoff.md`** — Phase 0 backend completion details, UUIDs, scraper status.
5. **`docs/handoff/phase1-backend-foundation.md`** — Technical reference: function signatures, TypeScript types, file inventory.
6. **This document** — Decisions, plans, and context from the March 3 planning session. Most decisions are now reflected in the files above; this document adds coordination context (AI agent workflow, role mapping, build phases) not captured elsewhere.
7. **`docs/DECISIONS_AND_FEEDBACK_GUIDE.md`** — What Philip and Mike need to decide, discuss, and what feedback to gather from each investor profile during alpha.

---

## CURRENT STATE (March 3, 2026)

### What's built and working
- Supabase backend: 9 tables, 35 RLS policies, role hierarchy (super_admin / admin / investor)
- Auth: email/password with Supabase SSR, middleware protecting routes
- Data: 81 properties seeded (Sedgwick County, KS), 8 user profiles, 1 market, 1 deal room
- Queries: 14 functions in `lib/queries.ts` — all working
- Server actions: auth, pipeline CRUD, admin notes — all working
- Scraper: 511-line Python script (PDF extraction via Claude API + appraiser lookup via BeautifulSoup) — writes to Google Sheets only, Supabase integration pending
- `pipeline_stage_history` table: added this session for per-stage notes tracking

### What's been fixed this session
- **Pagination bug:** Dashboard was sending page 0 to a 1-based query function. Fixed in `app/(main)/dashboard/page.tsx`.
- **Search Suspense bug:** `FilterBar` uses `useSearchParams()` which requires a `<Suspense>` boundary in Next.js 14+. Fixed with `FilterBarSkeleton` wrapper.

### What's in progress
- **Bakeoff Round 2:** Round 1 (PR #5 on GitHub: `github.com/kingconnect11/foreclosure-funder/pull/5`) produced dark, generic, similar-looking dashboards with non-functional admin panels. CTO verdict: "not impressed." Root causes: too much prescriptive design direction in prompts (dark mode default, color suggestions, typography guidance) produced homogeneous output; insufficient sample data (most fields blank) meant agents couldn't build convincing UIs. Prompts have been fully rewritten (see `BAKEOFF_PROMPT.md` and `FUNCTIONAL_SPEC.md`). Round 2 requires 10 perfect sample properties before running.

---

## KEY DECISIONS MADE THIS SESSION

### Design direction
- **All prescriptive design direction stripped** from bakeoff prompt and functional spec. Competing agents get full creative freedom.
- **Two structural requirements kept:** left sidebar navigation + notifications/activity area.
- **shadcn/ui allowed** (was previously banned), but must be customized beyond recognition.
- **Light or dark mode is the agent's choice** (was previously "dark mode default").

### Technical decisions
- **Address-based Google Maps** — use Maps Embed API and Street View Static API with raw addresses. No geocoding, no latitude/longitude columns.
- **`pipeline_stage_history`** table added for tracking notes and timestamps per stage transition.
- **Component libraries OK** with heavy customization. Only full opinionated kits (MUI, Chakra, Ant) remain banned.

### Product decisions
- **Alpha launch: end of this week** — for Mike King + 1-2 of his investors. Mike-centered, Wichita-centered, Kansas-centered.
- **Onboarding: build as self-service form NOW** — Philip fills it out during Zoom calls with investors. Maps to `investor_preferences` table. Not a future feature; it's needed for alpha.
- **10 perfect sample properties** — all fields populated, court research included, Kansas/Midwest-specific concerns addressed. No blank fields. To be created in a dedicated Claude Code session before Bakeoff Round 2.
- **Note-to-tag system (planned):** Investor notes on properties → extracted tags → visible in admin backend → feed recommendation engine training data.
- **Recommendation engine needs multi-session ideation** — not just a coding task. Will need far more than the 7 weighted factors in the founding architecture doc. Tag integration required.
- **Referral code system (Phase 4):** Easy one-time referral codes for investors to share.
- **Onboarding dream property field:** The free-text "dream property" input should have rotating placeholder suggestions (e.g., "A 3-bed ranch in College Hill under $120K", "Something I can rent for $1,200/month near WSU"). These are placeholder text examples, not pre-populated values.
- **Bakeoff prompt lives in multiple locations:** Philip has copies of `BAKEOFF_PROMPT.md` in three folders. When updating, replace in all three. (Ask Philip which folders if unclear.)
- **Scaling article influenced onboarding design:** The @maubaron article (`scaling article.rtfd/TXT.rtf` in the project folder) argues that longer onboarding converts better, mirroring user answers back creates an "aha moment," and commitment principles increase retention. This shaped the decision to build a real onboarding form now rather than deferring to Phase 4.

---

## PHASED BUILD PLAN

### Phase 1a — Bakeoff Prep (before Round 2)
**Owner:** Dedicated Claude Code session
- Create 10 fully populated sample properties with realistic Kansas foreclosure data
- Include court research records (liens, judgments, title status) for all 10
- Address Kansas-specific investor concerns (ag liens, mineral rights, manufactured home filtering)
- Populate all fields — no blanks

### Phase 1b — Frontend Bakeoff Round 2
**Owner:** Multiple competing AI agents
- Run bakeoff with revised prompts (`BAKEOFF_PROMPT.md` + `FUNCTIONAL_SPEC.md`)
- CTO picks winner, then winner gets polished by Claude Code

### Phase 1c — Onboarding Form
**Owner:** Claude Code
- Multi-step questionnaire mapping to `investor_preferences` table
- All fields from Section 10 of `FOUNDING_ARCHITECTURE.md` (budget range, financing method, location preferences, property types, risk tolerance, dream property description, deal breakers, desired features, timeline)
- Save draft / progress capability
- Philip uses this during manual Zoom onboarding calls

### Phase 2a — Pipeline Enhancements
**Owner:** Claude Code
- `pipeline_stage_history` UI (per-stage notes visible on property detail)
- Note-to-tag system: extract tags from investor notes, display on property cards in admin view
- Stage progression with notes prompt

### Phase 2b — Court Research & Scraper Integration
**Owner:** Architect session → Claude Code (1-2 weeks minimum)
- Scraper writes to Supabase (currently Google Sheets only)
- Court research automation for Kansas courts
- Title health assessment (clean/clouded/complex)
- Lien and judgment parsing
- Property detail page integration
- Multiple sub-phases required

### Phase 3 — Recommendation Engine
**Owner:** Full ideation sessions → Claude Code
- Expand beyond 7 weighted factors
- Integrate tag system from Phase 2a
- Investor preference matching with explanation generation
- Requires brainstorming, investor feedback, iterative design — not a single coding session

### Phase 4 — Growth Features
- Referral code system
- Stripe subscription integration
- Deal Room setup flow
- Marketing site

---

## VIEWS AND PANELS FROM FOUNDING ARCHITECTURE NOT YET BUILT

The following are described in `FOUNDING_ARCHITECTURE.md` but not in the current Phase 1 scope. They will need their own pages/panels/tabs in future phases:

**Investor-facing:**
- Recommendation scores view (sorted/filterable property feed with scores + explanations)
- Saved searches & alerts management
- Investment history tracker
- Investor preference editor (post-onboarding)
- Subscription management / billing

**Admin-facing (Deal Room):**
- Deal Room setup/branding page (logo, colors, contact info)
- Investor onboarding management
- Group visibility / consent settings
- Homeowner outreach campaign tracker (letter sequences)
- Weekly digest configuration
- RPR manual data entry interface
- Property tag management (from note-to-tag system)

**System-level (Super Admin / future):**
- Multi-market management
- Scraper monitoring / scheduling
- User management across deal rooms

---

## ROLE MAPPING FOR AI AGENT ASSIGNMENT

When assigning future work to AI agents, these are the traditional role equivalents:

| Area | Traditional Role | AI Agent |
|------|-----------------|----------|
| Frontend build, bakeoff | Frontend Engineer | Bakeoff agents / Cursor |
| Backend architecture, schema, RLS | Backend Engineer | Claude Code |
| Scraper, data pipeline, court research | Data Engineer | Claude Code (architect session) |
| Recommendation engine design | ML Engineer / Data Scientist | Cowork ideation → Claude Code |
| Onboarding flow, user research | Product Designer | Cowork planning → Claude Code |
| Product strategy, roadmap | Product Manager | Cowork (this chat) |
| Investor preferences, market fit | User Researcher | Cowork research sessions |
| Security audit, RLS review | Security Engineer | Claude Code (dedicated session) |
| Competitive analysis, positioning | Marketing Strategist | Cowork research sessions |

---

## FILES MODIFIED THIS SESSION

| File | Change |
|------|--------|
| `BAKEOFF_PROMPT.md` | Fully rewritten — stripped all design direction except left sidebar + notifications |
| `FUNCTIONAL_SPEC.md` | Updated — added Section 10a (UI states), removed design language, added acceptance criteria 13-15, allowed shadcn/ui |
| `app/(main)/dashboard/page.tsx` | Pagination fix (page 0→1), Suspense boundary for FilterBar |
| `lib/types.ts` | Added `PipelineStageHistory` type |
| `CLAUDE_CODE_PROMPT.md` | Created — 4 tasks for Claude Code. Tasks 1-2 (pagination fix, Suspense boundary) confirmed completed. Tasks 3-4 (sample properties, pipeline_stage_history table) status: Task 4 type was added to `lib/types.ts` (confirmed), full table creation and Task 3 need verification or re-assignment. |
| `CURSOR_PROMPT.md` | Created but redundant — Claude Code already handled both tasks. Can be deleted. |

---

## WHAT TO READ NEXT

If you're picking up this project:
1. `FOUNDING_ARCHITECTURE.md` — full context (read it all, ~1000 lines)
2. `FUNCTIONAL_SPEC.md` — what to build
3. `docs/handoff/phase1-backend-foundation.md` — technical reference for existing code
4. This document — what's changed and what's planned
