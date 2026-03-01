# Alternative Architecture - Possible Plan
## February 24, 2026

This document explores a better, more scalable architecture for the Mike King Foreclosure Automation System. The current approach works but has a fundamental weakness: regex-based PDF parsing of a multi-column newspaper layout is inherently fragile. This plan proposes a Claude API-powered approach that solves the core problem and sets up a much stronger foundation for the court research, investor matching, and recommendation features discussed in Monday's meeting.

---

## THE CORE PROBLEM WITH THE CURRENT APPROACH

The Sedgwick County Post is a multi-column newspaper PDF. When pdfplumber extracts text, it reads left-to-right across all columns on the same horizontal band, merging text from adjacent columns. This means:

- "1234 S Main St" in column 1 + "Law Firm, P.C." in column 2 becomes "1234 S MainLaw Firm"
- Address patterns, case numbers, and legal text get garbled
- Regex patterns break every time the newspaper changes column widths or layout
- We found 14 foreclosure cases from the civil docket (readable) but only extracted 1 real address out of 15

No amount of regex tuning will fully solve this. The newspaper layout will vary week to week, and edge cases will always appear.

---

## THE RECOMMENDED FIX: CLAUDE API FOR PDF EXTRACTION

### What it does
Instead of pdfplumber + regex, send the PDF directly to the Claude API (Anthropic's API). Claude is a multimodal AI that can natively read PDFs, understand multi-column layouts, and extract structured data with near-human accuracy. It doesn't care about column boundaries because it "sees" the page visually.

### How it works
```
Weekly PDF downloaded
        |
        v
Send to Claude API with a structured prompt:
  "Extract all mortgage foreclosure notices from this PDF.
   For each, return: case_number, plaintiff, defendant,
   address, city, sale_date, notice_type"
        |
        v
Claude returns structured JSON
        |
        v
Write to Google Sheets (same as now)
```

### Cost estimate
- Sedgwick County Post PDF: ~1.3MB, roughly 50-100 pages
- Claude API (Sonnet model) PDF input: approximately $0.50-1.50 per run
- Running once per week: **$2-6 per month**
- This is far cheaper than any SaaS subscription and dramatically more reliable than regex

### What changes in the code
The `extract_foreclosure_notices()` function gets replaced with roughly 30 lines of code:

```python
import anthropic
import base64
import json

def extract_foreclosure_notices_via_claude(pdf_bytes):
    client = anthropic.Anthropic()  # uses ANTHROPIC_API_KEY env var

    # Encode PDF for the API
    pdf_b64 = base64.standard_b64encode(pdf_bytes).decode("utf-8")

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=8000,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "document",
                    "source": {
                        "type": "base64",
                        "media_type": "application/pdf",
                        "data": pdf_b64
                    }
                },
                {
                    "type": "text",
                    "text": """Extract ALL mortgage foreclosure notices from this
                    Sedgwick County Post PDF. Return a JSON array where each
                    object has these fields:
                    - case_number (format: SG-YYYY-CV-XXXXXX)
                    - plaintiff (the lender/bank filing)
                    - defendant (the homeowner)
                    - address (street address of the property)
                    - city (Wichita, Derby, etc.)
                    - sale_date (if a sale date is listed, MM/DD/YYYY format)
                    - notice_type ("Suit" for Notice of Suit, "Sale" for
                      Notice of Sale/Sheriff's Sale)

                    Only include mortgage foreclosure cases (where the plaintiff
                    is a bank, mortgage company, loan servicer, or credit union).
                    Do NOT include other civil cases like personal injury,
                    contract disputes, etc.

                    Return ONLY the JSON array, no other text."""
                }
            ]
        }]
    )

    # Parse the JSON response
    notices = json.loads(response.content[0].text)
    return notices
```

### What stays the same
- Google Sheets write logic (unchanged)
- Appraiser lookup for beds/baths/sqft/county value (unchanged)
- Manufactured home filter (unchanged)
- Dashboard, Zapier, Lofty, Apps Script (all unchanged)

### Setup required
1. Create an Anthropic API account at console.anthropic.com
2. Add a credit card (pay-per-use, no subscription)
3. Generate an API key
4. Set it as an environment variable: `export ANTHROPIC_API_KEY=sk-ant-...`
5. Install the SDK: `pip install anthropic`
6. Replace the extraction function in the scraper

### Why this is better
- **100% solves the multi-column problem** - Claude reads PDFs visually, not as raw text
- **Self-healing** - if the newspaper changes layout, Claude adapts. No regex to maintain
- **Extracts ALL data** - addresses, dates, plaintiffs, defendants, notice types, all in one pass
- **Foundation for Phase 2** - the same API call can be extended to extract lien amounts, legal descriptions, and other data from the foreclosure notices
- **Cheap** - $2-6/month vs. hours of manual entry or ongoing regex maintenance

---

## EXPANDED ARCHITECTURE: WHAT BECOMES POSSIBLE

Once the Claude API is in the pipeline, the entire system becomes much more powerful:

### Court Research (Phase 2 from ARCHITECTURE_PLAN.md)
Mike's "huge" feature - automatically researching liens, judgments, and title clouds:

```
Case number from PDF extraction
        |
        v
Kansas Courts public website (ecf.kscourts.org or district court portal)
        |
        v
Download case documents / docket
        |
        v
Send to Claude API:
  "Extract: foreclosure amount, all liens, judgments,
   total encumbrances, title health assessment,
   estimated offer range"
        |
        v
Structured data -> Google Sheet new columns
        |
        v
Dashboard shows per-property research card
```

Cost: Another $0.50-1.00 per property per week. For 15 properties, that's $7-15/month total for both PDF extraction AND court research. Compare this to what Dan Drake spends in time researching each property manually.

### Investor Matching (Phase 4)
With structured data reliably extracted, matching becomes straightforward:

```
Investor preferences (from onboarding call transcript or form)
        |
        v
Claude API: "Score this property for this investor.
  Return: score (0-100), reasoning, deal-breakers"
        |
        v
Personalized dashboard view + weekly email
```

### MLS Expired/Withdrawn Pipeline (Phase 6)
Mike exports CSV from MLS weekly. This is actually easier than the PDF:

```
MLS CSV export
        |
        v
Parse CSV (trivial - no multi-column issues)
        |
        v
Enrich with appraiser + court data (same pipeline)
        |
        v
Same dashboard, different tab/section
```

---

## ALTERNATIVE DATABASE: SUPABASE INSTEAD OF GOOGLE SHEETS

### The problem with Google Sheets at scale
Google Sheets works fine for 50-100 properties. But as the system grows (court research columns, investor matching scores, MLS data, historical comps), it will hit limits:
- 10 million cell limit
- Slow API responses with large datasets
- No proper querying (filters, joins, aggregations)
- CSV export endpoint is fragile and has caching issues
- No real-time updates

### Why Supabase
Supabase is an open-source Firebase alternative built on PostgreSQL. It provides:
- **Free tier**: 500MB database, 50K monthly active users, 2 million edge function invocations
- **Real-time subscriptions**: dashboard auto-updates when new data is written
- **Row-level security**: investors see only what they should see (no more worrying about the Investors tab being exposed)
- **REST API**: auto-generated from your table schema, works perfectly with Next.js
- **Edge Functions**: can replace Google Apps Script for the weekly email
- **Auth**: built-in user authentication for future investor login/personalized views

### Migration path (non-disruptive)
This doesn't have to be a big-bang migration. The approach:

1. **Keep Google Sheets as the source of truth for now** - Mike is comfortable with it
2. **Add Supabase as a sync target** - scraper writes to both Google Sheets AND Supabase
3. **Point the dashboard at Supabase** - faster, more reliable, supports real-time
4. **Gradually move features to Supabase** - court research, investor matching, personalized views
5. **Eventually, Google Sheets becomes optional** - Mike can still view data there if he wants

### Cost
- Supabase Free tier: $0/month (sufficient for this use case for a long time)
- Pro tier (if needed later): $25/month (includes 8GB database, 100K MAU, custom domains)

---

## ALTERNATIVE AUTOMATION: N8N INSTEAD OF ZAPIER

### Current state
Two Zapier Zaps running:
1. New Filing row -> Lofty CRM -> Smart Plan 1
2. Stage changed to "Sale Date Assigned" -> Remove Plan 1 -> Apply Plan 2

### The concern
Zapier's free tier is very limited (100 tasks/month, 5 Zaps). Once the system processes more properties or adds more automations (court research triggers, investor notifications, MLS pipeline), it will quickly exceed free limits. Zapier pricing jumps to $20-30/month.

### n8n alternative
n8n is an open-source workflow automation tool (like Zapier but self-hosted or cloud):
- **Self-hosted**: free forever, runs on any server or even Philip's Mac
- **Cloud**: $20/month but with far more generous limits than Zapier
- **Key advantage**: can run Python scripts directly in workflows, so the scraper could be a workflow step rather than a separate cron job
- **Lofty integration**: n8n has HTTP request nodes that work with any API, including Lofty's

### Recommendation
Keep Zapier for now (the 2 Zaps work and are within free tier). Switch to n8n only if/when Zapier's limits become a constraint or when adding more complex automations in Phases 2-4.

---

## RECOMMENDED ARCHITECTURE (FULL PICTURE)

```
                        PHASE 1 (IMMEDIATE FIX)
                        =======================

  Sedgwick County Post PDF
           |
           v
  [Claude API - PDF Extraction]  <-- replaces pdfplumber+regex
           |
           v
  Structured JSON (case#, address, defendant, sale_date, type)
           |
           v
  [Python Script - Appraiser Lookup + Manufactured Filter]
           |
           v
  Google Sheets (unchanged)
           |
           +--> Zapier -> Lofty (unchanged)
           +--> Apps Script -> Weekly Email (unchanged)
           +--> Dashboard via CSV export (unchanged, fix row offset)


                     PHASE 2-3 (COURT RESEARCH)
                     ==========================

  Case numbers from PDF extraction
           |
           v
  [Python - Kansas Courts Scraper]
           |
           v
  [Claude API - Extract liens, judgments, amounts]
           |
           v
  Google Sheets (new columns)  AND/OR  Supabase (new tables)
           |
           v
  Enhanced Dashboard (court research cards, offer ranges)


                     PHASE 4+ (INVESTOR PLATFORM)
                     ============================

  Supabase (primary database)
      |
      +--> Next.js Dashboard (real-time, per-investor views)
      +--> Claude API (investor matching + scoring)
      +--> Edge Functions (personalized emails)
      +--> Auth (investor login)
      |
  Google Sheets (optional sync for Mike's convenience)
```

---

## COST SUMMARY (RECOMMENDED STACK)

| Component | Monthly Cost | Notes |
|-----------|-------------|-------|
| Claude API (PDF + court research) | $5-15 | Pay per use, scales with volume |
| Supabase | $0 | Free tier sufficient for 1+ year |
| Vercel | $0 | Free tier (hobby plan) |
| Google Sheets | $0 | Already part of Mike's Google Workspace |
| Zapier | $0 | Free tier (2 Zaps, <100 tasks/month) |
| Lofty CRM | Already paying | No additional cost |
| Domain (CNAME) | Already has it | mikekingrealestate.com |
| **Total additional** | **$5-15/month** | |

Compare to the current manual process: Mike spends 4+ hours/week on data entry and research. At his billing rate, that's $200-400+/month in time cost. The Claude API pays for itself in the first week.

---

## IMPLEMENTATION PRIORITY

| Step | What | Effort | Impact |
|------|------|--------|--------|
| 1 | Replace pdfplumber extraction with Claude API | 2 hours | Fixes the entire PDF problem permanently |
| 2 | Fix dashboard row-offset bug + deploy to Vercel | 1 hour | Dashboard goes live |
| 3 | Add court research via Claude API | 4-6 hours | The "huge" differentiator Mike wants |
| 4 | Add Supabase as sync target | 2-3 hours | Sets up for real-time dashboard + investor auth |
| 5 | Build investor matching | 4-6 hours | Personalized experience per investor |

Steps 1-2 can be done in a single session. Step 3 is the big value-add. Steps 4-5 are the platform play.

---

## WHAT NOT TO DO

- **Don't build a custom OCR pipeline** - Claude API handles PDF reading better than any custom solution
- **Don't migrate away from Google Sheets yet** - Mike knows it, it works for the Zapier/Lofty integration, and it's free. Add Supabase alongside, don't replace
- **Don't over-engineer the investor matching** - start with simple weighted scoring, not ML. 6 investors don't need a recommendation engine, they need a well-organized spreadsheet with good data
- **Don't self-host n8n yet** - Zapier works for the current 2 automations. Switch when it becomes a constraint
- **Don't try to fix the regex approach** - every hour spent tuning regex for this newspaper PDF is an hour wasted. The Claude API approach is simpler, cheaper, and permanent
