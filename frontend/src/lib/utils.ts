import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number | undefined, decimals = 0): string {
  if (num === undefined || num === null) return '-';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatDuration(minutes: number | undefined): string {
  if (minutes === undefined || minutes === null) return '-';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function getHeatmapColor(value: number): string {
  // value is 0-100
  if (value === 0) return 'bg-gray-100';
  if (value < 25) return 'bg-primary-200';
  if (value < 50) return 'bg-primary-400';
  if (value < 75) return 'bg-primary-600';
  return 'bg-primary-800';
}

export function getHeatmapColorHex(value: number): string {
  // GitHub-style contribution heatmap colors
  if (value === 0) return '#ebedf0';
  if (value < 25) return '#9be9a8';
  if (value < 50) return '#40c463';
  if (value < 75) return '#30a14e';
  return '#216e39';
}

export function getProviderIcon(provider: string): string {
  const icons: Record<string, string> = {
    apple_health: '🍎',
    fitbit: '⌚',
    garmin: '📱',
    oura: '💍',
    withings: '⚖️',
  };
  return icons[provider] || '📊';
}

export function getProviderName(provider: string): string {
  const names: Record<string, string> = {
    apple_health: 'Apple Health',
    fitbit: 'Fitbit',
    garmin: 'Garmin',
    oura: 'Oura Ring',
    withings: 'Withings',
  };
  return names[provider] || provider;
}

export function getMetricUnit(metric: string): string {
  const units: Record<string, string> = {
    steps: 'steps',
    sleep: 'hrs',
    heart_rate: 'bpm',
    calories: 'kcal',
    stress: 'score',
  };
  return units[metric] || '';
}

export function getMetricLabel(metric: string): string {
  const labels: Record<string, string> = {
    steps: 'Steps',
    sleep: 'Sleep',
    heart_rate: 'Resting HR',
    calories: 'Active Calories',
    stress: 'Stress',
  };
  return labels[metric] || metric;
}

export function calculateStreak(data: { date: string; value: number }[]): number {
  if (!data.length) return 0;
  
  // Sort by date descending
  const sorted = [...data].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (const point of sorted) {
    const pointDate = new Date(point.date);
    pointDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor(
      (today.getTime() - pointDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (diffDays === streak && point.value > 0) {
      streak++;
    } else if (diffDays > streak) {
      break;
    }
  }
  
  return streak;
}
