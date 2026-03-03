# Security Review: Foreclosure Funder

**Date:** 2026-03-03
**Reviewer:** Claude Code Security Review
**Scope:** Full codebase — API keys, secrets, authentication, authorization, data access

---

## Executive Summary

The codebase demonstrates **solid security fundamentals**. No hardcoded API keys or leaked credentials were found. Supabase Row-Level Security (RLS) is comprehensive and well-structured with a three-tier role model. However, there are **5 actionable findings** ranging from Medium to Low severity that should be addressed before production use.

---

## FINDING 1: Profile Update RLS Policy Allows Role/Subscription Self-Escalation

**Severity: MEDIUM**
**File:** `supabase/migrations/20260301235841_rls_policies.sql:44-46`

```sql
CREATE POLICY "user_update_own_profile" ON profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
```

**Risk:** This policy lets any authenticated user update **any column** on their own profile row, including `role` (investor → admin → super_admin), `subscription_tier`, and `subscription_status`. A malicious user could escalate their privileges by calling:

```js
supabase.from('profiles').update({ role: 'super_admin' }).eq('id', myUserId)
```

**Recommendation:** Restrict which columns users can update using a trigger or a more restrictive policy:

```sql
-- Option A: Use a BEFORE UPDATE trigger to freeze sensitive columns
CREATE OR REPLACE FUNCTION prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Cannot change own role';
  END IF;
  IF NEW.subscription_tier IS DISTINCT FROM OLD.subscription_tier THEN
    RAISE EXCEPTION 'Cannot change own subscription tier';
  END IF;
  IF NEW.subscription_status IS DISTINCT FROM OLD.subscription_status THEN
    RAISE EXCEPTION 'Cannot change own subscription status';
  END IF;
  IF NEW.deal_room_id IS DISTINCT FROM OLD.deal_room_id THEN
    RAISE EXCEPTION 'Cannot change own deal room assignment';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER guard_profile_updates
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  WHEN (current_setting('role') != 'service_role')
  EXECUTE FUNCTION prevent_role_escalation();
```

---

## FINDING 2: `pipeline_stage_history` Missing Ownership Check in `changeStage()`

**Severity: MEDIUM**
**File:** `actions/pipeline.ts:36-51`

```typescript
// Close the current stage history row (set exited_at)
await supabase
  .from('pipeline_stage_history')
  .update({ exited_at: new Date().toISOString() })
  .eq('pipeline_id', pipelineId)
  .is('exited_at', null)

// Insert new stage history row
const { error: historyError } = await supabase
  .from('pipeline_stage_history')
  .insert({
    pipeline_id: pipelineId,
    stage: newStage as any,
    notes: notes ?? null,
  })
```

**Risk:** While the subsequent pipeline update at line 54-61 correctly checks `.eq('investor_id', user.id)`, the stage history operations above do not include an ownership check at the application level. The RLS policies on `pipeline_stage_history` do enforce ownership via a subquery, so this is **mitigated by RLS**. However, the RLS subquery using `IN (SELECT ...)` is less performant than a direct join, and the lack of application-level validation means a user could attempt writes to arbitrary `pipeline_id` values — RLS would block them, but the error handling is not clean.

**Recommendation:** Verify ownership before touching stage history, or restructure the operation to validate the pipeline entry belongs to the user first.

---

## FINDING 3: No Rate Limiting on Authentication Endpoints

**Severity: MEDIUM**
**Files:** `actions/auth.ts`, `lib/supabase/middleware.ts`

**Risk:** No rate limiting exists on login (`signIn`) or signup (`signUp`) server actions. While Supabase has some built-in auth rate limiting, there is no application-level throttling. This leaves the app vulnerable to:
- Brute-force password attacks
- Credential stuffing
- Account enumeration (error messages are passed via URL: `?error=${encodeURIComponent(error.message)}`)

**Recommendation:**
1. Add rate limiting middleware (e.g., `@upstash/ratelimit` with Redis, or IP-based in-memory limiting)
2. Sanitize auth error messages — don't reveal whether an email exists:
   ```typescript
   // Bad: redirect(`/login?error=${encodeURIComponent(error.message)}`)
   // Good: redirect('/login?error=Invalid+email+or+password')
   ```
3. Configure Supabase auth rate limits in `supabase/config.toml`

---

## FINDING 4: `get_watching_count` RPC Leaks Aggregate Investor Activity

**Severity: LOW**
**File:** `supabase/migrations/20260302061044_watching_count_rpc.sql`

