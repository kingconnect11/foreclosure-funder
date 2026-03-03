# Claude Code Task — Backend Bug Fixes + Schema Addition

**CTO:** Philip King (kingconnection@icloud.com)
**Priority:** These fixes are blocking the frontend bake-off. Do them in order.

---

## CONTEXT

Read these files first, in order:

1. `FOUNDING_ARCHITECTURE.md` — Architecture source of truth. DO NOT rewrite.
2. `lib/queries.ts` — All Supabase queries (14 functions)
3. `lib/types.ts` — TypeScript types generated from DB schema
4. `actions/pipeline.ts` — Pipeline mutations (save, stage change, notes)
5. `app/(main)/dashboard/page.tsx` — Dashboard page with the pagination bug
6. `components/filter-bar.tsx` — Filter bar with the search bug
7. `supabase/migrations/` — All migration files for schema context

---

## TASK 1: Fix pagination — page 1 always empty (CRITICAL)

**Root cause:** Dashboard sends `page: 0` on initial load. The query function `getProperties()` in `lib/queries.ts` defaults to `page = 1` and calculates `from = (page - 1) * 30`. When the dashboard passes 0, the query computes `from = -30, to = -1`, which returns zero results.

**Fix in `app/(main)/dashboard/page.tsx`:**

- Line 34: Change `page: params.page ? parseInt(params.page) : 0` → `page: params.page ? parseInt(params.page) : 1`
- Line 44: Change `const currentPage = params.page ? parseInt(params.page) : 0` → `const currentPage = params.page ? parseInt(params.page) : 1`
- Line 52: Change `if (page > 0) p.set('page', page.toString())` → `if (page > 1) p.set('page', page.toString())`
- Line 87: Change `currentPage > 0` → `currentPage > 1`
- Line 99: Display should read `Page {currentPage} of {totalPages}` (remove the `+ 1`)
- Line 102: Change `currentPage < totalPages - 1` → `currentPage < totalPages`

All pagination should be 1-based. Page 1 = first page, no page param in URL means page 1.

---

## TASK 2: Fix search — likely Suspense boundary issue

**Investigation needed:** The `FilterBar` component (`components/filter-bar.tsx`) uses `useSearchParams()` from `next/navigation`. In Next.js 14+ App Router, this hook requires a `<Suspense>` boundary wrapping the component. Without it, the page may fail during static rendering or the search params may not update properly.

**Steps:**

1. Check `app/(main)/layout.tsx` and `app/(main)/dashboard/page.tsx` for Suspense boundaries around `FilterBar`.
2. If missing, wrap `<FilterBar>` in `<Suspense fallback={<FilterBarSkeleton />}>`. Create a simple skeleton that matches the filter bar dimensions.
3. Test: type a search term in the filter bar, verify the URL updates with `?search=term`, verify the dashboard re-renders with filtered properties.
4. If the Suspense boundary wasn't the issue, investigate further — check if the `.or()` query in `getProperties()` is correctly handling the search param passthrough from the server component's `searchParams` prop.

---

## TASK 3: Create 10 fully populated sample properties

Write a SQL migration file (`supabase/migrations/YYYYMMDDHHMMSS_sample_data.sql`) that inserts 10 properties with ALL fields populated. Use realistic Sedgwick County, KS addresses.

**Every row must have:**
- `case_number` — format like "2026-CV-000XXX"
- `market_id` — `'00000000-0000-0000-0000-000000000001'` (Sedgwick County)
- `address` — real Wichita, KS street addresses
- `city` — Wichita, Derby, Andover, or other Sedgwick County cities
- `state` — 'KS'
- `zip_code` — real Sedgwick County ZIPs (67202, 67203, 67204, 67205, 67206, 67207, 67208, 67210, 67212, 67213, 67214, 67216, 67217, 67218, 67219, 67220, 67226, 67230, 67235)
- `bedrooms` — 2-5
- `bathrooms` — 1-3
- `sqft` — 900-3200
- `county_appraisal` — $75,000-$350,000
- `foreclosure_amount` — 60-85% of appraisal
- `property_type` — 'Single Family', 'Duplex', 'Townhouse'
- `sale_date` — spread across next 8-60 days from now
- `defendant_name` — realistic names
- `plaintiff_name` — bank names like 'Nationstar Mortgage LLC', 'Wells Fargo Bank N.A.', 'U.S. Bank Trust National Association'
- `attorney_name` — realistic names
- `notice_type` — mix of 'new_filing' and 'scheduled_sale'
- `stage` — mix: 3 'new_filing', 4 'sale_date_assigned', 3 'upcoming'
- `source_url` — 'https://www.wichitapost.com/sedgwick-county-post'
- `scraped_at` — now()

