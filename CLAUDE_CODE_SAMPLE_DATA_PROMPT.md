# Claude Code Task — Bakeoff Round 2 Data Prep

**CTO:** Philip King (kingconnection@icloud.com)
**Priority:** This is the ONLY blocker for running the frontend bakeoff. Get it right.
**Time estimate:** Single session, ~30 minutes.

---

## CONTEXT

Read these files first, in order:

1. `FOUNDING_ARCHITECTURE.md` — Architecture source of truth (skim Sections 8, 11, 13 for schema and pipeline context)
2. `lib/types.ts` — TypeScript types generated from DB schema. Pay attention to `court_research`, `investor_pipeline`, and `properties` table shapes.
3. `supabase/migrations/20260302120000_sample_data.sql` — The 10 sample properties that already exist in the migrations folder (may or may not have been applied to Supabase yet)
4. `supabase/migrations/20260302000119_seed_data.sql` — Market and deal room seed data
5. `FUNCTIONAL_SPEC.md` — What the frontend builds. Sections 4-7 describe what data appears on each page.

---

## GOAL

The frontend bakeoff agents need **rich, realistic data across every page and section** of the app. Round 1 failed partly because most data fields were blank — agents built UIs around empty tables. This time, every UI section must have data to render.

Here's what each page needs:

| Page | Data needed |
|------|-------------|
| Dashboard | 10+ properties with ALL fields filled, mix of stages and urgencies |
| Property Detail | Full property data + court research (liens, judgments, title status) + watching count > 1 + pipeline entries with notes |
| Pipeline (kanban) | Multiple investors with properties in various pipeline stages, with notes and offer amounts |
| Admin Panel | Multiple investors with pipeline entries, activity feed with recent timestamps, admin group notes |

---

## TASK 1: Verify and apply existing sample properties

The migration file `supabase/migrations/20260302120000_sample_data.sql` contains 10 properties. Check if they exist in Supabase:

```sql
SELECT count(*) FROM properties WHERE case_number LIKE '2026-CV-0004%';
```

- If count = 0: run the migration against Supabase
- If count = 10: they're already there, move on
- If count is between 1-9: something went wrong. Delete the partial set and re-run the full migration

After confirming all 10 exist, capture their UUIDs — you'll need them for court research and pipeline entries.

---

## TASK 2: Add RPR values to all 10 sample properties

