# HANDOFF

## Session Metadata

- Date: 2026-03-07 (second session)
- Branch: `claude/harden-midnight-terminal-Siq88`
- Last commit: `c587c07` (`docs: update CLAUDE.md and TODO.md with session progress`)
- Previous session last commit: `4ef0e92`
- This is the canonical handoff file in root. Do not create additional handoff files.

## Goal of This Session

1. Review Codex work, commit it in scoped batches.
2. Ship quick wins (notes revalidation, design token fix, welcome message).
3. Connect Deal Analyzer to property data.
4. Set up test suite foundation.
5. Push and verify Vercel deployment.

## What Was Completed

### 1) Codex Work Committed (8 scoped batches)

All previously uncommitted Codex work reviewed and committed:

- **Auth hardening** (`ab4f8f5`) -- Password confirmation (client + server), middleware allowlist for public routes, signup form extracted to client component, 44px touch targets
- **Onboarding form** (`0e28c5f`) -- Config-driven `/onboarding` route, draft/submit save modes, admin investor switcher, server action with auth checks
- **Loading skeletons** (`f05b217`) -- 5 routes: dashboard, pipeline, admin, property detail, deal-analyzer + deal-analyzer error boundary
- **Frontend polish** (`40b1a4f`) -- Admin table bg-rice-50 fix, group notes zen tokens, property notes cleanup, pipeline tweaks, CSS additions
- **Infrastructure** (`010329c`) -- ESLint flat config migration for Next.js 16, postcss config, dependency updates
- **Security migration** (`e9f1b58`) -- Profile escalation guard trigger, investor_pipeline.deal_room_id index, super_admin stage history RLS policy
- **Documentation** (`366b765`) -- CLAUDE.md, TODO.md, AGENTS.md, HANDOFF.md updates
- **Onboarding query** (`0421e00`) -- getInvestorPreferences added to lib/queries.ts

### 2) Quick Wins Shipped

Commit `8b9634b`:

- `updateNotes` now calls `revalidatePath()` for `/pipeline` and property detail -- notes reflect without refresh
- `error.tsx` hardcoded `text-[#0B1928]` replaced with `text-foreground` design token
- Dashboard heading shows "Welcome back, {FirstName}" with fallback

### 3) Deal Analyzer Connected to Property Data

Commit `b125540`:

- Page accepts `?propertyId=uuid` URL param
- Server component wrapper fetches property data, client component renders UI
- Foreclosure amount maps to purchase price, county appraisal maps to ARV
- Property detail page has "Analyze This Deal" button
- Manual entry still works as default when no propertyId

### 4) Test Suite Foundation

Commit `6806fd8`:

- vitest configured with path aliases matching tsconfig
- `npm run test` (54 tests, all passing) and `npm run test:watch`
- 24 unit tests for `lib/utils.ts` (formatCurrency, formatDate, saleDateUrgency, timeInStage, cn, etc.)
- 30 unit tests for `lib/deal-analyzer/calculations.ts` (flip, rental, wholesale with edge cases)

### 5) Deployment Status

- All commits pushed to remote (`c587c07`)
- Vercel preview deployment `dpl_9jTdh3DpJqUkTFjzo71U5Mi7H1UL` is **READY**
- Production is still on `4ef0e92` -- needs merge to main or promote to update production
- PR #11 exists for this branch

## Skipped Files (not committed, user confirmed)

- `.claude/` -- local agent config
- `PHASE1C_CLAUDE_CODE_PROMPT.md` / `PHASE1C_CURSOR_PROMPT.md` -- prompt files
- `archive/v0-dashboard/` -- archived bake-off entry
- `scaling article.rtfd/` -- unrelated file
- `docs/plans/2026-03-07-philip-todo-api-and-ai.md` -- operator plan doc

## Important Notes for Next Session

