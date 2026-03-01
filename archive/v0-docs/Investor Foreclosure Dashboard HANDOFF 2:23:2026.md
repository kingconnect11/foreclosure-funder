# Mike King Real Estate - Foreclosure Automation System
## Project Handoff Document
**Last Updated:** February 23, 2026
**Status:** Lofty + Zapier integration complete. PDF scraper is next.

---

## WHO THIS IS FOR

Philip (Mike King), licensed real estate agent and auctioneer with LPT Realty in Wichita, Kansas. He works foreclosure properties exclusively, serves a network of 6 investors with weekly updates, and is building a full automation system to replace 4+ hours of manual weekly work.

**Contact info embedded in all outputs:**
- Phone: 316-841-4242
- Email: mike.king@lptrealty.com
- Website: mikekingrealestate.com
- Brokerage: LPT Realty
- Address: 3234 E Douglas Ave, Wichita, KS 67208 (return address on letters)

---

## SYSTEM ARCHITECTURE - FULL PICTURE

```
Sedgwick County Post PDF (weekly)
         |
         v
[PHASE 3 - NEXT] PDF Scraper (Python)
         |
         v
Google Sheets (v4) - Master Data
   |              |
   |              v
   |        Zapier Zap 1 (New Filing row added)
   |              |
   |              v
   |        Lofty CRM - Create Contact
   |              |
   |              v
   |        Smart Plan 1: Foreclosure Homeowner Outreach
   |              (Touch 1 immediately, Touch 2 at Day 14, Touch 3 at Day 28)
   |
   |        Zapier Zap 2 (Stage changed to "Sale Date Assigned")
   |              |
   |              v
   |        Remove Smart Plan 1, Apply Smart Plan 2
   |              |
   |              v
   |        Smart Plan 2: Foreclosure Urgent - Sale Date Assigned
   |              (Single urgent letter, immediately)
   |
   v
Google Apps Script (every Friday 2pm)
         |
         v
Weekly Investor Email (personalized per investor)
         |
         v
Link to Vercel Dashboard: foreclosures.mikekingrealestate.com
```

---

## GOOGLE SHEET

**Sheet ID:** `11BvthJcHKRRiC89KSGuBSDkp3I7GLEOJ`
**URL:** https://docs.google.com/spreadsheets/d/11BvthJcHKRRiC89KSGuBSDkp3I7GLEOJ

**Three tabs:**

### Tab 1: Scheduled Sales
Properties with confirmed auction dates.

| Column | Header | Notes |
|--------|--------|-------|
| A | Case Number | SG-YYYY-CV-XXXXXX format |
| B | Address | Street address |
| C | City | Wichita, Derby, etc. |
| D | Sale Date | MM/DD/YYYY |
| E | Defendant / Owner | Homeowner name |
| F | BD | Bedrooms |
| G | BA | Bathrooms |
| H | Sq Ft | Square footage |
| I | County Appr | County appraised value |
| J | RPR Value | Realtors Property Resource AVM - Mike fills manually |
| K | Opening Bid | Lender's minimum at auction |
| L | Auction Sale Price | What it actually sold for (filled after auction) |
| M | Stage | Dropdown: Upcoming, Sold, Sold to Lender, Canceled/Satisfied |
| N | Notes | Free text |

**Stage color coding:**
- Upcoming = white (active, shows on dashboard)
- Sold = green #E2EFDA (keep as comp)
- Sold to Lender = orange #FCE4D6 (keep as comp)
- Canceled/Satisfied = gray #D9D9D9 (filter out)

### Tab 2: New Filings
Pre-foreclosure pipeline (no confirmed auction date yet).

| Column | Header | Notes |
|--------|--------|-------|
| A | Case Number | |
| B | Date Filed | When added to sheet |
| C | Address | |
| D | City | |
| E | Defendant / Owner | |
| F | BD | |
| G | BA | |
| H | Sq Ft | |
| I | County Appr | |
| J | RPR Value | Mike fills manually |
| K | Stage | Dropdown: New Filing, Sale Date Assigned, Moved to Scheduled Sales, Withdrawn/Redeemed |
| L | Sale Date (if assigned) | Only populated when Stage = Sale Date Assigned |
| M | Touch 1 Sent | Date logged when letter goes out |
| N | Touch 2 Sent | |
| O | Touch 3 Sent | |
| P | Notes | |

**Stage logic:**
- New Filing = just filed, no sale date, Zap 1 triggers here
- Sale Date Assigned = Zap 2 triggers here, switches to urgent letter
- Moved to Scheduled Sales = Mike manually moves row to Tab 1, updates this stage
- Withdrawn/Redeemed = homeowner resolved it, letter sequence stops

