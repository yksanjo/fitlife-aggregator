#!/usr/bin/env python3
"""
Generate mock fitness data for demonstration purposes.
Run this script to populate the database with sample data.
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.user import User, DailyMetric, FitnessConnection
from app.core.auth import get_password_hash

def create_mock_data():
    db = SessionLocal()
    
    try:
        # Create test user
        test_user = db.query(User).filter(User.email == "demo@fitlife.app").first()
        if not test_user:
            test_user = User(
                email="demo@fitlife.app",
                hashed_password=get_password_hash("demo123"),
                first_name="Demo",
                last_name="User",
                is_premium=True,
                timezone="America/New_York"
            )
            db.add(test_user)
            db.commit()
            db.refresh(test_user)
            print(f"Created test user: {test_user.email}")
        
        # Create fitness connections
        providers = ["fitbit", "garmin", "apple_health"]
        for provider in providers:
            existing = db.query(FitnessConnection).filter(
                FitnessConnection.user_id == test_user.id,
                FitnessConnection.provider == provider
            ).first()
            
            if not existing:
                conn = FitnessConnection(
                    user_id=test_user.id,
                    provider=provider,
                    is_active=True,
                    is_syncing=False,
                    last_sync_at=datetime.utcnow() - timedelta(hours=2),
                    last_sync_status="success",
                    sources=[provider]
                )
                db.add(conn)
        
        db.commit()
        print("Created fitness connections")
        
        # Generate 6 months of daily metrics
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=180)
        
        current_date = start_date
        records_created = 0
        
        while current_date <= end_date:
            # Check if record exists
            existing = db.query(DailyMetric).filter(
                DailyMetric.user_id == test_user.id,
                DailyMetric.date == current_date
            ).first()
            
            if not existing:
                # Generate realistic data with patterns
                # Weekends typically have more steps
                is_weekend = current_date.weekday() >= 5
                base_steps = 8000 if is_weekend else 6000
                steps = int(base_steps + random.gauss(0, 2000))
                steps = max(2000, min(25000, steps))  # Clamp to realistic range
                
                # Sleep varies between 5-9 hours
                sleep_minutes = int(420 + random.gauss(0, 60))
                sleep_minutes = max(300, min(540, sleep_minutes))
                
                # Resting HR typically 55-75
                resting_hr = int(65 + random.gauss(0, 5))
                resting_hr = max(50, min(80, resting_hr))
                
                # Calories based on steps
                active_calories = int(steps * 0.04 + random.gauss(0, 50))
                
                # Stress score 20-80
                stress_score = int(50 + random.gauss(0, 15))
                stress_score = max(20, min(80, stress_score))
                
                metric = DailyMetric(
                    user_id=test_user.id,
                    date=current_date,
                    steps=steps,
                    active_calories=active_calories,
                    resting_hr=resting_hr,
                    sleep_duration_minutes=sleep_minutes,
                    stress_score=stress_score,
                    sources=[random.choice(["fitbit", "garmin", "apple_health"])],
                    is_complete=True
                )
                db.add(metric)
                records_created += 1
            
            current_date += timedelta(days=1)
        
        db.commit()
        print(f"Created {records_created} daily metric records")
        print("\nMock data generation complete!")
        print(f"Login with: demo@fitlife.app / demo123")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    create_mock_data()
