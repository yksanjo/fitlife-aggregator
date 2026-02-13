from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    first_name = Column(String)
    last_name = Column(String)
    avatar_url = Column(String)
    
    # Subscription
    is_premium = Column(Boolean, default=False)
    stripe_customer_id = Column(String)
    stripe_subscription_id = Column(String)
    subscription_expires_at = Column(DateTime)
    
    # Settings
    timezone = Column(String, default="UTC")
    units = Column(String, default="metric")  # metric or imperial
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    last_sync_at = Column(DateTime)
    
    # Relationships
    connections = relationship("FitnessConnection", back_populates="user", cascade="all, delete-orphan")
    daily_metrics = relationship("DailyMetric", back_populates="user", cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")


class FitnessConnection(Base):
    __tablename__ = "fitness_connections"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    provider = Column(String, nullable=False)  # apple_health, fitbit, garmin, oura, withings
    
    # OAuth tokens
    access_token = Column(Text)
    refresh_token = Column(Text)
    token_expires_at = Column(DateTime)
    
    # Connection status
    is_active = Column(Boolean, default=True)
    is_syncing = Column(Boolean, default=False)
    last_sync_at = Column(DateTime)
    last_sync_status = Column(String)  # success, error, partial
    last_error_message = Column(Text)
    
    # Provider-specific user ID
    provider_user_id = Column(String)
    
    # Sync settings
    sync_from_date = Column(DateTime)  # How far back to sync
    data_types = Column(JSON)  # ["steps", "heart_rate", "sleep", "workouts"]
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="connections")


class DailyMetric(Base):
    __tablename__ = "daily_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(DateTime, nullable=False)
    
    # Activity
    steps = Column(Integer)
    active_calories = Column(Integer)
    resting_calories = Column(Integer)
    total_calories = Column(Integer)
    active_minutes = Column(Integer)  # Moderate + vigorous activity
    distance_meters = Column(Float)
    floors_climbed = Column(Integer)
    
    # Heart Rate
    resting_hr = Column(Integer)
    avg_hr = Column(Integer)
    max_hr = Column(Integer)
    min_hr = Column(Integer)
    hr_zones = Column(JSON)  # {zone1: minutes, zone2: minutes, ...}
    
    # Sleep
    sleep_duration_minutes = Column(Integer)
    sleep_efficiency = Column(Float)  # percentage
    deep_sleep_minutes = Column(Integer)
    light_sleep_minutes = Column(Integer)
    rem_sleep_minutes = Column(Integer)
    awake_minutes = Column(Integer)
    sleep_score = Column(Integer)
    
    # Stress/Recovery
    stress_score = Column(Integer)
    recovery_score = Column(Integer)
    hrv_avg = Column(Float)  # Heart rate variability
    body_battery = Column(Integer)  # Garmin-specific
    readiness_score = Column(Integer)  # Oura-specific
    
    # Weight & Body
    weight_kg = Column(Float)
    body_fat_percentage = Column(Float)
    muscle_mass_kg = Column(Float)
    water_percentage = Column(Float)
    
    # Blood Pressure (if available)
    bp_systolic = Column(Integer)
    bp_diastolic = Column(Integer)
    
    # SpO2
    spo2_avg = Column(Float)
    spo2_min = Column(Float)
    
    # Metadata
    sources = Column(JSON)  # Which devices contributed to this data
    is_complete = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="daily_metrics")
    
    __table_args__ = (
        # Ensure one record per user per date
        {'sqlite_autoincrement': True},
    )


class Goal(Base):
    __tablename__ = "goals"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    metric_type = Column(String, nullable=False)  # steps, sleep, weight, etc.
    target_value = Column(Float, nullable=False)
    current_value = Column(Float, default=0)
    
    period = Column(String, nullable=False)  # daily, weekly, monthly
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime)
    
    is_active = Column(Boolean, default=True)
    reminder_enabled = Column(Boolean, default=False)
    reminder_time = Column(String)  # HH:MM format
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="goals")


class Workout(Base):
    __tablename__ = "workouts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Workout details
    type = Column(String, nullable=False)  # running, cycling, swimming, etc.
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    duration_seconds = Column(Integer)
    
    # Metrics
    calories = Column(Integer)
    avg_hr = Column(Integer)
    max_hr = Column(Integer)
    distance_meters = Column(Float)
    elevation_gain_meters = Column(Float)
    
    # GPS data (stored as JSON for flexibility)
    gps_data = Column(JSON)
    
    # Source
    source_provider = Column(String)  # Which device/app recorded this
    external_id = Column(String)  # Provider's workout ID
    
    created_at = Column(DateTime, server_default=func.now())