1. **Production deploy needed** -- Preview is ready but production hasn't been updated. Merge PR #11 to main or promote the preview deployment.
2. **Test suite is foundation only** -- Unit tests exist for utils and calculations. Still needed: integration tests for server actions, E2E for auth + pipeline.
3. **Onboarding RLS gap** -- Admin updates to investor_preferences bypass RLS via serviceClient. Not a security hole (service_role is trusted) but should add explicit admin RLS policy for clarity.
4. **Deal Analyzer compare mode** -- Still a backlog item, not implemented.
5. **Street View/thumbnails** -- Still blocked on Google Maps API setup.

## Remaining Claude Code Tasks (priority order)

1. Integration tests for server actions (P0 expansion)
2. Email verification setup (P1 -- Supabase config)
3. RLS tier-gating enforcement (P2)
4. Flip calculation loan term parameterization (P2)
5. AI property descriptions with Anthropic (P2)

## Remaining Tasks for Other Agents

### Cursor/Codex

- Sale date urgency visual strengthening
- Keyboard shortcuts (g+d, g+p, /, Escape)
- Data visualizations (dashboard charts)
- Pipeline visual enrichment pack (stage chips, card density)
- Pipeline motion polish + closed celebration animation
- Settings/menu UX redesign (future)

### Human (Philip)

- Google Maps API setup (unblocks Street View/thumbnails)
- Competitor research (FOUNDING_ARCHITECTURE.md Section 21)
- Review and merge PR #11 to production

### Human (Mike)

- Finalize onboarding questions

---

## Kimi Landing Page + Pricing Prompt

### Overview

Build the landing page at `/` and pricing section for Foreclosure Funder. This is P0 -- it blocks alpha launch. The landing page is the first thing potential investors see. It needs to feel premium, confident, and alive with motion.

### Design Direction

**Rich animations and lots of movement.** This is a marketing page, not an app page -- go big. Think Stripe, Linear, or Vercel-level polish. Every section should have intentional motion that draws the eye and builds trust.

**Core emotional message:** Property investors finding peace of mind because all their intelligence on foreclosure properties comes from one place. No more juggling court records, spreadsheets, county sites, and random tools. Foreclosure Funder is their single command center.

### Visual and Animation Requirements

- **Hero section:** Full-width with a cinematic entrance animation. Show a property investor (stock imagery or illustrated) looking confident and relaxed -- not stressed, not frantic. They have everything they need in one place. Use parallax scrolling, subtle particle effects, or a morphing data visualization that resolves into the product. Bold headline with staggered word-by-word reveal animation.

- **Property intelligence showcase:** Animate a mockup of the dashboard/pipeline coming together piece by piece -- cards sliding in, data populating, stage badges appearing. Show the product assembling itself in real time as the user scrolls. Use scroll-triggered animations (Framer Motion or GSAP).

- **Peace of mind section:** Large lifestyle imagery of property investors/owners looking relaxed, confident, successful. Not stock-photo-generic -- aim for authentic, warm, aspirational. Show families in front of properties, investors reviewing clean dashboards on tablets, professionals closing deals with confidence. Use a soft parallax float effect on images. Overlay subtle data visualization elements (charts, property pins) that fade in and out to reinforce the "intelligence" angle.

- **Feature highlights:** Animated cards that expand/flip/reveal on hover or scroll-into-view. Each feature should have a micro-animation (icon spin, number count-up, progress bar fill). Key features to highlight:
  - Real-time foreclosure tracking (live data, not stale lists)
  - CRM pipeline (track every deal from discovery to close)
  - Deal Analyzer (flip/rental/wholesale -- instant ROI calculations)
  - Court research and title intelligence (coming soon)
  - Team collaboration via Deal Room (for agents managing investors)

- **Social proof / trust section:** Animated testimonial carousel or staggered fade-in testimonial cards. Use placeholder testimonials for now (Mike will provide real ones). Include trust badges, security indicators, and a "Built in Kansas, for Kansas investors" local pride element.

