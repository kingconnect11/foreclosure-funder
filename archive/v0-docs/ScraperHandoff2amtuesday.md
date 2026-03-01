# Scraper Handoff - 2:00 AM Tuesday, February 24, 2026

## SESSION SUMMARY

This session focused on getting the PDF scraper operational. We diagnosed and fixed the Google Sheets connection error, rewrote the PDF extraction logic from scratch, and ran the scraper successfully against the live Sedgwick County Post PDF. The scraper now connects to Google Sheets and writes rows, but the data quality from the PDF needs significant improvement - specifically, address extraction is failing due to the multi-column newspaper layout.

---

## WHAT HAPPENED THIS SESSION

### 1. Fixed pip install issue
Philip was getting `externally-managed-environment` error on his Mac (Python managed by Homebrew). Created a virtual environment:
```
python3 -m venv ~/foreclosure-scraper-env
source ~/foreclosure-scraper-env/bin/activate
pip install pdfplumber requests beautifulsoup4 gspread google-auth
```
All packages installed successfully (pdfplumber 0.11.9, gspread 6.2.1).

### 2. Fixed Google Sheets connection error
The original SPREADSHEET_ID was wrong - `11BvthJcHKRRiC89KSGuBSDkp3I7GLEOJ` (33 chars, truncated).
Correct ID from Philip's Sheet URL: `1JCvukRernEhHJntzanSBk98UC6o6nuHPXvPF9buyu8w` (44 chars).
Updated in both:
- `SCRAPERfiles/foreclosure_scraper.py` (line 57)
- `foreclosure-dashboard/app/api/listings/route.js` (line 5)

Also updated `connect_to_sheets()` to try `gspread.service_account()` first (preferred in gspread 6.x) with legacy `gspread.authorize()` as fallback. Changed scope from `drive.readonly` to `drive` (full).

