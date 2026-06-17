import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday } from 'date-fns';
import { fetchMonthlyData } from '../features/analytics/analyticsSlice';
import { fetchHabits } from '../features/habits/habitSlice';
import { FiChevronLeft, FiChevronRight, FiCalendar, FiCheck, FiX, FiInfo, FiActivity, FiZap } from 'react-icons/fi';

export default function CalendarPage() {
  const dispatch = useDispatch();
  const { monthlyData } = useSelector((state) => state.analytics);
  const { habits } = useSelector((state) => state.habits);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date()); // default to today

  useEffect(() => {
    dispatch(fetchHabits({ archived: 'false' }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchMonthlyData({
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1,
    }));
  }, [dispatch, currentDate]);

  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate),
    });
  }, [currentDate]);

  const startDay = getDay(startOfMonth(currentDate)); // 0 = Sun, 1 = Mon ...
  const heatmap = monthlyData?.heatmap || {};

  const getCellColor = (dateStr) => {
    const data = heatmap[dateStr];
    if (!data || data.total === 0) return 'rgba(255,255,255,0.03)';
    const rate = data.completed / data.total;
    if (rate === 0) return 'rgba(239, 68, 68, 0.1)'; // 0%
    if (rate < 0.25) return 'rgba(99, 102, 241, 0.2)';
    if (rate < 0.5) return 'rgba(99, 102, 241, 0.4)';
    if (rate < 0.75) return 'rgba(99, 102, 241, 0.65)';
    return 'rgba(99, 102, 241, 0.9)'; // 100%
  };

  const getCellBorder = (dateStr) => {
    const data = heatmap[dateStr];
    if (!data || data.total === 0) return 'border-white/5';
    return 'border-indigo-500/20';
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Extract selected day data
  const selectedDayDetails = useMemo(() => {
    if (!selectedDay) return null;
    const dateStr = format(selectedDay, 'yyyy-MM-dd');
    const dayStats = heatmap[dateStr] || null;
    
    // Find logs for this specific date
    const dayLogs = monthlyData?.logs?.filter((l) => l.date === dateStr) || [];
    
    // Match logs to habits
    const loggedHabits = dayLogs.map(log => {
      const habit = habits.find(h => h._id === log.habit);
      return habit ? { ...habit, completed: log.completed } : { _id: log.habit, title: 'Deleted Habit', icon: '❓', completed: log.completed };
    });

    return {
      stats: dayStats,
      habits: loggedHabits,
    };
  }, [selectedDay, heatmap, monthlyData, habits]);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 text-white min-h-screen">
      {/* Title Header */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <FiCalendar className="text-violet-500" /> Habit Calendar
          </h1>
          <p className="text-slate-400 mt-1">Visualize and review your habit logs date by date</p>
        </div>
        
        {/* Month Navigation */}
        <div className="flex items-center gap-2 bg-slate-900 border border-white/10 p-1.5 rounded-2xl shadow-inner w-fit self-start sm:self-center">
          <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition">
            <FiChevronLeft size={16} />
          </button>
          <span className="text-xs font-bold px-4 uppercase tracking-wider min-w-[120px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition">
            <FiChevronRight size={16} />
          </button>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calendar Grid Container */}
        <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-md space-y-6">
          
          {/* Day Headers (Sun-Sat) */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 uppercase">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>

          {/* Day Cells Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty padding cells for start of month alignment */}
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            
            {/* Month Day Cells */}
            {daysInMonth.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const data = heatmap[dateStr];
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              const todayDay = isToday(day);
              const cellBg = getCellColor(dateStr);
              const cellBorder = getCellBorder(dateStr);

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDay(day)}
                  style={{ backgroundColor: cellBg }}
                  className={`relative aspect-square rounded-xl border flex flex-col items-center justify-center text-xs transition-all duration-200 cursor-pointer
                    ${cellBorder}
                    ${isSelected ? 'ring-2 ring-violet-500 scale-110 z-10' : ''}
                    ${todayDay && !isSelected ? 'ring-1 ring-white/40 border-white/20' : ''}
                    hover:scale-105 hover:border-violet-500/40`}
                >
                  <span className={`font-bold ${todayDay ? 'text-violet-300' : 'text-slate-300'}`}>
                    {format(day, 'd')}
                  </span>
                  
                  {/* Completion indicator dots */}
                  {data && data.completed > 0 && (
                    <div className="absolute bottom-1.5 flex gap-0.5">
                      {Array.from({ length: Math.min(data.completed, 3) }).map((_, i) => (
                        <div key={i} className="w-1 h-1 rounded-full bg-indigo-300" />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Heatmap Legend */}
          <div className="flex items-center gap-3 justify-center text-[10px] text-slate-400 pt-4 border-t border-white/5">
            <span>Less</span>
            <div className="flex gap-1.5">
              <div className="w-3.5 h-3.5 rounded bg-white/5 border border-white/5" title="Untracked" />
              <div className="w-3.5 h-3.5 rounded bg-red-500/15 border border-red-500/20" title="0% Completed" />
              <div className="w-3.5 h-3.5 rounded bg-indigo-500/20 border border-indigo-500/10" title="1-24%" />
              <div className="w-3.5 h-3.5 rounded bg-indigo-500/40 border border-indigo-500/20" title="25-49%" />
              <div className="w-3.5 h-3.5 rounded bg-indigo-500/65 border border-indigo-500/20" title="50-74%" />
              <div className="w-3.5 h-3.5 rounded bg-indigo-600 border border-indigo-500/20" title="75-100%" />
            </div>
            <span>More</span>
          </div>
        </div>

        {/* Selected Day Panel Container */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-md flex flex-col justify-between min-h-[360px]">
          <div>
            {/* Header Title */}
            <div className="pb-4 border-b border-white/5 mb-4">
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-0.5">Selected Date</span>
              <h3 className="text-xl font-bold text-white tracking-tight">
                {selectedDay ? format(selectedDay, 'EEEE, MMM d') : 'No Day Selected'}
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">{selectedDay ? format(selectedDay, 'yyyy') : ''}</p>
            </div>

            {/* Selected day statistics/logs */}
            {selectedDayDetails?.stats ? (
              <div className="space-y-6">
                {/* Stats Summary Bubble */}
                <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-extrabold text-violet-400">
                    {selectedDayDetails.stats.completed}/{selectedDayDetails.stats.total}
                  </div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1">Habits Done</div>
                  <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden border border-white/10 mt-3">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-indigo-500"
                      style={{ width: `${(selectedDayDetails.stats.completed / selectedDayDetails.stats.total) * 100}%` }}
                    />
                  </div>
                </div>

                {/* List of individual habits logged */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Habit Status List</span>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {selectedDayDetails.habits.map((h, i) => (
                      <div key={`${h._id}-${i}`} className="flex items-center justify-between p-2.5 rounded-xl bg-white/3 border border-white/5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-lg w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">{h.icon}</span>
                          <span className="text-xs font-semibold text-slate-200 truncate">{h.title}</span>
                        </div>
                        {h.completed ? (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                            <FiCheck size={10} /> Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-[9px] font-bold text-rose-450">
                            <FiX size={10} /> Missed
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 space-y-2">
                <FiInfo className="mx-auto text-3xl opacity-35" />
                <p className="text-xs font-medium">No tracking entries logged for this day</p>
              </div>
            )}
          </div>

          {/* Month Summary Footer Card */}
          {monthlyData && (
            <div className="border-t border-white/5 pt-4 mt-6">
              <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-3">Month Performance</h4>
              <div className="space-y-2.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Completion Rate</span>
                  <span className="text-violet-400">{monthlyData.completionRate}%</span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Total Checked Off</span>
                  <span className="text-slate-200">{monthlyData.totalCompleted} logs</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-indigo-500"
                    style={{ width: `${monthlyData.completionRate}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
