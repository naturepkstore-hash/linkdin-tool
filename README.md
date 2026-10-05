# PostFlow AI — Production-Ready LinkedIn Content Management & Auto-Posting Platform

> **Create. Schedule. Publish. Grow.**

PostFlow AI is a modern, high-performance SaaS web application built with Next.js 16 (App Router), TypeScript, Tailwind CSS, Prisma ORM, and official LinkedIn OAuth 2.0 / UGC Community Management APIs.

---

## 🌟 Key Features

1. **Official LinkedIn Integration (Zero-Scraping / 100% Compliant)**
   - Secure LinkedIn OAuth 2.0 Authorization Code exchange.
   - Encrypted token storage using **AES-256-GCM**.
   - Direct publishing using LinkedIn UGC Posts & Media Assets APIs.
   - Automatic detection of expired tokens, permission revocations, and rate limits.

2. **Post Creator & Live Feed Preview**
   - Rich post copy editor with character counter (3,000 char threshold).
   - Dynamic hashtag recommender & 1-click insertion.
   - Drag-and-drop image uploader with media storage library.
   - **Pixel-perfect LinkedIn Feed Preview** with realistic avatar, formatting, and reaction simulation.

3. **Content Quality & Algorithmic Analyzer**
   - Real-time scoring (0 - 100) evaluating **Hook Strength**, **Readability Flow**, **Call-To-Action (CTA)**, and **Hashtag Optimization**.
   - **Duplicate Post Protection** alerting the user if similar copy was recently scheduled or published.

4. **Interactive Content Calendar**
   - Monthly & weekly calendar view with status color coding (`Draft`, `Scheduled`, `Published`, `Failed`).
   - Interactive slide-over inspector for reviewing, editing, duplicating, or rescheduling posts.

5. **365-Day Content Series Planner**
   - Create structured multi-day campaigns (e.g. *365-Day SEO Mastery Series*).
   - Automated batch AI generator (Day 1 through Day 365).
   - 1-click **Schedule All Ready Posts** into the background queue.

6. **AI Writer & Prompt Strategist**
   - Tailored prompt engine parameterized by **Topic**, **Content Goal**, **Tone**, **Audience**, and **Length**.
   - 8 instant AI action buttons: *Add Viral Hook*, *Add CTA*, *Shorten*, *Expand*, *Make Professional*, *Make Conversational*, *Generate Hashtags*, and *Regenerate*.

7. **Background Publishing Scheduler & Worker**
   - Idempotent job runner with transaction locks.
   - Exponential backoff retry policy for transient network hiccups.
   - Standalone worker (`npm run worker`) and in-app automated scheduler loop.

8. **Analytics & Metrics**
   - Aggregated metrics for impressions, reactions, comments, reposts, and engagement rates.
   - Time-series charts powered by Recharts over 7-day, 30-day, and 90-day intervals.

9. **Security, System Health & Admin Oversight**
   - Secure session management with HTTP-only cookies and bcrypt hashing.
   - Live infrastructure status for Database, Queue, AI provider, and LinkedIn API.
   - Complete audit trail tracking user authentication, publishing events, and system actions.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js 18+ (Node.js 20+ recommended)
- npm 9+

### 2. Installation
```bash
# Clone or navigate into repository
cd linkdin-tool

# Install dependencies
npm install --legacy-peer-deps
```

### 3. Environment Configuration
Copy `.env.example` to `.env` and configure a PostgreSQL database (Neon is recommended):
```bash
cp .env.example .env
```

Configure your secrets:
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST-pooler/DATABASE?sslmode=require"
DIRECT_DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
JWT_SECRET="your-jwt-secret-at-least-32-chars-long"
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

# Official LinkedIn API Credentials
LINKEDIN_CLIENT_ID="your_linkedin_client_id"
LINKEDIN_CLIENT_SECRET="your_linkedin_client_secret"
LINKEDIN_REDIRECT_URI="http://localhost:3000/api/linkedin/callback"

# Optional External AI API Key (Built-in engine works out-of-the-box)
AI_API_KEY=""
```

### 4. Database Initialization & Seed
```bash
# Apply the checked-in PostgreSQL migrations
npm run db:migrate:deploy

# Optional: seed a fresh development database only (do not seed production)
npm run db:seed
```

To copy the existing local SQLite records into an empty PostgreSQL database, set the target URLs and create its tables first:
```powershell
$env:DATABASE_URL = "postgresql://USER:PASSWORD@HOST-pooler/DATABASE?sslmode=require"
$env:DIRECT_DATABASE_URL = "postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
npm run db:migrate:deploy

