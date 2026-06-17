import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { fetchWeeklyData, fetchMonthlyData, fetchYearlyData, fetchHabitPerformance } from '../features/analytics/analyticsSlice';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { FiBarChart2, FiTrendingUp, FiTarget, FiChevronLeft, FiChevronRight, FiActivity, FiZap, FiCheckCircle, FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-slate-950 p-3 shadow-xl text-xs space-y-1">
        <p className="text-slate-400 font-medium mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-semibold">
            {p.name}: {p.value}{p.name === 'Rate' ? '%' : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const dispatch = useDispatch();
  const { weeklyData, monthlyData, yearlyData, habitPerformance, categories } = useSelector((s) => s.analytics);
  const [calMonth, setCalMonth] = useState(new Date());

  useEffect(() => {
    dispatch(fetchWeeklyData());
    dispatch(fetchYearlyData({ year: new Date().getFullYear() }));
    dispatch(fetchHabitPerformance());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchMonthlyData({ year: calMonth.getFullYear(), month: calMonth.getMonth() + 1 }));
  }, [dispatch, calMonth]);

  const totalCompleted = weeklyData.reduce((a, d) => a + d.completed, 0);
  const avgRate = weeklyData.length > 0 ? Math.round(weeklyData.reduce((a, d) => a + d.rate, 0) / weeklyData.length) : 0;
  const bestStreak = habitPerformance.reduce((max, h) => Math.max(max, h.longestStreak || 0), 0);

  const categoryChartData = Object.entries(categories || {}).map(([name, data]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: data.count,
    rate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
  }));

  // Heatmap helper to generate days
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    const days = [];
    
    // padding for start of week (Monday start: Mon=0, Tue=1... Sun=6)
    let startDay = start.getDay(); // 0 = Sun, 1 = Mon... 6 = Sat
    const padding = startDay === 0 ? 6 : startDay - 1;
    for (let i = 0; i < padding; i++) {
      days.push(null);
    }
    for (let i = 1; i <= end.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const daysArray = getDaysInMonth(calMonth);
  const heatmap = monthlyData?.heatmap || {};

  const getCellBg = (dateStr) => {
    const d = heatmap[dateStr];
    if (!d || d.total === 0) return 'rgba(255,255,255,0.03)'; // Empty/untracked
    const r = d.completed / d.total;
    if (r === 0) return 'rgba(239, 68, 68, 0.15)'; // 0% completed (Reddish tint)
    if (r < 0.25) return 'rgba(99, 102, 241, 0.25)'; // Low completion
    if (r < 0.5) return 'rgba(99, 102, 241, 0.5)';
    if (r < 0.75) return 'rgba(99, 102, 241, 0.75)';
    return '#6366f1'; // 100% completion
  };

  const getCellBorder = (dateStr) => {
    const d = heatmap[dateStr];
    if (!d || d.total === 0) return 'border-white/5';
    return 'border-indigo-500/20';
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 text-white min-h-screen">
      {/* Title Header */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <FiBarChart2 className="text-violet-500" /> Analytics Dashboard
        </h1>
        <p className="text-slate-400 mt-1">Deep insights into your productivity, consistency, and habit streaks</p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Avg Completion', value: `${avgRate}%`, icon: FiActivity, color: '#6366f1' },
          { label: 'Longest Streak', value: `${bestStreak} days`, icon: FiZap, color: '#f59e0b' },
          { label: 'Habits Active', value: habitPerformance.length, icon: FiTarget, color: '#10b981' },
          { label: 'This Week Done', value: totalCompleted, icon: FiCheckCircle, color: '#8b5cf6' },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 p-5 backdrop-blur-md shadow-lg flex items-center justify-between"
            >
              <div className="space-y-1">
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">{card.label}</p>
                <p className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: card.color }}>{card.value}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xl" style={{ color: card.color }}>
                <Icon />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Bar Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-md">
          <h2 className="text-base font-bold text-white mb-6 flex items-center gap-2">
            <FiTrendingUp className="text-violet-500" /> Weekly Completion Trend
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="completed" name="Completed" radius={[4, 4, 0, 0]} fill="#6366f1" />
              <Bar dataKey="total" name="Total" radius={[4, 4, 0, 0]} fill="rgba(99,102,241,0.15)" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Yearly Area Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-md">
          <h2 className="text-base font-bold text-white mb-6 flex items-center gap-2">
            <FiActivity className="text-violet-500" /> Yearly Growth Rate
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={yearlyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="rate" name="Rate" stroke="#8b5cf6" fill="url(#areaGrad)" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Monthly Heatmap Calendar section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FiCalendar className="text-violet-500" /> Monthly Heatmap
          </h2>
          
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1.5 self-center">
            <button
              onClick={() => setCalMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
              className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition"
            >
              <FiChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold px-3 uppercase tracking-wider">{format(calMonth, 'MMMM yyyy')}</span>
            <button
              onClick={() => setCalMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
              className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="max-w-md mx-auto">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 uppercase mb-3">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="py-1">{day}</div>
            ))}
          </div>
          
          {/* Cells */}
          <div className="grid grid-cols-7 gap-2">
            {daysArray.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="aspect-square" />;
              const dateStr = format(day, 'yyyy-MM-dd');
              const cellBg = getCellBg(dateStr);
              const cellBorder = getCellBorder(dateStr);
              const hoverTitle = heatmap[dateStr] 
                ? `${format(day, 'MMM d')}: ${heatmap[dateStr].completed}/${heatmap[dateStr].total} completed`
                : `${format(day, 'MMM d')}: No habits`;

              return (
                <div
                  key={dateStr}
                  title={hoverTitle}
                  style={{ backgroundColor: cellBg }}
                  className={`aspect-square rounded-lg border ${cellBorder} flex items-center justify-center text-[10px] font-semibold text-slate-400/60 hover:scale-110 hover:border-indigo-500/50 transition cursor-help`}
                >
                  {day.getDate()}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-3 mt-6 text-[10px] text-slate-400">
            <span>Less</span>
            <div className="flex gap-1.5">
              <div className="w-3.5 h-3.5 rounded bg-white/5 border border-white/5" title="Untracked" />
              <div className="w-3.5 h-3.5 rounded bg-red-500/15 border border-red-500/20" title="0%" />
              <div className="w-3.5 h-3.5 rounded bg-indigo-500/25 border border-indigo-500/10" title="1-24%" />
              <div className="w-3.5 h-3.5 rounded bg-indigo-500/50 border border-indigo-500/20" title="25-49%" />
              <div className="w-3.5 h-3.5 rounded bg-indigo-500/75 border border-indigo-500/20" title="50-74%" />
              <div className="w-3.5 h-3.5 rounded bg-indigo-600 border border-indigo-500/20" title="75-100%" />
            </div>
            <span>More</span>
          </div>
        </div>
      </motion.div>

      {/* Bottom grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        {categoryChartData.length > 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-md">
            <h2 className="text-base font-bold text-white mb-6">Category Breakdown</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="w-full sm:w-1/2 flex justify-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryChartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full sm:w-1/2 space-y-2">
                {categoryChartData.map((c, i) => (
                  <div key={c.name} className="flex items-center justify-between text-xs border-b border-white/5 pb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="font-medium">{c.name}</span>
                    </div>
                    <span className="text-slate-400 font-semibold">{c.value} habits ({c.rate}% rate)</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 text-center text-slate-500">
            No category metrics yet
          </div>
        )}

        {/* Habit Performance Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-md">
          <h2 className="text-base font-bold text-white mb-6">Individual Habit Performance (30 Days)</h2>
          <div className="space-y-4 max-h-[200px] overflow-y-auto pr-1">
            {habitPerformance.map((h) => (
              <div key={h._id} className="flex items-center gap-3">
                <span className="text-2xl w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 border border-white/10">{h.icon || '🎯'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold truncate text-slate-200">{h.title}</span>
                    <span className="text-xs font-bold text-slate-400">{h.completionRate}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/5 border border-white/10 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${h.completionRate}%`, backgroundColor: h.color || '#6366f1' }} />
                  </div>
                </div>
                <div className="text-xs font-bold text-amber-500 flex items-center gap-1">
                  🔥 {h.currentStreak}d
                </div>
              </div>
            ))}
            {habitPerformance.length === 0 && (
              <div className="text-center text-slate-500 py-8 text-sm">No habit logs found. Track some habits first!</div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
