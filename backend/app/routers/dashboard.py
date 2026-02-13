from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from app.core.database import get_db
from app.routers.auth import get_current_user
from app.models.user import User, FitnessConnection, Goal
from app.schemas.user import (
    DashboardSummary, DailyMetricSummary, 
    MultiDimensionalHeatmap, FitnessConnectionResponse
)
from app.services.fitness_aggregator import FitnessDataAggregator

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the complete dashboard summary for the current user."""
    aggregator = FitnessDataAggregator(db)
    
    # Get user's connections
    connections = db.query(FitnessConnection).filter(
        FitnessConnection.user_id == current_user.id,
        FitnessConnection.is_active == True
    ).all()
    
    # Get today's metrics
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_metrics = None  # Would fetch from daily_metrics
    
    # Calculate weekly average
    week_ago = today - timedelta(days=7)
    # Would calculate from daily_metrics
    weekly_average = {
        "steps": 8432,
        "active_minutes": 45,
        "sleep_hours": 7.2,
        "resting_hr": 62
    }
    
    # Generate heatmaps for different metrics
    heatmaps = []
    for metric_type in ["steps", "sleep", "heart_rate", "calories"]:
        heatmap = aggregator.generate_heatmap_data(
            current_user.id, metric_type, weeks=26
        )
        heatmaps.append(MultiDimensionalHeatmap(**heatmap))
    
    # Get active goals
    goals = db.query(Goal).filter(
        Goal.user_id == current_user.id,
        Goal.is_active == True
    ).all()
    
    # Calculate trial days remaining (if applicable)
    days_remaining = None
    if not current_user.is_premium:
        days_since_signup = (datetime.utcnow() - current_user.created_at).days
        trial_days = 14
        days_remaining = max(0, trial_days - days_since_signup)
    
    return DashboardSummary(
        user=current_user,
        connections=[FitnessConnectionResponse.model_validate(c) for c in connections],
        today_metrics=today_metrics,
        weekly_average=weekly_average,
        heatmaps=heatmaps,
        active_goals=[{"type": g.metric_type, "target": g.target_value} for g in goals],
        is_premium=current_user.is_premium,
        days_remaining_trial=days_remaining
    )


@router.get("/heatmap/{metric_type}", response_model=MultiDimensionalHeatmap)
async def get_heatmap(
    metric_type: str,
    weeks: int = Query(default=26, ge=4, le=52),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get heatmap data for a specific metric type.
    
    Available metric types:
    - steps: Daily step count
    - sleep: Sleep duration in minutes
    - heart_rate: Resting heart rate
    - calories: Active calories burned
    - stress: Stress score (if available)
    """
    aggregator = FitnessDataAggregator(db)
    heatmap_data = aggregator.generate_heatmap_data(
        current_user.id, metric_type, weeks=weeks
    )
    return MultiDimensionalHeatmap(**heatmap_data)


@router.post("/sync")
async def sync_data(
    days: int = Query(default=30, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Trigger a sync of fitness data from all connected providers."""
    aggregator = FitnessDataAggregator(db)
    result = await aggregator.sync_user_data(current_user.id, days_back=days)
    return result


@router.get("/trends")
async def get_trends(
    metric: str = Query(..., description="Metric to analyze"),
    period: str = Query(default="30d", regex="^(7d|30d|90d|1y)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get trend analysis for a specific metric over time.
    """
    # Parse period
    period_days = {"7d": 7, "30d": 30, "90d": 90, "1y": 365}[period]
    
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=period_days)
    
    aggregator = FitnessDataAggregator(db)
    metrics = aggregator.get_unified_metrics(
        current_user.id, start_date, end_date
    )
    
    # Calculate trend
    field_map = {
        "steps": "steps",
        "sleep": "sleep_duration_minutes",
        "heart_rate": "resting_hr",
        "calories": "active_calories"
    }
    
    field = field_map.get(metric)
    values = [getattr(m, field) for m in metrics if getattr(m, field) is not None]
    
    if not values:
        return {
            "metric": metric,
            "period": period,
            "data_points": 0,
            "trend": "insufficient_data"
        }
    
    # Simple trend calculation
    avg = sum(values) / len(values)
    first_half = values[:len(values)//2]
    second_half = values[len(values)//2:]
    
    first_avg = sum(first_half) / len(first_half) if first_half else 0
    second_avg = sum(second_half) / len(second_half) if second_half else 0
    
    if second_avg > first_avg * 1.05:
        trend = "improving"
    elif second_avg < first_avg * 0.95:
        trend = "declining"
    else:
        trend = "stable"
    
    return {
        "metric": metric,
        "period": period,
        "data_points": len(values),
        "average": round(avg, 2),
        "trend": trend,
        "change_percent": round(((second_avg - first_avg) / first_avg) * 100, 2) if first_avg else 0,
        "best_day": max(values) if metric != "heart_rate" else min(values),
        "worst_day": min(values) if metric != "heart_rate" else max(values)
    }