```sql
CREATE OR REPLACE FUNCTION get_watching_count(p_property_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(COUNT(DISTINCT investor_id)::INTEGER, 0)
  FROM investor_pipeline
  WHERE property_id = p_property_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

**Risk:** This `SECURITY DEFINER` function bypasses RLS and exposes how many **distinct investors** are watching any property. While it doesn't reveal investor identities, it leaks competitive intelligence — an investor can see demand signals for every property. In a competitive foreclosure market, knowing that 10 other investors are watching a property vs. 0 is actionable intelligence that may not be intended to be public.

**Recommendation:** Evaluate whether this is intentional product behavior. If not, consider:
- Returning a boolean (`has_others_watching`) instead of an exact count
- Limiting the function to return the user's own status only
- Adding a check for `deal_rooms.settings->>'inter_investor_visibility'`

---

## FINDING 5: Missing Security Headers in Next.js Config

**Severity: LOW**
**File:** `next.config.js`

```js
const nextConfig = {}
module.exports = nextConfig
```

**Risk:** No custom security headers are configured. While Next.js provides some defaults, production deployments should explicitly set:
- `Content-Security-Policy` (prevents XSS, data injection)
- `X-Frame-Options` or `frame-ancestors` (prevents clickjacking)
- `Strict-Transport-Security` (forces HTTPS)
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy`

**Recommendation:**
```js
const nextConfig = {
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      ],
    }]
  },
}
```

---

## Areas Reviewed — No Issues Found

| Area | Status | Notes |
|---|---|---|
| **Hardcoded Secrets** | PASS | All keys loaded from env vars. `.env` files properly gitignored. |
| **Git History** | PASS | No credentials found in any prior commit. |
| **SQL Injection** | PASS | All queries use Supabase parameterized client (PostgREST). No raw SQL in app code. |
| **XSS** | PASS | No `dangerouslySetInnerHTML`, `eval()`, or innerHTML usage. React text binding used throughout. |
| **CSRF** | PASS | Next.js Server Actions provide built-in CSRF token validation. |
| **IDOR on Mutations** | PASS | All pipeline mutations (`changeStage`, `updateNotes`, `removeFromPipeline`) include `.eq('investor_id', user.id)` ownership checks. |
| **Admin Authorization** | PASS | Admin page checks role at component level. RLS enforces deal room scoping at database level. |
| **Service Role Key Exposure** | PASS | `createServiceClient()` is defined but **never imported** in any server action or page. Only the anon key is used in the web app. The service role key is only used by the Python scraper (server-side, env var). |
| **Session Management** | PASS | JWT via Supabase SSR. HTTP-only cookies. Middleware validates on every request. |
| **Password Storage** | PASS | Delegated entirely to Supabase Auth (bcrypt). App code never handles raw passwords. |
| **`.env.example` Safety** | PASS | Contains only placeholder values (`your-service-role-key-here`, `sk-ant-your-key-here`). Supabase URL is a public project identifier, not a secret. |
| **Google Credentials** | PASS | `scraper/google_credentials.json` is in `.gitignore`. Not committed. |
| **Input Validation (DB)** | PASS | Enum types for stages, `CHECK` constraints on `risk_tolerance`, foreign keys prevent orphaned records. |

---

## Additional Recommendations (Hardening)

1. **Add server-side input validation with `zod`** — Currently no explicit length limits on text fields (`notes`, `group_notes`). A user could submit multi-megabyte strings.

2. **Add audit logging** — Sensitive operations (role changes, admin actions, pipeline stage transitions) should be logged with actor, timestamp, and IP for forensic purposes.

3. **Add pre-commit hooks** — Use tools like `gitleaks` or `trufflehog` to prevent accidental credential commits as the team grows.

4. **Silent error swallowing** — `components/property-notes.tsx` has empty `catch (e) {}` blocks. Errors should at minimum be logged to help diagnose issues.

5. **`newStage` type safety** — `actions/pipeline.ts:30` accepts `newStage: string` and casts with `as any`. This should validate against the `pipeline_stage` enum to prevent invalid data.

---

## Priority Action Items

| Priority | Finding | Effort |
|---|---|---|
| **P1** | Fix profile update RLS to prevent role self-escalation | ~30 min |
| **P2** | Add rate limiting to auth endpoints | ~2 hrs |
| **P2** | Sanitize auth error messages | ~15 min |
| **P3** | Add security headers to next.config.js | ~15 min |
| **P3** | Evaluate `get_watching_count` information disclosure | ~15 min |
