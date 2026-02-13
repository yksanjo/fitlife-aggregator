from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum


class ProviderType(str, Enum):
    APPLE_HEALTH = "apple_health"
    FITBIT = "fitbit"
    GARMIN = "garmin"
    OURA = "oura"
    WITHINGS = "withings"
    WHOOP = "whoop"


class UserBase(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    timezone: Optional[str] = None
    units: Optional[str] = None


class UserResponse(UserBase):
    id: int
    avatar_url: Optional[str]
    is_premium: bool
    timezone: str
    units: str
    created_at: datetime
    last_sync_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class FitnessConnectionBase(BaseModel):
    provider: ProviderType
    data_types: List[str] = ["steps", "heart_rate", "sleep", "workouts"]


class FitnessConnectionCreate(FitnessConnectionBase):
    pass


class FitnessConnectionResponse(FitnessConnectionBase):
    id: int
    user_id: int
    is_active: bool
    is_syncing: bool
    last_sync_at: Optional[datetime]
    last_sync_status: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class DailyMetricSummary(BaseModel):
    date: datetime
    steps: Optional[int]
    active_calories: Optional[int]
    sleep_duration_minutes: Optional[int]
    resting_hr: Optional[int]
    stress_score: Optional[int]
    
    class Config:
        from_attributes = True


class HeatmapDataPoint(BaseModel):
    date: str  # ISO date string
    value: float  # Normalized 0-100 value for heatmap intensity
    raw_value: Optional[float]  # Actual value
    metric_type: str  # steps, sleep, hr, etc.
    sources: List[str]  # Which devices contributed


class MultiDimensionalHeatmap(BaseModel):
    metric_type: str
    start_date: str
    end_date: str
    data: List[HeatmapDataPoint]
    average: float
    best_day: Optional[HeatmapDataPoint]
    streak_days: int


class DashboardSummary(BaseModel):
    user: UserResponse
    connections: List[FitnessConnectionResponse]
    today_metrics: Optional[DailyMetricSummary]
    weekly_average: dict
    heatmaps: List[MultiDimensionalHeatmap]
    active_goals: List[dict]
    is_premium: bool
    days_remaining_trial: Optional[int]
