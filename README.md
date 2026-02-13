# 🏃‍♂️ FitLife Aggregator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-000000.svg?logo=next.js&logoColor=white)](https://nextjs.org/)

> **One Dashboard. All Your Fitness Data.**

FitLife Aggregator solves the "data in silos" problem across Apple Health, Fitbit, Garmin, Oura Ring, and more. Get a unified view of your health with our unique **multi-dimensional activity heatmap** that reveals patterns at a glance.

![Dashboard Preview](https://via.placeholder.com/800x400/22c55e/ffffff?text=FitLife+Aggregator+Dashboard)

## ✨ Features

- 🔗 **Multi-Platform Integration** - Connect Apple Health, Fitbit, Garmin, Oura Ring, Withings
- 🔥 **Multi-Dimensional Activity Heatmap** - Visual pattern recognition (26+ weeks of history)
- 📊 **Unified Dashboard** - All metrics in one beautiful interface
- 📈 **Trend Analysis** - Identify patterns across weeks, months, years
- 🎯 **Goal Tracking** - Set and monitor personalized health goals
- 💳 **Stripe Subscriptions** - Built-in $4.99/month Pro tier

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
git clone https://github.com/yksanjo/fitlife-aggregator.git
cd fitlife-aggregator

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start all services
docker-compose up -d

# App available at:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8000
# - API Docs: http://localhost:8000/docs
```

### Manual Setup

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 📖 Documentation

- [Getting Started Guide](GETTING_STARTED.md) - Detailed setup instructions
- [Project Overview](PROJECT_OVERVIEW.md) - Architecture & business model
- [API Documentation](http://localhost:8000/docs) - OpenAPI/Swagger (when running)

## 💰 Pricing

| Feature | Free | Pro ($4.99/month) |
|---------|------|-------------------|
| Data History | 7 days | Unlimited |
| Device Connections | 2 | Unlimited |
| Heatmap | Basic | Multi-dimensional |
| Advanced Analytics | ❌ | ✅ |
| Data Export | ❌ | CSV, JSON |
| Personalized Insights | ❌ | ✅ |

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Next.js UI    │────▶│   FastAPI API    │────▶│   PostgreSQL    │
│   (Frontend)    │◀────│   (Backend)      │◀────│   (Database)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        ▼                      ▼                      ▼
   ┌─────────┐           ┌──────────┐          ┌──────────┐
   │ Fitbit  │           │  Garmin  │          │  Apple   │
   │   API   │           │   API    │          │  Health  │
   └─────────┘           └──────────┘          └──────────┘
```

**Tech Stack:**
- **Backend:** Python 3.11+, FastAPI, SQLAlchemy, PostgreSQL, Redis, Celery
- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS, Zustand
- **Billing:** Stripe (Subscriptions)
- **Auth:** JWT with refresh tokens

## 🔌 Supported Integrations

| Platform | Status | Data Types |
|----------|--------|------------|
| Apple Health | ✅ Ready | Steps, HR, Sleep, Workouts |
| Fitbit | ✅ Ready | Steps, HR, Sleep, Active Zone Minutes |
| Garmin | ✅ Ready | Steps, HR, Sleep, Stress, Body Battery |
| Oura Ring | 🚧 Planned | Sleep, Readiness, Activity |
| Withings | 🚧 Planned | Weight, BP, Sleep |
| Whoop | 🚧 Planned | Recovery, Strain, Sleep |

## 🧪 Demo

Generate mock data for testing:

```bash
cd backend
python scripts/generate_mock_data.py
```

Then login with:
- **Email:** `demo@fitlife.app`
- **Password:** `demo123`

## 🛣️ Roadmap

- [x] MVP with heatmap visualization
- [x] Stripe subscription integration
- [ ] Automatic daily data sync
- [ ] Mobile app (React Native)
- [ ] ML-powered insights
- [ ] Social features (challenges, sharing)
- [ ] Apple Health direct integration

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) (coming soon).

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built as part of the Agent 2.1 project
- Inspired by GitHub's contribution graph
- Thanks to all the fitness platforms with open APIs

---

**[⬆ Back to Top](#-fitlife-aggregator)**

Made with ❤️ by [yksanjo](https://github.com/yksanjo)
