export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  is_premium: boolean;
  timezone: string;
  units: string;
  created_at: string;
  last_sync_at?: string;
}

export interface FitnessConnection {
  id: number;
  provider: 'apple_health' | 'fitbit' | 'garmin' | 'oura' | 'withings';
  is_active: boolean;
  is_syncing: boolean;
  last_sync_at?: string;
  last_sync_status?: string;
  created_at: string;
}

export interface DailyMetric {
  date: string;
  steps?: number;
  active_calories?: number;
  sleep_duration_minutes?: number;
  resting_hr?: number;
  stress_score?: number;
}

export interface HeatmapPoint {
  date: string;
  value: number;
  raw_value?: number;
  metric_type: string;
  sources: string[];
}

export interface HeatmapData {
  metric_type: string;
  start_date: string;
  end_date: string;
  data: HeatmapPoint[];
  average: number;
  best_day?: HeatmapPoint;
  streak_days: number;
}

export interface DashboardSummary {
  user: User;
  connections: FitnessConnection[];
  today_metrics?: DailyMetric;
  weekly_average: {
    steps: number;
    active_minutes: number;
    sleep_hours: number;
    resting_hr: number;
  };
  heatmaps: HeatmapData[];
  active_goals: Array<{
    type: string;
    target: number;
  }>;
  is_premium: boolean;
  days_remaining_trial?: number;
}

export interface TrendData {
  metric: string;
  period: string;
  data_points: number;
  average: number;
  trend: 'improving' | 'declining' | 'stable' | 'insufficient_data';
  change_percent: number;
  best_day: number;
  worst_day: number;
}
