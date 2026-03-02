"""
MIKE KING REAL ESTATE
Sedgwick County Post - Foreclosure Notice Scraper
================================================

WHAT THIS DOES:
  1. Downloads the weekly Sedgwick County Post PDF
  2. Sends PDF to Claude API for structured extraction (handles multi-column layout)
  3. Looks up each property on the Sedgwick County Appraiser website
  4. Filters out manufactured homes automatically
  5. Adds new properties to the correct tab in Google Sheets:
     - Properties WITH a sale date  --> "Scheduled Sales" tab
     - Properties WITHOUT a sale date --> "New Filings" tab
  6. Skips any case numbers already in the sheet (no duplicates)

HOW TO RUN:
  python3 foreclosure_scraper.py

SCHEDULE (Mac/Linux cron):
  Run every Wednesday at 9am to catch the freshest weekly post.
  Cron example: 0 9 * * 3 /path/to/venv/bin/python3 /path/to/foreclosure_scraper.py

FIRST-TIME SETUP:
  1. Install dependencies (in virtual env):
     pip install anthropic requests beautifulsoup4 gspread google-auth
     pip install supabase
  2. Place google_credentials.json in the same folder as this script
  3. Share the Google Sheet with the service account email (Editor)
  4. Set environment variable: export ANTHROPIC_API_KEY=sk-ant-...
  4b. Set Supabase env vars (optional - scraper works without them):
      export SUPABASE_URL=https://fgcwbrolnxpfihqkvmcn.supabase.co
      export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
  5. Verify SPREADSHEET_ID below matches the ID in your Google Sheet URL
  6. Run once and verify output in scraper_log.txt
"""

import re
import os
import json
import time
import logging
import base64
import requests
from datetime import datetime
from bs4 import BeautifulSoup

# Claude API
import anthropic

# Google Sheets
import gspread
from google.oauth2.service_account import Credentials

# Supabase
try:
    from supabase import create_client
    SUPABASE_ENABLED = True
except ImportError:
    SUPABASE_ENABLED = False

# Supabase config (set env vars before running)
SUPABASE_URL = os.environ.get('SUPABASE_URL', '')
SUPABASE_SERVICE_ROLE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')
SEDGWICK_MARKET_ID = "00000000-0000-0000-0000-000000000001"

# -- LOGGING -------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s  %(levelname)s  %(message)s',
    handlers=[
        logging.FileHandler('scraper_log.txt'),
        logging.StreamHandler()
    ]
)
log = logging.getLogger(__name__)

# -- CONFIG - UPDATE THESE ----------------------------------------------------
SPREADSHEET_ID     = "1JCvukRernEhHJntzanSBk98UC6o6nuHPXvPF9buyu8w"   # Verified from Sheet URL
SHEET_SCHEDULED    = "Scheduled Sales"
SHEET_NEW_FILINGS  = "New Filings"
CREDENTIALS_FILE   = "google_credentials.json"

POST_PDF_URL       = "https://thesedgwickcountypost.com/POST.pdf"
APPRAISER_BASE_URL = "https://www.sedgwickcounty.org/assessor/property-search/"
REQUEST_DELAY      = 2   # Seconds between appraiser lookups - be respectful

# Claude API config
CLAUDE_MODEL       = "claude-sonnet-4-20250514"
CLAUDE_MAX_TOKENS  = 16000
# ------------------------------------------------------------------------------


def download_pdf(url: str) -> bytes:
    """Download the weekly PDF from the Sedgwick County Post."""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    log.info(f"Downloading PDF from {url}")
    r = requests.get(url, headers=headers, timeout=60)
    r.raise_for_status()
    log.info(f"Downloaded {len(r.content):,} bytes")
    return r.content


