"""
Foreclosure Funder - One-time seed script
==========================================
Reads existing data from the Google Sheet and inserts into Supabase.

Tabs read:
  - "Investors" -> logs investor info (can't create profiles without auth.users)
  - "Scheduled Sales" -> properties table
  - "New Filings" -> properties table

Usage:
  1. pip install supabase gspread google-auth
  2. Set env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
  3. Ensure scraper/google_credentials.json exists
  4. python scripts/seed_from_sheets.py

This script is idempotent - it skips rows that already exist (by case_number
for properties).

Note: The Google Sheets have inconsistent formatting:
  - Title rows at the top of each tab
  - Scheduled Sales has NO header row (positional columns)
  - New Filings has headers at row 1
  - Investors has headers at row 1
"""

import os
import sys
import gspread
from supabase import create_client

# Config
SPREADSHEET_ID = "1JCvukRernEhHJntzanSBk98UC6o6nuHPXvPF9buyu8w"
CREDENTIALS_FILE = os.path.join(os.path.dirname(__file__), '..', 'scraper', 'google_credentials.json')
SEDGWICK_MARKET_ID = "00000000-0000-0000-0000-000000000001"
MIKE_DEAL_ROOM_ID = "00000000-0000-0000-0000-000000000002"


def get_supabase_client():
    url = os.environ.get('SUPABASE_URL')
    key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    if not url or not key:
        print("ERROR: Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars")
        sys.exit(1)
    return create_client(url, key)


def get_sheets_client():
    try:
        client = gspread.service_account(filename=CREDENTIALS_FILE)
        return client.open_by_key(SPREADSHEET_ID)
    except Exception as e:
        print(f"ERROR: Could not connect to Google Sheets: {e}")
        sys.exit(1)


def parse_int(val):
    """Parse an integer, stripping commas and whitespace."""
    try:
        return int(str(val).replace(',', '').strip()) if val else None
    except (ValueError, TypeError):
        return None


def parse_float(val):
    """Parse a float, stripping $, commas, and whitespace."""
    try:
        return float(str(val).replace(',', '').replace('$', '').strip()) if val else None
    except (ValueError, TypeError):
        return None


def find_header_row(all_values, marker_column):
    """Find the row index containing a specific column name (case-insensitive).

    Returns (header_index, headers_list) or (None, None) if not found.
    """
    marker_lower = marker_column.lower()
    for i, row in enumerate(all_values):
        for cell in row:
            if cell.strip().lower() == marker_lower:
                return i, [h.strip() for h in row]
    return None, None


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

    all_values = ws.get_all_values()
    header_idx, headers = find_header_row(all_values, 'Email')

    if header_idx is None:
        print("No 'Email' column found in Investors tab - skipping")
        return

    data_rows = all_values[header_idx + 1:]
    email_idx = next(i for i, h in enumerate(headers) if h.lower() == 'email')
    first_name_idx = next((i for i, h in enumerate(headers) if h.lower() == 'first name'), None)
    last_name_idx = next((i for i, h in enumerate(headers) if h.lower() == 'last name'), None)
    name_idx = next((i for i, h in enumerate(headers) if h.lower() == 'name'), None)

    print(f"Found {len(data_rows)} investors in Google Sheets:")
    for row in data_rows:
        email = row[email_idx].strip() if email_idx < len(row) else ''
        if not email:
            continue

        # Handle both "Name" and "First Name"/"Last Name" columns
        if first_name_idx is not None:
            first = row[first_name_idx].strip() if first_name_idx < len(row) else ''
            last = row[last_name_idx].strip() if last_name_idx is not None and last_name_idx < len(row) else ''
            name = f"{first} {last}".strip()
        elif name_idx is not None:
            name = row[name_idx].strip() if name_idx < len(row) else ''
        else:
            name = ''

        print(f"  - {name} ({email})")

    print(f"\nThese investors need to sign up (or be created via Auth admin API).")
    print(f"After signup, link to deal room:")
    print(f"  UPDATE profiles SET deal_room_id = '{MIKE_DEAL_ROOM_ID}' WHERE email = '<email>';")


