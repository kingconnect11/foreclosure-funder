# Phase 1 Split: Backend Foundation + Frontend Bake-Off

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Split Phase 1 into two clean streams — a backend foundation built by the context team, and a frontend bake-off where competing AI agents each build the visual UI on top of that foundation.

**Architecture:** The backend team delivers a fully-wired Next.js 14 project with Supabase auth, generated types, server actions, data-fetching functions, route skeleton, and one new DB migration (watching count RPC). Frontend competitors fork this repo and implement all visual components, layouts, and design system styling. The backend is the contract; the frontend is the competition.

**Tech Stack:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, @supabase/ssr, @supabase/supabase-js v2, Vercel

---

## Stream A: Backend Foundation (Context Team)

This is everything that requires Supabase context, auth knowledge, and DB schema understanding. No visual UI — just wiring.

---

### Task 1: Scaffold Next.js Project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `postcss.config.js`
- Create: `app/layout.tsx` (root — fonts, metadata, Tailwind import only)
- Create: `app/globals.css` (Tailwind directives only)
- Create: `.env.local.example`

**What to do:**
```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir=false --import-alias="@/*"
```

Install the exact whitelist from the brief:
```bash
npm install @supabase/supabase-js @supabase/ssr lucide-react date-fns clsx
```

Configure `.env.local.example`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Populate `.env.local` with real values from the existing `.env` / Supabase dashboard.

**Commit:** `feat: scaffold Next.js 14 project with dependencies`

---

### Task 2: Generate TypeScript Types from Supabase Schema

**Files:**
- Create: `lib/types.ts`

**What to do:**
Use the Supabase MCP tool `generate_typescript_types` for project `fgcwbrolnxpfihqkvmcn`, or run:
```bash
npx supabase gen types typescript --project-id fgcwbrolnxpfihqkvmcn > lib/types.ts
```

This generates types for all 9 tables, all enums, and all relationships. Frontend teams import from here — they never define their own types.

Export convenience type aliases at the bottom of the file:
```typescript
export type Property = Database['public']['Tables']['properties']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type InvestorPipeline = Database['public']['Tables']['investor_pipeline']['Row']
export type CourtResearch = Database['public']['Tables']['court_research']['Row']
export type DealRoom = Database['public']['Tables']['deal_rooms']['Row']
export type Market = Database['public']['Tables']['markets']['Row']
export type PipelineStage = Database['public']['Enums']['pipeline_stage']
export type PropertyStage = Database['public']['Enums']['property_stage']
export type UserRole = Database['public']['Enums']['user_role']
export type TitleStatus = Database['public']['Enums']['title_status']
```

**Commit:** `feat: generate TypeScript types from Supabase schema`

---

### Task 3: Supabase Client Helpers

**Files:**
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/middleware.ts`

**What to do:**

`lib/supabase/server.ts` — Server-side Supabase client using `@supabase/ssr`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/lib/types'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch { /* Server Component — read-only */ }
        },
      },
    }
  )
}

// Service role client for admin operations (server-only, bypasses RLS)
export async function createServiceClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

`lib/supabase/client.ts` — Browser-side client:
```typescript
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/lib/types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