Make these 10 entries feel real — investors will be judging the UI with this data.

---

## TASK 4: Add `pipeline_stage_history` table

Create a new migration file that adds a table for tracking per-stage notes when investors move properties through pipeline stages.

```sql
CREATE TABLE pipeline_stage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id UUID NOT NULL REFERENCES investor_pipeline(id) ON DELETE CASCADE,
  stage pipeline_stage NOT NULL,
  notes TEXT,
  entered_at TIMESTAMPTZ DEFAULT now(),
  exited_at TIMESTAMPTZ
);

-- Index for fast lookups
CREATE INDEX idx_stage_history_pipeline ON pipeline_stage_history(pipeline_id);
CREATE INDEX idx_stage_history_stage ON pipeline_stage_history(stage);

-- RLS
ALTER TABLE pipeline_stage_history ENABLE ROW LEVEL SECURITY;

-- Investors can read their own stage history
CREATE POLICY "investors_read_own_stage_history" ON pipeline_stage_history
  FOR SELECT USING (
    pipeline_id IN (
      SELECT id FROM investor_pipeline WHERE investor_id = auth.uid()
    )
  );

-- Investors can insert into their own stage history
CREATE POLICY "investors_insert_own_stage_history" ON pipeline_stage_history
  FOR INSERT WITH CHECK (
    pipeline_id IN (
      SELECT id FROM investor_pipeline WHERE investor_id = auth.uid()
    )
  );

-- Investors can update their own stage history (for exited_at)
CREATE POLICY "investors_update_own_stage_history" ON pipeline_stage_history
  FOR UPDATE USING (
    pipeline_id IN (
      SELECT id FROM investor_pipeline WHERE investor_id = auth.uid()
    )
  );

-- Admin can read stage history for their deal room's investors
CREATE POLICY "admin_read_deal_room_stage_history" ON pipeline_stage_history
  FOR SELECT USING (
    pipeline_id IN (
      SELECT ip.id FROM investor_pipeline ip
      JOIN profiles p ON p.id = ip.investor_id
      WHERE p.deal_room_id = (SELECT get_user_deal_room_id())
    )
    AND get_user_role() IN ('admin', 'super_admin')
  );
```

**Then update `actions/pipeline.ts`:**

The `changeStage` server action should:
1. Set `exited_at = now()` on the current stage's history row (where `pipeline_id` matches and `exited_at IS NULL`)
2. Insert a new `pipeline_stage_history` row with the new stage and `entered_at = now()`
3. The existing stage change on `investor_pipeline` stays as-is

**Then update `lib/types.ts`:**

Regenerate types or manually add the `PipelineStageHistory` type.

**Then add a query in `lib/queries.ts`:**

```typescript
export async function getStageHistory(pipelineId: string): Promise<PipelineStageHistory[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pipeline_stage_history')
    .select('*')
    .eq('pipeline_id', pipelineId)
    .order('entered_at', { ascending: true })
  if (error) throw error
  return data ?? []
}
```

---

## WHAT NOT TO DO

- Do NOT rewrite `FOUNDING_ARCHITECTURE.md`
- Do NOT modify the scraper
- Do NOT add any Phase 3+ features
- Do NOT change `lib/queries.ts` function signatures (only add new functions)
- Do NOT touch any component styling — the frontend bake-off agents handle that
