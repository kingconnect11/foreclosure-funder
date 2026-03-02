# Phase 0 Completion - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Finish all remaining Phase 0 tasks — seed properties from Google Sheets, verify auth trigger, create founder accounts with correct roles, fix scraper dependencies, and write the final handoff doc.

**Architecture:** Python seed script writes properties to Supabase via service role key (bypasses RLS). Founder accounts created via Supabase Auth admin REST API, which auto-triggers profile row creation, then SQL promotes roles. Scraper gets a requirements.txt for its existing supabase dependency.

**Tech Stack:** Python 3, supabase-py, gspread, Supabase Auth Admin API (REST), Supabase CLI

---

### Task 1: Fix Seed Script Investor Section

**Files:**
- Modify: `scripts/seed_from_sheets.py:51-94`

The `seed_investors()` function tries to call an RPC `create_placeholder_investor` that doesn't exist, then falls through to a log message. Since `profiles.id` has an FK to `auth.users(id)`, we cannot insert placeholder profiles without corresponding auth users. Fix the function to skip gracefully and log clearly.

**Step 1: Replace the `seed_investors` function**

Replace lines 51-94 with:

```python
def seed_investors(supabase, spreadsheet):
    """Read Investors tab and log investors who need accounts.

    Note: profiles.id references auth.users(id), so we cannot create
    placeholder profiles. Investors must sign up (or be created via the
    Auth admin API), which auto-triggers profile creation. After signup,
    update their deal_room_id to link them to Mike's group.
    """
    print("\n--- Investors ---")
    try:
        ws = spreadsheet.worksheet("Investors")
    except gspread.WorksheetNotFound:
        print("No 'Investors' tab found - skipping")
        return

    rows = ws.get_all_records()
    if not rows:
        print("No investor rows found")
        return

    print(f"Found {len(rows)} investors in Google Sheets:")
    for row in rows:
        email = row.get('Email', '').strip()
        name = row.get('Name', '').strip()
        if email:
            print(f"  - {name} ({email})")

    print(f"\nThese investors need to sign up (or be created via Auth admin API).")
    print(f"After signup, link to deal room: UPDATE profiles SET deal_room_id = '{MIKE_DEAL_ROOM_ID}' WHERE email = '<email>';")
```

**Step 2: Verify the script parses without errors**

Run:
```bash
cd "/Users/iamtheking/Documents/Projects/Mike King Real Estate"
python3 -c "import ast; ast.parse(open('scripts/seed_from_sheets.py').read()); print('OK')"
```
Expected: `OK`

**Step 3: Commit**

```bash
git add scripts/seed_from_sheets.py
git commit -m "fix: update seed_investors to log clearly instead of calling missing RPC"
```

---

### Task 2: Install Python Dependencies

**Step 1: Install the packages**

Run:
```bash
pip install supabase gspread google-auth
```
Expected: All three packages install successfully.

**Step 2: Verify imports work**

Run:
```bash
python3 -c "from supabase import create_client; import gspread; print('OK')"
```
Expected: `OK`

No commit needed — these are runtime dependencies, not code changes.

---

### Task 3: Run Seed Script (Properties Backfill)

**Requires:** User provides `SUPABASE_SERVICE_ROLE_KEY` value.

**Step 1: Set environment variables**

Run:
```bash
export SUPABASE_URL=https://fgcwbrolnxpfihqkvmcn.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=<USER_PASTES_KEY_HERE>
```

**Step 2: Run the seed script**

Run:
```bash
cd "/Users/iamtheking/Documents/Projects/Mike King Real Estate"
python3 scripts/seed_from_sheets.py
```

Expected output:
```
Foreclosure Funder - Seed from Google Sheets
==================================================

--- Investors ---
Found N investors in Google Sheets:
  - Name1 (email1@...)
  - Name2 (email2@...)
...

--- Seeding Properties ---
Found 0 existing properties in Supabase
  Reading N rows from 'Scheduled Sales'
  Reading N rows from 'New Filings'

Properties: X inserted, 0 skipped (duplicates)
...
Seeding complete.
```

**Step 3: Verify properties landed in Supabase**

Run:
```bash
curl -s "https://fgcwbrolnxpfihqkvmcn.supabase.co/rest/v1/properties?select=case_number,address,city,stage&limit=5" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" | python3 -m json.tool
```

Expected: JSON array with property rows showing case_number, address, city, stage.

**Step 4: Count total properties**

Run:
```bash
curl -s "https://fgcwbrolnxpfihqkvmcn.supabase.co/rest/v1/properties?select=count" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Prefer: count=exact" -I 2>/dev/null | grep -i content-range
```

Expected: `content-range: 0-N/N` where N > 0.

No commit — this is data seeding, not code.