### 3. Diagnosed the multi-column PDF problem
Ran `debug_pdf.py` against the live PDF. Key findings:
- PDF is 1.3MB, extracts to 305,823 characters, 2,092 lines
- **103 total case numbers** found in the PDF
- The PDF is a multi-column newspaper layout (Sedgwick County Post)
- pdfplumber's `extract_text()` merges text from adjacent columns on the same horizontal line
- This garbles the NOTICE OF SUIT/SALE blocks, mixing addresses with attorney names, legal descriptions with article text
- Example: "South" from an address in column 1 merges with "Law, P.C." from column 2, producing "SouthLaw"
- The civil docket listing (PLAINTIFF VS. DEFENDANT ... CASE#) IS readable because the dot-leader format survives column mixing

### 4. Rewrote the extraction logic (two-pass approach)
Old approach: Split PDF text on "NOTICE OF" keywords, parse each block. Found only 1 notice.

New approach:
- **Pass 1 (docket mining):** Regex the civil docket table for `PLAINTIFF VS. ... DEFENDANT ... SG-YYYY-CV-XXXXXX` lines where plaintiff contains known lender keywords (MORTGAGE, BANK, LOAN SERVICING, NEWREZ, PHH, etc.). Found **14 cases** - huge improvement.
- **Pass 2 (context search):** For each case from Pass 1, search a 1200-char window around each occurrence of the case number in both standard and `layout=True` text, looking for addresses, sale dates, notice types.
- **Pass 3 (notice-only cases):** Catch any foreclosure NOTICE blocks with case numbers not found in the docket. Found **1 additional case**.

### 5. Ran the scraper successfully
```
Pass 1 (docket): found 14 mortgage foreclosure cases
Total foreclosure notices found: 15
  With address:    5/15
  With sale date:  1/15
Connected to Google Sheets successfully
Found 68 existing case numbers in sheet
Added 1 rows to Scheduled Sales
Added 14 rows to New Filings
```

Google Sheets connection works. Rows were written to both tabs. Google Cloud project name: "King Foreclosure Scraper".

---

## CURRENT ISSUES (PRIORITY ORDER)

### ISSUE 1: Address extraction failing (10/15 have no address)
**Severity: HIGH - this is the main blocker**

The multi-column PDF layout means addresses in NOTICE OF SUIT/SALE blocks get garbled. The 1200-char context window around each case number in the extracted text does not contain a clean, parseable street address in most cases.

Only 5/15 extracted an address:
- 4 of those 5 are **GARBAGE**: "1989 SCHU MANUFACT" and "1991 SCHU MANUFACT"
- 1 is **REAL**: "250 N. Rock Rd." (case SG-2026-CV-000308)

The garbage addresses are matching because the address regex `\d{1,5}\s+[NSEWnsew]\.?\s*[A-Za-z]...` interprets "1989 S..." as a street number + south direction. "SCHU MANUFACT" is actually "Schult Manufactured Home" text from the PDF (a mobile home brand description), not a street name.

**Fixes needed:**
1. Add address validation: reject patterns containing MANUFACT, SCHULT, MOBILE, HUD, MODULAR
2. Require a recognized street suffix (Ave, St, Dr, etc.) AND at least one word between the direction and the suffix
3. Consider a minimum address length and format check
4. The core problem (multi-column garbling) needs a different approach entirely - see alternative_architecture_possible_plan.md for the Claude API solution

### ISSUE 2: Notice type not being detected (all show type=None)
**Severity: MEDIUM**

The context search around case numbers in the docket isn't finding "NOTICE OF SUIT" or "NOTICE OF SALE" text. This is because:
- In the docket section of the PDF, cases appear as one-line listings with no "NOTICE" keyword nearby
- The actual NOTICE blocks are on different pages and the case number in those blocks is garbled by column mixing
- The `layout=True` text version doesn't help enough because the text is still interleaved

**Impact:** Without notice type, the scraper can't distinguish new filings from scheduled sales based on notice type. Currently it falls back to: has sale_date -> Scheduled Sales, no sale_date -> New Filings. This is actually correct behavior for the routing logic, so this is cosmetic.

### ISSUE 3: Only 1 sale date found
**Severity: LOW-MEDIUM**

Only 1 of 15 cases had a sale date extracted. This is likely correct - the February 17, 2026 edition probably has mostly new filings (NOTICE OF SUIT) with only 1 scheduled sale (NOTICE OF SALE). But it could also mean sale dates in other notices are being missed due to garbled text.

**To verify:** Check the actual PDF manually. If there's only 1 NOTICE OF SALE in this week's edition, the scraper is working correctly for sale dates.

### ISSUE 4: Manufactured home filter not effective
**Severity: MEDIUM**

The manufactured home filter relies on the appraiser lookup, which requires a valid address. Since most addresses are missing or garbage, the appraiser lookup either gets skipped (no address) or returns empty results (garbage address). The "1989 SCHU MANUFACT" entries should have been caught as manufactured homes but weren't because the appraiser couldn't find a property at that bogus address.

**Fix:** Add a pre-filter before appraiser lookup - if the extracted "address" contains MANUFACT, SCHULT, MOBILE, MODULAR, or HUD, skip that property immediately. This is a quick win.

### ISSUE 5: Rows written to sheet may have wrong data in wrong columns
**Severity: HIGH - Philip flagged this**

Philip said "we need to fix the way its displaying and the info its capturing for the sheet." The 14 rows written to New Filings and 1 row to Scheduled Sales likely have:
- Case numbers: correct (from docket)
- Defendant names: correct (from docket), but may have leftover dot-leaders or formatting artifacts
- Addresses: mostly blank, 4 have garbage "1989 SCHU MANUFACT"
- Sale dates: mostly blank (may be correct if most are new filings)
- Beds/baths/sqft/county appraisal: all blank (appraiser lookups failed or were skipped)

**The next agent should check the Google Sheet directly** to see what was actually written and clean up any garbage rows.

---

## FILE LOCATIONS

| File | Path | Status |
|------|------|--------|
| Scraper (updated) | `SCRAPERfiles/foreclosure_scraper.py` | Updated this session. Two-pass approach working, address extraction needs fixing |
| Debug script | `SCRAPERfiles/debug_pdf.py` | Diagnostic tool - downloads PDF, shows raw text + case numbers + context |
| Scraper log | `SCRAPERfiles/scraper_log.txt` | Contains output from both the failed run (old ID) and successful run (new ID) |
| Google credentials | `SCRAPERfiles/google_credentials.json` | Present and working |
| Virtual environment | `~/foreclosure-scraper-env/` | On Philip's Mac. Must run `source ~/foreclosure-scraper-env/bin/activate` before running scraper |
| Dashboard API route | `foreclosure-dashboard/app/api/listings/route.js` | Spreadsheet ID updated. Has a separate issue: parseCSV assumes Row 0 is title row (see below) |
| Dashboard page | `foreclosure-dashboard/app/page.js` | No changes this session |
| Original handoff | `Investor Foreclosure Dashboard HANDOFF 2:23:2026.md` | Still accurate for Lofty, Zapier, Apps Script, letters |
| Architecture plan | `ARCHITECTURE_PLAN.md` | Full roadmap through Phase 10 |
| Meeting transcript | `Transcribedmeetingmonday.rtf` | Monday meeting with Mike - discusses court research, offer ranges, investor preferences |

---

## DASHBOARD ISSUE (NOT YET FIXED)

The dashboard's `route.js` has a separate data-fetch problem identified earlier this session:

1. **Google Sheet must be made publicly viewable** - the dashboard uses Google's public CSV endpoint (`gviz/tq?tqx=out:csv`). Without public sharing, it returns a login page instead of data.

2. **parseCSV row offset bug** - Line 22-23 of `route.js`:
   ```javascript
   // Row 0 = title ("SCHEDULED FORECLOSURE SALES"), Row 1 = column headers, Row 2+ = data
   const headers = parseCSVLine(lines[1])
   ```
   This assumes Row 0 is a title row. If the actual sheet has headers starting in Row 1 (no title row above them), then `lines[0]` = headers, `lines[1]` = first data row (read as headers), and all data mapping breaks. **Need to verify the actual sheet structure and adjust the offset.**

---

## GOOGLE SHEET DETAILS

- **Sheet ID:** `1JCvukRernEhHJntzanSBk98UC6o6nuHPXvPF9buyu8w`
- **URL:** https://docs.google.com/spreadsheets/d/1JCvukRernEhHJntzanSBk98UC6o6nuHPXvPF9buyu8w/edit
- **Service account:** Connected and working (credentials in `google_credentials.json`)
- **Google Cloud project name:** "King Foreclosure Scraper"
- **68 existing case numbers** already in the sheet (pre-existing data Mike entered manually)
- **Tabs:** Scheduled Sales, New Filings, Investors (as documented in original handoff)
- **The sheet has NOT been made publicly viewable yet** (needed for dashboard)

---

## WHAT THE NEXT AGENT SHOULD DO

### Immediate (fix the scraper output quality):
1. **Check the Google Sheet** - look at the 15 rows that were just written. Delete any garbage rows (the "1989 SCHU MANUFACT" entries).
2. **Fix address regex** - add validation to reject manufactured home text, require proper street format
3. **Add pre-filter for manufactured homes** in extracted "addresses" before appraiser lookup
4. **Clean defendant names** - strip dot-leaders and formatting artifacts from docket extraction
5. **Test the manufactured home filter** with a real address to verify the appraiser scraping works

### Important (solve the core PDF problem):
6. **Strongly consider the Claude API approach** for PDF extraction (see `alternative_architecture_possible_plan.md`). This would completely solve the multi-column problem for about $1/month. The regex approach will always be fragile for this newspaper PDF format.
7. If staying with pdfplumber, try **column cropping**: detect column boundaries from word x-coordinates, crop each page into separate columns, extract each column's text independently.

### Dashboard:
8. **Fix the parseCSV row offset** in `route.js` - check if the sheet has a title row or starts with headers
9. **Have Mike make the sheet publicly viewable** (Share > Anyone with link > Viewer)
10. **Deploy to Vercel** - push to GitHub, connect to Vercel, add SPREADSHEET_ID env var, set CNAME

---

## PHILIP'S MAC ENVIRONMENT

- Machine: "Royalty" (iamtheking@Royalty)
- OS: macOS (Apple Silicon - arm64, based on pip wheel downloads)
- Python: python3 (system, via Homebrew)
- Virtual env: `~/foreclosure-scraper-env/` - has all scraper dependencies
- Scraper files: `/Users/iamtheking/Documents/Projects/Mike King Real Estate/SCRAPERfiles/`
- Terminal: zsh
- To run scraper: `source ~/foreclosure-scraper-env/bin/activate && python3 foreclosure_scraper.py`

---

## KEY RULES (from original handoff, still apply)

- **NEVER USE EM DASHES** - hyphens only (Mike's explicit rule)
- Dashboard aesthetic: dark navy (#0f1e35), amber (#f0a500), green (#3ecf8e), slate (#a8bbd4)
- Fonts: Playfair Display (headings), DM Mono (data), Inter (body)
- Foreclosure outreach tone: empathetic, confidential, no pressure
- Investor email tone: data-focused, efficient, professional
- Mike's contact: 316-841-4242, mike.king@lptrealty.com, LPT Realty