def extract_foreclosure_notices(pdf_bytes: bytes) -> list[dict]:
    """
    Send the PDF to Claude API for structured extraction of foreclosure notices.

    Claude reads the PDF visually, so multi-column newspaper layouts are not a
    problem. It extracts all mortgage foreclosure notices and returns structured
    JSON with case numbers, addresses, defendants, sale dates, and more.

    Returns a list of dicts with extracted data.
    """

    client = anthropic.Anthropic()  # uses ANTHROPIC_API_KEY env var

    pdf_b64 = base64.standard_b64encode(pdf_bytes).decode("utf-8")
    pdf_size_mb = len(pdf_bytes) / (1024 * 1024)
    log.info(f"Sending PDF to Claude API ({pdf_size_mb:.1f} MB, model: {CLAUDE_MODEL})")

    extraction_prompt = """You are analyzing a Sedgwick County Post newspaper PDF from Wichita, Kansas. This is a legal newspaper that publishes foreclosure notices and court filings.

Extract ALL mortgage foreclosure notices from this PDF. There are two types of notices to look for:

1. NOTICE OF SUIT (or "petition to foreclose") - These are new foreclosure filings. The plaintiff is a bank/lender/mortgage company suing a homeowner. They may NOT have a sale date yet.

2. NOTICE OF SALE / SHERIFF'S SALE - These are scheduled auctions. They WILL have a sale date (usually a Wednesday).

Also check the CIVIL DOCKET section, which lists cases in this format:
  LENDER NAME VS. ......... HOMEOWNER NAME ......... SG-YYYY-CV-XXXXXX
Only include cases where the plaintiff is clearly a mortgage lender, bank, loan servicer, or credit union.

For EACH mortgage foreclosure notice, extract these fields:
- case_number: The Sedgwick County case number in format SG-YYYY-CV-XXXXXX
- plaintiff: The lender/bank/mortgage company filing the foreclosure
- defendant: The homeowner(s) being foreclosed on
- address: The street address of the property (look for "commonly known as" or "property address" or similar)
- city: The city (Wichita, Derby, Andover, Haysville, Maize, Valley Center, Goddard, Park City, etc.)
- zip_code: The ZIP code if mentioned in the notice
- sale_date: The scheduled auction/sale date in MM/DD/YYYY format, if one is listed. Look for phrases like "Wednesday, March 5, 2026 at 10:00 a.m."
- notice_type: "Suit" for Notice of Suit/petition to foreclose, "Sale" for Notice of Sale/Sheriff's Sale
- foreclosure_amount: The dollar amount the lender is seeking (look for "judgment in the amount of" or similar), as a number without $ or commas
- attorney_name: The attorney or law firm listed in the notice

IMPORTANT RULES:
- ONLY include mortgage foreclosure cases (plaintiff is a bank, mortgage company, loan servicer, credit union, or similar financial institution)
- Do NOT include other civil cases (personal injury, contract disputes, divorce, tax cases, etc.)
- Do NOT include cases where the plaintiff is the IRS, a tax authority, a city/county government, or a private individual
- If a field cannot be found, set it to null
- For sale_date, always use MM/DD/YYYY format
- For foreclosure_amount, return just the number (no $ sign, no commas)

Return your response as a JSON array. Each element should be an object with exactly these fields:
  case_number, plaintiff, defendant, address, city, zip_code, sale_date, notice_type, foreclosure_amount, attorney_name

Return ONLY the JSON array, no other text or markdown formatting. If you find zero foreclosure notices, return an empty array: []"""

    try:
        response = client.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=CLAUDE_MAX_TOKENS,
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
                        "text": extraction_prompt
                    }
                ]
            }]
        )

        raw_text = response.content[0].text.strip()

        # Handle case where Claude wraps JSON in markdown code block
        if raw_text.startswith("```"):
            raw_text = re.sub(r'^```(?:json)?\s*', '', raw_text)
            raw_text = re.sub(r'\s*```$', '', raw_text)

        notices = json.loads(raw_text)

        if not isinstance(notices, list):
            log.error(f"Claude returned non-list type: {type(notices)}")
            return []

        log.info(f"Claude extracted {len(notices)} mortgage foreclosure notices")

        # Log usage info
        input_tokens = response.usage.input_tokens
        output_tokens = response.usage.output_tokens
        log.info(f"API usage: {input_tokens:,} input tokens, {output_tokens:,} output tokens")

        # Log summary
        with_address  = sum(1 for n in notices if n.get('address'))
        with_saledate = sum(1 for n in notices if n.get('sale_date'))
        with_amount   = sum(1 for n in notices if n.get('foreclosure_amount'))
        suits  = sum(1 for n in notices if n.get('notice_type') == 'Suit')
        sales  = sum(1 for n in notices if n.get('notice_type') == 'Sale')
        log.info(f"  Notices of Suit:  {suits}")
        log.info(f"  Notices of Sale:  {sales}")
        log.info(f"  With address:     {with_address}/{len(notices)}")
        log.info(f"  With sale date:   {with_saledate}/{len(notices)}")
        log.info(f"  With amount:      {with_amount}/{len(notices)}")

        return notices

    except anthropic.APIError as e:
        log.error(f"Claude API error: {e}")
        return []
    except json.JSONDecodeError as e:
        log.error(f"Failed to parse Claude response as JSON: {e}")
        log.error(f"Raw response (first 500 chars): {raw_text[:500]}")
        return []
    except Exception as e:
        log.error(f"Unexpected error in Claude extraction: {e}")
        return []


