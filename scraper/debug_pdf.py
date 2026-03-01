"""
PDF DEBUG SCRIPT
Run this to show what the Post PDF actually looks like as text.
Paste the output back to Claude so the scraper patterns can be tuned.
Usage: python3 debug_pdf.py
"""

import re
import io
import requests
import pdfplumber

POST_PDF_URL = "https://thesedgwickcountypost.com/POST.pdf"

print("Downloading PDF...")
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
r = requests.get(POST_PDF_URL, headers=headers, timeout=30)
pdf_bytes = r.content
print(f"Downloaded {len(pdf_bytes):,} bytes\n")

with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
    full_text = ""
    for page in pdf.pages:
        text = page.extract_text()
        if text:
            full_text += text + "\n"

print(f"Total characters: {len(full_text):,}")
print(f"Total lines: {len(full_text.splitlines())}\n")

# -- Show first 3000 characters --
print("=" * 60)
print("FIRST 3000 CHARACTERS OF PDF TEXT:")
print("=" * 60)
print(full_text[:3000])

# -- Find all case numbers and show context around them --
case_numbers = list(re.finditer(r'SG-\d{4}-CV-\d{6}', full_text))
print(f"\n\n{'=' * 60}")
print(f"FOUND {len(case_numbers)} CASE NUMBERS TOTAL")
print("=" * 60)

for i, match in enumerate(case_numbers[:15]):  # Show first 15
    start = max(0, match.start() - 300)
    end = min(len(full_text), match.end() + 300)
    print(f"\n--- Case #{i+1}: {match.group()} ---")
    print(full_text[start:end])
    print()

# -- Show where NOTICE appears --
notices = list(re.finditer(r'NOTICE', full_text, re.IGNORECASE))
print(f"\n{'=' * 60}")
print(f"'NOTICE' APPEARS {len(notices)} TIMES")
print("=" * 60)
for n in notices[:10]:
    snippet = full_text[max(0, n.start()-20):n.start()+80]
    print(f"  ...{snippet}...")

# -- Show where FORECLOS appears --
foreclos = list(re.finditer(r'FORECLOS', full_text, re.IGNORECASE))
print(f"\n'FORECLOS' APPEARS {len(foreclos)} TIMES")
for f in foreclos[:10]:
    snippet = full_text[max(0, f.start()-20):f.start()+100]
    print(f"  ...{snippet}...")

print("\n\nDONE - paste everything above back to Claude")