### Tab 3: Investors
Never exposed to dashboard or emails between investors. Pre-populated with 6 contacts.

| Name | Phone | Email |
|------|-------|-------|
| Rene Rodriguez | (316) 214-7570 | renerodriguez606@yahoo.com |
| Miles Milspaugh | (316) 393-7936 | miles@tri-mhomes.com |
| Dan Drake | (316) 204-4312 | dan@libertyasset.com |
| Brian Brundage | (316) 712-3767 | brianlbrundage@gmail.com |
| Ahmad Azimi | (316) 365-0430 | ahmadazim.22798@gmail.com |
| David Alvarado | (323) 483-2328 | jandsunderground@gmail.com |

---

## COMPLETED COMPONENTS

### 1. Google Sheet v4
**File:** `Current_Foreclosure_List_v4.xlsx` (in outputs)
- All three tabs built with correct columns, dropdowns, color coding, frozen headers
- Investor data pre-populated
- **STATUS: Uploaded to Google Sheets by Mike. Live and in use.**

### 2. Weekly Investor Email - Google Apps Script
**File:** `weekly_investor_email.gs` (in outputs)
- Reads Investors tab, sends personalized HTML email to each investor
- Branded dark navy header, clean layout
- Counts new filings and upcoming sales in subject line
- Includes link button to Vercel dashboard
- Trigger: every Friday at 2pm, created by running `createWeeklyTrigger()` once
- Sender: mike.king@lptrealty.com (Google Workspace, linked to Lofty)
- **STATUS: Built. Mike needs to install via Extensions > Apps Script and run createWeeklyTrigger().**

### 3. Homeowner Outreach Letters
**File:** `homeowner_letters.md` (in outputs)
Also generated as PDFs: `touch1_letter.pdf`, `touch2_letter.pdf`, `touch3_letter.pdf`, `touch3b_urgent_letter.pdf`

**Four letters total:**
- Touch 1 (Day 0): "The Options Approach" - warm intro, confidential, no pressure
- Touch 2 (Day 14): "The Story Angle" - social proof, family helped in Wichita
- Touch 3 (Day 28): "The Clock Is Running" - more urgent, equity at risk
- Touch 3b (Conditional): "Sale Date Assigned" - fires when Stage switches mid-sequence

**Important:** Bracket placeholders in the .md file ([Date], [Homeowner Name], etc.) must be replaced with Lofty merge tags. They are NOT automatic.

**NEVER USE EM DASHES** - Mike's explicit requirement. Use hyphens only.

### 4. Lofty CRM Smart Plans
- **STATUS: COMPLETE. Both Smart Plans built and saved in Lofty.**
- Smart Plan 1: "Foreclosure Homeowner Outreach" (Standard Plan, 3 letter steps)
  - Step 1: Touch 1 letter, immediately
  - Step 2: Touch 2 letter, 14 days after Step 1
  - Step 3: Touch 3 letter, 14 days after Step 2
  - Auto Pause: ON
- Smart Plan 2: "Foreclosure Urgent - Sale Date Assigned" (Standard Plan, 1 letter step)
  - Step 1: Touch 3b letter, immediately
  - Auto Pause: ON

Letter design: Mike found and edited a Lofty template. Letter content pasted in. Merge tags set for homeowner name and address.

### 5. Zapier Integration
- **STATUS: COMPLETE. Both Zaps built and turned on.**
- Lofty is connected to Zapier

**Zap 1 - New Filing to Lofty:**
- Trigger: Google Sheets - New Spreadsheet Row - "New Filings" tab
- Filter: Stage = "New Filing"
- Action 1: Lofty - Create or Update Contact (maps address, name, tag: foreclosure-outreach)
- Action 2: Lofty - Apply Smart Plan "Foreclosure Homeowner Outreach"

**Zap 2 - Sale Date Assigned:**
- Trigger: Google Sheets - Updated Spreadsheet Row - "New Filings" tab
- Filter: Stage = "Sale Date Assigned"
- Action 1: Lofty - Remove from Smart Plan "Foreclosure Homeowner Outreach"
- Action 2: Lofty - Apply Smart Plan "Foreclosure Urgent - Sale Date Assigned"

**Known gap:** Zip code is not a column in the sheet, so mailing zip may be blank on some Lofty contacts. May need to add a Zip column to New Filings tab or handle manually.

### 6. Investor Dashboard (Vercel)
**File:** `foreclosure-dashboard.zip` (in outputs)
**URL when live:** foreclosures.mikekingrealestate.com
**Tech stack:** Next.js 14, deployed on Vercel, pulls data from Google Sheet via public CSV endpoint

