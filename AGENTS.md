# AGENTS.md -- Foreclosure Funder

Shared conventions for all AI agents working on this project (Claude Code, Cursor, Copilot, etc.). This file follows the Linux Foundation AGENTS.md standard.

---

## Project Context

**Product:** Foreclosure Funder -- SaaS for real estate investors buying foreclosure properties in Kansas.
**Stack:** Next.js 16 (App Router), TypeScript (strict), Tailwind CSS 3, Supabase (PostgreSQL + Auth + RLS), Vercel.
**Two products:** Investor Dashboard (property listings, CRM pipeline, deal analyzer) + Deal Room (agent admin panel).
**Source of truth:** `FOUNDING_ARCHITECTURE.md` for product decisions, `FUNCTIONAL_SPEC.md` for page behavior.
**Current phase:** Phase 1 Alpha Launch (see FOUNDING_ARCHITECTURE.md Section 19). Target: working product for Mike + 1-2 investors in 4 weeks.
**Current status:** Phase 1 frontend built, Phase 1c hardening done, moving to alpha. Frontend design is current working state.

### Agent Team

| Agent | Handles | Does NOT handle |
|-------|---------|-----------------|
| Claude Code | Backend, architecture, server actions, data layer, Supabase, infrastructure | Frontend pixel-polish, marketing copy |
| Cursor | Frontend polish, loading states, responsive design, CSS fixes, component UI | Backend logic, schema changes, server actions |
| Kimi | Landing page, marketing copy, pricing page | App features, backend, database |
| Human (Philip) | CTO decisions, Supabase admin, product direction, competitor research | - |
| Human (Mike) | Onboarding questions, investor feedback, sales content | - |

Check `TODO.md` for which agent is assigned to each task.

---

## Task Conventions

### Before Starting Any Task

1. Read `CLAUDE.md` (if using Claude Code) or this file
2. Check `TODO.md` for current priorities
3. Check `HANDOFF.md` if it exists (written by previous agent session)
4. Read the files you intend to modify before making changes
5. Understand existing patterns in the codebase before adding new ones

### Task Breakdown

- Break work into phases that each produce a working, buildable state
- Never leave the build broken between steps
- Commit after each logical unit of work (if authorized)
- Run `npm run build` to verify zero TypeScript errors before declaring done

### After Completing Any Task

- Update `CLAUDE.md` "Recent Changes" section (if using Claude Code)
- Update `TODO.md` to mark completed items or add newly discovered issues
- If handing off to another tool, write `HANDOFF.md` in project root

---

## Code Style Rules

### TypeScript

- Strict mode enabled (`tsconfig.json`)
- No `any` unless wrapping a generated type (e.g., Supabase enum casts)
- Use type imports: `import type { Property } from '@/lib/types'`
- Prefer interfaces for component props, types for unions/aliases
- Path alias: `@/*` maps to project root

### React / Next.js

- **Server Components by default.** Only add `'use client'` when you need hooks, event handlers, or browser APIs
- **No `useEffect` + `fetch` for data.** All data fetching in Server Components via `lib/queries.ts`
- **State management:** React Server Components + URL search params. No Redux, Zustand, or global stores. `useState` only for local UI state (modals, dropdowns, form inputs)
- **Server Actions** for mutations (files in `actions/` with `'use server'` directive)
- After mutations, call `revalidatePath()` for affected routes
- Use `Promise.all` for parallel data fetching in server components
- Default exports for page components; named exports for everything else
- Error boundaries via `error.tsx` files per route (client components with reset)

### Styling

- **Tailwind CSS only.** No CSS-in-JS, styled-components, or CSS modules
- Use `cn()` from `lib/utils.ts` for conditional class composition (clsx + tailwind-merge)
- Custom component classes defined only in `globals.css` (e.g., .zen-card, .btn-primary)
- Explicit pixel values in brackets for precise sizing: `text-[14px]`, `text-[12px]`
- Uppercase labels: `text-[12px] font-medium uppercase tracking-[0.05em]`
- Financial data uses `font-mono` / `font-data`
- Headings use `font-display`

### Naming

- Files: kebab-case (`property-card.tsx`, `stage-badge.tsx`)
- Components: PascalCase (`PropertyCard`, `StageBadge`)
- Functions/variables: camelCase (`formatCurrency`, `saleDateUrgency`)
- Server actions: camelCase verbs (`saveToPipeline`, `changeStage`)
- Database columns: snake_case (matches Supabase/Postgres convention)
- CSS classes: kebab-case for custom classes (`.zen-card`, `.btn-primary`)

### Patterns

- Optimistic updates for pipeline saves (set local state before server action completes)
- Auto-save with 2-second debounce for notes (both onChange timer and onBlur)
- URL search params for dashboard filters (bookmarkable, shareable)
- PAGE_SIZE = 30 for property pagination
- `formatCurrency()`, `formatDate()`, `saleDateUrgency()`, `timeInStage()` from `lib/utils.ts`

---

## File Organization

### Where things go

