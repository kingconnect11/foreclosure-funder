# SCRAPER SETUP GUIDE
## How to Connect the Scraper to Your Google Sheet

This is a one-time setup. Takes about 20 minutes.

---

## STEP 1 - Create a Google Cloud Project

1. Go to https://console.cloud.google.com
2. Sign in with your Google account (the one that owns the foreclosure sheet)
3. Click the project dropdown at the top left (it may say "Select a project")
4. Click "New Project"
5. Name it: Mike King Foreclosure Scraper
6. Click "Create"
7. Wait for it to create, then make sure it is selected in the dropdown

---

## STEP 2 - Enable the Google Sheets API

1. In the left sidebar, click "APIs & Services" then "Library"
2. In the search bar, type "Google Sheets API"
3. Click it, then click "Enable"
4. Go back to Library, search "Google Drive API"
5. Click it, then click "Enable"

---

## STEP 3 - Create a Service Account (this is how the script logs in)

1. In the left sidebar, click "APIs & Services" then "Credentials"
2. Click "+ Create Credentials" at the top
3. Select "Service account"
4. Name it: foreclosure-scraper
5. Click "Create and Continue"
6. Under "Grant this service account access" - skip this, just click "Continue"
7. Click "Done"
8. You will see your new service account listed - click on it
9. Click the "Keys" tab
10. Click "Add Key" then "Create new key"
11. Select "JSON" and click "Create"
12. A file will download to your computer automatically
13. Rename that file to: google_credentials.json
14. Move it into the same folder as the foreclosure_scraper.py file

---

## STEP 4 - Share Your Google Sheet with the Service Account

1. Open the downloaded google_credentials.json file in any text editor (Notepad works)

2. Find the line that says "client_email" - copy that email address
   It will look like: foreclosure-scraper@mike-king-foreclosure-scraper.iam.gserviceaccount.com

3. Open your foreclosure Google Sheet in the browser

4. Click the green "Share" button in the top right

5. Paste the service account email address

6. Set permission to "Editor"

7. Uncheck "Notify people"

8. Click "Share"

---

## STEP 5 - Install Python Dependencies and Anthropic API Key

Open a Terminal (Mac) or Command Prompt (Windows) and run:

```
pip install anthropic requests beautifulsoup4 gspread google-auth
```

Then set your Anthropic API key as an environment variable:

**Mac/Linux:**
```
export ANTHROPIC_API_KEY=sk-ant-your-key-here
```

To make it permanent, add that line to your `~/.zshrc` or `~/.bash_profile` file.

**Windows:**
```
set ANTHROPIC_API_KEY=sk-ant-your-key-here
```

To get an API key:
1. Go to https://console.anthropic.com
2. Create an account and add a credit card (pay-per-use, about $2-6/month)
3. Go to API Keys and create a new key
4. Copy it and set it as shown above

---

## STEP 6 - Run the Scraper

1. Make sure these files are all in the same folder:
   - foreclosure_scraper.py
   - google_credentials.json

2. Open Terminal or Command Prompt, navigate to that folder:
   ```
   cd path/to/your/folder
   ```

3. Run:
   ```
   python foreclosure_scraper.py
   ```

4. Watch the output - it will tell you exactly what it found, what it skipped, and what it added

5. Open your Google Sheet and verify the new rows are there

---

## STEP 7 - Schedule It to Run Automatically

### On Mac (cron):
1. Open Terminal
2. Type: crontab -e
3. Add this line:
   ```
   0 9 * * 3 ANTHROPIC_API_KEY=sk-ant-your-key-here /path/to/venv/bin/python3 /path/to/foreclosure_scraper.py
   ```
4. Save and exit

### On Windows (Task Scheduler):
1. Open Task Scheduler (search for it in Start menu)
2. Click "Create Basic Task"
3. Name: Foreclosure Scraper
4. Trigger: Weekly, Wednesday, 9:00 AM
5. Action: Start a program
6. Program: python
7. Arguments: C:\path\to\foreclosure_scraper.py
8. Click Finish

---

## WHAT THE SCRAPER DOES AND DOES NOT DO

### It does automatically:
- Downloads the new PDF each week
- Sends it to Claude AI for intelligent extraction (handles the newspaper multi-column layout)
- Finds all foreclosure notices (both new suits and scheduled sales)
- Extracts case numbers, addresses, defendants, sale dates, foreclosure amounts, attorney names, and zip codes
- Checks each address at the Sedgwick County Appraiser for beds, baths, sqft, county value
- Excludes manufactured homes
- Skips properties already in your sheet
- Routes properties to the correct tab (Scheduled Sales vs New Filings)
- Logs everything so you can see exactly what happened

### You still do manually:
- Fill in RPR values (column J) - the appraiser does not have this
- Review and verify the auto-populated data before Friday
- Update Stage dropdown when properties sell, cancel, or get a sale date assigned

---

## TROUBLESHOOTING

**"ANTHROPIC_API_KEY environment variable is not set"**
Make sure you set the API key as described in Step 5. On Mac, run `echo $ANTHROPIC_API_KEY` to verify it is set.

**"Failed to download PDF"**
The Sedgwick County Post URL may have changed. Go to thesedgwickcountypost.com and right-click the PDF link to get the new URL, then update POST_PDF_URL in the script.

**"Failed to connect to Google Sheets"**
Make sure google_credentials.json is in the same folder as the script, and that you shared the sheet with the service account email from Step 4.

**"No foreclosure notices found"**
Check scraper_log.txt for details. If the Claude API returned an empty array, the PDF may not contain any foreclosure notices this week (unlikely but possible). Email the log file to your developer.

**"Claude API error"**
Check that your API key is valid and your account has credit. Go to console.anthropic.com to verify.

**Properties appear but some appraiser fields are blank**
The Sedgwick County Appraiser website layout may have changed. The case number and address will still be captured - just fill in the blanks manually for that week and report it so the appraiser parser can be updated.
