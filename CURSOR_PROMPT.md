# Cursor Tasks — Quick Bug Fixes

These are small, well-scoped fixes. Each can be verified independently.

---

## TASK 1: Fix pagination — page 1 always empty

**File:** `app/(main)/dashboard/page.tsx`

The dashboard uses 0-based pagination but the query function (`lib/queries.ts` `getProperties()`) uses 1-based. On initial load with no `?page=` param, the dashboard sends `page: 0`, which computes `from = -30, to = -1` and returns zero results.

**Changes (all in `app/(main)/dashboard/page.tsx`):**

```
Line 34: page: params.page ? parseInt(params.page) : 0
→ page: params.page ? parseInt(params.page) : 1

Line 44: const currentPage = params.page ? parseInt(params.page) : 0
→ const currentPage = params.page ? parseInt(params.page) : 1

Line 52: if (page > 0) p.set('page', page.toString())
→ if (page > 1) p.set('page', page.toString())

Line 87: currentPage > 0
→ currentPage > 1

Line 99: Page {currentPage + 1} of {totalPages}
→ Page {currentPage} of {totalPages}

Line 102: currentPage < totalPages - 1
→ currentPage < totalPages
```

**Verify:** Load `/dashboard` with no params. Properties should appear. Click Next → URL should show `?page=2`. Click Previous → URL should have no page param. Display should always show correct page numbers.

---

## TASK 2: Fix search — Suspense boundary

**File:** `components/filter-bar.tsx` uses `useSearchParams()` from `next/navigation`. In Next.js 14+ App Router, this hook requires a `<Suspense>` boundary.

**Steps:**

1. Check `app/(main)/dashboard/page.tsx` — is `<FilterBar>` wrapped in `<Suspense>`?
2. If not, wrap it:

```tsx
import { Suspense } from 'react'

// In the JSX:
<Suspense fallback={<div className="flex flex-col md:flex-row gap-4 mb-8"><div className="h-10 bg-surface border border-border rounded animate-pulse" /><div className="h-10 bg-surface border border-border rounded animate-pulse" /><div className="h-10 bg-surface border border-border rounded animate-pulse" /><div className="h-10 flex-1 bg-surface border border-border rounded animate-pulse" /></div>}>
  <FilterBar cities={cities} />
</Suspense>
```

3. If search still doesn't work after adding Suspense, the issue is deeper. Check the browser console — there may be a hydration mismatch error. The `useEffect` dependency on `searchParams` object reference can cause infinite re-renders in some Next.js versions. A fix would be to use `searchParams.toString()` as the dependency instead of the `searchParams` object.

**Verify:** Type "123" in the search box. After 500ms debounce, URL should update to `?search=123`. Properties list should filter to only addresses or case numbers containing "123". Clear the search box — all properties should reappear.

---

## DO NOT

- Change any query functions in `lib/queries.ts`
- Modify any server actions
- Change the visual styling of any components
- Add new packages