def lookup_property_appraiser(address: str, case_number: str) -> dict:
    """
    Look up property details from the Sedgwick County Appraiser website.
    Returns dict with: bedrooms, bathrooms, sq_ft, county_appraisal,
                       property_type, is_manufactured
    Returns empty result if property not found or lookup fails.
    """
    result = {
        'bedrooms':        None,
        'bathrooms':       None,
        'sq_ft':           None,
        'county_appraisal': None,
        'property_type':   None,
        'is_manufactured': False
    }

    if not address:
        log.warning(f"No address for {case_number} - skipping appraiser lookup")
        return result

    try:
        search_url = "https://www.sedgwickcounty.org/assessor/property-search/"
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

        session = requests.Session()
        session.get(search_url, headers=headers, timeout=15)

        search_data = {
            'address': address.split(',')[0].strip(),
            'submit':  'Search'
        }
        results = session.post(search_url, data=search_data, headers=headers, timeout=15)
        soup = BeautifulSoup(results.text, 'html.parser')
        page_text = results.text.upper()

        # Manufactured home filter (critical - Mike never works these)
        manufactured_keywords = [
            'MANUFACTURED', 'MOBILE HOME', 'MODULAR', 'HUD CODE',
            'MANUFACTURED HOUSING', 'MH -', 'MOBILE PARK'
        ]
        for keyword in manufactured_keywords:
            if keyword in page_text:
                result['is_manufactured'] = True
                result['property_type']   = 'Manufactured'
                log.info(f"MANUFACTURED HOME detected for {case_number} - will exclude")
                break

        # Extract property details from result tables
        tables = soup.find_all('table')
        for table in tables:
            for row in table.find_all('tr'):
                cells = row.find_all(['td', 'th'])
                if len(cells) >= 2:
                    label = cells[0].get_text(strip=True).upper()
                    value = cells[1].get_text(strip=True)

                    if 'BEDROOM' in label or label == 'BED':
                        try:
                            result['bedrooms'] = int(re.search(r'\d+', value).group())
                        except (AttributeError, ValueError):
                            pass

                    elif 'BATH' in label:
                        try:
                            result['bathrooms'] = float(re.search(r'[\d.]+', value).group())
                        except (AttributeError, ValueError):
                            pass

                    elif 'SQUARE' in label or 'SQ FT' in label or 'LIVING AREA' in label:
                        try:
                            result['sq_ft'] = int(re.sub(r'[^\d]', '', value))
                        except ValueError:
                            pass

                    elif 'APPRAISED' in label or 'TOTAL VALUE' in label or 'MARKET VALUE' in label:
                        try:
                            result['county_appraisal'] = int(re.sub(r'[^\d]', '', value))
                        except ValueError:
                            pass

                    elif 'PROP' in label and 'TYPE' in label:
                        result['property_type'] = value

        time.sleep(REQUEST_DELAY)

    except requests.RequestException as e:
        log.warning(f"Appraiser lookup failed for {case_number}: {e}")
    except Exception as e:
        log.warning(f"Parse error for {case_number}: {e}")

    return result