**What it shows:**
- Live stats: new this week / auction scheduled / active pre-foreclosure counts
- "New This Week" section: properties added in last 7 days, highlighted in amber
- "Coming to Auction" section: all Scheduled Sales with Upcoming stage
- "Active Pre-Foreclosure Pipeline" section: all New Filings with active stages
- Each card: case number, address, beds/baths/sqft, county appraisal, RPR value, sale date if applicable
- "Inquire with Mike" button on each card - opens pre-filled email to mike.king@lptrealty.com
- Investors tab is NEVER fetched - only property tabs are read

**STATUS: Built. NOT YET DEPLOYED. Mike needs to:**
1. Make Google Sheet publicly viewable (Share > Anyone with link > Viewer)
2. Push code to GitHub private repo
3. Connect to Vercel, add SPREADSHEET_ID env variable, deploy
4. Add CNAME record: foreclosures -> cname.vercel-dns.com
5. Update Apps Script email button URL to foreclosures.mikekingrealestate.com

### 7. PDF Scraper
**File:** `foreclosure_scraper.py` + `scraper_setup_guide.md` (in outputs)
**STATUS: BUILT BUT NOT YET TESTED OR DEPLOYED. THIS IS THE NEXT PRIORITY.**

---

## NEXT PRIORITY: PDF SCRAPER IMPLEMENTATION

This is the biggest remaining time-saver. Currently Mike manually enters every new foreclosure from the weekly PDF, which takes 2-3 hours. The scraper automates this entirely.

### What It Does
1. Downloads Sedgwick County Post PDF from `https://thesedgwickcountypost.com/POST.pdf`
2. Extracts all foreclosure notices (both NOTICE OF SUIT and NOTICE OF SALE)
3. Looks up each address at Sedgwick County Appraiser for beds/baths/sqft/county value
4. **Filters out manufactured homes automatically** (critical - Mike never works these)
5. Routes properties to correct tab:
   - Has sale date -> Scheduled Sales tab
   - No sale date -> New Filings tab
6. Skips case numbers already in sheet (no duplicates)
7. Logs everything to scraper_log.txt

### What It Does NOT Do
- Fill in RPR Value (column J) - no public API, Mike still does this manually
- That's the only remaining manual data entry task

### Known Issues to Address
The scraper was built based on known PDF structure but **has not been tested against a live PDF** because the sandbox environment can't reach thesedgwickcountypost.com. The regex patterns for extracting notice text may need tuning once Mike runs it against a real PDF.

**Most likely areas needing adjustment:**
- The notice block splitting regex (currently splits on "NOTICE OF")
- Address extraction pattern (Kansas address formats)
- Sedgwick County Appraiser web scraping (site layout may differ from assumptions)

### How to Test and Debug
1. Mike runs: `python foreclosure_scraper.py`
2. Check `scraper_log.txt` for what was found
3. If notices found = 0: the PDF structure is different than expected, need to re-examine
4. If appraiser data is blank: the appraiser site layout needs updating
5. Share the log output so patterns can be adjusted

### Scraper Setup Requirements
Mike needs to complete one-time Google Cloud setup:
1. Create Google Cloud project
2. Enable Google Sheets API and Google Drive API
3. Create Service Account, download `google_credentials.json`
4. Share the Google Sheet with the service account email (Editor)
5. Place `google_credentials.json` in same folder as `foreclosure_scraper.py`
6. Run: `pip install pdfplumber requests beautifulsoup4 gspread google-auth`
7. Schedule via Windows Task Scheduler or cron (recommended: Wednesday 9am)

Full instructions are in `scraper_setup_guide.md`.

### PDF Structure Notes
Sedgwick County foreclosure process:
- Mortgage foreclosures published in Sedgwick County Post, 3 weeks before sale
- Sales happen every Wednesday at 10am at the courthouse
- Case number format: SG-YYYY-CV-XXXXXX
- Two notice types in the PDF:
  - NOTICE OF SUIT = new filing, no sale date yet -> New Filings tab
  - NOTICE OF SALE / SHERIFF'S SALE = has confirmed date -> Scheduled Sales tab
- Physical PDF at: https://thesedgwickcountypost.com/POST.pdf
- Mike has a subscription to the Post

### Manufactured Home Filter
**This is the most critical business rule.** Mike never works manufactured/mobile homes.
The Sedgwick County Appraiser database flags property type.
Keywords that indicate manufactured home: MANUFACTURED, MOBILE HOME, MODULAR, HUD CODE, MH -
If any of these appear in the appraiser page for a property, skip it entirely.

