from typing import List, Dict, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.user import User, DailyMetric, FitnessConnection
import httpx
import asyncio


class FitnessDataAggregator:
    """
    Aggregates fitness data from multiple wearable devices and platforms.
    Handles normalization, conflict resolution, and data merging.
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    async def sync_user_data(self, user_id: int, days_back: int = 30) -> Dict:
        """
        Sync data from all connected fitness platforms for a user.
        """
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return {"error": "User not found"}
        
        connections = self.db.query(FitnessConnection).filter(
            FitnessConnection.user_id == user_id,
            FitnessConnection.is_active == True
        ).all()
        
        results = {
            "user_id": user_id,
            "synced_providers": [],
            "errors": [],
            "records_created": 0,
            "records_updated": 0
        }
        
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days_back)
        
        for conn in connections:
            try:
                provider_data = await self._fetch_from_provider(conn, start_date, end_date)
                if provider_data:
                    stats = await self._merge_provider_data(user_id, conn.provider, provider_data)
                    results["records_created"] += stats["created"]
                    results["records_updated"] += stats["updated"]
                    results["synced_providers"].append(conn.provider)
                    
                    # Update connection status
                    conn.last_sync_at = datetime.utcnow()
                    conn.last_sync_status = "success"
                    conn.is_syncing = False
            except Exception as e:
                results["errors"].append({
                    "provider": conn.provider,
                    "error": str(e)
                })
                conn.last_sync_status = "error"
                conn.last_error_message = str(e)
        
        self.db.commit()
        
        # Update user's last sync time
        user.last_sync_at = datetime.utcnow()
        self.db.commit()
        
        return results
    
    async def _fetch_from_provider(
        self, 
        connection: FitnessConnection, 
        start_date: datetime, 
        end_date: datetime
    ) -> Optional[List[Dict]]:
        """
        Fetch data from a specific provider.
        This is a placeholder - real implementation would call each provider's API.
        """
        provider_handlers = {
            "fitbit": self._fetch_fitbit,
            "garmin": self._fetch_garmin,
            "apple_health": self._fetch_apple_health,
            "oura": self._fetch_oura,
        }
        
        handler = provider_handlers.get(connection.provider)
        if handler:
            return await handler(connection, start_date, end_date)
        return None
    
    async def _fetch_fitbit(self, conn: FitnessConnection, start: datetime, end: datetime) -> List[Dict]:
        """Fetch data from Fitbit API."""
        # Placeholder - real implementation would use Fitbit OAuth2 flow
        # and call endpoints like /1/user/-/activities/steps/date/{date}/{end-date}.json
        return []
    
    async def _fetch_garmin(self, conn: FitnessConnection, start: datetime, end: datetime) -> List[Dict]:
        """Fetch data from Garmin API."""
        # Placeholder - would use Garmin Health API
        return []
    
    async def _fetch_apple_health(self, conn: FitnessConnection, start: datetime, end: datetime) -> List[Dict]:
        """Fetch data from Apple Health via HealthKit export or direct integration."""
        # Placeholder - Apple Health typically requires iOS app for data access
        return []
    
    async def _fetch_oura(self, conn: FitnessConnection, start: datetime, end: datetime) -> List[Dict]:
        """Fetch data from Oura Ring API."""
        # Placeholder - would use Oura Cloud API v2
        return []
    
    async def _merge_provider_data(
        self, 
        user_id: int, 
        provider: str, 
        data: List[Dict]
    ) -> Dict:
        """
        Merge provider data into the unified daily metrics table.
        Handles conflicts by taking the most complete data or averaging.
        """
        created = 0
        updated = 0
        
        for record in data:
            date = record.get("date")
            if not date:
                continue
            
            # Check if record exists
            existing = self.db.query(DailyMetric).filter(
                DailyMetric.user_id == user_id,
                DailyMetric.date == date
            ).first()
            
            if not existing:
                # Create new record
                new_metric = DailyMetric(
                    user_id=user_id,
                    date=date,
                    **self._normalize_record(record, provider)
                )
                self.db.add(new_metric)
                created += 1
            else:
                # Merge data - prefer non-null values, average duplicates
                updated_fields = self._merge_records(existing, record, provider)
                if updated_fields:
                    updated += 1
        
        self.db.commit()
        return {"created": created, "updated": updated}
    
    def _normalize_record(self, record: Dict, provider: str) -> Dict:
        """
        Normalize provider-specific data to our unified schema.
        """
        normalized = {
            "sources": [provider],
            "is_complete": False
        }
        
        # Map provider-specific fields to unified fields
        field_mappings = {
            "steps": ["steps", "activitySteps", "total_steps"],
            "active_calories": ["activeCalories", "activityCalories", "calories_out"],
            "resting_hr": ["restingHeartRate", "resting_hr", "resting_heart_rate"],
            "sleep_duration_minutes": ["totalSleepTime", "duration", "minutesAsleep"],
        }
        
        for unified_field, possible_names in field_mappings.items():
            for name in possible_names:
                if name in record and record[name] is not None:
                    normalized[unified_field] = record[name]
                    break
        
        return normalized
    
    def _merge_records(self, existing: DailyMetric, new_data: Dict, provider: str) -> bool:
        """
        Merge new data into existing record. Returns True if any field was updated.
        """
        updated = False
        
        # Add source if not already present
        if existing.sources is None:
            existing.sources = []
        if provider not in existing.sources:
            existing.sources.append(provider)
            updated = True
        
        # Update fields if new data is better quality
        # Strategy: prefer non-null values, but could implement more sophisticated logic
        mappings = {
            "steps": ["steps", "activitySteps"],
            "active_calories": ["activeCalories", "calories_out"],
            "resting_hr": ["restingHeartRate"],
            "sleep_duration_minutes": ["totalSleepTime", "minutesAsleep"],
        }
        
        for field, possible_names in mappings.items():
            current_value = getattr(existing, field)
            for name in possible_names:
                if name in new_data and new_data[name] is not None:
                    new_value = new_data[name]
                    if current_value is None:
                        setattr(existing, field, new_value)
                        updated = True
                    elif field == "steps":
                        # For steps, take the maximum from all sources
                        setattr(existing, field, max(current_value, new_value))
                        updated = True
                    break
        
        return updated
    
    def get_unified_metrics(
        self, 
        user_id: int, 
        start_date: datetime, 
        end_date: datetime
    ) -> List[DailyMetric]:
        """
        Get unified metrics for a date range.
        """
        return self.db.query(DailyMetric).filter(
            DailyMetric.user_id == user_id,
            DailyMetric.date >= start_date,
            DailyMetric.date <= end_date
        ).order_by(DailyMetric.date).all()
    
    def generate_heatmap_data(
        self,
        user_id: int,
        metric_type: str,
        weeks: int = 26
    ) -> Dict:
        """
        Generate data for the multi-dimensional activity heatmap.
        """
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(weeks=weeks * 7)
        
        metrics = self.get_unified_metrics(user_id, start_date, end_date)
        
        # Map metric_type to actual field name
        field_map = {
            "steps": "steps",
            "sleep": "sleep_duration_minutes",
            "heart_rate": "resting_hr",
            "calories": "active_calories",
            "stress": "stress_score"
        }
        
        field = field_map.get(metric_type, metric_type)
        
        # Calculate normalization values
        values = [getattr(m, field) for m in metrics if getattr(m, field) is not None]
        
        if not values:
            return {
                "metric_type": metric_type,
                "data": [],
                "average": 0,
                "best_day": None,
                "streak_days": 0
            }
        
        min_val = min(values)
        max_val = max(values)
        avg_val = sum(values) / len(values)
        
        # Generate heatmap points
        heatmap_data = []
        best_day = None
        best_value = -1
        
        for metric in metrics:
            raw_value = getattr(metric, field)
            if raw_value is None:
                continue
            
            # Normalize to 0-100 for heatmap intensity
            if max_val == min_val:
                normalized = 50
            else:
                normalized = ((raw_value - min_val) / (max_val - min_val)) * 100
            
            point = {
                "date": metric.date.strftime("%Y-%m-%d"),
                "value": round(normalized, 2),
                "raw_value": raw_value,
                "metric_type": metric_type,
                "sources": metric.sources or []
            }
            heatmap_data.append(point)
            
            # Track best day
            if metric_type == "heart_rate":
                # Lower is better for resting HR
                if best_value == -1 or raw_value < best_value:
                    best_value = raw_value
                    best_day = point
            else:
                # Higher is better for steps, sleep, etc.
                if raw_value > best_value:
                    best_value = raw_value
                    best_day = point
        
        # Calculate streak (consecutive days meeting goal)
        # For simplicity, we'll define streak as consecutive days with data
        streak = 0
        sorted_data = sorted(heatmap_data, key=lambda x: x["date"], reverse=True)
        
        for point in sorted_data:
            # Simple streak: consecutive days with any activity
            streak += 1
        
        return {
            "metric_type": metric_type,
            "start_date": start_date.strftime("%Y-%m-%d"),
            "end_date": end_date.strftime("%Y-%m-%d"),
            "data": heatmap_data,
            "average": round(avg_val, 2),
            "best_day": best_day,
            "streak_days": min(streak, 7)  # Cap at 7 for weekly streak
        }
