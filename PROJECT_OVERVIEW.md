# FitLife Aggregator - Project Overview

## 🎯 Mission
**Solve the "data in silos" problem** for fitness enthusiasts who use multiple wearable devices and health apps.

## 💡 The Problem
- You have a Fitbit for daily steps
- An Apple Watch for workouts
- A Garmin for running
- An Oura Ring for sleep
- A Withings scale for weight

**Result:** Your health data is scattered across 5+ apps with no unified view.

## ✨ The Solution
FitLife Aggregator brings everything together in one beautiful dashboard with a unique **multi-dimensional activity heatmap** that reveals patterns at a glance.

---

## 🏗️ Architecture

### Backend (FastAPI + Python)
```
┌─────────────────────────────────────────────────────────┐
│  FastAPI Application                                    │
│  ├── /auth       - JWT authentication                   │
│  ├── /dashboard  - Metrics, heatmaps, trends            │
│  └── /subscriptions - Stripe billing                    │
└─────────────────────────────────────────────────────────┘
                           │
    ┌──────────────────────┼──────────────────────┐
    ▼                      ▼                      ▼
┌─────────┐         ┌──────────┐         ┌──────────────┐
│SQLite/  │         │  Redis   │         │ Stripe API   │
│Postgres │         │ (Celery) │         │ (Billing)    │
└─────────┘         └──────────┘         └──────────────┘
```

### Frontend (Next.js + React + TypeScript)
```
┌─────────────────────────────────────────────────────────┐
│  Next.js Application                                    │
│  ├── Dashboard        - Main analytics view             │
│  ├── ActivityHeatmap  - Key differentiator UI           │
│  ├── Login/Signup     - Authentication                  │
│  └── Subscribe        - Stripe checkout                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 Key Features

### 1. Multi-Dimensional Activity Heatmap
The **key differentiator** - a GitHub-style contribution graph that shows:
- **Steps heatmap** - Daily activity intensity over 26+ weeks
- **Sleep heatmap** - Sleep duration patterns
- **Heart Rate heatmap** - Resting HR trends
- **Calories heatmap** - Energy expenditure patterns

Each cell:
- Shows intensity via color (white → light green → dark green)
- Hover tooltip with exact values and data sources
- Highlights your best day and current streak

### 2. Unified Dashboard
- Today's metrics at a glance
- Weekly averages and trends
- Connected devices status
- Active goals progress

### 3. Multi-Device Aggregation
Supports:
- Apple Health
- Fitbit
- Garmin
- Oura Ring
- Withings

Data merge strategy:
- Takes the maximum value for steps (if multiple devices report)
- Averages for metrics like heart rate
- Tracks which sources contributed to each day

---

## 💰 Business Model

### Freemium with 14-day Trial

**Free Plan:**
- 7-day data history
- 2 device connections
- Basic dashboard

**Pro Plan: $4.99/month**
- Unlimited data history
- Unlimited device connections
- Advanced analytics & trends
- Data export (CSV, JSON)
- Personalized insights
- Priority support

**Why $4.99?**
- Lower than most fitness apps ($9.99+)
- High enough to cover infrastructure costs
- Sweet spot for impulse purchases

---

## 🚀 Tech Stack Rationale

### Why FastAPI?
- Async support for concurrent API calls to fitness providers
- Automatic OpenAPI documentation
- Type hints with Pydantic
- Easy OAuth integration

### Why Next.js?
- Server-side rendering for SEO
- Static generation for performance
- TypeScript first-class support
- Easy API routes for webhooks

### Why Stripe?
- Industry standard
- Excellent subscription management
- Built-in customer portal
- Webhook support for real-time updates

---

## 📊 Data Model

### Core Entities

**User**
- id, email, password
- subscription status (is_premium, stripe_customer_id)
- preferences (timezone, units)

**FitnessConnection**
- OAuth tokens for each provider
- Sync status and last sync time
- Data types being synced

**DailyMetric** (The key table)
- One row per user per day
- All possible metrics (steps, sleep, HR, etc.)
- JSON sources field tracking which devices contributed
- Normalized to common units

---

## 🔌 Integration Strategy

### OAuth Flow
1. User clicks "Connect Fitbit"
2. Redirect to Fitbit OAuth
3. User authorizes app
4. Fitbit redirects back with code
5. Exchange code for access/refresh tokens
6. Store tokens securely
7. Begin background sync

### Background Sync (Celery)
- Daily sync job pulls new data from all connected providers
- Handles rate limiting and retries
- Updates unified DailyMetric records
- Merge strategy resolves conflicts

---

## 🎨 UI/UX Highlights

### The Heatmap Experience
```
Mon  Tue  Wed  Thu  Fri  Sat  Sun
■    ■    ■    ■    ■    ■    ■   Jan
■    ■    ■    ■    ■    ■    ■
■    ■    □    □    ■    ■    ■
...
■    ■    ■    ■    ■    ■    ■   Jul

Legend: □ < 25% | ■ 25-50% | ■ 50-75% | ■ 75-100%
```

Features:
- 26 weeks of history visible at once
- Month labels for orientation
- Hover for exact values
- Animation on load for delight
- Streak badges for motivation

---

## 📈 Growth Strategy

### Phase 1: MVP (Current)
- Manual OAuth connections
- Basic heatmap
- Stripe subscriptions

### Phase 2: Automation
- Automatic daily sync
- Email reports
- Trend notifications

### Phase 3: Intelligence
- ML-powered insights
- Personalized recommendations
- Anomaly detection

### Phase 4: Social
- Share achievements
- Compare with friends
- Challenges

---

## 🛡️ Security

- JWT tokens with refresh token rotation
- OAuth state parameter to prevent CSRF
- Stripe webhooks signature verification
- Password hashing with bcrypt
- HTTPS only (production)

---

## 📦 Deployment

### Docker Compose (Development)
```bash
docker-compose up -d
```
Starts: PostgreSQL, Redis, Backend, Frontend, Celery Worker

### Production Checklist
- [ ] PostgreSQL on managed service (RDS, etc.)
- [ ] Redis on managed service (ElastiCache, etc.)
- [ ] Stripe webhooks configured
- [ ] OAuth redirect URIs updated
- [ ] SSL certificates
- [ ] Environment variables secured
- [ ] Database backups

---

## 📊 Success Metrics

**North Star:** Monthly Recurring Revenue (MRR)

**Leading Indicators:**
- Signup conversion rate
- Trial-to-paid conversion
- Device connections per user
- Daily active users
- Data sync frequency

---

## 🎯 Why This Will Work

1. **Real Problem:** Everyone with multiple fitness devices feels this pain
2. **Clear Differentiator:** The heatmap visualization is unique
3. **Fair Pricing:** $4.99 is accessible to most users
4. **Viral Potential:** Users want to share their heatmaps
5. **Sticky:** Once users connect devices, switching costs are high

---

## 🚦 Next Steps

1. **Setup:** Run `docker-compose up` to start locally
2. **Data:** Run `python scripts/generate_mock_data.py` for demo data
3. **Stripe:** Create account and add keys to .env
4. **Test:** Login with demo@fitlife.app / demo123
5. **Iterate:** Add real OAuth integrations

---

## 📞 Support

- API Docs: http://localhost:8000/docs
- GitHub Issues: (Add repo link)
- Email: support@fitlife.app

---

**Built with ❤️ by Agent 2.1**