Update the 10 sample properties to include `rpr_value`. RPR (Realtor's Property Resource) values should be slightly different from county appraisals — sometimes higher, sometimes lower, reflecting market conditions vs. government assessment.

Guidelines:
- RPR values should be 85-115% of county_appraisal (some over, some under)
- The variance should feel realistic — older neighborhoods trend lower, newer neighborhoods trend higher
- Round to nearest $1,000

---

## TASK 3: Create court research records for all 10 properties

Insert into `court_research` for each of the 10 sample properties. This is what makes the property detail page come alive.

**Schema reminder:**
```
court_research:
  id: UUID (auto)
  property_id: UUID (FK to properties)
  title_status: 'clean' | 'clouded' | 'complex'
  liens: JSONB
  judgments: JSONB
  estimated_offer_min: number
  estimated_offer_max: number
  research_summary: text
  researched_at: timestamp
```

### Distribution across 10 properties:

- **4 CLEAN** titles — straightforward deals, few or no liens
- **4 CLOUDED** titles — one or two issues that need resolution (tax liens, HOA liens, mechanic's liens)
- **2 COMPLEX** titles — multiple issues, serious investigation needed

### Liens JSON format:
```json
[
  {
    "type": "property_tax",
    "amount": 4200,
    "creditor": "Sedgwick County Treasurer",
    "filing_date": "2025-08-15",
    "status": "active"
  }
]
```

### Judgments JSON format:
```json
[
  {
    "type": "deficiency_judgment",
    "amount": 12000,
    "court": "Sedgwick County District Court",
    "case_number": "2025-CV-001234",
    "filing_date": "2025-11-20",
    "status": "pending"
  }
]
```

### Kansas-specific concerns to include:

These are real issues that Kansas foreclosure investors encounter. Include at least one of each across the 10 properties:

1. **Agricultural liens** — Kansas has strong agricultural lien protections. Include one property with an ag lien (e.g., "Crop lien filed by Sedgwick County Farm Service Agency, $3,200")
2. **Mineral rights** — In Kansas, mineral rights can be severed from surface rights. Include in one research_summary: "Note: Mineral rights were severed in 1987 deed. Surface rights only included in this sale. Buyer will not own subsurface mineral rights."
3. **Manufactured home concerns** — Include one property where the research_summary flags: "Property classified as manufactured housing. Verify if title is real property vs. personal property (Kansas certificate of title vs. deed). Check for DMV lien release."
4. **Tax sale certificates** — Include one with a prior tax sale certificate lien from Sedgwick County
5. **IRS federal tax liens** — Include one with a federal tax lien (these have a 120-day right of redemption in Kansas)
6. **Mechanic's liens** — Include one with a contractor's lien for renovation work

### Estimated offer ranges:
- Clean titles: offer range = 55-70% of county appraisal
- Clouded titles: offer range = 40-55% of county appraisal (discount for lien resolution costs)
- Complex titles: offer range = 25-40% of county appraisal (heavy discount)

### Research summaries:
Write 2-4 sentence summaries that sound like a paralegal wrote them. Include key findings, risk flags, and actionable next steps. Examples:

- "Title search complete. No outstanding liens or judgments beyond the subject mortgage. Property taxes current through 2025. Recommend standard title insurance. Clean acquisition candidate."
- "Title search reveals two active liens: Sedgwick County property tax delinquency ($4,200, 2024-2025) and mechanic's lien filed by ABC Contracting ($8,500, filed 2025-06-12). Total lien exposure: $12,700. Taxes must be satisfied at closing; mechanic's lien may be negotiable. Title insurance with exceptions recommended."

---

## TASK 4: Create investor pipeline entries

You need pipeline data so the Pipeline page (kanban), Admin panel (activity feed + investor table), and property detail page (watching counts, notes) all have real data.

### Step 1: Identify existing user profiles

```sql
SELECT id, full_name, email, role, deal_room_id FROM profiles ORDER BY created_at;
```

You need at least 4 investor-role users in Mike's deal room (`00000000-0000-0000-0000-000000000002`). If fewer than 4 investors exist, create test users:

```sql
-- Only if needed. Use Supabase auth admin API or direct insert into auth.users + profiles.
-- Ask CTO if you need to create auth users — DO NOT create them without confirming first.
```

If you DO have 4+ investors, proceed with pipeline entries.

### Step 2: Create pipeline entries

Insert `investor_pipeline` rows that create a realistic spread:

| Investor | Properties saved | Stages | Notes? | Offer amounts? |
|----------|-----------------|--------|--------|----------------|
| Investor 1 (most active) | 5-6 properties | watching(2), researching(1), site_visit(1), preparing_offer(1) | Yes, on 3+ | $95,000 on preparing_offer |
| Investor 2 | 3-4 properties | watching(1), researching(2), offer_submitted(1) | Yes, on 2 | $72,000 on offer_submitted |
| Investor 3 | 2 properties | watching(1), researching(1) | Yes, on 1 | None |
| Investor 4 | 1 property | watching(1) | No | None |

**Important fields:**
- `investor_id`: the profile UUID
- `property_id`: UUID from the 10 sample properties
- `deal_room_id`: `'00000000-0000-0000-0000-000000000002'` (Mike's deal room)
- `stage`: valid pipeline_stage enum value
- `notes`: realistic investor notes (2-3 sentences about the property, what they noticed on a drive-by, concerns, etc.)
- `group_notes`: set on 2-3 entries from Mike's admin perspective (e.g., "Dan is very interested in this one. Price point is in his sweet spot. Follow up after Tuesday auction.")
- `offer_amount`: set on entries that are at preparing_offer, offer_submitted, or beyond
- `stage_changed_at`: stagger these across the last 2 weeks so the activity feed has temporal spread
- `created_at`: stagger from 3 weeks ago to today
- `updated_at`: recent (last few days)

### Step 3: Ensure overlap

Multiple investors should be watching the same properties so that:
- `get_watching_count(propertyId)` returns > 1 for at least 3-4 properties
- The admin activity feed shows multiple investors interacting with the same properties

---

## TASK 5: Verify everything renders

After all data is inserted, run these verification queries:

```sql
-- 1. All 10 sample properties have all fields filled
SELECT case_number, address, city, bedrooms, bathrooms, sqft, county_appraisal,
       foreclosure_amount, rpr_value, sale_date, defendant_name, plaintiff_name,
       attorney_name, stage, property_type
FROM properties
WHERE case_number LIKE '2026-CV-0004%'
ORDER BY case_number;

-- 2. Court research exists for all 10
SELECT p.case_number, cr.title_status, cr.estimated_offer_min, cr.estimated_offer_max,
       jsonb_array_length(cr.liens) as lien_count,
       jsonb_array_length(cr.judgments) as judgment_count
FROM court_research cr
JOIN properties p ON p.id = cr.property_id
WHERE p.case_number LIKE '2026-CV-0004%'
ORDER BY p.case_number;

-- 3. Pipeline entries with stage distribution
SELECT p.full_name, ip.stage, count(*)
FROM investor_pipeline ip
JOIN profiles p ON p.id = ip.investor_id
GROUP BY p.full_name, ip.stage
ORDER BY p.full_name, ip.stage;

-- 4. Watching counts > 1
SELECT pr.address, count(ip.id) as watching_count
FROM properties pr
JOIN investor_pipeline ip ON ip.property_id = pr.id
WHERE pr.case_number LIKE '2026-CV-0004%'
GROUP BY pr.address
HAVING count(ip.id) > 1
ORDER BY watching_count DESC;

-- 5. Activity feed data (recent pipeline changes)
SELECT p.full_name, pr.address, ip.stage, ip.stage_changed_at, ip.offer_amount
FROM investor_pipeline ip
JOIN profiles p ON p.id = ip.investor_id
JOIN properties pr ON pr.id = ip.property_id
WHERE pr.case_number LIKE '2026-CV-0004%'
ORDER BY ip.stage_changed_at DESC;
```

**Every query must return results.** If any are empty, something is wrong — fix it.

---

## WHAT NOT TO DO

- Do NOT modify any TypeScript files, queries, or server actions
- Do NOT modify `FOUNDING_ARCHITECTURE.md`, `BAKEOFF_PROMPT.md`, or `FUNCTIONAL_SPEC.md`
- Do NOT create new tables or modify existing schema beyond adding data
- Do NOT add Phase 3+ features (recommendation scores, etc.)
- Do NOT touch the scraper
- Do NOT create auth users without confirming with CTO first — use existing profiles if possible

---

## DELIVERABLE

When done, report back with:
1. Count of sample properties confirmed in DB (should be 10)
2. Count of court_research records (should be 10)
3. Count of investor_pipeline entries created
4. Count of properties with watching_count > 1
5. The output of all 5 verification queries above
6. Any issues encountered (e.g., insufficient test users, RLS blocking inserts)

The bakeoff agents will be launched immediately after this data is confirmed. Get it right.