---

### Task 4: Test Auth Trigger

**Requires:** `SUPABASE_SERVICE_ROLE_KEY` still set from Task 3.

**Step 1: Create a test user via Auth admin API**

Run:
```bash
curl -s -X POST "https://fgcwbrolnxpfihqkvmcn.supabase.co/auth/v1/admin/users" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email": "test-trigger@example.com", "password": "TestPassword123!", "email_confirm": true}' | python3 -m json.tool
```

Expected: JSON with `"id": "<uuid>"`, `"email": "test-trigger@example.com"`. Save the `id` value.

**Step 2: Verify profile was auto-created by the trigger**

Run:
```bash
curl -s "https://fgcwbrolnxpfihqkvmcn.supabase.co/rest/v1/profiles?email=eq.test-trigger@example.com&select=id,email,role,subscription_tier,subscription_status,trial_ends_at" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" | python3 -m json.tool
```

Expected: JSON array with one row:
- `role`: `"investor"`
- `subscription_tier`: `"free"`
- `subscription_status`: `"trial"`
- `trial_ends_at`: a date ~60 days from now

**Step 3: Delete the test user**

Run (replace `<TEST_USER_UUID>` with the id from Step 1):
```bash
curl -s -X DELETE "https://fgcwbrolnxpfihqkvmcn.supabase.co/auth/v1/admin/users/<TEST_USER_UUID>" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
```

Expected: Empty response (200 OK). The profile row should cascade-delete due to `ON DELETE CASCADE`.

**Step 4: Verify cascade delete worked**

Run:
```bash
curl -s "https://fgcwbrolnxpfihqkvmcn.supabase.co/rest/v1/profiles?email=eq.test-trigger@example.com&select=id" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" | python3 -m json.tool
```

Expected: `[]` (empty array — profile was cascade-deleted).

No commit — this is verification, not code.

---

### Task 5: Create Philip's Account (super_admin)

**Requires:** User provides desired password for Philip's account.

**Step 1: Create Philip's auth user**

Run:
```bash
curl -s -X POST "https://fgcwbrolnxpfihqkvmcn.supabase.co/auth/v1/admin/users" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email": "kingconnection@icloud.com", "password": "<PHILIP_PASSWORD>", "email_confirm": true}' | python3 -m json.tool
```

Expected: JSON with `"id": "<philip_uuid>"`.

**Step 2: Verify profile auto-created**

Run:
```bash
curl -s "https://fgcwbrolnxpfihqkvmcn.supabase.co/rest/v1/profiles?email=eq.kingconnection@icloud.com&select=id,email,role,subscription_tier" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" | python3 -m json.tool
```

Expected: One row with `role: "investor"` (not yet promoted).

**Step 3: Promote to super_admin and set name**

Run:
```bash
curl -s -X PATCH "https://fgcwbrolnxpfihqkvmcn.supabase.co/rest/v1/profiles?email=eq.kingconnection@icloud.com" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"role": "super_admin", "full_name": "Philip King"}' | python3 -m json.tool
```

Expected: Updated row with `role: "super_admin"`, `full_name: "Philip King"`.

---

### Task 6: Create Mike's Account (admin + deal room link)

**Requires:** User provides desired password for Mike's account.

**Step 1: Create Mike's auth user**

Run:
```bash
curl -s -X POST "https://fgcwbrolnxpfihqkvmcn.supabase.co/auth/v1/admin/users" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email": "mike.king@lptrealty.com", "password": "<MIKE_PASSWORD>", "email_confirm": true}' | python3 -m json.tool
```

Expected: JSON with `"id": "<mike_uuid>"`.

**Step 2: Verify profile auto-created**

Run:
```bash
curl -s "https://fgcwbrolnxpfihqkvmcn.supabase.co/rest/v1/profiles?email=eq.mike.king@lptrealty.com&select=id,email,role" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" | python3 -m json.tool
```

Expected: One row with `role: "investor"`.

**Step 3: Promote to admin, set name, link deal room**

Run:
```bash
curl -s -X PATCH "https://fgcwbrolnxpfihqkvmcn.supabase.co/rest/v1/profiles?email=eq.mike.king@lptrealty.com" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"role": "admin", "full_name": "Mike King", "deal_room_id": "00000000-0000-0000-0000-000000000002"}' | python3 -m json.tool
```

Expected: Updated row with `role: "admin"`, `deal_room_id: "00000000-0000-0000-0000-000000000002"`.

**Step 4: Get Mike's profile UUID for deal room ownership**

Run:
```bash
curl -s "https://fgcwbrolnxpfihqkvmcn.supabase.co/rest/v1/profiles?email=eq.mike.king@lptrealty.com&select=id" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" | python3 -m json.tool
```