`lib/supabase/middleware.ts` — Middleware auth helper (refreshes session):
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect unauthenticated users to /login (except auth pages)
  if (!user && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/signup')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages
  if (user && (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
```

**Commit:** `feat: add Supabase client helpers (server, browser, middleware)`

---

### Task 4: Auth Middleware

**Files:**
- Create: `middleware.ts` (project root)

```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

**Commit:** `feat: add Next.js auth middleware`

---

### Task 5: Utility Functions

**Files:**
- Create: `lib/utils.ts`

```typescript
import { format, formatDistanceToNow, differenceInDays } from 'date-fns'

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  return format(new Date(date), 'EEE, MMM d, yyyy')
}

export function formatNumber(n: number | null | undefined): string {
  if (n == null) return '—'
  return new Intl.NumberFormat('en-US').format(n)
}

export function saleDateUrgency(saleDate: string | null | undefined): 'danger' | 'warning' | 'normal' {
  if (!saleDate) return 'normal'
  const days = differenceInDays(new Date(saleDate), new Date())
  if (days <= 14) return 'danger'
  if (days <= 30) return 'warning'
  return 'normal'
}

export function timeInStage(stageChangedAt: string | null | undefined): string {
  if (!stageChangedAt) return '—'
  return formatDistanceToNow(new Date(stageChangedAt), { addSuffix: false })
}

export function formatPropertyDetails(beds: number | null, baths: number | null, sqft: number | null): string {
  const parts: string[] = []
  if (beds != null) parts.push(`${beds} BD`)
  if (baths != null) parts.push(`${baths} BA`)
  if (sqft != null) parts.push(`${formatNumber(sqft)} sqft`)
  return parts.join(' · ')
}
```

**Commit:** `feat: add utility functions (currency, dates, formatting)`

---

### Task 6: DB Migration — Watching Count RPC

**Files:**
- Create: `supabase/migrations/YYYYMMDDHHMMSS_watching_count_rpc.sql`

**Why this is needed:** The RLS policies restrict `investor_pipeline` reads to own rows for investors. The frontend brief requires showing "X investors are watching this property" — a count across ALL investors. This needs a `SECURITY DEFINER` function that returns only the count (no data leak).

```sql
-- RPC: get anonymous watching count for a property
-- Returns just the count, no investor details. Safe for any authenticated user.
CREATE OR REPLACE FUNCTION get_watching_count(p_property_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(COUNT(DISTINCT investor_id)::INTEGER, 0)
  FROM investor_pipeline
  WHERE property_id = p_property_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_watching_count(UUID) TO authenticated;
```

Apply with:
```bash
~/bin/supabase migration new watching_count_rpc
# paste SQL into the file
~/bin/supabase db push
```

Or use the Supabase MCP `apply_migration` tool.

**Commit:** `feat: add watching count RPC (bypasses RLS for anonymous count)`

---

### Task 7: Data Fetching Functions

**Files:**
- Create: `lib/queries.ts`

These are the server-side data fetching functions that pages will call. Encapsulates all Supabase queries so frontend teams don't need to understand the schema directly.

```typescript
import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { Property, Profile, InvestorPipeline, CourtResearch, DealRoom } from '@/lib/types'

// ── Dashboard ──

export async function getProperties(filters: {
  stage?: string
  city?: string
  sort?: string
  search?: string
  page?: number
}) {
  const supabase = await createClient()
  const page = filters.page ?? 0
  const limit = 30
  const offset = page * limit

  let query = supabase
    .from('properties')
    .select('*', { count: 'exact' })
    .not('stage', 'in', '("sold","redeemed","canceled")')

  if (filters.stage && filters.stage !== 'all') {
    query = query.eq('stage', filters.stage)
  }
  if (filters.city) {
    query = query.eq('city', filters.city)
  }
  if (filters.search) {
    query = query.or(`address.ilike.%${filters.search}%,case_number.ilike.%${filters.search}%`)
  }

  // Sort
  switch (filters.sort) {
    case 'sale_date':
      query = query.order('sale_date', { ascending: true, nullsFirst: false })
      break
    case 'value_high':
      query = query.order('county_appraisal', { ascending: false, nullsFirst: false })
      break
    case 'value_low':
      query = query.order('county_appraisal', { ascending: true, nullsFirst: false })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  query = query.range(offset, offset + limit - 1)

  const { data, count, error } = await query
  if (error) throw error
  return { properties: data as Property[], total: count ?? 0 }
}

export async function getDistinctCities(): Promise<string[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('properties')
    .select('city')
    .not('stage', 'in', '("sold","redeemed","canceled")')
    .not('city', 'is', null)
  if (error) throw error
  const cities = [...new Set(data.map(r => r.city).filter(Boolean))] as string[]
  return cities.sort()
}

export async function getDashboardStats(userId: string) {
  const supabase = await createClient()

  const [activeRes, upcomingRes, newRes, pipelineRes] = await Promise.all([
    supabase.from('properties').select('*', { count: 'exact', head: true })
      .not('stage', 'in', '("sold","redeemed","canceled")'),
    supabase.from('properties').select('*', { count: 'exact', head: true })
      .eq('stage', 'upcoming'),
    supabase.from('properties').select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase.from('investor_pipeline').select('*', { count: 'exact', head: true })
      .eq('investor_id', userId),
  ])

  return {
    totalActive: activeRes.count ?? 0,
    auctionScheduled: upcomingRes.count ?? 0,
    newThisWeek: newRes.count ?? 0,
    inPipeline: pipelineRes.count ?? 0,
  }
}

// ── Property Detail ──

export async function getProperty(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Property
}

export async function getCourtResearch(propertyId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('court_research')
    .select('*')
    .eq('property_id', propertyId)
    .single()
  return data as CourtResearch | null
}

export async function getPipelineEntry(userId: string, propertyId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('investor_pipeline')
    .select('*')
    .eq('investor_id', userId)
    .eq('property_id', propertyId)
    .single()
  return data as InvestorPipeline | null
}

export async function getWatchingCount(propertyId: string): Promise<number> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_watching_count', { p_property_id: propertyId })
  if (error) return 0
  return data as number
}

export async function getDealRoom(dealRoomId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('deal_rooms')
    .select('*')
    .eq('id', dealRoomId)
    .single()
  return data as DealRoom | null
}

// ── Pipeline Page ──

export async function getUserPipeline(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('investor_pipeline')
    .select('*, properties(*)')
    .eq('investor_id', userId)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data
}

// ── Admin Panel ──

export async function getDealRoomInvestors(dealRoomId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('deal_room_id', dealRoomId)
    .eq('role', 'investor')
  if (error) throw error
  return data as Profile[]
}

export async function getDealRoomActivity(dealRoomId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('investor_pipeline')
    .select('*, profiles!investor_pipeline_investor_id_fkey(full_name), properties(address, city)')
    .order('updated_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return data
}

export async function getInvestorPipelineSummary(investorId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('investor_pipeline')
    .select('stage')
    .eq('investor_id', investorId)
  if (error) throw error

  const summary: Record<string, number> = {}
  data.forEach(row => {
    summary[row.stage] = (summary[row.stage] || 0) + 1
  })
  return summary
}

// ── Auth Helpers ──

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  return profile as Profile | null
}
```

**Commit:** `feat: add data fetching functions for all pages`

---

### Task 8: Server Actions (Mutations)

**Files:**
- Create: `actions/pipeline.ts`
- Create: `actions/admin.ts`
- Create: `actions/auth.ts`

`actions/pipeline.ts`:
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveToPipeline(propertyId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get user's deal_room_id to set on pipeline entry
  const { data: profile } = await supabase
    .from('profiles')
    .select('deal_room_id')
    .eq('id', user.id)
    .single()

  const { error } = await supabase.from('investor_pipeline').insert({
    investor_id: user.id,
    property_id: propertyId,
    deal_room_id: profile?.deal_room_id ?? null,
    stage: 'watching',
  })

  if (error) throw error
  revalidatePath('/dashboard')
  revalidatePath(`/property/${propertyId}`)
}

export async function changeStage(pipelineId: string, newStage: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('investor_pipeline')
    .update({ stage: newStage as any, stage_changed_at: new Date().toISOString() })
    .eq('id', pipelineId)
    .eq('investor_id', user.id)

  if (error) throw error
  revalidatePath('/pipeline')
}

export async function updateNotes(pipelineId: string, notes: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('investor_pipeline')
    .update({ notes })
    .eq('id', pipelineId)
    .eq('investor_id', user.id)

  if (error) throw error
}

export async function removeFromPipeline(pipelineId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('investor_pipeline')
    .delete()
    .eq('id', pipelineId)
    .eq('investor_id', user.id)

  if (error) throw error
  revalidatePath('/pipeline')
  revalidatePath('/dashboard')
}
```

`actions/admin.ts`:
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateGroupNotes(pipelineId: string, groupNotes: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // RLS ensures only deal room admin can update
  const { error } = await supabase
    .from('investor_pipeline')
    .update({ group_notes: groupNotes })
    .eq('id', pipelineId)

  if (error) throw error
  revalidatePath('/admin')
}
```

`actions/auth.ts`:
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signIn(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })
  if (error) return { error: error.message }
  redirect('/dashboard')
}

export async function signUp(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })
  if (error) return { error: error.message }
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
```

**Commit:** `feat: add server actions (pipeline, admin, auth)`

---

### Task 9: Route Skeleton with Data Loading

**Files:**
- Create: `app/(auth)/login/page.tsx`
- Create: `app/(auth)/signup/page.tsx`
- Create: `app/(main)/layout.tsx`
- Create: `app/(main)/dashboard/page.tsx`
- Create: `app/(main)/property/[id]/page.tsx`
- Create: `app/(main)/pipeline/page.tsx`
- Create: `app/(main)/admin/page.tsx`

Each page loads its data server-side and passes it as props to client components that the frontend teams will build. The pages are functional but visually bare — just enough to prove the data flows work.

**Example — `app/(main)/dashboard/page.tsx`:**
```typescript
import { getProperties, getDistinctCities, getDashboardStats, getCurrentUser } from '@/lib/queries'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string; city?: string; sort?: string; search?: string; page?: string }>
}) {
  const params = await searchParams
  const user = await getCurrentUser()
  if (!user) return null

  const [{ properties, total }, cities, stats] = await Promise.all([
    getProperties({
      stage: params.stage,
      city: params.city,
      sort: params.sort,
      search: params.search,
      page: params.page ? parseInt(params.page) : 0,
    }),
    getDistinctCities(),
    getDashboardStats(user.id),
  ])

  // Frontend teams replace this with their UI components
  return (
    <div>
      <pre>{JSON.stringify({ stats, total, propertyCount: properties.length, cities }, null, 2)}</pre>
    </div>
  )
}
```

**Auth route group `(auth)` has no layout** — just standalone pages.

**Main route group `(main)` layout** checks auth and provides user context:
```typescript
import { getCurrentUser } from '@/lib/queries'
import { redirect } from 'next/navigation'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  // Frontend teams add <Nav user={user} /> here
  return <>{children}</>
}
```

**Admin page** checks role and redirects investors:
```typescript
import { getCurrentUser, getDealRoomInvestors, getDealRoomActivity } from '@/lib/queries'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const user = await getCurrentUser()
  if (!user || user.role === 'investor') redirect('/dashboard')
  if (!user.deal_room_id) redirect('/dashboard')

  const [investors, activity] = await Promise.all([
    getDealRoomInvestors(user.deal_room_id),
    getDealRoomActivity(user.deal_room_id),
  ])

  return (
    <div>
      <pre>{JSON.stringify({ investors, activity }, null, 2)}</pre>
    </div>
  )
}
```

**Commit:** `feat: add route skeleton with server-side data loading`

---

### Task 10: Vercel Environment Variables

**What to do:**
Set environment variables on the Vercel project (`prj_BNjPyPdakHg2XIeAEydWCltZpbNB`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Deploy the skeleton to verify it builds and runs on Vercel.

**Commit:** (none — env vars are set via Vercel dashboard/CLI)

---

### Task 11: Update Auth Trigger for Full Name

**Files:**
- Create: `supabase/migrations/YYYYMMDDHHMMSS_auth_trigger_full_name.sql`

The signup action passes `full_name` in user metadata. The existing auth trigger doesn't set it on the profile. Fix:

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, subscription_tier, subscription_status, trial_ends_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'investor',
    'free',
    'trial',
    now() + INTERVAL '60 days'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Commit:** `fix: auth trigger now sets full_name from signup metadata`

---

### Task 12: Write Backend Handoff Doc

**Files:**
- Create: `docs/handoff/phase1-backend-foundation.md`

Document for the frontend bake-off competitors:
- How to clone and set up the project
- Where every file lives and what it does
- Available data fetching functions and their return types
- Available server actions and their signatures
- Design system spec (copied from FRONTEND_BRIEF sections 3-4)
- Pages and what data they receive
- What to build vs. what's already wired

**Commit:** `docs: add Phase 1 backend foundation handoff`

---

## Stream B: Frontend Bake-Off (Competing AI Agents)

Each competitor forks the backend foundation and builds everything visual. Here's what they each implement — this is their scope and deliverable list.

---

### B1: Tailwind Design System Configuration

**Files to create/modify:**
- `tailwind.config.ts` — extend with the full color palette, typography, spacing from brief section 3

**Deliverable:** All CSS custom properties from the brief baked into Tailwind config. Colors, fonts, spacing scale, border-radius constraints, component patterns as Tailwind utilities.

---

### B2: Google Fonts + Root Layout

**Files:**
- Modify: `app/layout.tsx`

**Deliverable:** Load Playfair Display (400, 700), DM Sans (400, 500, 600), DM Mono (400) via `next/font/google`. Apply font CSS variables.

---

### B3: Navigation Component

**Files:**
- Create: `components/nav.tsx`
- Modify: `app/(main)/layout.tsx`

**Deliverable:** Top nav bar per brief section 4: logo left, links center-right, user email + sign out far right. Mobile hamburger menu. Role-aware (admin link only for admin+).

---

### B4: Login + Signup Pages

**Files:**
- Modify: `app/(auth)/login/page.tsx`
- Modify: `app/(auth)/signup/page.tsx`

**Deliverable:** Auth forms matching the design system. Wire to the existing `signIn`/`signUp` server actions. Error display. Redirect behavior already handled by middleware.

---

### B5: Dashboard Page — Stat Cards

**Files:**
- Create: `components/stat-card.tsx`
- Modify: `app/(main)/dashboard/page.tsx`

**Deliverable:** 4 stat cards per brief section 5. Data is already fetched — just render it.

---

### B6: Dashboard Page — Filter Bar

**Files:**
- Create: `components/filter-bar.tsx`

**Deliverable:** Stage dropdown, city dropdown, sort dropdown, search input. Updates URL search params. Client component.

---

### B7: Dashboard Page — Property Grid + Cards

**Files:**
- Create: `components/property-card.tsx`
- Create: `components/stage-badge.tsx`

**Deliverable:** Responsive grid (3/2/1 columns). PropertyCard with all 7 content sections from brief section 5. Stage badge color coding. "Save to Pipeline" button wired to `saveToPipeline` action with optimistic update. Card click navigates to detail page. Pagination at bottom.

---

### B8: Property Detail Page

**Files:**
- Create: `components/stage-progress.tsx`
- Modify: `app/(main)/property/[id]/page.tsx`

**Deliverable:** Two-column layout (65/35). Left: header, property details grid, court research section, notes section. Right: pipeline status card with stage progress, watching count, contact section. All data already fetched — render it. Notes auto-save (debounced) wired to `updateNotes` action.

---

### B9: Pipeline Page — Kanban

**Files:**
- Create: `components/pipeline-card.tsx`
- Modify: `app/(main)/pipeline/page.tsx`

**Deliverable:** Kanban board with columns per stage. Pipeline summary stats at top. Compact cards. Card click navigates to detail page. No drag-and-drop required.

---

### B10: Admin Panel

**Files:**
- Modify: `app/(main)/admin/page.tsx`

**Deliverable:** Investor table with expandable rows. Activity feed below. Group notes capability. All data already fetched — render it.

---

### B11: Responsive Design + Polish

**Deliverable:** All pages responsive to 375px. Hover states, transitions, optimistic updates working smoothly. No console errors, no hydration mismatches.

---

## Verification

### Backend Foundation (before handing off):
1. `npm run build` succeeds with zero errors
2. `npm run dev` — visit `/login`, verify redirect from `/dashboard`
3. Sign in as Philip → `/dashboard` shows JSON data dump with 81 properties
4. Visit `/property/[any-id]` → shows property data + court research (null) + watching count
5. Visit `/pipeline` → shows empty pipeline
6. Visit `/admin` → shows investor list + activity feed (as admin)
7. Sign in as an investor → `/admin` redirects to `/dashboard`
8. Deployed to Vercel, all routes work

### Frontend Bake-Off (each competitor):
- Run through all 14 acceptance criteria from FRONTEND_BRIEF section 13
- Lighthouse score on dashboard page
- Visual comparison to design spec
- Responsive check at 375px, 768px, 1024px, 1440px

---

## Summary

| Stream | Tasks | Owner | Deliverable |
|--------|-------|-------|-------------|
| **A: Backend** | 12 tasks | Context team (us) | Fully-wired Next.js project with types, auth, data fetching, server actions, route skeleton |
| **B: Frontend** | 11 tasks | Competing AI agents | Visual UI, design system, components, layouts, responsive polish |

The clean split: **backend team owns the data contract and wiring, frontend teams own everything the user sees.**