def seed_new_filings(supabase, spreadsheet, existing_cases):
    """Seed properties from the New Filings tab (has header row)."""
    print("\n  --- New Filings ---")
    try:
        ws = spreadsheet.worksheet("New Filings")
    except gspread.WorksheetNotFound:
        print("  No 'New Filings' tab found - skipping")
        return 0, 0

    all_values = ws.get_all_values()
    header_idx, headers = find_header_row(all_values, 'Case Number')

    if header_idx is None:
        print("  No 'Case Number' column found - skipping")
        return 0, 0

    data_rows = all_values[header_idx + 1:]
    print(f"  Reading {len(data_rows)} rows")

    def col(name):
        """Get column index by header name (case-insensitive)."""
        name_lower = name.lower()
        for i, h in enumerate(headers):
            if h.lower() == name_lower:
                return i
        return None

    def get_val(row, col_name):
        idx = col(col_name)
        if idx is not None and idx < len(row):
            return row[idx].strip()
        return ''

    inserted = 0
    skipped = 0

    for row in data_rows:
        case_number = get_val(row, 'Case Number').upper()
        if not case_number:
            continue

        if case_number in existing_cases:
            skipped += 1
            continue

        # Map sheet stage to DB enum
        sheet_stage = get_val(row, 'Stage').lower()
        if sheet_stage in ('sold', 'redeemed', 'canceled'):
            stage = sheet_stage
        elif 'sale date' in sheet_stage or 'sale' in sheet_stage:
            stage = 'sale_date_assigned'
        elif 'upcoming' in sheet_stage:
            stage = 'upcoming'
        else:
            stage = 'new_filing'

        property_data = {
            'market_id': SEDGWICK_MARKET_ID,
            'case_number': case_number,
            'address': get_val(row, 'Address') or None,
            'city': get_val(row, 'City') or None,
            'state': 'KS',
            'defendant_name': get_val(row, 'Defendant / Owner') or get_val(row, 'Defendant') or None,
            'notice_type': 'new_filing',
            'bedrooms': parse_int(get_val(row, 'BD') or get_val(row, 'Bedrooms')),
            'bathrooms': parse_float(get_val(row, 'BA') or get_val(row, 'Bathrooms')),
            'sqft': parse_int(get_val(row, 'Sq Ft')),
            'county_appraisal': parse_float(get_val(row, 'County Appr') or get_val(row, 'County Appraisal')),
            'rpr_value': parse_float(get_val(row, 'RPR Value')),
            'foreclosure_amount': parse_float(get_val(row, 'Foreclosure Amount')),
            'stage': stage,
            'scraped_at': None,
        }

        sale_date_str = get_val(row, 'Sale Date (if assigned)') or get_val(row, 'Sale Date')
        if sale_date_str:
            property_data['sale_date'] = sale_date_str

        try:
            supabase.table('properties').insert(property_data).execute()
            existing_cases.add(case_number)
            inserted += 1
        except Exception as e:
            print(f"  ERROR inserting {case_number}: {e}")

    return inserted, skipped