- **Pricing section:** Four-tier comparison with animated tier cards that elevate/glow on hover. Staggered entrance animation as user scrolls to pricing. The recommended tier ("Standard" at $20/mo) should have a subtle persistent pulse or glow. Tiers:
  - **Free** ($0/mo) -- 2-3 listings per session, address + sale date only, save up to 3 properties, no pipeline, educational content
  - **Standard** ($20/mo) -- Full listings, court research, appraisal data, recommendation scores, full CRM pipeline, unlimited saves, property alerts, onboarding interview, mobile access
  - **Premium** ($40/mo) -- Everything in Standard + AI voice agent, priority notifications, comparable sales, maps/satellite, document prep, automation, priority support
  - **Deal Room** ($500/mo) -- Agent admin panel, branded deal room, full onboarding meeting, 2 custom feature requests, homeowner outreach automation, weekly investor digests

- **CTA sections:** Multiple call-to-action moments throughout the page, each with a satisfying button animation (ripple, scale, color shift). Primary CTA: "Start Free" linking to `/signup`. Secondary CTA: "See Pricing" smooth-scrolling to pricing section.

- **Footer:** Clean footer with company info, quick links, and a subtle ambient animation (floating property icons, gentle gradient shift).

### Motion Guidelines

- Use `framer-motion` (already installed in the project) for all animations
- Scroll-triggered animations should use intersection observer pattern
- Keep animations smooth (60fps) -- prefer transforms and opacity over layout-triggering properties
- Add `prefers-reduced-motion` media query respect for accessibility
- Stagger delays should feel natural (50-100ms between elements)
- No animation should block the user from reading content -- motion enhances, never distracts
- Page should feel alive even when not scrolling (subtle floating elements, gentle gradient pulses)

### Imagery Guidance

Use high-quality stock photography or illustrations showing:
- Diverse property investors looking confident and organized
- Beautiful residential properties (single family homes, not mansions -- Kansas market)
- Clean, modern office/home-office environments with technology
- Families benefiting from smart property investments
- Abstract data visualizations that feel premium (think Bloomberg terminal meets Apple design)

### Technical Constraints

- This is a Next.js App Router page at `app/page.tsx` (or could be a dedicated layout)
- The page must be accessible without authentication (already in middleware allowlist)
- Use Tailwind CSS only for styling (project convention)
- Use `cn()` from `lib/utils.ts` for conditional classnames
- No em dashes anywhere -- use "--" or rewrite
- Keep the existing app navigation separate -- landing page should have its own nav/header
- Mobile-first responsive design with 44px minimum touch targets
- Page should load fast -- lazy load heavy images and animations below the fold

### Color Direction

- Use the existing design system tokens where possible (accent red, zen backgrounds)
- For marketing flair, can extend beyond the app palette -- blues, greens, warm golds
- No pink/purple (product-owner preference)
- Dark sections are OK for contrast/drama (dark hero, light features, dark testimonials, light pricing)

### Content Copy (Philip will refine, but start with)

- **Headline:** "Your Foreclosure Intelligence Command Center" or "Every Kansas Foreclosure Deal. One Place. Total Clarity."
- **Subheadline:** "Stop juggling county records, spreadsheets, and gut feelings. Foreclosure Funder gives you real-time property intelligence, deal analysis, and pipeline management -- all in one platform built for Kansas investors."
- **Value props:** Real-time data, not stale lists. Smart deal analysis, not guesswork. Pipeline tracking from discovery to close. Built by investors, for investors.

### Deliverable

A complete, production-ready landing page with:
1. Animated hero section
2. Feature showcase with scroll-triggered animations
3. Peace of mind / lifestyle imagery section
4. Social proof / testimonials (placeholder content OK)
5. Pricing tier comparison with animations
6. Multiple CTAs throughout
7. Responsive from 320px to 1440px+
8. Mobile-first with touch-friendly interactions

---

## Proposed Next Build Order

1. **Kimi:** Landing page + pricing (P0, blocks alpha)
2. **Philip:** Merge PR #11, promote to production
3. **Claude Code:** Integration tests, email verification
4. **Cursor/Codex:** Pipeline visual enrichment, motion polish
5. **All:** Alpha launch prep and smoke testing
