# FORECLOSURE FUNDER — Founding Architecture Document

**Version:** 1.0
**Date:** March 1, 2026
**Authors:** Philip King (Co-Founder / CTO), Mike King (Co-Founder / Head of Sales & Market Operations)
**Status:** Living document — primary source of truth for all development

---

## TABLE OF CONTENTS

1. [Company Overview](#1-company-overview)
2. [Product Vision](#2-product-vision)
3. [Target Market & User Personas](#3-target-market--user-personas)
4. [Product Architecture — Two Products, One Suite](#4-product-architecture--two-products-one-suite)
5. [Feature Specification by Tier](#5-feature-specification-by-tier)
6. [Business Model & Pricing](#6-business-model--pricing)
7. [Technical Architecture](#7-technical-architecture)
8. [Database Schema (Supabase)](#8-database-schema-supabase)
9. [Authentication & Authorization](#9-authentication--authorization)
10. [The Onboarding Interview System](#10-the-onboarding-interview-system)
11. [The CRM Pipeline](#11-the-crm-pipeline)
12. [The Recommendation Engine](#12-the-recommendation-engine)
13. [Data Pipeline — Scraping, Court Research, Property Intelligence](#13-data-pipeline)
14. [iOS App Strategy](#14-ios-app-strategy)
15. [Security Architecture](#15-security-architecture)
16. [Multi-Market Expansion Playbook](#16-multi-market-expansion-playbook)
17. [Current State of the Codebase (as of March 2026)](#17-current-state-of-the-codebase)
18. [What Came from the Original Plan vs. This Document](#18-lineage)
19. [Development Phases & Roadmap](#19-development-phases--roadmap)
20. [Hiring Plan & Company Building](#20-hiring-plan--company-building)
21. [Research Task Prompts for Parallel Chats](#21-research-task-prompts)
22. [Open Questions & Decisions Pending](#22-open-questions)

---

## 1. COMPANY OVERVIEW

**Name:** Foreclosure Funder
**Entity:** Delaware LLC (to be formed)
**Founders:** Philip King (50%) and Mike King (50%)
**Relationship:** Brothers. Philip is based in San Francisco (technology/development). Mike is based in Wichita, Kansas (real estate market knowledge, investor relationships, sales).
**Initial Market:** Sedgwick County and Butler County, Kansas
**Expansion Path:** Kansas statewide → Kansas City metro (Missouri) → additional markets
**Monthly Infrastructure Budget:** $200-500 (scaling to $1,000 with traction)

### Roles

- **Philip King — Co-Founder / CTO / Super Admin**
  - All software development (until first developer hire)
  - Product architecture and technical decisions
  - Onboarding interviews (product/technical questions)
  - Only person who can modify super admin settings, database schema, and critical infrastructure

- **Mike King — Co-Founder / Head of Sales & Market Operations / Admin**
  - All investor relationships and sales
  - Market intelligence and real estate expertise
  - Onboarding interviews (market/investment questions)
  - Manual data entry (RPR values, property notes, drive-by assessments)
  - Admin access to his own deal room and all investors within it

---

## 2. PRODUCT VISION

### The Problem

Real estate investors, particularly those focused on foreclosure properties, spend 4+ hours per week on manual research: reading legal publications, searching court records for liens, looking up property values, cross-referencing multiple data sources, and tracking their deal pipeline in spreadsheets or their heads. Real estate agents who serve these investors spend even more time aggregating this data and distributing it manually.

### The Solution

Foreclosure Funder is a two-sided platform:

1. **For Real Estate Investors (the SaaS product):** A personalized dashboard that aggregates foreclosure listings, court research, property intelligence, and a CRM pipeline — all tailored to each investor's preferences, risk tolerance, and budget. Think of it as "a Bloomberg terminal for foreclosure investing, but built for humans, not quants."

2. **For Real Estate Agents / Group Managers (the Deal Room product):** An admin tool that lets agents like Mike manage a portfolio of investors, brand their own deal room, automate homeowner outreach, track which investors are looking at which properties, and provide concierge-level service at scale.

### The Long-Term Vision

Foreclosure Funder is the first product in what will become a larger real estate investment platform suite. The foreclosure-specific tooling is the entry point because it's the most underserved and the most painful. Over time, the platform expands to cover expired/withdrawn MLS listings (for line-of-credit investors who close in 20-30 days), general investment property sourcing, and possibly commercial real estate. The platform should be architected so that "foreclosure" is one data source among many, not a hard-coded assumption.

---

## 3. TARGET MARKET & USER PERSONAS

### Primary Persona: The Cash-Ready Foreclosure Investor

- **Who:** Seasoned real estate investor with liquid cash ($30K-$200K+ readily available)
- **Behavior:** Attends foreclosure auctions, needs same-day information, has own contractors
- **Pain point:** Researching court records, liens, and title health takes hours per property
- **Example:** Dan Drake (Mike's most active investor) — spends most of his time researching court cases and title clouds
- **Willingness to pay:** High ($29-49/month for time savings)

### Secondary Persona: The Financed Investor

- **Who:** Investor who uses bank lines of credit, closes in 20-30 days
- **Behavior:** More selective, needs deeper property analysis, not auction-dependent
- **Pain point:** Finding the right deal among expired/withdrawn listings, coordinating with lender
- **Example:** Not yet in beta group, but Mike knows many
- **Phase:** Phase 2+ (expired MLS listings pipeline)

### Tertiary Persona: The New/Aspiring Investor

- **Who:** Someone who decides on a Friday night they want to get into real estate investing
- **Behavior:** Browsing, learning, looking for guidance and confidence
- **Pain point:** Doesn't know where to start, doesn't have relationships
- **Example:** Future free-tier users discovering the platform
- **Phase:** Phase 3+ (self-service onboarding, educational content)

### Agent Persona: The Real Estate Agent (Deal Room Buyer)

- **Who:** A licensed real estate agent (like Mike) who serves a group of investors
- **Behavior:** Needs to manage multiple investors' interests, provide weekly updates, track deals
- **Pain point:** Manual spreadsheet management, generic CRM tools that don't understand foreclosures
- **Example:** Mike King (our first and reference customer)
- **Willingness to pay:** $1,100 setup + $29/seat/month

### Future Persona: Institutional Investors

- **Who:** Family offices, PE firms, investor groups that pool capital
- **Behavior:** Need data rooms, compliance tracking, multi-user access with permissions
- **Phase:** Far future (12+ months), but architecture should not prevent this

---

## 4. PRODUCT ARCHITECTURE — TWO PRODUCTS, ONE SUITE

### Product 1: Foreclosure Funder (Investor Dashboard)

The customer-facing SaaS product. Accessible via web (foreclosurefunder.com) and iOS app.

**Core features:**
- Personalized property feed based on investor preferences
- Property detail pages with court research, lien analysis, offer range estimates
- CRM pipeline (save → research → offer → close/reject)
- Recommendation scores with explanations
- Anonymous "X others watching this property" indicator
- Saved searches and alerts
- Investment history tracking
- Notes and documents per property

### Product 2: Deal Room (Agent Admin Tool)

The B2B product sold to real estate agents. White-labeled for each agent's brand.

**Core features:**
- Branded deal room setup (agent's logo, colors, contact info)
- Investor management (onboard, monitor activity, track pipelines)
- Property note sharing (agent can add drive-by notes visible to their group)
- Homeowner outreach automation (letter campaigns via Lofty CRM integration)
- Weekly digest automation (personalized emails to each investor)
- Group settings (enable/disable inter-investor visibility with consent)
- Admin dashboard showing all investor activity across all properties
- Manual data entry interface for RPR values and property notes

### Shared Backend

Both products share:
- Supabase database (properties, court research, investor profiles, pipelines)
- Scraper infrastructure (foreclosure listings, court records, appraiser data)
- Recommendation engine
- Authentication system (Supabase Auth)
- API layer (Next.js API routes or Supabase Edge Functions)

### Role Hierarchy

| Role | Access Level | Who |
|------|-------------|-----|
| Super Admin | Everything. Schema changes, all deal rooms, all investor data, system settings | Philip only |
| Admin | Their own deal room + all investors in it. Can see all investor pipelines. Cannot see other deal rooms. | Mike, future agents |
| Investor (Standard) | Their own dashboard, pipeline, notes. Cannot see other investors unless in same group with consent. | Paying subscribers |
| Investor (Free) | Limited property info (address + sale date). Preview of full features. | Free-tier users |

---

## 5. FEATURE SPECIFICATION BY TIER

### Free Tier

- View 2-3 property listings per session (limited, similar to a "people search" paywall)
- Basic info only: address, sale date
- No defendant names, no court research, no recommendation scores
- Preview sidebar showing what they're missing (mock example of full property detail)
- Can create account and save up to 3 properties
- Limited pipeline (save only, no status tracking)
- Resources & educational content (blog posts, guides)

### Standard Tier ($19-29/month)

- Full property listings with all data fields
- Court research: liens, judgments, title health, foreclosure amount
- County appraiser data: beds, baths, sqft, assessed value
- Recommendation scores with explanations
- Full CRM pipeline with all stages
- Unlimited saves and notes
- Property alerts (new listings matching preferences)
- "X others watching" anonymous indicator
- Onboarding interview (transcript-processed personalization)
- Investment history tracking
- Mobile app access

### Premium Tier ($39/month annual, $49/month monthly)

- Everything in Standard
- AI voice agent for cold-calling property owners (gauge interest, qualify leads)
- Priority notifications (new listings pushed immediately vs. daily digest)
- Detailed comparable sales data (nearby comps, what they sold/rent for)
- Visual data (maps, street view, satellite imagery)
- Document preparation services (pre-filled offer documents)
- Zapier/automation integration setup assistance
- Direct access to agent (for Deal Room investors) or priority support

### Deal Room Add-On ($1,100 Setup + $29/seat/month)

- Custom branded deal room
- Full onboarding meeting with Philip and Mike
- Onboarding session for all investors (30-45 min group call)
- Up to 2 custom feature requests
- Agent admin panel
- Homeowner outreach automation (Zapier + Lofty or equivalent CRM)
- Weekly automated investor digests
- 7-day free trial per seat

---

## 6. BUSINESS MODEL & PRICING

### Revenue Streams

1. **Subscriptions (primary):** Monthly/annual SaaS fees from investors
2. **Deal Room Setup (secondary):** One-time setup fee for agents
3. **Per-Seat Licensing (secondary):** Monthly fees for each investor in a deal room
4. **Add-On Services (future):** Zapier setup, CRM integration, document preparation, legal referrals, lender partnerships

### Pricing Table

| Tier | Monthly | Annual (per month) | Notes |
|------|---------|-------------------|-------|
| Free | $0 | $0 | Limited access, lead generation |
| Standard | $29 | $19 | Full investor dashboard |
| Premium | $49 | $39 | Voice agent, priority alerts, docs |
| Deal Room Setup | $1,100 | — | One-time, includes onboarding |
| Deal Room Seat | $29/seat | — | Per investor in the deal room |

### Beta Period

- First 5-10 users: 60-day free trial
- Mike tests the waters on willingness to pay before charging
- Beta users are guinea pigs who provide feedback at every step
- We assign a value to the software even during free trial ($29/month value)

### Revenue Split

- 50/50 between Philip and Mike
- All initial revenue reinvested in the business
- Shares reserved: allocations for Philip's father, nieces, and nephews (TBD)
- Goal: begin drawing income as soon as sustainable

---

## 7. TECHNICAL ARCHITECTURE

### Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend (Web) | Next.js 14+ | Dashboard, Deal Room admin, marketing site |
| Frontend (Mobile) | React Native + Expo | iOS & Android (when ready); PWA in the interim |
| Backend / API | Next.js API Routes + Supabase Edge Functions | Business logic, data transformation |
| Database | Supabase (PostgreSQL) | Source of truth for all data |
| Auth | Supabase Auth | Email/password, Sign in with Apple, Google |
| File Storage | Supabase Storage | Documents, images, onboarding transcripts |
| Scraper | Python (Claude API + BeautifulSoup) | PDF extraction, court research, appraiser lookup |
| Legacy Sync | Google Sheets (read/write) | Mike's convenience layer, not source of truth |
| Email Automation | Google Apps Script or Supabase Edge Function | Weekly investor digests |
| Homeowner Outreach | Zapier + Lofty CRM | Letter campaigns |
| Hosting | Vercel | Web app hosting, serverless functions |
| Domain | foreclosurefunder.com (TBD) | Primary domain |

### Data Flow

```
[Sedgwick County Post PDF] → [Python Scraper + Claude API] → [Supabase]
                                                                 ↓
[Kansas Court Records] → [Court Research Automation] ──────→ [Supabase]
                                                                 ↓
[Sedgwick County Appraiser] → [Property Lookup] ──────────→ [Supabase]
                                                                 ↓
                                                    [Sync to Google Sheets]
                                                    (Mike's convenience layer)
                                                                 ↓
[Supabase] → [Next.js API] → [Web Dashboard / iOS App]
                                                                 ↓
                                    [Recommendation Engine] → [Personalized Feed]
                                                                 ↓
                                    [Investor CRM Pipeline] → [Per-user data]
```

### Key Architectural Decisions

1. **Supabase is the source of truth.** Google Sheets becomes a sync target for Mike's convenience, not the primary data store.
2. **Row-Level Security (RLS) in Supabase** ensures investors can only see their own data. Deal room admins can see their group's data. Super admins see everything.
3. **The scraper writes to Supabase first**, then a sync function pushes relevant data to Google Sheets.
4. **The recommendation engine runs server-side** (Supabase Edge Function or Next.js API route) and returns scored results per investor.
5. **iOS app is a Capacitor.js wrapper** around the Next.js web app for v1. Rebuild in React Native if/when justified by user volume.

---

## 8. DATABASE SCHEMA (SUPABASE)

### Core Tables

```sql
-- USERS & AUTH (extends Supabase auth.users)
profiles
  id (uuid, FK → auth.users)
  email
  full_name
  phone
  role (enum: super_admin, admin, investor)
  subscription_tier (enum: free, standard, premium)
  subscription_status (enum: trial, active, canceled, expired)
  trial_ends_at (timestamp)
  deal_room_id (uuid, nullable, FK → deal_rooms)
  onboarding_completed (boolean)
  onboarding_transcript_url (text, nullable)
  created_at
  updated_at

-- DEAL ROOMS (agent/group containers)
deal_rooms
  id (uuid)
  owner_id (uuid, FK → profiles) -- the agent/admin
  name (text) -- e.g., "Mike King Investment Group"
  brand_logo_url (text)
  brand_colors (jsonb) -- primary, secondary, accent
  contact_email
  contact_phone
  website_url
  settings (jsonb) -- inter-investor visibility, etc.
  created_at

-- INVESTOR PREFERENCES (from onboarding interview)
investor_preferences
  id (uuid)
  investor_id (uuid, FK → profiles)
  budget_min (integer)
  budget_max (integer)
  financing_method (enum: cash, loc, mortgage, mixed)
  risk_tolerance (integer, 1-10)
  property_types (text[]) -- single_family, multi_family, commercial, land
  intended_use (text[]) -- flip_sell, renovate_sell, rent_long, rent_short, teardown_rebuild
  location_preferences (jsonb) -- zip codes, neighborhoods, radius
  condition_preference (enum: teardown_ok, needs_work, cosmetic_only, structurally_sound)
  timeline_preference (text) -- "close within 2 weeks", "flexible"
  deal_breakers (text[]) -- manufactured, flood_zone, septic, etc.
  desired_features (text[]) -- pool, basement, garage, etc.
  dream_property_description (text) -- free-form from interview
  raw_preferences_json (jsonb) -- full AI-extracted preferences from transcript
  created_at
  updated_at

-- MARKETS (geographic regions)
markets
  id (uuid)
  name (text) -- "Sedgwick County, KS"
  state (text)
  county (text)
  scraper_config (jsonb) -- PDF URL, court URL, appraiser URL, etc.
  is_active (boolean)
  created_at

-- PROPERTIES (the core data)
properties
  id (uuid)
  market_id (uuid, FK → markets)
  case_number (text, unique per market)
  address (text)
  city (text)
  zip_code (text)
  state (text)
  defendant_name (text)
  plaintiff_name (text)
  property_type (text) -- single_family, etc.
  bedrooms (integer)
  bathrooms (numeric)
  sqft (integer)
  county_appraisal (numeric)
  rpr_value (numeric, nullable) -- manual entry
  foreclosure_amount (numeric)
  sale_date (date, nullable)
  notice_type (text) -- new_filing, scheduled_sale
  stage (text) -- new_filing, sale_date_assigned, upcoming, sold, redeemed, canceled
  attorney_name (text)
  source_url (text) -- where we scraped it from
  scraped_at (timestamp)
  created_at
  updated_at

-- COURT RESEARCH (per property)
court_research
  id (uuid)
  property_id (uuid, FK → properties)
  liens (jsonb[]) -- [{type, amount, creditor, filing_date}]
  judgments (jsonb[]) -- [{type, amount, plaintiff, filing_date}]
  title_status (enum: clean, clouded, complex)
  estimated_offer_min (numeric)
  estimated_offer_max (numeric)
  research_summary (text) -- AI-generated summary
  researched_at (timestamp)
  created_at

-- INVESTOR PIPELINE (per investor per property)
investor_pipeline
  id (uuid)
  investor_id (uuid, FK → profiles)
  property_id (uuid, FK → properties)
  deal_room_id (uuid, nullable, FK → deal_rooms)
  stage (enum: watching, researching, site_visit, preparing_offer, offer_submitted, counter_offered, offer_accepted, in_closing, closed, rejected, no_response, passed)
  notes (text) -- private to investor
  group_notes (text, nullable) -- visible to deal room group if enabled
  offer_amount (numeric, nullable)
  stage_changed_at (timestamp)
  created_at
  updated_at

-- RECOMMENDATION SCORES (computed)
recommendation_scores
  id (uuid)
  investor_id (uuid, FK → profiles)
  property_id (uuid, FK → properties)
  score (numeric, 0-100)
  reasons (jsonb) -- [{factor, score, explanation}]
  computed_at (timestamp)

-- HOMEOWNER OUTREACH (for Deal Room automation)
outreach_campaigns
  id (uuid)
  property_id (uuid, FK → properties)
  deal_room_id (uuid, FK → deal_rooms)
  touch1_sent (boolean)
  touch1_date (date)
  touch2_sent (boolean)
  touch2_date (date)
  touch3_sent (boolean)
  touch3_date (date)
  touch3b_urgent_sent (boolean)
  touch3b_date (date)
  status (text) -- active, paused, completed
  created_at
```

### Row-Level Security Policies

```
-- Investors see only their own pipeline, preferences, and recommendations
-- Admins see all data within their deal room
-- Super admins see everything
-- Properties and court research are readable by all authenticated users (tier-gated at API level)
-- Group notes visible only to members of the same deal room with visibility enabled
```

---

## 9. AUTHENTICATION & AUTHORIZATION

### Auth Methods (Supabase Auth)

1. **Email + Password** (primary)
2. **Sign in with Apple** (required for iOS App Store if offering any social login)
3. **Google Sign-In** (optional convenience)

### User Lifecycle

1. User visits foreclosurefunder.com or downloads iOS app
2. Free browsing of limited listings (2-3 per session, basic info only)
3. Sign up with email/password → assigned Free tier
4. Upgrade to Standard/Premium → Stripe checkout integration
5. Deal Room investors: invited by their agent admin via email → assigned Standard tier, linked to deal room
6. Onboarding interview completed → preferences extracted and stored

### Subscription Management

- Stripe for payment processing
- Subscription status synced to Supabase profile
- Tier determines API-level feature gating
- Trial: 60 days for beta users, 7 days for Deal Room seats

---

## 10. THE ONBOARDING INTERVIEW SYSTEM

### How It Works

1. **Scheduling:** New investor (or deal room agent) schedules a Zoom call
2. **The Call:** Philip and Mike (or future sales rep) conduct a 30-45 minute interview
3. **Questions:** Mix of structured (exact responses needed) and open-ended (general desires)
4. **Recording:** Zoom records and auto-transcribes
5. **Processing:** Transcript is sent to an AI processing pipeline (make.com or n8n automation)
6. **Extraction:** Claude API extracts structured preferences from the transcript
7. **Storage:** Preferences stored in `investor_preferences` table; raw transcript stored in Supabase Storage
8. **Activation:** Recommendation engine begins scoring properties for this investor

### Standardized Interview Questions (Draft)

**Exact-response questions:**
- What is your typical transaction size? (budget range)
- Do you have liquid cash available or do you use financing? (financing method)
- What counties/zip codes are you interested in? (location)
- Do you work in residential only, or also commercial? (property types)
- Do you have existing contractor relationships? (readiness indicator)
- Do you have an existing lender for larger transactions? (financing detail)

**Open-ended questions:**
- If you could describe your ideal property — something that would really excite you — what would that look like? (dream property description)
- What's the most annoying part of researching a potential investment? (pain points)
- What's your biggest fear when purchasing a foreclosure? (risk tolerance indicator)
- Walk me through your last investment — what went right and what went wrong? (experience level)
- Are there any absolute deal-breakers for you? (deal breakers)
- What property features matter most to you? (pool, basement, garage, lot size, etc.)
- How quickly do you typically want to move from finding a property to closing? (timeline)

### AI Processing Pipeline

```
[Zoom Recording] → [Auto-Transcript] → [make.com/n8n webhook]
    → [Claude API: Extract structured preferences from transcript]
    → [Validate extracted data against schema]
    → [Write to investor_preferences table in Supabase]
    → [Store raw transcript in Supabase Storage]
    → [Trigger recommendation engine initial run]
    → [Send confirmation email to investor with preference summary]
```

### Evolution

- **Phase 1 (now):** Philip + Mike conduct calls manually
- **Phase 2:** Trained sales rep or customer service rep conducts calls
- **Phase 3:** AI voice agent conducts initial screening, human follows up
- **Phase 4:** Self-service onboarding questionnaire + optional call

---

## 11. THE CRM PIPELINE

### Pipeline Stages

| Stage | Description | Actions Available |
|-------|------------|-------------------|
| **Watching** | Saved from dashboard, monitoring | View details, add notes, move to researching |
| **Researching** | Reviewing court docs, liens, title | View court research, add notes, schedule site visit |
| **Site Visit** | Drive-by or interior visit planned/completed | Add condition notes, photos, move to preparing offer |
| **Preparing Offer** | Getting documents ready, running numbers | Calculate offer, generate documents, move to submitted |
| **Offer Submitted** | Offer sent to bank/seller | Track status, add counter details |
| **Counter-Offered** | Bank/seller countered | Review counter, accept/reject/re-counter |
| **Offer Accepted** | Deal in motion | Move to closing, track deadlines |
| **In Closing** | Closing process underway | Track milestones, document management |
| **Closed** | Purchase completed | Record final price, move to investment history |
| **Rejected** | Offer rejected by bank/seller | Archive, notes on why |
| **No Response** | No response received | Follow up or pass |
| **Passed** | Investor chose not to pursue | Archive with reason |

### Visibility Rules

- **Investor's own pipeline:** Fully visible and editable by the investor
- **Deal room admin (Mike):** Can see all investor pipelines within their deal room. This is critical for Mike to avoid sending two investors to the same property.
- **Group notes:** If the deal room admin enables inter-investor visibility AND individual investors consent, group notes (e.g., Mike's drive-by observations) are visible to all group members.
- **Cross-group:** Never visible. Deal rooms are completely siloed.
- **Anonymous indicator:** All investors see "X others are watching this property" — no names, no deal room affiliation.

---

## 12. THE RECOMMENDATION ENGINE

### How Scoring Works

Each property receives a score (0-100) for each investor, based on weighted factors:

| Factor | Weight | Source |
|--------|--------|--------|
| Budget match | 25% | Purchase price vs. investor budget range |
| Location match | 20% | Property zip/neighborhood vs. investor preferences |
| Property type match | 15% | Single family, multi, etc. vs. preference |
| Intended use fit | 15% | Condition + type vs. flip/rent/teardown preference |
| Risk alignment | 10% | Title health + lien complexity vs. risk tolerance |
| Feature match | 10% | Pool, basement, etc. vs. desired features |
| Deal-breaker check | 5% | Binary: any deal-breaker present = score to 0 |

### Output

Each recommendation includes:
- **Score:** 0-100 numeric score
- **Top reasons FOR:** "Great location match — 2 miles from your preferred zip 67202"
- **Top reasons AGAINST:** "Title has a mechanic's lien for ~$10,000 — may add to acquisition cost"
- **Risk flag:** Green / Yellow / Red based on title health and lien complexity

### Implementation

- Runs server-side (Supabase Edge Function or Next.js API route)
- Recomputes when: new property added, investor preferences updated, court research completed
- Stored in `recommendation_scores` table for fast retrieval
- Sorted by score descending on investor's dashboard

---

## 13. DATA PIPELINE

### Source 1: Sedgwick County Post PDF (Weekly)

**Current state:** Built and tested (foreclosure_scraper.py, 511 lines)
**Method:** Download PDF → Claude API (Sonnet) for visual extraction → structured JSON
**Output:** Case number, plaintiff, defendant, address, city, zip, sale date, notice type, foreclosure amount, attorney
**Schedule:** Wednesday 9am
**Destination:** Supabase `properties` table (with sync to Google Sheets)

### Source 2: Sedgwick County Appraiser (Per Property)

**Current state:** Built (within scraper)
**Method:** HTTP request to appraiser website → BeautifulSoup parsing
**Output:** Bedrooms, bathrooms, sqft, county appraisal value, property type
**Filter:** Manufactured homes filtered out (MANUFACTURED, MOBILE HOME, MODULAR, HUD CODE)

### Source 3: Kansas Court Records (Per Property)

**Current state:** Planned (Phase 2, highest-value feature per Mike and Dan Drake)
**Method:** TBD — likely Claude API or web scraping of Kansas public court records
**Output:** Active lawsuits, liens (mechanic, tax, judgment), title health assessment, estimated offer range
**Destination:** Supabase `court_research` table

### Source 4: RPR Values (Manual)

**Current state:** Mike enters manually
**Method:** Mike logs into RPR (Realtor's Property Resource), looks up value, enters in admin panel
**Future:** No public API available at Mike's NAR membership tier. Explore API access at higher tiers.

### Source 5: Visual Data (Future)

**Planned:** Google Maps / Street View / satellite imagery per property
**Planned:** Nearby comparable sales (sold prices, rent prices, condition)
**Phase:** 3+

### Source 6: Expired/Withdrawn MLS Listings (Future)

**Planned:** Mike exports from MLS weekly, or automated via browser agent
**Method:** CSV/CBO file upload or automated scraping
**Phase:** 2+

---

## 14. iOS & ANDROID APP STRATEGY

### Immediate: Progressive Web App (PWA)

- Add service worker + web manifest to Next.js app (30 minutes of work)
- Users "Add to Home Screen" from Safari/Chrome — looks and feels like an app
- Sufficient for beta period with 6-10 known investors
- No App Store submission, no review cycles, no $99/year fee yet
- Limitation: push notifications are limited on iOS, no App Store discoverability

### When Ready: React Native with Expo (Target: 3-4 weeks of focused work)

- Build once, deploy to both iOS and Android
- React Native uses the same JavaScript/React mental model as the Next.js web app — no new language to learn
- Expo handles builds, App Store submission, over-the-air updates, and TestFlight distribution
- Shared business logic (API calls, data models, TypeScript utilities) between web and mobile via shared packages
- Supabase has a first-party React Native SDK — auth, database, realtime all work out of the box
- Native capabilities: push notifications, Face ID / Touch ID, camera (property photos), GPS (nearby properties), offline caching
- Critical: Apple requires "Sign in with Apple" if offering any social login
- Apple Developer Program ($99/year) + Google Play Developer ($25 one-time) needed at submission time
- **Trigger:** Web app is stable, court research works, paying users exist. Don't build the app before the product is proven.

### Why Not Flutter or Capacitor

- **Flutter** uses Dart, a completely different language. No code sharing with the Next.js web app. Excellent UI rendering but doubles the maintenance burden for a solo developer already deep in the React ecosystem.
- **Capacitor.js** wraps the web app in a native shell. Fast to build but Apple sometimes rejects "thin wrappers," and the result never feels truly native. Better to invest the extra 2-3 weeks in React Native and get a real app.

---

## 15. SECURITY ARCHITECTURE

### Principles

1. **Investor data is sacred.** Every investor's pipeline, notes, preferences, and history are private to them.
2. **Row-Level Security (RLS)** at the database level ensures data isolation — not just at the API level.
3. **Encrypt at rest and in transit.** Supabase provides both by default.
4. **Audit trail.** All data modifications logged (who changed what, when).
5. **Role-based access.** API endpoints check user role before returning data.

### Implementation

- **Supabase RLS policies** on every table containing user data
- **JWT tokens** from Supabase Auth, verified on every API request
- **HTTPS everywhere** (Vercel default)
- **Environment variables** for all secrets (never in code)
- **No PII in URLs** (no investor IDs or property addresses in query strings)
- **Rate limiting** on API routes to prevent scraping
- **Developer security audit** before public launch (hire a consultant)

### Pre-Launch Security Checklist

- [ ] All RLS policies tested with multiple user roles
- [ ] Penetration testing or security audit by hired consultant
- [ ] Data backup strategy documented and tested
- [ ] Incident response plan documented
- [ ] Terms of Service and Privacy Policy drafted (legal review)
- [ ] GDPR/CCPA considerations if handling California residents' data

---

## 16. MULTI-MARKET EXPANSION PLAYBOOK

### What's Needed Per New Market

1. **Foreclosure publication source:** Each county/state publishes foreclosure notices differently. Need to identify the source (PDF, website, legal newspaper) and build/configure a scraper.
2. **Court records source:** Each jurisdiction's court system has a different public records interface.
3. **Property appraiser source:** Each county has its own assessor/appraiser website with different HTML structure.
4. **Local real estate agent (optional):** A "Mike" for that market who provides RPR values, drive-by assessments, and investor relationships.

### Expansion Order

1. **Sedgwick County, KS** — Live (scraper built, beta users active)
2. **Butler County, KS** — Near-term (adjacent to Sedgwick, may share court system)
3. **Kansas statewide** — Medium-term (county by county, shared state court system)
4. **Kansas City metro (MO/KS)** — 6+ months (large market, significant opportunity)
5. **Additional markets** — Based on demand, agent partnerships, or investor requests

### Architecture for Multi-Market

The `markets` table with `scraper_config` JSON allows each market to have its own scraper configuration without code changes. The scraper becomes a pluggable framework where new markets are configuration, not code rewrites.

---

## 17. CURRENT STATE OF THE CODEBASE

### What's Built and Working

| Component | Status | Location |
|-----------|--------|----------|
| PDF Scraper (Sedgwick County) | Built, tested | SCRAPERfiles/foreclosure_scraper.py |
| Next.js Dashboard | Built, not deployed | foreclosure-dashboard/ |
| Google Sheets (4 tabs) | Live, in daily use by Mike | Google Sheets |
| Zapier Integration (2 Zaps) | Live and running | Zapier |
| Lofty CRM Smart Plans (2) | Live and running | Lofty CRM |
| Homeowner Outreach Letters (4) | Designed as PDFs | files 2/ |
| Weekly Investor Email Script | Built, not installed | Google Apps Script (in handoff docs) |
| Vercel Project | Created, not deployed | foreclosure-dashboard/.vercel/ |

### What Needs to Happen Before Beta Launch

1. Set up Supabase project (database, auth, RLS)
2. Migrate data model from Google Sheets to Supabase
3. Rebuild dashboard API to read from Supabase instead of Sheets CSV
4. Implement auth (sign up, sign in, role-based access)
5. Build investor preference system and pipeline CRM
6. Deploy to Vercel with new domain
7. Set up Capacitor.js for iOS
8. Security audit
9. Terms of Service / Privacy Policy

### Technical Debt

- Dashboard has 2 em-dash instances (page.js lines 146, 228) — Mike prefers hyphens
- Sheet ID inconsistency in documentation (33 chars vs 44 chars)
- No automated tests
- No CI/CD pipeline
- CSS is all in globals.css (no component-level styling system)

---

## 18. LINEAGE: WHAT CAME FROM WHERE

### From Original Plan (Transcript + ARCHITECTURE_PLAN.md)

- Sedgwick County Post PDF scraper using Claude API
- Google Sheets as initial data layer
- Next.js 14 dashboard on Vercel
- Zapier + Lofty CRM for homeowner letter campaigns
- Weekly investor email automation
- Court case research as the killer differentiator
- RPR value lookup (manual)
- Investor matching concept (was Phase 4)
- Expired/withdrawn MLS listings as future pipeline
- "Inquire with Mike" human touchpoint
- Dark navy + amber visual design language
- 4-phase development timeline
- $9-21/month infrastructure cost estimate

### New From This Conversation (March 1, 2026)

- Rename to "Foreclosure Funder"
- Supabase replaces Google Sheets as source of truth
- iOS app as near-term target (6 weeks, Capacitor.js)
- Formal subscription tiers (Free / Standard / Premium)
- Deal Room as a separate product for agents ($1,100 + per-seat)
- Onboarding interview → AI transcript processing → preference extraction
- Full CRM pipeline with 12 granular stages
- Group functionality with consent-based visibility
- Anonymous "others watching" property indicator
- Super admin / admin / investor role hierarchy
- AI voice agent for cold calling (premium feature)
- Multi-market expansion plan with timeline
- Delaware LLC formation
- 50/50 revenue split
- Developer consultant hire before going live
- In-person sales reps for key markets (future)
- Larger product suite vision beyond foreclosures
- Institutional investor consideration (far future)
- $200-1000/month budget range
- Self-service onboarding questionnaire (future phase)

---

## 19. DEVELOPMENT PHASES & ROADMAP

### Timeline Note

This roadmap assumes a single developer with full access to AI coding tools (Claude Code, Cursor, multi-agent workflows). With concurrent AI agents handling boilerplate, schema generation, component scaffolding, and test writing, the bottleneck is decision-making and user feedback loops, not code output. Timelines below reflect that reality as of March 2026.

### Phase 0: Foundation (Week 1)
*Goal: Get the backend right before building more frontend*

- [ ] Create Supabase project
- [ ] Design and implement database schema (all tables above)
- [ ] Set up Supabase Auth (email/password)
- [ ] Implement Row-Level Security policies
- [ ] Write migration script: Google Sheets data → Supabase
- [ ] Set up bidirectional sync: Supabase ↔ Google Sheets (for Mike)
- [ ] Update scraper to write to Supabase (primary) and Sheets (secondary)
- [ ] Register foreclosurefunder.com domain
- [ ] Add PWA manifest + service worker to Next.js app

### Phase 1: Beta Dashboard (Weeks 2-3)
*Goal: Working dashboard for Mike's 6 investors*

- [ ] Rebuild dashboard API to read from Supabase
- [ ] Implement auth flow (sign up, sign in, protected routes)
- [ ] Build investor preference input form (manual, pre-interview)
- [ ] Build basic CRM pipeline UI (save, stage changes, notes)
- [ ] Build admin panel for Mike (see all investors, add notes)
- [ ] Deploy to Vercel with custom domain
- [ ] Install weekly email automation
- [ ] Invite beta users, assign accounts
- [ ] **Ship to beta users and start collecting feedback immediately**

### Phase 2: Court Research (Weeks 4-5)
*Goal: The killer feature that proves the business*

- [ ] Build court case research automation (Kansas courts)
- [ ] Integrate court research into property detail pages
- [ ] Implement offer range estimation (lien analysis → estimated bank ask)
- [ ] Title health badges (clean / clouded / complex)
- [ ] Get Dan Drake's feedback specifically — this is the feature he described
- [ ] Iterate based on feedback

### Phase 3: Recommendation Engine + Onboarding (Weeks 6-7)
*Goal: Personalization that makes the product indispensable*

- [ ] Build recommendation scoring engine
- [ ] Implement onboarding interview processing pipeline (n8n/make.com + Claude API)
- [ ] Build preference extraction from transcripts
- [ ] Property detail pages with recommendation scores and explanations
- [ ] "X others watching" anonymous indicator
- [ ] Enhanced property cards (lien badges, title status, offer ranges)
- [ ] Alerts: new properties matching preferences

### Phase 4: Monetization + Deal Room (Weeks 8-10)
*Goal: Start charging, launch second product line*

- [ ] Set up Stripe account and subscription model
- [ ] Stripe subscription integration + free tier paywall
- [ ] Build Deal Room setup flow
- [ ] White-label branding for agents
- [ ] Investor management panel for agents
- [ ] Group visibility settings with consent
- [ ] Marketing site / landing page
- [ ] Form Delaware LLC
- [ ] First paying customers
- [ ] Hire developer consultant for security audit before going fully public

### Phase 5: Mobile App + Expansion (Weeks 11-14)
*Goal: App Store presence, second market*

- [ ] Build React Native app with Expo (3-4 weeks)
- [ ] Push notifications, biometric auth, camera, GPS
- [ ] Sign in with Apple implementation
- [ ] Submit to Apple App Store + Google Play
- [ ] Second market: Butler County, KS
- [ ] Expired/withdrawn MLS listing pipeline (for financed investors)

### Phase 6: Premium Features + Growth (Weeks 15-20)
*Goal: Premium tier value, market expansion*

- [ ] AI voice agent for cold-calling property owners
- [ ] Visual data (maps, street view, comps)
- [ ] Document preparation services
- [ ] Kansas City market research and prep
- [ ] Additional Kansas county expansion

---

## 20. HIRING PLAN & COMPANY BUILDING

### Current Team

| Person | Role | Status |
|--------|------|--------|
| Philip | CTO / Developer / Co-Founder | Active |
| Mike | Sales / Market Expert / Co-Founder | Active |

### Hiring Timeline (Estimated)

| When | Role | Why |
|------|------|-----|
| Pre-launch | Security consultant (contract) | Audit before going live with financial data |
| 20-30 investors | Part-time customer support | Handle onboarding scheduling, basic questions |
| 2nd market (KC) | Sales rep / onboarding specialist (KC-based) | In-person meetings, local market knowledge |
| 50+ investors | Second developer (contract or part-time) | Feature velocity, mobile app improvements |
| 100+ investors | Marketing person | Content, SEO, paid acquisition |
| 3+ markets | Operations manager | Manage multi-market scraper configs, data quality |

### What Can Be Automated vs. Needs Humans

| Task | Automate? | Notes |
|------|-----------|-------|
| Property scraping | Yes | Already automated |
| Court research | Yes | Phase 2 automation |
| Property appraiser lookup | Yes | Already automated |
| Homeowner outreach letters | Yes | Already automated via Zapier + Lofty |
| Weekly investor emails | Yes | Already automated via Apps Script |
| Onboarding interviews | Partially | AI processes transcript, human conducts call (for now) |
| RPR value lookup | No (for now) | Requires Mike's NAR login |
| Drive-by assessments | No | Requires physical presence |
| Investor relationship management | No | Mike's core value-add |
| Sales to new agents/deal rooms | No | Requires human relationship building |
| Customer support (basic) | Partially | FAQ + AI chatbot for tier 1, human for complex |

---

## 21. RESEARCH TASK PROMPTS FOR PARALLEL CHATS

### PROMPT 1: Market Research & Competitive Analysis

```
You are a market research analyst specializing in real estate technology (PropTech). I need a comprehensive competitive analysis for a new product called "Foreclosure Funder."

ABOUT FORECLOSURE FUNDER:
- A SaaS platform for real estate investors focused on foreclosure properties
- Provides automated scraping of legal foreclosure publications, court research (liens, judgments, title health), property intelligence (appraisal values, beds/baths/sqft), and a personalized recommendation engine based on investor preferences
- Includes a CRM pipeline for tracking deals from discovery to closing
- Has a second product: "Deal Rooms" for real estate agents managing groups of investors
- Differentiator: hyper-local (county-level data), combines AI-driven research with human agent expertise, works for both independent investors and managed groups
- Starting market: Wichita, Kansas (Sedgwick County)
- Target users: Real estate investors (from beginners to seasoned), real estate agents serving investors

RESEARCH TASKS:

1. DIRECT COMPETITORS: Research these platforms in depth — features, pricing, target market, strengths, weaknesses:
   - PropStream
   - DealMachine
   - Privy
   - BatchLeads
   - Auction.com
   - Foreclosure.com
   - RealtyTrac / ATTOM Data
   - Hubzu
   - REIPro
   - Mashvisor
   - Roofstock

2. ADJACENT COMPETITORS: Research platforms that serve overlapping use cases:
   - Zillow (investor features)
   - Redfin (investor tools)
   - Realtor.com
   - CoStar (commercial)
   - Reonomy
   - Buildium / AppFolio (property management)

3. For each competitor, document:
   - Core features
   - Pricing model and price points
   - Target customer
   - Geographic coverage
   - Mobile app availability
   - Foreclosure-specific features (if any)
   - Court research / lien analysis features (if any)
   - CRM / pipeline features (if any)
   - Recommendation / personalization features (if any)

4. MARKET SIZE: Estimate the TAM/SAM/SOM for:
   - Foreclosure investor tools (nationwide)
   - Real estate investor SaaS tools (nationwide)
   - Kansas/Missouri real estate investor market specifically

5. GAP ANALYSIS: Identify what Foreclosure Funder does that NO competitor does, and what competitors do that we should consider adding.

6. POSITIONING RECOMMENDATION: Based on the analysis, recommend how Foreclosure Funder should position itself — tagline, key differentiators, competitive messaging.

Deliver as a structured document with comparison tables. Be thorough.
```

### PROMPT 2: Real Estate Investor Pain Points & User Research

```
You are a user researcher studying real estate investors who purchase foreclosure properties. I'm building a SaaS product called "Foreclosure Funder" and need to deeply understand investor pain points.

CONTEXT:
- Our initial market is Wichita, Kansas (Sedgwick County)
- Our beta users are 6 investors who work with a local real estate agent (Mike)
- These investors range from cash-ready auction buyers to line-of-credit investors
- The product provides automated foreclosure listing scraping, court research, property intelligence, personalized recommendations, and a deal pipeline CRM

RESEARCH TASKS:

1. PAIN POINTS BY STAGE: Map the investor journey from "I want to find a foreclosure to invest in" to "I've closed on the property" and identify pain points at every stage:
   - Discovery (finding properties)
   - Research (due diligence, court records, title search, property condition)
   - Valuation (what's it worth? what should I offer?)
   - Acquisition (auction process, negotiation, paperwork)
   - Closing (legal, financing, timeline management)
   - Post-purchase (renovation, rental, resale)

2. PAIN POINTS BY INVESTOR TYPE:
   - Cash auction buyers (time pressure, same-day decisions)
   - Financed investors (longer timeline, lender requirements)
   - House flippers (renovation cost estimation, contractor management)
   - Rental investors (rent estimation, tenant-readiness assessment)
   - Wholesale investors (assignment contracts, buyer network)
   - New/aspiring investors (knowledge gaps, risk aversion)

3. INFORMATION GAPS: What information do investors wish they had that's currently hard to find?
   - Search Reddit (r/realestateinvesting, r/foreclosure, r/flipping), BiggerPockets forums, and other investor communities
   - Look for recurring complaints, questions, and feature requests

4. WILLINGNESS TO PAY: Research what investors currently pay for similar tools and what price sensitivity looks like in this market.

5. ONBOARDING PREFERENCES: How do investors prefer to be onboarded to new tools? Self-service vs. guided? What questions should we ask?

6. FEATURE WISHLIST: Based on community research, what features do investors dream about that don't exist yet?

Deliver as a structured report with direct quotes from real investor discussions where possible.
```

### PROMPT 3: Supabase Auth + RLS + Database Architecture

```
You are a backend architect specializing in Supabase and PostgreSQL. I need you to design and implement the complete database architecture for a SaaS product called "Foreclosure Funder."

PRODUCT OVERVIEW:
- A real estate investor platform with three user roles: super_admin, admin (deal room owner), investor
- Multi-tenant: multiple "deal rooms" (agent-managed investor groups), plus independent investors
- Data types: properties, court research, investor preferences, CRM pipeline stages, recommendation scores
- Subscription tiers: free, standard, premium (each gates different feature access)

REQUIREMENTS:

1. DATABASE SCHEMA: Design the complete Supabase schema including:
   - All tables (I'll provide the draft schema below)
   - Proper foreign keys, indexes, and constraints
   - Enum types for stages, roles, tiers, etc.
   - JSONB columns for flexible data (preferences, court records)
   - Timestamps and audit fields

2. ROW-LEVEL SECURITY: Write RLS policies for EVERY table that ensure:
   - Investors can only read/write their own pipeline, preferences, and notes
   - Deal room admins can read all data within their deal room
   - Super admins can read/write everything
   - Properties and court research are readable by all authenticated users (but feature-gated at API level by tier)
   - Group notes are only visible to members of the same deal room IF the deal room has visibility enabled AND the investor has consented
   - Anonymous property watching counts are available without revealing who's watching

3. AUTH SETUP: Configure Supabase Auth for:
   - Email/password signup
   - Sign in with Apple (required for iOS App Store)
   - Google Sign-In
   - Custom claims for role and tier in JWT
   - Profile creation trigger (on auth.users insert → create profiles row)

4. EDGE FUNCTIONS: Outline Supabase Edge Functions needed for:
   - Recommendation score computation
   - Onboarding transcript processing
   - Google Sheets sync
   - Stripe webhook handling

5. MIGRATION PLAN: How to migrate from the current Google Sheets data model to Supabase.

[DRAFT SCHEMA ATTACHED — SEE FOUNDING_ARCHITECTURE.md SECTION 8]

Deliver as:
- Complete SQL migration files
- RLS policy SQL
- Edge Function outlines with pseudocode
- Migration script outline
```

### PROMPT 4: iOS App Deployment with Capacitor.js

```
You are a mobile developer experienced with Capacitor.js and iOS App Store submissions. I need step-by-step guidance for wrapping an existing Next.js 14 web app as an iOS app.

CURRENT STATE:
- Next.js 14 app (React 18, no UI framework, CSS in globals.css)
- Dashboard with property listings, stats, CRM pipeline
- Supabase for backend (auth, database)
- Deployed on Vercel

REQUIREMENTS:

1. CAPACITOR SETUP:
   - Step-by-step instructions to add Capacitor to the Next.js project
   - Configuration for iOS platform
   - How to handle Next.js SSR vs. static export for Capacitor

2. NATIVE FEATURES TO ADD:
   - Push notifications (for new property alerts)
   - Biometric auth (Face ID / Touch ID for secure login)
   - Offline caching (view saved properties without internet)
   - Camera access (for property photos during site visits)
   - GPS/location (for "properties near me" feature)

3. APP STORE SUBMISSION:
   - Apple Developer Program setup ($99/year)
   - App Store Connect configuration
   - Required metadata (screenshots, descriptions, privacy policy URL)
   - How to implement "Sign in with Apple" (REQUIRED if offering other social logins)
   - Common rejection reasons and how to avoid them
   - How to avoid "thin wrapper" rejection
   - TestFlight setup for beta testing

4. PERFORMANCE OPTIMIZATION:
   - How to make a Capacitor-wrapped web app feel native
   - Splash screen and app icon setup
   - Navigation patterns that feel iOS-native
   - Handling the iOS safe area and notch

5. TIMELINE ESTIMATE:
   - Realistic week-by-week plan for a single developer
   - Target: App Store submission within 4 weeks (2 weeks buffer for review)

Deliver as a step-by-step implementation guide with code examples.
```

### PROMPT 5: Onboarding Interview Question Design

```
You are a product designer and qualitative researcher. I'm building a SaaS platform for real estate investors called "Foreclosure Funder." A key part of our product is an onboarding interview where we learn each investor's preferences, and then an AI processes the transcript to extract structured data that powers a personalized recommendation engine.

WHAT THE RECOMMENDATION ENGINE NEEDS:
- Budget range (min/max purchase price)
- Financing method (cash, line of credit, mortgage, mixed)
- Risk tolerance (1-10 scale)
- Property type preference (single family, multi-family, commercial, land)
- Intended use (flip and sell, renovate and sell, long-term rental, short-term rental, teardown/rebuild)
- Location preferences (specific zip codes, neighborhoods, or general areas)
- Condition preference (teardown OK, needs work, cosmetic only, structurally sound)
- Timeline preference (how fast they want to close and exit)
- Deal-breakers (manufactured homes, flood zones, septic tanks, etc.)
- Desired features (pool, basement, garage, finished basement, etc.)
- Dream property description (free-form narrative)
- Experience level and past investment history

DESIGN TASKS:

1. INTERVIEW SCRIPT: Design a 30-45 minute semi-structured interview script that naturally elicits all the data above without feeling like a form. The conversation should feel like "two investors having coffee" not "customer service reading a checklist."

2. QUESTION TYPES: For each question, specify:
   - The exact wording
   - Whether it's "exact response" (we need a specific answer) or "open-ended" (we want their story)
   - What data field(s) it maps to
   - Follow-up probes if they give a vague answer
   - Red flags to watch for (e.g., signs they're overextended financially)

3. AI EXTRACTION PROMPT: Write the Claude API prompt that processes the interview transcript and extracts structured JSON matching our investor_preferences schema.

4. SELF-SERVICE QUESTIONNAIRE: Design a web form version for investors who prefer to self-onboard (future phase). This should capture the same data but in a guided, step-by-step UI flow.

5. ITERATION PLAN: How should we refine the interview based on feedback from the first 10 calls?

Deliver the interview script as a document that Mike (a real estate agent with no technical background) could use in a call tomorrow.
```

### PROMPT 6: Legal & Compliance Requirements for Investor Data Platform

```
You are a legal researcher (NOT providing legal advice — this is for research purposes to inform a conversation with an actual attorney). I'm building a SaaS platform called "Foreclosure Funder" that handles:

- Personal information of real estate investors (name, email, phone, address)
- Financial preferences (budget ranges, financing methods, risk tolerance)
- Investment history and deal pipeline data
- Court records and property data (public information)
- Recorded Zoom interview transcripts

RESEARCH TASKS:

1. REGULATORY LANDSCAPE: What regulations apply to a platform that handles this type of data?
   - CCPA/CPRA (California — one founder is in SF)
   - State privacy laws in Kansas and Missouri
   - Fair Housing Act implications (are we at risk if our recommendation engine inadvertently discriminates?)
   - Real estate licensing requirements (does the software need its own license?)
   - SEC regulations (if institutional investors use the platform, does this become an investment advisory service?)

2. TERMS OF SERVICE: What should our ToS cover? Outline the key sections.

3. PRIVACY POLICY: What must our privacy policy disclose given the data we handle?

4. DATA HANDLING REQUIREMENTS:
   - Data retention policies
   - Right to deletion
   - Data portability
   - Breach notification requirements

5. RECORDING CONSENT: What are the legal requirements for recording onboarding Zoom calls in Kansas and Missouri? One-party vs. two-party consent states?

6. PUBLIC DATA USAGE: Are there any restrictions on our use of public court records, county appraiser data, or foreclosure publication data in a commercial product?

7. RECOMMENDED ACTIONS: What legal steps should we take before launching?

NOTE: This research is to inform a conversation with an actual attorney. We are NOT relying on this as legal advice.
```

### PROMPT 7: AI Voice Agent Research for Real Estate Cold Calling

```
You are a technical researcher investigating AI voice agents for a premium feature in a real estate investment platform. The feature: an AI agent that places phone calls to homeowners of properties in pre-foreclosure, gauging their interest in selling and qualifying the lead before connecting them with a human agent.

RESEARCH TASKS:

1. TECHNOLOGY OPTIONS: Research and compare:
   - Bland.ai
   - Vapi.ai
   - Retell.ai
   - Eleven Labs voice agents
   - OpenAI Realtime API
   - Twilio + custom LLM integration

   For each, document: pricing, voice quality, latency, compliance features, real estate use cases, integration APIs.

2. LEGAL REQUIREMENTS:
   - TCPA (Telephone Consumer Protection Act) compliance for AI cold calling
   - FTC regulations on robocalls and AI disclosure
   - State-specific regulations in Kansas and Missouri
   - Do-Not-Call list compliance
   - Required disclosures ("This call is from an AI agent...")
   - Recording consent requirements

3. REAL ESTATE SPECIFIC:
   - Are there real estate industry regulations about AI cold calling?
   - How do other real estate investors/agents use AI calling today?
   - What scripts work for foreclosure homeowner outreach?
   - What's the typical conversion rate for human cold calling in this space?

4. TECHNICAL ARCHITECTURE:
   - How would this integrate with our Supabase backend?
   - Call scheduling and queue management
   - Transcript processing and lead qualification
   - Handoff to human agent when homeowner expresses interest

5. COST ANALYSIS:
   - Per-call cost for each platform
   - Monthly cost at 50 calls/week, 200 calls/week, 500 calls/week
   - Is this viable at $39-49/month premium tier pricing?

Deliver as a comparison matrix with a clear recommendation.
```

### PROMPT 8: SaaS Pricing Strategy for Real Estate Investor Tools

```
You are a SaaS pricing strategist. I need help finalizing the pricing model for "Foreclosure Funder," a real estate investor platform.

CONTEXT:
- Three subscription tiers: Free, Standard ($19-29/mo), Premium ($39-49/mo)
- A "Deal Room" B2B product for real estate agents: $1,100 setup + $29/seat/month
- Initial market: 6 beta users in Wichita, KS. Goal: 50-100 paying users within 6 months.
- Competitors charge: PropStream ($97/mo), DealMachine ($99/mo), BatchLeads ($39-299/mo), Privy ($197/mo)

RESEARCH TASKS:

1. PRICING BENCHMARKS: Research what real estate investors actually pay for:
   - Data/research tools (PropStream, ATTOM, etc.)
   - CRM tools (REIPro, InvestorFuse, etc.)
   - Lead generation tools (DealMachine, BatchLeads)
   - How much do investors spend per month on software total?

2. WILLINGNESS TO PAY: Based on the value we provide (court research automation alone saves 4+ hours/week), what's the optimal price point?

3. FREE TIER STRATEGY: Research best practices for:
   - How much to give away (we're thinking 2-3 listing views, basic info only)
   - Conversion rates from free to paid in B2B SaaS
   - Freemium vs. free trial vs. demo-gated

4. ANNUAL DISCOUNT: What discount makes sense? We're thinking $19/mo annual vs $29/mo monthly (34% discount). Is that too aggressive?

5. DEAL ROOM PRICING: Is $1,100 setup + $29/seat right? Research comparable B2B setup fees in real estate tech.

6. EXPANSION REVENUE: What add-on services or usage-based pricing could we layer on?

7. RECOMMENDED PRICING TABLE: Give me a final recommendation with justification.

Consider that our initial users are in Kansas, which generally has lower willingness to pay than coastal markets.
```

---

## 22. OPEN QUESTIONS & DECISIONS PENDING

1. **Domain name:** Is foreclosurefunder.com available? Alternatives?
2. **LLC formation:** Who handles the Delaware LLC filing? Timeline?
3. **Apple Developer Program:** Who signs up? Personal or organizational account?
4. **Stripe account:** Business or individual? Connected to LLC?
5. **Brand identity:** Logo, color scheme, typography for Foreclosure Funder (vs. current navy/amber)
6. **Mike's existing Lofty website:** How does it link to Foreclosure Funder?
7. **Investor email migration:** How do we transition from Google Sheets investor list to Supabase-powered emails?
8. **Mike's data entry workflow:** Does he continue using Google Sheets, or do we build an admin panel he'd actually prefer?
9. **Deal Room branding:** For Mike's initial group, is it "Mike King Investments" or "Foreclosure Funder powered by Mike King"?
10. **Voice agent legal review:** Need actual attorney before implementing AI cold calling
11. **Fair Housing compliance:** Need legal review of recommendation engine to ensure it doesn't discriminate
12. **Security audit budget:** How much to allocate for the pre-launch security consultant?
13. **Beta user agreement:** Do we need beta users to sign anything (NDA, feedback agreement, ToS)?

---

*This is a living document. All development work should reference this document as the source of truth. When decisions are made on open questions, update this document first, then implement.*
