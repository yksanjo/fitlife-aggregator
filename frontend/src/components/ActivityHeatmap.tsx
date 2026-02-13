'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HeatmapData, HeatmapPoint } from '@/types';
import { 
  getHeatmapColorHex, 
  formatNumber, 
  formatDate,
  getMetricLabel,
  getMetricUnit,
} from '@/lib/utils';
import { Info, ChevronLeft, ChevronRight, Trophy, Zap, TrendingUp } from 'lucide-react';

interface ActivityHeatmapProps {
  data: HeatmapData;
  onWeeksChange?: (weeks: number) => void;
  weeks?: number;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function ActivityHeatmap({ 
  data, 
  onWeeksChange,
  weeks = 26 
}: ActivityHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<HeatmapPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Organize data into weeks for the grid
  const { weeks: weekData, monthLabels } = useMemo(() => {
    const weeks: HeatmapPoint[][] = [];
    const labels: { month: string; index: number }[] = [];
    
    // Sort data by date
    const sortedData = [...data.data].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    if (sortedData.length === 0) return { weeks: [], monthLabels: [] };
    
    // Group into weeks (starting from Sunday)
    let currentWeek: HeatmapPoint[] = [];
    let lastMonth = -1;
    
    sortedData.forEach((point, index) => {
      const date = new Date(point.date);
      const dayOfWeek = date.getDay();
      
      // Track month labels
      const month = date.getMonth();
      if (month !== lastMonth && dayOfWeek === 0) {
        labels.push({ month: MONTHS[month], index: weeks.length });
        lastMonth = month;
      }
      
      currentWeek.push(point);
      
      if (dayOfWeek === 6 || index === sortedData.length - 1) {
        // Pad week if needed
        while (currentWeek.length < 7) {
          currentWeek.unshift({
            date: '',
            value: 0,
            metric_type: data.metric_type,
            sources: [],
          });
        }
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    
    return { weeks: weeks.slice(-weeks), monthLabels: labels };
  }, [data.data, data.metric_type, weeks]);

  const handleMouseEnter = (day: HeatmapPoint, e: React.MouseEvent) => {
    if (!day.date) return;
    setHoveredDay(day);
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setTooltipPos({ x: e.clientX, y: e.clientY - 100 });
  };

  const handleMouseLeave = () => {
    setHoveredDay(null);
  };

  // Calculate stats
  const stats = useMemo(() => {
    const values = data.data.filter(d => d.value > 0).map(d => d.value);
    const total = values.length;
    const activeDays = values.filter(v => v > 50).length;
    const consistency = total > 0 ? Math.round((activeDays / total) * 100) : 0;
    
    return {
      totalDays: total,
      activeDays,
      consistency,
      average: data.average,
      bestDay: data.best_day,
      streak: data.streak_days,
    };
  }, [data]);

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {getMetricLabel(data.metric_type)} Activity
            </h3>
            <p className="text-sm text-gray-500">
              Last {weeks} weeks • {stats.totalDays} days tracked
            </p>
          </div>
        </div>
        
        {/* Week selector */}
        {onWeeksChange && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onWeeksChange(Math.max(4, weeks - 4))}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={weeks <= 4}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-gray-600 min-w-[80px] text-center">
              {weeks} weeks
            </span>
            <button
              onClick={() => onWeeksChange(Math.min(52, weeks + 4))}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={weeks >= 52}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Average</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatNumber(stats.average)}
          </p>
          <p className="text-xs text-gray-400">{getMetricUnit(data.metric_type)}</p>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Best Day</p>
          <p className="text-2xl font-bold text-primary-600">
            {stats.bestDay ? formatNumber(stats.bestDay.raw_value) : '-'}
          </p>
          <p className="text-xs text-gray-400">
            {stats.bestDay ? formatDate(stats.bestDay.date) : 'No data'}
          </p>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Current Streak</p>
            <Zap className="w-3 h-3 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats.streak} days
          </p>
          <p className="text-xs text-gray-400">Keep it up!</p>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Consistency</p>
          <p className="text-2xl font-bold text-gray-900">
            {stats.consistency}%
          </p>
          <p className="text-xs text-gray-400">Active days</p>
        </div>
      </div>

      {/* Month labels */}
      <div className="flex mb-2 pl-8">
        {monthLabels.map((label, i) => (
          <div
            key={i}
            className="text-xs text-gray-400 font-medium"
            style={{ 
              marginLeft: i === 0 ? 0 : `${(label.index - (monthLabels[i - 1]?.index || 0)) * 14 - 30}px`,
              minWidth: '30px'
            }}
          >
            {label.month}
          </div>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="flex gap-1">
        {/* Weekday labels */}
        <div className="flex flex-col gap-1 mr-2">
          {WEEKDAYS.map((day, i) => (
            <div key={day} className="h-3 flex items-center">
              <span className="text-[10px] text-gray-400 w-6 text-right">
                {i % 2 === 1 ? day : ''}
              </span>
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="flex gap-1 overflow-x-auto pb-2">
          {weekData.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => (
                <motion.div
                  key={`${weekIndex}-${dayIndex}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: day.date ? 1 : 0 }}
                  transition={{ 
                    delay: (weekIndex * 7 + dayIndex) * 0.002,
                    duration: 0.2 
                  }}
                  className={`
                    w-3 h-3 rounded-sm cursor-pointer transition-all duration-200
                    ${day.date ? 'hover:ring-2 hover:ring-primary-400 hover:scale-125' : ''}
                  `}
                  style={{
                    backgroundColor: day.date ? getHeatmapColorHex(day.value) : 'transparent',
                  }}
                  onMouseEnter={(e) => handleMouseEnter(day, e)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-500">
            Darker colors indicate higher {getMetricLabel(data.metric_type).toLowerCase()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Less</span>
          {[0, 25, 50, 75, 100].map((value) => (
            <div
              key={value}
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: getHeatmapColorHex(value) }}
            />
          ))}
          <span className="text-xs text-gray-500">More</span>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredDay && hoveredDay.date && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl pointer-events-none"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <p className="font-medium">{formatDate(hoveredDay.date)}</p>
          <p className="text-gray-300">
            {formatNumber(hoveredDay.raw_value)} {getMetricUnit(data.metric_type)}
          </p>
          {hoveredDay.sources.length > 0 && (
            <p className="text-gray-400 text-[10px] mt-1">
              From: {hoveredDay.sources.join(', ')}
            </p>
          )}
        </div>
      )}

      {/* Achievement badges */}
      {stats.streak >= 7 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3"
        >
          <Trophy className="w-5 h-5 text-yellow-600" />
          <div>
            <p className="text-sm font-medium text-yellow-800">
              {stats.streak >= 30 ? 'Monthly Master!' : 'Week Streak!'}
            </p>
            <p className="text-xs text-yellow-600">
              You've been consistent for {stats.streak} days
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
