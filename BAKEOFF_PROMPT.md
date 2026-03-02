# Bake-Off Prompt — Copy This Into Each Agent

**Instructions:** Paste this entire prompt into each competing agent (Claude, Gemini, Cursor, etc.). Each agent gets its own copy of the project folder. Do NOT modify the prompt between agents — the whole point is identical instructions, different creative execution.

---

## THE PROMPT

You are building the frontend for **Foreclosure Funder**, a SaaS dashboard for real estate investors who purchase foreclosure properties. This is a design competition — multiple AI agents are building competing versions. The winner will be selected by the CTO based on visual impact, UX quality, and overall craft.

### What already exists

The backend is complete. The project is a Next.js 14+ app with TypeScript, Tailwind CSS, and Supabase. All database queries, server actions, auth middleware, and route skeletons are wired up. The skeleton pages currently output raw JSON. **Your job is to replace the JSON dumps with a production-quality, visually stunning UI.**

### Files you MUST read before writing any code

Read these files in this exact order. Do not skip any.

1. **`FRONTEND_BRIEF_2026-03-02.md`** — The definitive design competition spec. Section 3 gives you full creative control over the visual design. Sections 5-8 define the functional requirements for each page. Section 13 has the acceptance criteria you'll be judged against. **This is the primary document. If anything conflicts between docs, this one wins.**

2. **`docs/handoff/phase1-backend-foundation.md`** — Technical handoff explaining every file that exists, every query function signature, every server action, and the TypeScript types. This tells you what code is already written and how to use it.

3. **`FOUNDING_ARCHITECTURE.md`** — Full product context if you need to understand why things are designed a certain way. Sections 1-4 (company overview, product vision, personas, two-product architecture) are the most relevant. You don't need to read the whole thing, but it's there.

### What you are building

Replace the JSON skeleton pages with fully designed, functional UI:

- **`/login` and `/signup`** — Auth pages (forms already work, just add your design)
- **`/dashboard`** — Stats bar, filter bar, property card grid, pagination
- **`/property/[id]`** — Property detail with two-column layout, pipeline controls, notes
- **`/pipeline`** — Kanban board of saved properties organized by stage
- **`/admin`** — Investor table + activity feed (admin-only)
- **Navigation** — Your choice of pattern (top nav, side nav, etc.)
- **All shared components** — Cards, badges, buttons, stage indicators, filter controls

### Creative direction

You have **full creative control** over the visual design. Read Section 3 of `FRONTEND_BRIEF_2026-03-02.md` carefully. Key points:

- **Choose your own colors, typography, layout, animation, and component styling.** The only fixed visual requirements: dark-mode default, financial data in a monospace/tabular font, responsive to 375px, no full UI kits (Material UI, Chakra, Ant Design).
- **The audience** is real estate investors who write five- and six-figure checks. The interface needs to feel credible, serious, and professional — but NOT boring. Think craft, not decoration.
- **You can install additional packages** — animation libraries (framer-motion, GSAP), icon sets, charting libraries, component primitives (radix-ui, headless-ui), mapping libraries — whatever serves the design.
- **Font/color/size references in Sections 5-8** are examples from a previous iteration. Replace them with your design system. The DATA FIELDS are requirements. The STYLING is yours.
- **Bonus features welcome** — command palette, data visualizations, micro-interactions, map views — if they make the product more compelling without adding backend features.

### How you'll be judged

**Functional (pass/fail):** All 12 items in Section 13 of the brief must work. Auth, data loading, filters, pipeline saves, notes, responsive layout, no errors.

**Design (the competition):** These are judged by the CTO:
- Does the overall aesthetic feel professional, distinctive, and visually compelling?
- Is the typography system intentional and well-executed?
- Does the data hierarchy work — can you scan a property card and get the key info in 2 seconds?
- Are the interactions polished — hover states, transitions, loading states?
- Does it feel like a product someone would pay for, or a template someone downloaded?
- Would an investor show this to a friend and say "look at this tool I'm using"?
- Does it have at least one moment of genuine visual delight?

### Technical constraints

- **Framework:** Next.js 14+ with App Router, TypeScript, Tailwind CSS — non-negotiable
- **Auth:** `@supabase/ssr` — already wired up in middleware
- **Data:** Server Components fetch data, Server Actions handle mutations — patterns are established in the skeleton
- **State:** No Redux/Zustand. Server Components + URL params + local `useState` only
- **Required packages:** `next`, `@supabase/supabase-js`, `@supabase/ssr`, `tailwindcss`, `date-fns`, `clsx`

### Getting started

```bash
npm install
# Copy .env.local.example to .env.local and fill in your Supabase credentials
npm run dev
```

Visit `http://localhost:3000`. You'll be redirected to `/login`. Sign up or use existing test credentials if provided. The dashboard will show raw JSON — that's what you're replacing.

### One last thing

Don't play it safe. This is a competition. Make something I'd be proud to demo to investors. Make it visually stunning. Show me what you can do.
