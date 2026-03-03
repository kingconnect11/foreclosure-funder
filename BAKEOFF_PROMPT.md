# Design Competition — Foreclosure Funder

**Revised:** March 3, 2026
**Approved by:** Philip King, CTO

Paste this entire prompt into the competing agent. Each agent gets its own copy of the project folder.

---

## YOUR ASSIGNMENT

You are entering a design competition. Multiple AI agents are building competing frontends for the same product. The CTO will pick the winner based on visual impact, UX craft, and functional completeness. The functional requirements are locked — everyone builds the same features. **The design is entirely yours.**

### The product

**Foreclosure Funder** — a SaaS dashboard for real estate investors who buy foreclosure properties at county auction. Your users write $50K–$200K checks on distressed properties. Some are weathered contractors who've flipped 200 houses. Some are first-timers with ambition and a line of credit. The tool needs to feel like it was built by someone who understands serious money — not like a template, not like a hackathon project.

### What exists

The backend is fully built. The Next.js app has working auth, database queries, server actions, middleware, and route skeletons. The skeleton pages currently dump raw JSON. You are replacing that JSON with a complete, styled, interactive UI.

### Files to read (in order)

1. **`FUNCTIONAL_SPEC.md`** — What the app does. Every page, every data field, every interaction. This is the contract. Build all of it.
2. **`docs/handoff/phase1-backend-foundation.md`** — Technical reference. Every function signature, every TypeScript type, every file that already exists.

Do NOT read `OLD FRONTEND BRIEF.md`.

---

## TWO STRUCTURAL REQUIREMENTS

These are the only two layout constraints. Everything else — colors, typography, density, mood, animation, component style — is entirely your decision.

### 1. Left sidebar navigation

Use a persistent left sidebar — not a top nav bar. Think Mercury, Linear, Notion, Vercel. The sidebar contains:

- Product branding ("Foreclosure Funder" or a logomark you design)
- Navigation links: Dashboard, Pipeline, Admin (admin-only)
- User section at the bottom: user's name/email, sign out

Collapse gracefully on mobile (hamburger or slide-out drawer). Main content fills the remaining viewport.

### 2. Notifications / activity area

Somewhere in the layout (header bar, sidebar section, dedicated panel — your call on placement), include:

- A search capability for filtering properties by address or case number
- A notification or activity indicator (e.g., upcoming auctions this week, recent pipeline activity)
- A personalized welcome ("Welcome, [First Name]" or similar)

How you design and position these is up to you. They just need to exist and work.

---

## WHAT IS YOURS TO DECIDE

Everything not listed above. This means:

- Light mode, dark mode, or both — your call
- Color palette — literally anything
- Typography — any fonts, any pairing
- Spacing and density — dense data tables or airy cards or something else
- Component style — build from scratch or customize a library beyond recognition
- Animation and interaction — as much or as little as serves the product
- Layout within pages — how you arrange property cards, stats, filters, detail panels
- Visual personality — the thing that makes someone say "this looks like a real product"

### The bar

The CTO's feedback on Round 1 was: "I do not want a bunch of dark boring versions of this." The submissions looked too similar — same dark themes, same generic dashboard energy. **Be distinctive.** Take a risk. If you've seen it before in another AI-generated dashboard, try something else.

### Component libraries

You MAY use **shadcn/ui**, **Radix UI**, **Headless UI**, or build from scratch. If you use a library, customize it until it's unrecognizable as that library's default. The goal is a product that looks like it has its own identity.

**Banned:** Material UI, Chakra UI, Ant Design (full opinionated kits that override everything).

### Additional packages

Install whatever serves the design: framer-motion, GSAP, lucide, phosphor, recharts, d3, chart.js, Google Maps Embed API (address-based, no geocoding), clsx, date-fns (already installed).

---

## FUNCTIONAL COMPLETENESS

This is as important as design quality. Round 1 submissions had non-functional admin panels. That is unacceptable.

### Every page must work

- Dashboard: stats load, filters work, pagination works, "Save to Pipeline" works
- Property detail: all data fields display, notes auto-save, stage changes work, court research section renders (even if empty)
- Pipeline: kanban layout with real data organized by stage, cards link to property detail
- Admin panel: investor table loads with real data, activity feed shows real pipeline events, admin notes save — **this must actually function, not just render a placeholder**
- Auth: sign in, sign up, sign out all work correctly

### Every page must have states

- **Loading:** Skeleton screens matching the layout shape. Not spinners. Not blank screens.
- **Empty:** Designed empty states with helpful messages. Not blank areas.
- **Error:** Clear error messages with retry actions. Not console errors.

### Interactive elements

The CTO wants "more buttons, more things to click, and they need to work." Every interactive element you add should do something real — link to a page, trigger a server action, filter data, expand a panel. No decorative-only buttons.

### Google Maps (optional, encouraged)

Address-based embeds work without geocoding:
- Maps Embed API: `https://www.google.com/maps/embed/v1/place?key=YOUR_KEY&q=ADDRESS+CITY+STATE+ZIP`
- Street View Static API: `https://maps.googleapis.com/maps/api/streetview?size=400x200&location=ADDRESS+CITY+STATE+ZIP&key=YOUR_KEY`

The `properties` table has full addresses. No latitude/longitude needed.

---

## HOW YOU'LL BE JUDGED

### Functional (pass/fail)

All 15 items in `FUNCTIONAL_SPEC.md` Section 12 must work. Auth, data loading, filters, pipeline saves, notes, responsive layout, loading states, empty states, error states. If the app is broken, it loses regardless of how it looks. **If the admin panel doesn't function, you are automatically disqualified.**

### Design (the competition)

1. **First impression.** Does it feel like a real product or a template?
2. **Distinctiveness.** Would I recognize this in a lineup of 5 competing versions?
3. **Layout quality.** Does the sidebar + content area feel cohesive and intentional?
4. **Information density.** Can I scan a property card and get the key info in 2 seconds?
5. **State handling.** Are loading, empty, and error states designed — not afterthoughts?
6. **Interaction polish.** Hover states, transitions, active states — crafted or default?
7. **Emotional response.** Would an investor show this to a friend?
8. **Feature richness.** Are there interactive elements beyond the bare minimum that actually work?

### Bonus features (encouraged)

- Command palette (cmd+K)
- Data visualizations (pipeline distribution, stage trends, appraisal scatter)
- Micro-interactions and transitions
- Keyboard navigation
- Map thumbnails on property cards
- Creative kanban pipeline approach
- Anything that makes the product feel alive and useful

Do NOT add new backend features, database queries, or server actions. Work with what exists.

---

## GETTING STARTED

```bash
npm install
# Ensure .env.local has your Supabase credentials
npm run dev
```

Visit `http://localhost:3000`. Read `FUNCTIONAL_SPEC.md` first. Then `docs/handoff/phase1-backend-foundation.md`. Then start building.

Make it look like a product someone would pay for. Make it yours.