def get_existing_case_numbers(spreadsheet) -> set:
    """Get all case numbers already in both sheets to avoid duplicates."""
    existing = set()

    for sheet_name in [SHEET_SCHEDULED, SHEET_NEW_FILINGS]:
        try:
            ws = spreadsheet.worksheet(sheet_name)
            # Row 1 = title, Row 2 = headers, data starts at row 3
            # But col_values returns all values, and we skip row 1 (header)
            values = ws.col_values(1)
            for v in values[1:]:   # Skip header row
                if v and v.strip():
                    existing.add(v.strip().upper())
        except Exception as e:
            log.warning(f"Could not read {sheet_name}: {e}")

    log.info(f"Found {len(existing)} existing case numbers in sheet")
    return existing


def write_to_sheets(spreadsheet, new_scheduled: list, new_filings: list):
    """Append new rows to the appropriate sheet tabs."""

    # -- Write to Scheduled Sales -----------------------------------------------
    if new_scheduled:
        ws = spreadsheet.worksheet(SHEET_SCHEDULED)
        rows_to_add = []
        for p in new_scheduled:
            row = [
                p.get('case_number', ''),
                p.get('address', ''),
                p.get('city', ''),
                p.get('sale_date', ''),
                p.get('defendant', ''),
                p.get('bedrooms', ''),
                p.get('bathrooms', ''),
                p.get('sq_ft', ''),
                p.get('county_appraisal', ''),
                '',   # RPR Value - Mike fills in
                '',   # Opening Bid
                '',   # Auction Sale Price
                'Upcoming',
                f"Auto-imported {datetime.now().strftime('%m/%d/%Y')}",
                p.get('zip_code', ''),
                p.get('foreclosure_amount', ''),
                p.get('attorney_name', ''),
            ]
            rows_to_add.append(row)

        ws.append_rows(rows_to_add, value_input_option='USER_ENTERED')
        log.info(f"Added {len(rows_to_add)} rows to Scheduled Sales")

    # -- Write to New Filings ---------------------------------------------------
    if new_filings:
        ws = spreadsheet.worksheet(SHEET_NEW_FILINGS)
        rows_to_add = []
        for p in new_filings:
            row = [
                p.get('case_number', ''),
                datetime.now().strftime('%m/%d/%Y'),  # Date Filed = today
                p.get('address', ''),
                p.get('city', ''),
                p.get('defendant', ''),
                p.get('bedrooms', ''),
                p.get('bathrooms', ''),
                p.get('sq_ft', ''),
                p.get('county_appraisal', ''),
                '',   # RPR Value - Mike fills in
                'New Filing',
                '',   # Sale Date if assigned
                '',   # Touch 1 Sent
                '',   # Touch 2 Sent
                '',   # Touch 3 Sent
                f"Auto-imported {datetime.now().strftime('%m/%d/%Y')}",
                p.get('zip_code', ''),
                p.get('foreclosure_amount', ''),
                p.get('attorney_name', ''),
            ]
            rows_to_add.append(row)

        ws.append_rows(rows_to_add, value_input_option='USER_ENTERED')
        log.info(f"Added {len(rows_to_add)} rows to New Filings")


