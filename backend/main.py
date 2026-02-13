from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.database import engine, Base
from app.routers import auth, dashboard, subscriptions
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables
    Base.metadata.create_all(bind=engine)
    print(f"🚀 {settings.APP_NAME} is starting up...")
    yield
    # Shutdown
    print(f"👋 {settings.APP_NAME} is shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    description="Unified fitness data platform solving the data silos problem",
    version="2.1.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(subscriptions.router, prefix="/api")


@app.get("/")
def root():
    return {
        "name": settings.APP_NAME,
        "version": "2.1.0",
        "tagline": "One Dashboard. All Your Fitness Data.",
        "status": "healthy"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "fitlife-aggregator"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