| What | Where |
|------|-------|
| Pages / routes | `app/(main)/` or `app/(auth)/` |
| Shared UI components | `components/` |
| Feature-specific components | `components/<feature>/` (e.g., `components/deal-analyzer/`) |
| Data fetching functions | `lib/queries.ts` |
| Server actions (mutations) | `actions/<domain>.ts` |
| TypeScript types | `lib/types.ts` (generated) + inline interfaces for props |
| Utility functions | `lib/utils.ts` |
| Supabase client setup | `lib/supabase/` |
| SQL migrations | `supabase/migrations/` |
| Python scripts | `scraper/` or `scripts/` (DO NOT MODIFY without CTO approval) |
| Documentation | `docs/plans/` for designs, `docs/handoff/` for handoffs |

### Files you must not modify

- `FOUNDING_ARCHITECTURE.md` -- product source of truth
- `FUNCTIONAL_SPEC.md` -- locked functional contract
- `BAKEOFF_PROMPT.md` -- design competition brief
- `scraper/` -- production scraper (separate concern)
- `scripts/` -- one-time seed scripts
- `lib/types.ts` -- generated file (regenerate with Supabase CLI, don't edit manually)

---

## Testing Requirements

**Current state: no test suite exists.** This is a known gap (see TODO.md).

When tests are added, follow these guidelines:
- Unit tests for `lib/` functions (calculations, utils, queries)
- Integration tests for server actions
- Component tests for client components with user interaction
- E2E tests for critical flows: auth, save to pipeline, stage change, admin panel
- `npm run build` must always pass with zero TypeScript errors (this is the current "test")

---

## Security Considerations

### Authentication
- All routes except `/login` and `/signup` require authentication (enforced by middleware)
- Auth cookies managed by `@supabase/ssr` -- never manually handle tokens
- Three roles: super_admin, admin, investor -- checked via `user.role` from profiles table
- Admin routes check role server-side and redirect investors to `/dashboard`

### Row-Level Security (RLS)
- 35 RLS policies enforce data isolation at the database level
- Investors can only read/write their own pipeline entries
- Admins can read/write within their deal room's scope
- Super admin (Philip) has unrestricted access
- Never bypass RLS unless creating a SECURITY DEFINER function (like `get_watching_count`)

### Environment Variables
- `SUPABASE_SERVICE_ROLE_KEY` is server-only -- never import in client components
- `NEXT_PUBLIC_*` variables are safe for the browser
- `.env.local` is gitignored -- credentials never committed

### Input Handling
- Server actions validate auth before any mutation
- Supabase parameterized queries prevent SQL injection
- Form data cast with `as string` in auth actions -- acceptable for Supabase's own validation
- Search filters passed to `.ilike()` -- Supabase handles escaping

---

## Component Inventory (19 components)

| Component | Type | Purpose |
|-----------|------|---------|
| nav.tsx | client | Sidebar nav (desktop) + hamburger menu (mobile) |
| property-card.tsx | client | Dashboard property listing card with save button |
| pipeline-card.tsx | server | Pipeline kanban card |
| stage-badge.tsx | server | Property stage badge (color-coded) |
| stage-progress.tsx | client | Pipeline stage indicator with clickable stages + modal |
| stat-card.tsx | server | Dashboard stat card |
| filter-bar.tsx | client | Dashboard filter bar with search, stage, city, sort |
| property-notes.tsx | client | Auto-saving notes textarea |
| admin-group-notes.tsx | client | Admin group notes textarea |
| admin-investor-table.tsx | client | Admin investor table with expandable rows |
| activity-feed.tsx | client | Admin activity feed with stage filter |
| deal-analyzer/*.tsx | client | 7 components for the deal analyzer tool |

---

## Key Queries (lib/queries.ts)

| Function | Returns |
|----------|---------|
| getCurrentUser() | Profile or null |
| getProperties(filters) | { properties, total } |
| getDistinctCities() | string[] |
| getDashboardStats(userId) | { totalActive, auctionScheduled, newThisWeek, inPipeline } |
| getProperty(id) | Property or null |
| getCourtResearch(propertyId) | CourtResearch or null |
| getPipelineEntry(userId, propertyId) | InvestorPipeline or null |
| getWatchingCount(propertyId) | number |
| getDealRoom(dealRoomId) | DealRoom or null |
| getUserPipeline(userId) | PipelineEntryWithProperty[] |
| getDealRoomInvestors(dealRoomId) | Profile[] |
| getDealRoomActivity(dealRoomId) | DealRoomActivityEntry[] |
| getInvestorPipelineSummary(investorId) | Record<string, number> |
| getStageHistory(pipelineId) | PipelineStageHistory[] |

---

## Server Actions (actions/)

| Action | File | What it does |
|--------|------|-------------|
| signIn(formData) | auth.ts | Email/password login, redirect |
| signUp(formData) | auth.ts | Registration with full_name in metadata |
| signOut() | auth.ts | Sign out, redirect to /login |
| saveToPipeline(propertyId) | pipeline.ts | Create pipeline entry (stage: watching) |
| changeStage(pipelineId, newStage, notes?) | pipeline.ts | Update stage + log history |
| updateNotes(pipelineId, notes) | pipeline.ts | Save investor notes |
| removeFromPipeline(pipelineId) | pipeline.ts | Delete pipeline entry |
| updateGroupNotes(pipelineId, groupNotes) | admin.ts | Admin-only group notes |