def connect_to_sheets():
    """Authenticate and connect to Google Sheets."""
    scopes = [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive',
    ]

    # Try service_account() method first (preferred in gspread 6.x)
    try:
        client = gspread.service_account(filename=CREDENTIALS_FILE)
        spreadsheet = client.open_by_key(SPREADSHEET_ID)
        return spreadsheet
    except Exception:
        pass

    # Fallback: legacy authorize() method
    creds = Credentials.from_service_account_file(CREDENTIALS_FILE, scopes=scopes)
    client = gspread.authorize(creds)
    return client.open_by_key(SPREADSHEET_ID)


def connect_to_supabase():
    """Connect to Supabase using service role key (bypasses RLS)."""
    if not SUPABASE_ENABLED:
        log.warning("supabase-py not installed. Run: pip install supabase")
        return None
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        log.warning("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set - skipping Supabase")
        return None
    try:
        client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        log.info("Connected to Supabase")
        return client
    except Exception as e:
        log.error(f"Failed to connect to Supabase: {e}")
        return None


def get_existing_supabase_cases(supabase_client) -> set:
    """Get all case numbers already in Supabase for Sedgwick County."""
    if not supabase_client:
        return set()
    try:
        result = supabase_client.table('properties') \
            .select('case_number') \
            .eq('market_id', SEDGWICK_MARKET_ID) \
            .execute()
        cases = {row['case_number'].upper() for row in result.data} if result.data else set()
        log.info(f"Found {len(cases)} existing case numbers in Supabase")
        return cases
    except Exception as e:
        log.error(f"Failed to read existing cases from Supabase: {e}")
        return set()


def write_to_supabase(supabase_client, properties: list):
    """Write properties to Supabase. Returns count of successfully inserted rows."""
    if not supabase_client or not properties:
        return 0

    inserted = 0
    for p in properties:
        notice_raw = p.get('notice_type', '')
        if notice_raw == 'Sale' or p.get('sale_date'):
            notice_type_val = 'scheduled_sale'
            stage_val = 'upcoming'
        else:
            notice_type_val = 'new_filing'
            stage_val = 'new_filing'

        row = {
            'market_id': SEDGWICK_MARKET_ID,
            'case_number': (p.get('case_number') or '').upper(),
            'address': p.get('address'),
            'city': p.get('city'),
            'zip_code': p.get('zip_code'),
            'state': 'KS',
            'defendant_name': p.get('defendant'),
            'plaintiff_name': p.get('plaintiff'),
            'property_type': p.get('property_type'),
            'bedrooms': p.get('bedrooms'),
            'bathrooms': p.get('bathrooms'),
            'sqft': p.get('sq_ft'),
            'county_appraisal': p.get('county_appraisal'),
            'foreclosure_amount': p.get('foreclosure_amount'),
            'sale_date': p.get('sale_date'),
            'notice_type': notice_type_val,
            'stage': stage_val,
            'attorney_name': p.get('attorney_name'),
            'source_url': POST_PDF_URL,
            'scraped_at': datetime.utcnow().isoformat(),
        }

        # Remove None values (Supabase doesn't like explicit nulls for some fields)
        row = {k: v for k, v in row.items() if v is not None}

        try:
            supabase_client.table('properties').insert(row).execute()
            inserted += 1
        except Exception as e:
            log.error(f"Supabase insert failed for {row.get('case_number')}: {e}")

    log.info(f"Wrote {inserted}/{len(properties)} properties to Supabase")
    return inserted


