'use client';

import { useEffect } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import ActivityHeatmap from './ActivityHeatmap';
import MetricCard from './MetricCard';
import ConnectionStatus from './ConnectionStatus';
import SubscriptionBanner from './SubscriptionBanner';
import { dashboardApi } from '@/lib/api';
import { useDashboardStore, useUIStore } from '@/lib/store';
import { 
  Footprints, 
  Flame, 
  Moon, 
  Heart, 
  RefreshCw,
  Activity,
} from 'lucide-react';

export default function Dashboard() {
  const { summary, setSummary, setLoading } = useDashboardStore();
  const { selectedMetric, heatmapWeeks, setSelectedMetric, setHeatmapWeeks } = useUIStore();

  const { data, isLoading, refetch } = useQuery(
    'dashboard-summary',
    () => dashboardApi.getSummary().then((res) => res.data),
    {
      onSuccess: (data) => {
        setSummary(data);
        setLoading(false);
      },
      onError: () => {
        setLoading(false);
      },
    }
  );

  const handleSync = async () => {
    await dashboardApi.syncData(30);
    refetch();
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Failed to load dashboard</p>
      </div>
    );
  }

  const heatmapData = data.heatmaps.find(h => h.metric_type === selectedMetric);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">FitLife</h1>
                <p className="text-xs text-gray-500">Unified Health Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={handleSync}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 
                         bg-white border border-gray-300 rounded-lg hover:bg-gray-50 
                         transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Sync Now
              </button>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {data.user.first_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {data.is_premium ? 'Pro Plan' : 'Free Plan'}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-lg">👤</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subscription Banner */}
        {!data.is_premium && data.days_remaining_trial !== undefined && (
          <SubscriptionBanner daysRemaining={data.days_remaining_trial} />
        )}

        {/* Today's Overview */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Steps"
              value={data.today_metrics?.steps || 0}
              target={10000}
              unit="steps"
              icon={<Footprints className="w-5 h-5" />}
              color="blue"
              trend={data.weekly_average.steps > 8000 ? 'up' : 'neutral'}
            />
            <MetricCard
              title="Active Calories"
              value={data.today_metrics?.active_calories || 0}
              target={500}
              unit="kcal"
              icon={<Flame className="w-5 h-5" />}
              color="orange"
              trend="up"
            />
            <MetricCard
              title="Sleep"
              value={data.today_metrics?.sleep_duration_minutes || 0}
              target={480}
              unit="min"
              icon={<Moon className="w-5 h-5" />}
              color="purple"
              format="duration"
            />
            <MetricCard
              title="Resting HR"
              value={data.today_metrics?.resting_hr || 0}
              target={60}
              unit="bpm"
              icon={<Heart className="w-5 h-5" />}
              color="red"
              lowerIsBetter
            />
          </div>
        </motion.section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Heatmaps */}
          <div className="lg:col-span-2 space-y-6">
            {/* Metric Selector */}
            <div className="flex flex-wrap gap-2">
              {['steps', 'sleep', 'heart_rate', 'calories'].map((metric) => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${selectedMetric === metric 
                      ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-500' 
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}
                  `}
                >
                  {metric === 'heart_rate' ? 'Heart Rate' : 
                   metric.charAt(0).toUpperCase() + metric.slice(1)}
                </button>
              ))}
            </div>

            {/* Activity Heatmap */}
            {heatmapData && (
              <ActivityHeatmap 
                data={heatmapData}
                weeks={heatmapWeeks}
                onWeeksChange={setHeatmapWeeks}
              />
            )}

            {/* Additional Heatmaps (Premium) */}
            {data.is_premium && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Multi-Dimensional View
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.heatmaps
                    .filter(h => h.metric_type !== selectedMetric)
                    .slice(0, 2)
                    .map((heatmap) => (
                      <div key={heatmap.metric_type} className="opacity-75 hover:opacity-100 transition-opacity">
                        <ActivityHeatmap data={heatmap} weeks={12} />
                      </div>
                    ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Connections & Goals */}
          <div className="space-y-6">
            {/* Connected Devices */}
            <ConnectionStatus connections={data.connections} />

            {/* Weekly Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Average</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Steps</span>
                  <span className="font-semibold text-gray-900">
                    {data.weekly_average.steps.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Active Minutes</span>
                  <span className="font-semibold text-gray-900">
                    {data.weekly_average.active_minutes}m
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Sleep</span>
                  <span className="font-semibold text-gray-900">
                    {data.weekly_average.sleep_hours}h
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Resting HR</span>
                  <span className="font-semibold text-gray-900">
                    {data.weekly_average.resting_hr} bpm
                  </span>
                </div>
              </div>
            </div>

            {/* Active Goals */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Goals</h3>
              {data.active_goals.length > 0 ? (
                <div className="space-y-3">
                  {data.active_goals.map((goal, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary-500 rounded-full" />
                      <span className="text-gray-600 capitalize">{goal.type}</span>
                      <span className="ml-auto font-medium text-gray-900">
                        {goal.target}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No active goals. Set your first goal!</p>
              )}
            </div>

            {/* Upgrade CTA (Free users) */}
            {!data.is_premium && (
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
                <h3 className="font-semibold mb-2">Unlock Full History</h3>
                <p className="text-sm text-primary-100 mb-4">
                  Upgrade to Pro for unlimited data history, advanced analytics, and more.
                </p>
                <button className="w-full py-2.5 bg-white text-primary-600 font-medium rounded-lg hover:bg-primary-50 transition-colors">
                  Upgrade to Pro - $4.99/mo
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-16 bg-white border-b border-gray-200" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-white rounded-2xl" />
            ))}
          </div>
          <div className="h-96 bg-white rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