def seed_scheduled_sales(supabase, spreadsheet, existing_cases):
    """Seed properties from the Scheduled Sales tab (NO header row - positional).

    Column positions (0-indexed):
      0: Case Number
      1: Address
      2: City
      3: Sale Date
      4: Defendant (usually empty)
      5: Bedrooms
      6: Bathrooms
      7: Sq Ft
      8: County Appraisal
      9: RPR Value
     10: (unused)
     11: Foreclosure Amount
     12: Stage
    """
    print("\n  --- Scheduled Sales ---")
    try:
        ws = spreadsheet.worksheet("Scheduled Sales")
    except gspread.WorksheetNotFound:
        print("  No 'Scheduled Sales' tab found - skipping")
        return 0, 0

    all_values = ws.get_all_values()

    # Find the first data row (skip title rows that just say "SCHEDULED FORECLOSURE SALES")
    data_start = None
    for i, row in enumerate(all_values):
        non_empty = [v for v in row if v.strip()]
        # Data rows have multiple non-empty cells and start with a case number pattern
        if len(non_empty) >= 3 and row[0].strip().upper().startswith('SG'):
            data_start = i
            break

    if data_start is None:
        print("  No data rows found - skipping")
        return 0, 0

    data_rows = all_values[data_start:]
    print(f"  Reading {len(data_rows)} rows (data starts at row {data_start})")

    inserted = 0
    skipped = 0

    for row in data_rows:
        # Skip rows without enough data
        if len(row) < 3:
            continue

        case_number = row[0].strip().upper()
        if not case_number or not case_number.startswith('SG'):
            continue

        if case_number in existing_cases:
            skipped += 1
            continue

        def safe_get(idx):
            return row[idx].strip() if idx < len(row) else ''

        # Map sheet stage to DB enum
        sheet_stage = safe_get(12).lower()
        if sheet_stage in ('sold', 'redeemed', 'canceled'):
            stage = sheet_stage
        elif 'upcoming' in sheet_stage:
            stage = 'upcoming'
        else:
            stage = 'sale_date_assigned'

        property_data = {
            'market_id': SEDGWICK_MARKET_ID,
            'case_number': case_number,
            'address': safe_get(1) or None,
            'city': safe_get(2) or None,
            'state': 'KS',
            'defendant_name': safe_get(4) or None,
            'notice_type': 'scheduled_sale',
            'bedrooms': parse_int(safe_get(5)),
            'bathrooms': parse_float(safe_get(6)),
            'sqft': parse_int(safe_get(7)),
            'county_appraisal': parse_float(safe_get(8)),
            'rpr_value': parse_float(safe_get(9)),
            'foreclosure_amount': parse_float(safe_get(11)),
            'stage': stage,
            'scraped_at': None,
        }

        sale_date_str = safe_get(3)
        if sale_date_str:
            property_data['sale_date'] = sale_date_str

        try:
            supabase.table('properties').insert(property_data).execute()
            existing_cases.add(case_number)
            inserted += 1
        except Exception as e:
            print(f"  ERROR inserting {case_number}: {e}")

    return inserted, skipped


def seed_properties(supabase, spreadsheet):
    """Seed properties from both tabs."""
    print("\n--- Seeding Properties ---")

    # Get existing case numbers to avoid duplicates
    existing = supabase.table('properties').select('case_number').eq('market_id', SEDGWICK_MARKET_ID).execute()
    existing_cases = {row['case_number'].upper() for row in existing.data} if existing.data else set()
    print(f"Found {len(existing_cases)} existing properties in Supabase")

    total_inserted = 0
    total_skipped = 0

    ins, skip = seed_scheduled_sales(supabase, spreadsheet, existing_cases)
    total_inserted += ins
    total_skipped += skip

    ins, skip = seed_new_filings(supabase, spreadsheet, existing_cases)
    total_inserted += ins
    total_skipped += skip

    print(f"\nProperties total: {total_inserted} inserted, {total_skipped} skipped (duplicates)")


if __name__ == '__main__':
    print("Foreclosure Funder - Seed from Google Sheets")
    print("=" * 50)

    supabase = get_supabase_client()
    spreadsheet = get_sheets_client()

    seed_investors(supabase, spreadsheet)
    seed_properties(supabase, spreadsheet)

    print("\n" + "=" * 50)
    print("Seeding complete.")
    print("\nNext steps:")
    print("  1. Have Philip and Mike sign up via the app")
    print("  2. Promote Philip to super_admin:")
    print("     UPDATE profiles SET role = 'super_admin' WHERE email = 'kingconnection@icloud.com';")
    print("  3. Promote Mike to admin and link deal room:")
    print("     UPDATE profiles SET role = 'admin', deal_room_id = '" + MIKE_DEAL_ROOM_ID + "' WHERE email = 'mike.king@lptrealty.com';")
    print("  4. Link deal room owner:")
    print("     UPDATE deal_rooms SET owner_id = (SELECT id FROM profiles WHERE email = 'mike.king@lptrealty.com') WHERE id = '" + MIKE_DEAL_ROOM_ID + "';")
    print("  5. As investors sign up, set their deal_room_id to link them to Mike's group")