---

## WEEKLY WORKFLOW (current state, post-automation)

**Wednesday after 10am:** Auctions happen at courthouse. Mike updates Scheduled Sales outcomes (change Stage to Sold, Sold to Lender, or Canceled/Satisfied, fill in Auction Sale Price).

**Wednesday/Thursday:** New Sedgwick County Post PDF published. Scraper runs automatically (once deployed), pre-populates both tabs. Mike reviews for accuracy, fills in RPR values (column J) for new properties.

**Thursday:** Mike's main review day. Confirm auto-imported data, fill RPR values, update any Stage changes from the week, move Sale-Date-Assigned properties as needed.

**Friday 2pm:** Investor email sends automatically via Apps Script. New properties featured, button links to dashboard.

**Ongoing:** Any new row added to New Filings with Stage = "New Filing" triggers Zapier -> Lofty contact created -> homeowner letter sequence starts automatically.

---

## DATA SOURCES

| Source | What it provides | How accessed |
|--------|-----------------|--------------|
| Sedgwick County Post | New foreclosure filings, scheduled sale notices | Weekly PDF subscription |
| Sedgwick County Appraiser | Beds, baths, sqft, county appraisal, property type/manufactured flag | sedgwickcounty.org - web scraping |
| RPR (Realtors Property Resource) | Estimated market value (AVM) | Manual - Mike looks up, no public API at his NAR tier |
| County case lookup | Liens, judgments | Manual as needed |

---

## TECHNICAL STACK

| Component | Technology |
|-----------|-----------|
| Data storage | Google Sheets |
| Investor email | Google Apps Script |
| Homeowner outreach | Lofty CRM Smart Plans |
| Zap automation | Zapier |
| Investor dashboard | Next.js 14 on Vercel |
| PDF scraper | Python (pdfplumber, requests, beautifulsoup4, gspread) |
| Domain | foreclosures.mikekingrealestate.com (CNAME pending) |
| Email | Google Workspace - mike.king@lptrealty.com (auto-syncs to Lofty) |

---

## FILES DELIVERED (all in outputs folder)

| File | Description | Status |
|------|-------------|--------|
| Current_Foreclosure_List_v4.xlsx | Master spreadsheet | Live in Google Sheets |
| weekly_investor_email.gs | Apps Script for Friday emails | Needs installation |
| homeowner_letters.md | All 4 letter copy with placeholders | Used in Lofty |
| touch1_letter.pdf | Touch 1 as clean PDF | Available if needed |
| touch2_letter.pdf | Touch 2 as clean PDF | Available if needed |
| touch3_letter.pdf | Touch 3 as clean PDF | Available if needed |
| touch3b_urgent_letter.pdf | Urgent letter as clean PDF | Available if needed |
| foreclosure_scraper.py | PDF scraper main script | Needs testing |
| scraper_setup_guide.md | Google Cloud setup instructions | Reference |
| foreclosure-dashboard.zip | Full Vercel dashboard codebase | Needs deployment |

---

## OUTSTANDING ACTION ITEMS FOR MIKE

In priority order:

1. **[NEXT SESSION] Test and debug the PDF scraper** - run it, share the log, fix patterns
2. Deploy the Vercel dashboard (unzip, push to GitHub, connect to Vercel, add env var)
3. Add CNAME record for foreclosures.mikekingrealestate.com
4. Install Apps Script (Extensions > Apps Script, paste code, run createWeeklyTrigger())
5. Update Apps Script button URL to foreclosures.mikekingrealestate.com once domain is live
6. Make Google Sheet publicly viewable (required for dashboard to read data)
7. Consider adding Zip Code column to New Filings tab to fix the Lofty mailing address gap

---

## IMPORTANT PREFERENCES AND RULES

- **NEVER USE EM DASHES** in any copy or code comments. Hyphens only.
- All letter copy must feel personal and human, not like marketing spam
- Foreclosure outreach tone: empathetic, confidential, no pressure, professional
- Investor email tone: data-focused, efficient, professional
- Dashboard aesthetic: dark navy, amber accents, financial-data feel (Bloomberg-inspired)
- Color palette: Navy #0f1e35, Amber #f0a500, Green #3ecf8e, Slate #a8bbd4
- Fonts: Playfair Display (headings), DM Mono (data/labels), Inter (body)

---

## PHASE 4 (FUTURE - NOT STARTED)

Auto-populate RPR values via API. Mike is a NAR member with RPR access. RPR has an API but availability depends on his specific NAR membership tier. This would eliminate the last remaining manual data entry task. Needs investigation once scraper is stable.