def run_scraper():
    """Main entry point - runs the full pipeline."""
    log.info("=" * 60)
    log.info("MIKE KING FORECLOSURE SCRAPER - Starting")
    log.info(f"Run time: {datetime.now().strftime('%A %B %d, %Y at %I:%M %p')}")
    log.info("=" * 60)

    # Verify API key is set
    if not os.environ.get('ANTHROPIC_API_KEY'):
        log.error("ANTHROPIC_API_KEY environment variable is not set.")
        log.error("Set it with: export ANTHROPIC_API_KEY=sk-ant-...")
        return

    # Step 1b: Connect to Supabase (optional - continues if unavailable)
    supabase_client = connect_to_supabase()

    # Step 1: Download the PDF
    try:
        pdf_bytes = download_pdf(POST_PDF_URL)
    except Exception as e:
        log.error(f"FAILED to download PDF: {e}")
        log.error("Check your internet connection or try the URL manually.")
        return

    # Step 2: Extract notices from PDF via Claude API
    notices = extract_foreclosure_notices(pdf_bytes)
    if not notices:
        log.warning("No foreclosure notices found. Check scraper_log.txt for details.")
        return

    # Step 3: Connect to Google Sheets
    try:
        spreadsheet = connect_to_sheets()
        log.info("Connected to Google Sheets successfully")
    except Exception as e:
        log.error(f"FAILED to connect to Google Sheets: {e}")
        log.error("ACTION NEEDED: Verify SPREADSHEET_ID in this script matches your Sheet URL.")
        log.error("  1. Open your Google Sheet in the browser")
        log.error("  2. Copy the ID from the URL: docs.google.com/spreadsheets/d/[ID HERE]/edit")
        log.error("  3. Update SPREADSHEET_ID at the top of this script")
        return

    # Step 4: Get existing case numbers to avoid duplicates
    existing_cases = get_existing_case_numbers(spreadsheet)

    # Step 4b: Get existing case numbers from Supabase too
    existing_supabase_cases = get_existing_supabase_cases(supabase_client)
    existing_cases = existing_cases.union(existing_supabase_cases)

    # Step 5: Process each notice
    new_scheduled         = []
    new_filings           = []
    skipped_manufactured  = 0
    skipped_duplicate     = 0

    for notice in notices:
        case_num = (notice.get('case_number') or '').upper()

        # Skip duplicates
        if case_num in existing_cases:
            log.info(f"SKIP (duplicate): {case_num}")
            skipped_duplicate += 1
            continue

        log.info(
            f"Processing: {case_num} | "
            f"{notice.get('address', 'NO ADDRESS')} | "
            f"type={notice.get('notice_type', '?')}"
        )

        # Look up property details from appraiser
        appraisal_data = lookup_property_appraiser(
            notice.get('address'),
            case_num
        )

        # Filter out manufactured homes
        if appraisal_data.get('is_manufactured'):
            log.info(f"EXCLUDED (manufactured home): {case_num}")
            skipped_manufactured += 1
            continue

        # Merge appraiser data into notice
        notice.update(appraisal_data)

        # Route to correct sheet based on whether we have a sale date
        if notice.get('sale_date'):
            new_scheduled.append(notice)
        else:
            new_filings.append(notice)

    # Step 6: Write results
    log.info(f"\nResults: {len(new_scheduled)} scheduled sales, {len(new_filings)} new filings")
    log.info(f"Skipped: {skipped_duplicate} duplicates, {skipped_manufactured} manufactured homes")

    # Step 6a: Write to Supabase FIRST
    all_new_properties = new_scheduled + new_filings
    if supabase_client and all_new_properties:
        write_to_supabase(supabase_client, all_new_properties)

    # Step 6b: Write to Google Sheets (secondary sync)
    write_to_sheets(spreadsheet, new_scheduled, new_filings)

    log.info("=" * 60)
    log.info("SCRAPER COMPLETE")
    log.info(f"  New scheduled sales added:   {len(new_scheduled)}")
    log.info(f"  New filings added:           {len(new_filings)}")
    log.info(f"  Manufactured homes excluded: {skipped_manufactured}")
    log.info(f"  Duplicates skipped:          {skipped_duplicate}")
    log.info(f"  Next step: fill in RPR Value (column J) manually for new rows")
    log.info("=" * 60)


if __name__ == "__main__":
    run_scraper()
