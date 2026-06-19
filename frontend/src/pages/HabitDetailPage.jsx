import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  fetchHabitDetail,
  updateHabit,
  deleteHabit,
} from '../features/habits/habitSlice';

const CATEGORIES = [
  { value: 'health', label: '💪 Health' },
  { value: 'fitness', label: '🏃 Fitness' },
  { value: 'mindfulness', label: '🧘 Mindfulness' },
  { value: 'learning', label: '📚 Learning' },
  { value: 'productivity', label: '⚡ Productivity' },
  { value: 'social', label: '🤝 Social' },
  { value: 'creativity', label: '🎨 Creativity' },
  { value: 'finance', label: '💰 Finance' },
  { value: 'other', label: '🌀 Other' },
];

const PRIORITIES = [
  { value: 'low', label: '🟢 Low' },
  { value: 'medium', label: '🟡 Medium' },
  { value: 'high', label: '🔴 High' },
];

const ICONS = ['🎯', '💪', '🏃', '📚', '🧘', '💧', '🥗', '😴', '📓', '🎨', '💰', '🔔', '⚡', '🌿', '🚴'];

const PRESET_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f97316', '#ec4899', '#14b8a6'];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const PRIORITY_META = {
  low: { label: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  medium: { label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-500/15' },
  high: { label: 'High', color: 'text-rose-400', bg: 'bg-rose-500/15' },
};

const EMPTY_FORM = {
  title: '',
  description: '',
  category: 'health',
  priority: 'medium',
  icon: '🎯',
  color: '#6366f1',
  frequency: 'daily',
  targetDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  reminderTime: '',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const CircularProgress = ({ value = 0, size = 120, stroke = 10, color = '#6366f1' }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#ffffff0f"
        strokeWidth={stroke}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
    </svg>
  );
};

const Heatmap = ({ logs = [], color = '#6366f1' }) => {
  const today = new Date();
  const cells = useMemo(() => {
    const result = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const log = logs.find((l) => l.date?.slice(0, 10) === dateStr);
      result.push({ date: dateStr, completed: log?.status === 'completed', day: d.getDate() });
    }
    return result;
  }, [logs]);

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {cells.map((cell, i) => (
          <motion.div
            key={cell.date}
            title={`${cell.date} — ${cell.completed ? 'Completed ✓' : 'Missed'}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.018, duration: 0.2 }}
            className="relative group h-7 w-7 rounded-md cursor-default"
            style={{
              background: cell.completed ? color : '#ffffff0d',
              border: `1px solid ${cell.completed ? color + '66' : '#ffffff10'}`,
            }}
          >
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
              {cell.day}
            </span>
          </motion.div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
        <div className="h-3 w-3 rounded bg-white/5 border border-white/10" />
        <span>Missed</span>
        <div className="h-3 w-3 rounded ml-2" style={{ background: color }} />
        <span>Completed</span>
      </div>
    </div>
  );
};

const LogRow = ({ log, index }) => (
  <motion.div
    variants={itemVariants}
    className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/3 px-4 py-3"
  >
    <div
      className={`mt-0.5 h-2.5 w-2.5 flex-shrink-0 rounded-full ${
        log.status === 'completed' ? 'bg-emerald-400' : 'bg-rose-400'
      }`}
    />
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-gray-400">
          {new Date(log.date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            log.status === 'completed'
              ? 'bg-emerald-500/15 text-emerald-400'
              : 'bg-rose-500/15 text-rose-400'
          }`}
        >
          {log.status === 'completed' ? '✓ Done' : '✗ Missed'}
        </span>
      </div>
      {log.note && (
        <p className="mt-1 text-sm text-gray-300 truncate">{log.note}</p>
      )}
    </div>
  </motion.div>
);

const EditModal = ({ open, onClose, initialData, onSave }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open && initialData) {
      setForm({ ...EMPTY_FORM, ...initialData });
      setErrors({});
    }
  }, [open, initialData]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const toggleDay = (day) =>
    setForm((f) => ({
      ...f,
      targetDays: f.targetDays.includes(day)
        ? f.targetDays.filter((d) => d !== day)
        : [...f.targetDays, day],
    }));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (form.targetDays.length === 0) e.targetDays = 'Select at least one day';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="edit-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl"
          initial={{ scale: 0.88, opacity: 0, y: 32 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.88, opacity: 0, y: 32 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Edit Habit</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">Icon</label>
              <div className="flex flex-wrap gap-2">
                {ICONS.map((ic) => (
                  <button
                    key={ic}
                    onClick={() => set('icon', ic)}
                    className={`rounded-xl p-2 text-xl transition-colors ${
                      form.icon === ic
                        ? 'bg-indigo-500/30 ring-2 ring-indigo-500'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
              {errors.title && <p className="mt-1 text-xs text-rose-400">{errors.title}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => set('category', e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-gray-800 px-3 py-2.5 text-white outline-none focus:border-indigo-500 transition"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => set('priority', e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-gray-800 px-3 py-2.5 text-white outline-none focus:border-indigo-500 transition"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">Color</label>
              <div className="flex gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => set('color', c)}
                    style={{ background: c }}
                    className={`h-8 w-8 rounded-full transition-transform ${
                      form.color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''
                    }`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">Frequency</label>
              <div className="flex gap-2">
                {['daily', 'weekly', 'custom'].map((f) => (
                  <button
                    key={f}
                    onClick={() => set('frequency', f)}
                    className={`flex-1 rounded-xl py-2 text-sm font-medium capitalize transition-colors ${
                      form.frequency === f
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">Target Days *</label>
              <div className="flex gap-1.5">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                      form.targetDays.includes(day)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              {errors.targetDays && <p className="mt-1 text-xs text-rose-400">{errors.targetDays}</p>}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">Reminder</label>
                <input
                  type="time"
                  value={form.reminderTime}
                  onChange={(e) => set('reminderTime', e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-gray-800 px-3 py-2.5 text-white outline-none focus:border-indigo-500 transition"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">Start Date</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => set('startDate', e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-gray-800 px-3 py-2.5 text-white outline-none focus:border-indigo-500 transition"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">End Date</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => set('endDate', e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-gray-800 px-3 py-2.5 text-white outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-sm font-medium text-gray-400 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => validate() && onSave(form)}
              style={{ background: form.color }}
              className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:opacity-90 transition-opacity"
            >
              Save Changes
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const LineTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-gray-900 px-4 py-2 shadow-xl">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-base font-bold text-indigo-400">{payload[0].value}%</p>
    </div>
  );
};

const HabitDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedHabit: habit, habitLogs: logs, loading } = useSelector((s) => s.habits);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState(0); 

  useEffect(() => {
    if (id) dispatch(fetchHabitDetail(id));
  }, [dispatch, id]);

  const handleSave = (formData) => {
    dispatch(updateHabit({ id, data: formData }));
    setEditOpen(false);
  };

  const handleDelete = () => {
    if (deleteStep === 0) {
      setDeleteStep(1);
      setTimeout(() => setDeleteStep(0), 4000);
    } else {
      dispatch(deleteHabit(id));
      navigate('/habits');
    }
  };

  const trendData = useMemo(() => {
    if (!logs?.length) return [];
    return logs.slice(-14).map((log) => ({
      date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: log.status === 'completed' ? 100 : 0,
    }));
  }, [logs]);

  const completionRate = useMemo(() => {
    if (!logs?.length) return 0;
    const completed = logs.filter((l) => l.status === 'completed').length;
    return Math.round((completed / logs.length) * 100);
  }, [logs]);

  const catLabel = CATEGORIES.find((c) => c.value === habit?.category)?.label ?? habit?.category ?? '';
  const pm = PRIORITY_META[habit?.priority] ?? PRIORITY_META.medium;
  const accentColor = habit?.color ?? '#6366f1';

  if (loading || !habit) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <motion.div
          className="h-12 w-12 rounded-full border-2 border-indigo-500 border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.85, ease: 'linear' }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8 text-white sm:px-8">
      <motion.div
        className="mx-auto max-w-5xl space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-indigo-500/20 hover:text-indigo-300 hover:border-indigo-500/40 transition-colors"
            >
              ✏️ Edit
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleDelete}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                deleteStep === 1
                  ? 'border-rose-500/60 bg-rose-500/20 text-rose-300'
                  : 'border-white/10 bg-white/5 text-gray-300 hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300'
              }`}
            >
              {deleteStep === 1 ? '⚠️ Confirm Delete' : '🗑️ Delete'}
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-md shadow-xl"
        >
          
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at top left, ${accentColor}, transparent 60%)`,
            }}
          />
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{ background: accentColor }}
          />

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            
            <div
              className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl text-5xl shadow-inner"
              style={{ background: `${accentColor}22` }}
            >
              {habit.icon ?? '🎯'}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                {habit.title}
              </h1>
              {habit.description && (
                <p className="mt-1 text-gray-400">{habit.description}</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-sm font-medium text-indigo-300">
                  {catLabel}
                </span>
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${pm.color} ${pm.bg}`}>
                  {pm.label} Priority
                </span>
                <span className="rounded-full bg-white/8 px-3 py-1 text-sm font-medium text-gray-300 capitalize">
                  {habit.frequency ?? 'daily'}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="relative">
                <CircularProgress value={completionRate} color={accentColor} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">{completionRate}%</span>
                </div>
              </div>
              <span className="text-xs text-gray-400">Completion Rate</span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            {
              label: 'Current Streak',
              value: `${habit.currentStreak ?? 0}`,
              unit: 'days',
              icon: '🔥',
              accent: '#f59e0b',
            },
            {
              label: 'Longest Streak',
              value: `${habit.longestStreak ?? 0}`,
              unit: 'days',
              icon: '🏆',
              accent: '#f97316',
            },
            {
              label: 'Total Completions',
              value: logs?.filter((l) => l.status === 'completed').length ?? 0,
              unit: 'times',
              icon: '✅',
              accent: '#10b981',
            },
            {
              label: 'Days Tracked',
              value: logs?.length ?? 0,
              unit: 'days',
              icon: '📅',
              accent: '#6366f1',
            },
          ].map((card) => (
            <motion.div
              key={card.label}
              whileHover={{ scale: 1.03, y: -2 }}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg text-center"
            >
              <div
                className="absolute -top-5 -right-5 h-20 w-20 rounded-full opacity-15 blur-xl"
                style={{ background: card.accent }}
              />
              <div className="text-3xl mb-1">{card.icon}</div>
              <div className="text-3xl font-extrabold text-white">{card.value}</div>
              <div className="text-xs text-gray-500">{card.unit}</div>
              <div className="mt-1 text-xs font-medium text-gray-400">{card.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          
          <motion.section variants={itemVariants}>
            <h2 className="mb-4 text-lg font-bold text-white">30-Day Overview</h2>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md shadow-lg">
              <Heatmap logs={logs ?? []} color={accentColor} />
            </div>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className="mb-4 text-lg font-bold text-white">Recent Activity</h2>
            <motion.div
              className="space-y-2 max-h-72 overflow-y-auto pr-1"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {(!logs || logs.length === 0) && (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/3 py-10 text-center">
                  <p className="text-3xl">📭</p>
                  <p className="mt-2 text-sm text-gray-400">No activity logged yet</p>
                </div>
              )}
              {logs?.slice(0, 10).map((log, i) => (
                <LogRow key={log._id ?? i} log={log} index={i} />
              ))}
            </motion.div>
          </motion.section>
        </div>

        <motion.section variants={itemVariants}>
          <h2 className="mb-4 text-lg font-bold text-white">14-Day Completion Trend</h2>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md shadow-lg">
            {trendData.length < 2 ? (
              <div className="flex h-52 items-center justify-center text-gray-500 text-sm">
                Not enough data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendData}>
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={accentColor} stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.9} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0f" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    interval={1}
                  />
                  <YAxis
                    domain={[0, 100]}
                    unit="%"
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={38}
                  />
                  <Tooltip content={<LineTooltip />} />
                  <ReferenceLine y={50} stroke="#ffffff15" strokeDasharray="4 4" />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="url(#lineGrad)"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: accentColor, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#fff', stroke: accentColor, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.section>
      </motion.div>

      <EditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initialData={habit}
        onSave={handleSave}
      />
    </div>
  );
};

export default HabitDetailPage;
