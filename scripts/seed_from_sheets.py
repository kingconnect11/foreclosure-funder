"""
Foreclosure Funder - One-time seed script
==========================================
Reads existing data from the Google Sheet and inserts into Supabase.

Tabs read:
  - "Investors" -> profiles table (placeholder rows)
  - "Scheduled Sales" -> properties table
  - "New Filings" -> properties table

Usage:
  1. pip install supabase gspread google-auth
  2. Set env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
  3. Ensure scraper/google_credentials.json exists
  4. python scripts/seed_from_sheets.py

This script is idempotent - it skips rows that already exist (by case_number
for properties, by email for investors).
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


def seed_properties(supabase, spreadsheet):
    """Read Scheduled Sales and New Filings tabs into properties table."""
    print("\n--- Seeding Properties ---")

    # Get existing case numbers to avoid duplicates
    existing = supabase.table('properties').select('case_number').eq('market_id', SEDGWICK_MARKET_ID).execute()
    existing_cases = {row['case_number'].upper() for row in existing.data} if existing.data else set()
    print(f"Found {len(existing_cases)} existing properties in Supabase")

    inserted = 0
    skipped = 0

    for tab_name, default_notice_type in [("Scheduled Sales", "scheduled_sale"), ("New Filings", "new_filing")]:
        try:
            ws = spreadsheet.worksheet(tab_name)
        except gspread.WorksheetNotFound:
            print(f"  No '{tab_name}' tab found - skipping")
            continue

        rows = ws.get_all_records()
        print(f"  Reading {len(rows)} rows from '{tab_name}'")

        for row in rows:
            case_number = str(row.get('Case Number', '') or row.get('case_number', '')).strip().upper()
            if not case_number:
                continue

            if case_number in existing_cases:
                skipped += 1
                continue

            # Parse numeric fields safely
            def parse_int(val):
                try:
                    return int(str(val).replace(',', '').strip()) if val else None
                except (ValueError, TypeError):
                    return None

            def parse_float(val):
                try:
                    return float(str(val).replace(',', '').replace('$', '').strip()) if val else None
                except (ValueError, TypeError):
                    return None

            property_data = {
                'market_id': SEDGWICK_MARKET_ID,
                'case_number': case_number,
                'address': str(row.get('Address', '') or row.get('address', '')).strip() or None,
                'city': str(row.get('City', '') or row.get('city', '')).strip() or None,
                'zip_code': str(row.get('Zip', '') or row.get('zip_code', '')).strip() or None,
                'state': 'KS',
                'defendant_name': str(row.get('Defendant', '') or row.get('defendant', '')).strip() or None,
                'notice_type': default_notice_type,
                'bedrooms': parse_int(row.get('Bedrooms', '') or row.get('bedrooms', '')),
                'bathrooms': parse_float(row.get('Bathrooms', '') or row.get('bathrooms', '')),
                'sqft': parse_int(row.get('Sq Ft', '') or row.get('sq_ft', '')),
                'county_appraisal': parse_float(row.get('County Appraisal', '') or row.get('county_appraisal', '')),
                'foreclosure_amount': parse_float(row.get('Foreclosure Amount', '') or row.get('foreclosure_amount', '')),
                'attorney_name': str(row.get('Attorney', '') or row.get('attorney_name', '')).strip() or None,
                'scraped_at': None,  # Historical data, not scraped
            }

            # Parse sale date
            sale_date_str = str(row.get('Sale Date', '') or row.get('sale_date', '')).strip()
            if sale_date_str:
                property_data['sale_date'] = sale_date_str  # Supabase handles date parsing

            # Set stage
            if default_notice_type == 'scheduled_sale':
                property_data['stage'] = 'upcoming'
            else:
                property_data['stage'] = 'new_filing'

            try:
                supabase.table('properties').insert(property_data).execute()
                existing_cases.add(case_number)
                inserted += 1
            except Exception as e:
                print(f"  ERROR inserting {case_number}: {e}")

    print(f"\nProperties: {inserted} inserted, {skipped} skipped (duplicates)")


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