$env:SQLITE_DATABASE_URL = "file:./dev.db"
$env:TARGET_DATABASE_URL = $env:DIRECT_DATABASE_URL
$env:TARGET_ENCRYPTION_KEY = "a-new-random-production-encryption-key"
npm run db:migrate:sqlite
```
The migration refuses to write if any target table already contains records. It uses the local `ENCRYPTION_KEY` to decrypt existing encrypted values and re-encrypts them with `TARGET_ENCRYPTION_KEY`; configure that same new key as `ENCRYPTION_KEY` in production and keep it backed up. It copies database records without printing record contents; it does not copy media file bytes from `public/uploads`.

**Default Demo Credentials:**
- **Email:** `alex.rivera@postflow.ai`
- **Password:** `password123`
*(A 1-click demo login button is also provided on the login page)*

### 5. Running the Application
```bash
# Start Next.js development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Running the Standalone Background Worker
To run the continuous scheduler worker in a separate terminal:
```bash
npm run worker
```

### 7. Running the Automated Test Suite
```bash
npm test
```

---

## 🔑 Official LinkedIn Developer Application Setup

To enable live publishing to real LinkedIn profiles:

1. Go to the [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps).
2. Click **Create App** and fill in your app details.
3. In the **Products** tab, request access to:
   - **Share on LinkedIn** (`w_member_social`)
   - **Sign In with LinkedIn using OpenID Connect** (`openid`, `profile`, `email`)
4. In the **Auth** tab:
   - Copy your **Client ID** and **Client Secret** into your `.env` file.
   - Add your Redirect URL under **Authorized redirect URLs for your app**:
     `http://localhost:3000/api/linkedin/callback` (or your production URL).
5. Save changes and connect your LinkedIn profile inside PostFlow AI dashboard under **LinkedIn Account**.

---

## 🗄️ Database Schema & Models

- `User`: User accounts, hashed passwords, roles (`USER`, `ADMIN`), and timezone.
- `SocialAccount`: LinkedIn profile metadata and AES-256 encrypted access/refresh tokens.
- `Post`: Content copy, media, status (`DRAFT`, `READY`, `SCHEDULED`, `PROCESSING`, `PUBLISHED`, `FAILED`, `CANCELLED`), UTC schedule timestamp, and LinkedIn UGC URN.
- `ContentSeries`: Multi-day campaigns with frequency and default times.
- `SeriesPost`: Day slots (Day 1..365) with topics and status.
- `Media`: File assets with storage URLs, mime-types, and file sizes.
- `Analytics`: Post impressions, reactions, comments, reposts, and engagement rates.
- `Notification`: In-app alerts for publishing events and token renewals.
- `AuditLog`: Security and activity trail.

---

## 📦 Production Deployment

### Vercel + Neon
In Vercel project settings, set these Production environment variables:

- `DATABASE_URL`: Neon pooled connection URL.
- `DIRECT_DATABASE_URL`: Neon direct connection URL (Prisma migrations use this).
- `JWT_SECRET`: random value of at least 32 characters.
- `ENCRYPTION_KEY`: use the same strong production key supplied as `TARGET_ENCRYPTION_KEY` during data migration; back it up because stored tokens depend on it.
- `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `LINKEDIN_REDIRECT_URI`: valid LinkedIn OAuth app values; register the exact callback URL `https://<your-domain>/api/linkedin/callback`.
- `APP_URL`: `https://<your-domain>`.
- `CRON_SECRET`: random value of at least 16 characters, shared with the external cron service.
- `AI_API_KEY` and storage settings if using those integrations.

Generate secrets locally with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`; enter them directly into Vercel and the cron provider, never commit them. Supabase environment variables are optional; Supabase middleware is bypassed when they are not configured.

Before sending traffic to a new database, run `npm run db:migrate:deploy` with `DATABASE_URL` and `DIRECT_DATABASE_URL` set to that Neon database. Deploy the app to Vercel only after the database migrations complete.

#### Scheduled publishing while your computer is off
The GitHub Actions workflow at `.github/workflows/linkedin-scheduled-publishing.yml` checks for due posts every 10 minutes and calls the production worker. It runs in GitHub's cloud, so your computer does not need to stay on. Scheduled workflow runs may be delayed during high load, so publishing is not guaranteed at the exact minute. Add a repository Actions secret named `CRON_SECRET` with the same value configured in Vercel (**Settings → Secrets and variables → Actions → New repository secret**). The workflow can also be started manually from the repository's Actions tab. Only posts already scheduled in the app are published; the workflow does not generate a new post every day.

Vercel Hobby cron jobs can run only once per day, which is too infrequent for scheduled LinkedIn publishing. If you prefer another external cron provider (for example, cron-job.org), configure it to send a **GET** request every 10 minutes to `https://<your-domain>/api/worker/tick`, with this HTTP header:

```text
Authorization: Bearer <the same CRON_SECRET configured in Vercel>
```

The endpoint returns `401` without the correct secret. The worker uses a 5-minute Vercel Function ceiling and atomically claims jobs to avoid duplicate posts when cron runs overlap. The dashboard no longer polls the worker; local development can still use `npm run worker`.

### Docker Deployment
Build and run the container:
```bash
docker build -t postflow-ai .
docker run -p 3000:3000 --env-file .env postflow-ai
```

### Production Build
```bash
npm run build
npm run start
```
