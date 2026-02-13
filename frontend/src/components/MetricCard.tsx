'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatNumber, formatDuration } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: number;
  target: number;
  unit: string;
  icon: React.ReactNode;
  color: 'blue' | 'orange' | 'purple' | 'red' | 'green';
  trend?: 'up' | 'down' | 'neutral';
  format?: 'number' | 'duration' | 'percentage';
  lowerIsBetter?: boolean;
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600',
  orange: 'bg-orange-50 text-orange-600',
  purple: 'bg-purple-50 text-purple-600',
  red: 'bg-red-50 text-red-600',
  green: 'bg-green-50 text-green-600',
};

export default function MetricCard({
  title,
  value,
  target,
  unit,
  icon,
  color,
  trend = 'neutral',
  format = 'number',
  lowerIsBetter = false,
}: MetricCardProps) {
  const percentage = Math.min(100, Math.round((value / target) * 100));
  const displayValue = format === 'duration' ? formatDuration(value) : formatNumber(value);
  
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (trend === 'neutral') return 'text-gray-400';
    if (lowerIsBetter) {
      return trend === 'down' ? 'text-green-500' : 'text-red-500';
    }
    return trend === 'up' ? 'text-green-500' : 'text-red-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 ${getTrendColor()}`}>
          {getTrendIcon()}
        </div>
      </div>

      <div className="mb-3">
        <p className="text-2xl font-bold text-gray-900">{displayValue}</p>
        <p className="text-sm text-gray-500">{title}</p>
      </div>

      {/* Progress bar */}
      <div className="relative">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              color === 'blue' ? 'bg-blue-500' :
              color === 'orange' ? 'bg-orange-500' :
              color === 'purple' ? 'bg-purple-500' :
              color === 'red' ? 'bg-red-500' : 'bg-green-500'
            }`}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-gray-400">{percentage}% of goal</span>
          <span className="text-xs text-gray-400">{formatNumber(target)} {unit}</span>
        </div>
      </div>
    </motion.div>
  );
}