Save the `id` value.

**Step 5: Set Mike as deal room owner**

Run (replace `<MIKE_UUID>` with id from Step 4):
```bash
curl -s -X PATCH "https://fgcwbrolnxpfihqkvmcn.supabase.co/rest/v1/deal_rooms?id=eq.00000000-0000-0000-0000-000000000002" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"owner_id": "<MIKE_UUID>"}' | python3 -m json.tool
```

Expected: Deal room row with `owner_id` set to Mike's UUID.

---

### Task 7: Create Scraper Requirements File

**Files:**
- Create: `scraper/requirements.txt`

**Step 1: Create the requirements file**

```
anthropic>=0.40.0
supabase>=2.0.0
gspread>=6.0.0
google-auth>=2.0.0
```

These match what the scraper actually imports. `anthropic` for Claude API extraction, `supabase` for DB writes, `gspread` + `google-auth` for Sheets.

**Step 2: Commit**

```bash
git add scraper/requirements.txt
git commit -m "chore: add scraper requirements.txt with supabase dependency"
```

---

### Task 8: Final Verification

**Step 1: Count properties**

Run:
```bash
curl -s "https://fgcwbrolnxpfihqkvmcn.supabase.co/rest/v1/properties?select=stage&limit=1000" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" | python3 -c "
import json, sys
data = json.load(sys.stdin)
stages = {}
for row in data:
    s = row['stage']
    stages[s] = stages.get(s, 0) + 1
print(f'Total properties: {len(data)}')
for stage, count in sorted(stages.items()):
    print(f'  {stage}: {count}')
"
```

**Step 2: Verify both founder profiles**

Run:
```bash
curl -s "https://fgcwbrolnxpfihqkvmcn.supabase.co/rest/v1/profiles?select=email,full_name,role,deal_room_id,subscription_tier,subscription_status" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" | python3 -m json.tool
```

Expected:
- Philip: `role=super_admin`, `full_name=Philip King`
- Mike: `role=admin`, `full_name=Mike King`, `deal_room_id=00000000-0000-0000-0000-000000000002`

**Step 3: Verify deal room has owner**

Run:
```bash
curl -s "https://fgcwbrolnxpfihqkvmcn.supabase.co/rest/v1/deal_rooms?select=id,name,owner_id" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" | python3 -m json.tool
```

Expected: `owner_id` is Mike's UUID (not null).

No commit — verification only.

---

### Task 9: Write Final Handoff Doc

**Files:**
- Create: `docs/handoff/2026-03-01_phase0-completion-handoff.md`

Write a handoff doc covering:

1. **Session summary** — what was completed in both Phase 0 sessions
2. **Database state** — X properties, 2 founder profiles, 1 market, 1 deal room with owner
3. **Auth trigger** — verified working with cascade delete
4. **Bidir sync decision** — scraper dual-writes (Supabase first, Sheets second). No separate sync mechanism. If Mike needs Sheets-to-Supabase in the future, options are: (a) lightweight Apps Script that POSTs to Supabase REST API on sheet edit, (b) scheduled Python cron that diffs Sheets vs Supabase. Neither needed now.
5. **Beta investor onboarding** — investors sign up themselves, admin links them to deal room via `UPDATE profiles SET deal_room_id = '...' WHERE email = '...';`
6. **What Phase 1 picks up** — frontend dashboard per `FRONTEND_BRIEF_2026-03-02.md`. Backend is ready: schema, auth, RLS, seed data, founder accounts all in place.
7. **Deferred items** — domain registration (beta launch), PWA (Phase 1 frontend), bidir sync (not needed until dashboard is live)

**Step 1: Write the handoff doc**

(Content will be written during execution based on actual results from Tasks 3-8)

**Step 2: Commit everything**

```bash
git add docs/handoff/2026-03-01_phase0-completion-handoff.md docs/plans/2026-03-01-phase0-completion-design.md docs/plans/2026-03-01-phase0-completion-implementation.md
git commit -m "docs: add Phase 0 completion design, plan, and handoff"
```

---

## Task Dependency Summary

```
Task 1 (fix seed script) ─── no deps
Task 2 (install pip deps) ── no deps
Task 3 (run seed script) ─── depends on Tasks 1, 2 + user provides service role key
Task 4 (test auth trigger) ─ depends on Task 2 + service role key
Task 5 (Philip account) ──── depends on Task 4 (trigger verified)
Task 6 (Mike account) ────── depends on Task 4
Task 7 (scraper reqs) ────── no deps
Task 8 (final verify) ────── depends on Tasks 3, 5, 6
Task 9 (handoff doc) ─────── depends on Task 8
```

Tasks 1, 2, 7 can run in parallel. Tasks 5, 6 can run in parallel after Task 4.
