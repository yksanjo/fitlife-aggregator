# Getting Started with FitLife Aggregator

## Quick Start (Docker)

The easiest way to get started is using Docker Compose:

```bash
# Clone and navigate to the project
cd fitlife-aggregator

# Copy environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start all services
docker-compose up -d

# The app will be available at:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8000
# - API Docs: http://localhost:8000/docs
```

## Manual Setup

### Backend Setup

1. **Create virtual environment:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Run the server:**
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

3. **Run the development server:**
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Configuration

### Stripe Setup (Required for subscriptions)

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Create a subscription product with price $4.99/month
4. Add the keys to your `.env` file:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLISHABLE_KEY` (also add to frontend)
   - `STRIPE_PRICE_ID`
   - `STRIPE_WEBHOOK_SECRET` (for webhooks)

### OAuth Providers (Optional)

To enable data syncing from fitness platforms, you'll need to register apps with each provider:

**Fitbit:**
- Register at https://dev.fitbit.com
- Add redirect URI: `http://localhost:8000/api/auth/fitbit/callback`

**Garmin:**
- Apply for access at https://developer.garmin.com/

**Oura:**
- Register at https://cloud.ouraring.com/oauth/applications

**Apple Health:**
- Requires iOS app for HealthKit access
- Server-to-server setup for background sync

## Project Structure

```
fitlife-aggregator/
├── backend/
│   ├── app/
│   │   ├── core/         # Config, auth, database
│   │   ├── models/       # SQLAlchemy models
│   │   ├── routers/      # API endpoints
│   │   ├── schemas/      # Pydantic schemas
│   │   └── services/     # Business logic
│   ├── main.py           # FastAPI app entry
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/          # Next.js pages
│   │   ├── components/   # React components
│   │   ├── lib/          # Utilities & API
│   │   └── types/        # TypeScript types
│   └── package.json
└── docker-compose.yml
```

## Key Features

### Multi-Dimensional Activity Heatmap
The heatmap component visualizes your activity patterns over time with:
- **GitHub-style contribution graph** for easy pattern recognition
- **Multi-metric support**: Steps, sleep, heart rate, calories
- **Interactive tooltips** showing detailed daily data
- **Streak tracking** to motivate consistency
- **Multi-device aggregation** showing which sources contributed

### Unified Dashboard
- Connect multiple fitness devices
- Single view of all health metrics
- Weekly averages and trend analysis
- Goal tracking and progress indicators

### Subscription Tiers

**Free Plan:**
- 7-day data history
- 2 device connections
- Basic dashboard
- 14-day free trial

**Pro Plan ($4.99/month):**
- Unlimited data history
- Unlimited device connections
- Advanced analytics & trends
- Data export (CSV, JSON)
- Personalized insights
- Priority support

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Development

### Adding a New Fitness Provider

1. Add OAuth credentials to `.env`
2. Create a provider handler in `app/services/fitness_aggregator.py`
3. Add connection flow in frontend
4. Test the sync functionality

### Database Migrations

```bash
cd backend

# Create migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head
```

## Troubleshooting

**Database connection errors:**
- Check that PostgreSQL is running
- Verify DATABASE_URL in .env

**Stripe webhook errors:**
- Use Stripe CLI for local webhook testing: `stripe listen --forward-to localhost:8000/api/subscriptions/webhook`

**CORS errors:**
- Ensure FRONTEND_URL in backend .env matches your frontend URL

## License

MIT License - See LICENSE file for details
