import { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  fetchHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  archiveHabit,
  restoreHabit,
  completeHabit,
} from '../features/habits/habitSlice';
import {
  FiPlus, FiSearch, FiEdit2, FiTrash2, FiArchive,
  FiX, FiCheck, FiRotateCcw, FiCalendar, FiClock,
  FiActivity, FiStar, FiChevronRight, FiDownload,
  FiBell, FiZap, FiTarget, FiTrendingUp, FiAward,
  FiFilter, FiGrid, FiList, FiRefreshCw,
} from 'react-icons/fi';
import { useNotifications } from '../hooks/useNotifications';
import { exportHabitsToCSV } from '../utils/exportCSV';
import confetti from 'canvas-confetti';

/* ─── Constants ─────────────────────────────────────────────────── */
const CATEGORIES = [
  { value: 'Health',               label: '💪 Health' },
  { value: 'Fitness',              label: '🏃 Fitness' },
  { value: 'Study',                label: '📚 Study' },
  { value: 'Coding',               label: '💻 Coding' },
  { value: 'Reading',              label: '📖 Reading' },
  { value: 'Meditation',           label: '🧘 Meditation' },
  { value: 'Productivity',         label: '⚡ Productivity' },
  { value: 'Personal Development', label: '🌱 Personal Dev' },
  { value: 'Custom',               label: '🎨 Custom' },
];

const PRIORITIES = [
  { value: 'Low',    label: '🟢 Low',    color: '#10b981' },
  { value: 'Medium', label: '🟡 Medium', color: '#f59e0b' },
  { value: 'High',   label: '🔴 High',   color: '#ef4444' },
];

const ICONS = ['🎯', '💪', '🏃', '📚', '🧘', '💧', '🥗', '😴', '📓', '🎨', '💰', '🔔', '⚡', '🌿', '🚴', '🏋️', '🍎', '🧠', '✍️', '🎵'];

const PRESET_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#f97316', '#ec4899',
  '#14b8a6', '#8b5cf6', '#06b6d4', '#84cc16', '#ef4444',
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const PRIORITY_META = {
  low:    { label: 'Low',    color: '#10b981', textClass: 'text-emerald-400', bgClass: 'bg-emerald-500/15', border: 'border-emerald-500/20' },
  Low:    { label: 'Low',    color: '#10b981', textClass: 'text-emerald-400', bgClass: 'bg-emerald-500/15', border: 'border-emerald-500/20' },
  medium: { label: 'Medium', color: '#f59e0b', textClass: 'text-amber-400',   bgClass: 'bg-amber-500/15',  border: 'border-amber-500/20'   },
  Medium: { label: 'Medium', color: '#f59e0b', textClass: 'text-amber-400',   bgClass: 'bg-amber-500/15',  border: 'border-amber-500/20'   },
  high:   { label: 'High',   color: '#ef4444', textClass: 'text-rose-400',    bgClass: 'bg-rose-500/15',   border: 'border-rose-500/20'    },
  High:   { label: 'High',   color: '#ef4444', textClass: 'text-rose-400',    bgClass: 'bg-rose-500/15',   border: 'border-rose-500/20'    },
};

const EMPTY_FORM = {
  title: '',
  description: '',
  category: 'Health',
  priority: 'Medium',
  icon: '🎯',
  color: '#6366f1',
  frequency: 'daily',
  targetDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  reminderTime: '',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '',
};

/* ─── Animation Variants ──────────────────────────────────────────── */
const containerVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const cardVariants = {
  hidden:  { opacity: 0, scale: 0.93, y: 18 },
  visible: { opacity: 1, scale: 1,    y: 0,  transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, scale: 0.88, y: -10, transition: { duration: 0.2 } },
};

/* ─── Helpers ─────────────────────────────────────────────────────── */
const toDateInputString = (dateVal) => {
  if (!dateVal) return '';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
  } catch { return ''; }
};

const getCompletionRate = (habit) => {
  if (!habit) return 0;
  if (typeof habit.completionRate === 'number' && habit.completionRate > 0) return habit.completionRate;
  if (habit.totalCompletions > 0) {
    const daysSinceStart = Math.max(1, Math.ceil(
      (Date.now() - new Date(habit.startDate || habit.createdAt).getTime()) / 86400000
    ));
    return Math.min(100, Math.round((habit.totalCompletions / daysSinceStart) * 100));
  }
  return 0;
};

/* ─── SVG Progress Ring ──────────────────────────────────────────── */
const ProgressRing = ({ percent = 0, size = 48, strokeWidth = 4, color = '#6366f1' }) => {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} fill="none" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        stroke={color} strokeWidth={strokeWidth} fill="none"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  );
};

/* ─── Habit Modal ─────────────────────────────────────────────────── */
const HabitModal = ({ open, onClose, initialData, onSave }) => {
  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [step, setStep]     = useState(0); // 0 = basics, 1 = schedule, 2 = style

  useEffect(() => {
    if (open) {
      if (initialData) {
        const numToDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const targetDays = (initialData.targetDays || []).map((d) =>
          typeof d === 'number' ? numToDay[d] : d
        );
        setForm({
          ...EMPTY_FORM,
          ...initialData,
          category:   initialData.category   || 'Health',
          priority:   initialData.priority   || 'Medium',
          targetDays,
          startDate:  toDateInputString(initialData.startDate) || EMPTY_FORM.startDate,
          endDate:    toDateInputString(initialData.endDate),
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setErrors({});
      setStep(0);
    }
  }, [open, initialData]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const toggleDay = (day) => setForm((f) => ({
    ...f,
    targetDays: f.targetDays.includes(day)
      ? f.targetDays.filter((d) => d !== day)
      : [...f.targetDays, day],
  }));

  const validate = () => {
    const e = {};
    if (!form.title.trim())          e.title      = 'Habit title is required';
    if (form.targetDays.length === 0) e.targetDays = 'Select at least one day';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => { if (validate()) onSave(form); };

  if (!open) return null;

  const STEPS = ['Basics', 'Schedule', 'Style'];

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-lg rounded-3xl border shadow-2xl my-auto"
          style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
          initial={{ scale: 0.88, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.88, opacity: 0, y: 30 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <span className="text-2xl">{form.icon}</span>
                {initialData ? 'Edit Habit' : 'Create New Habit'}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {initialData ? 'Update your habit details' : 'Build a new daily habit'}
              </p>
            </div>
            <button onClick={onClose} className="rounded-xl p-2 hover:bg-white/5 transition-colors border border-white/5">
              <FiX size={16} />
            </button>
          </div>

          {/* Step Tabs */}
          <div className="flex gap-1 px-6 pt-4">
            {STEPS.map((s, i) => (
              <button
                key={s}
                onClick={() => setStep(i)}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                  step === i
                    ? 'text-white shadow-md'
                    : 'text-slate-400 hover:text-white bg-white/5'
                }`}
                style={step === i ? { backgroundColor: form.color || '#6366f1' } : {}}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Step Content */}
          <div className="p-6 space-y-4 max-h-[55vh] overflow-y-auto">
            {step === 0 && (
              <>
                {/* Icon Row */}
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Habit Icon</label>
                  <div className="flex flex-wrap gap-1.5">
                    {ICONS.map((ic) => (
                      <button
                        key={ic}
                        onClick={() => set('icon', ic)}
                        className={`rounded-xl p-2 text-xl transition-all ${
                          form.icon === ic
                            ? 'bg-violet-600 text-white ring-2 ring-violet-400 ring-offset-2 ring-offset-slate-950 scale-110'
                            : 'bg-white/5 hover:bg-white/10 text-slate-300'
                        }`}
                      >{ic}</button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Habit Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => set('title', e.target.value)}
                    placeholder="e.g. Morning Meditation, Read 20 pages…"
                    className={`w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 transition-all text-sm ${
                      errors.title ? 'border-rose-500 focus:ring-rose-500/30' : 'focus:border-violet-500 focus:ring-violet-500/20'
                    }`}
                    style={{ borderColor: errors.title ? undefined : 'var(--border-default)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                  />
                  {errors.title && <p className="mt-1.5 text-xs text-rose-400 font-semibold flex items-center gap-1"><FiX size={10} />{errors.title}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Description (Optional)</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => set('description', e.target.value)}
                    rows={2}
                    placeholder="What is your goal with this habit?"
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 resize-none transition-all text-sm"
                    style={{ borderColor: 'var(--border-default)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                  />
                </div>

                {/* Category + Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => set('category', e.target.value)}
                      className="w-full rounded-xl border px-3 py-2.5 outline-none focus:border-violet-500 transition-all text-sm"
                      style={{ borderColor: 'var(--border-default)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                    >
                      {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Priority</label>
                    <select
                      value={form.priority}
                      onChange={(e) => set('priority', e.target.value)}
                      className="w-full rounded-xl border px-3 py-2.5 outline-none focus:border-violet-500 transition-all text-sm"
                      style={{ borderColor: 'var(--border-default)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                    >
                      {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                {/* Frequency */}
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Frequency</label>
                  <div className="flex gap-2">
                    {['daily', 'weekly', 'custom'].map((f) => (
                      <button
                        key={f}
                        onClick={() => set('frequency', f)}
                        className={`flex-1 rounded-xl py-2.5 text-sm font-semibold capitalize transition-all border ${
                          form.frequency === f
                            ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/20'
                            : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >{f}</button>
                    ))}
                  </div>
                </div>

                {/* Target Days */}
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Target Days <span className="text-rose-400">*</span>
                  </label>
                  <div className="flex gap-1.5 flex-wrap">
                    {DAYS.map((day) => {
                      const selected = form.targetDays.includes(day);
                      return (
                        <button
                          key={day}
                          onClick={() => toggleDay(day)}
                          className={`flex-1 min-w-[44px] rounded-lg py-2 text-xs font-bold transition-all border ${
                            selected
                              ? 'bg-violet-600 border-violet-500 text-white shadow-md'
                              : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                          }`}
                        >{day}</button>
                      );
                    })}
                  </div>
                  {errors.targetDays && <p className="mt-1.5 text-xs text-rose-400 font-semibold">{errors.targetDays}</p>}
                  {/* Quick select buttons */}
                  <div className="flex gap-2 mt-2">
                    <button
                      className="text-[10px] text-violet-400 hover:text-violet-300 transition-colors font-semibold"
                      onClick={() => set('targetDays', [...DAYS])}
                    >All Days</button>
                    <span className="text-slate-600">|</span>
                    <button
                      className="text-[10px] text-violet-400 hover:text-violet-300 transition-colors font-semibold"
                      onClick={() => set('targetDays', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])}
                    >Weekdays</button>
                    <span className="text-slate-600">|</span>
                    <button
                      className="text-[10px] text-violet-400 hover:text-violet-300 transition-colors font-semibold"
                      onClick={() => set('targetDays', ['Sat', 'Sun'])}
                    >Weekends</button>
                    <span className="text-slate-600">|</span>
                    <button
                      className="text-[10px] text-rose-400 hover:text-rose-300 transition-colors font-semibold"
                      onClick={() => set('targetDays', [])}
                    >Clear</button>
                  </div>
                </div>

                {/* Dates + Reminder */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Reminder</label>
                    <input
                      type="time" value={form.reminderTime}
                      onChange={(e) => set('reminderTime', e.target.value)}
                      className="w-full rounded-xl border px-3 py-2.5 outline-none focus:border-violet-500 transition-all text-xs"
                      style={{ borderColor: 'var(--border-default)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Start Date</label>
                    <input
                      type="date" value={form.startDate}
                      onChange={(e) => set('startDate', e.target.value)}
                      className="w-full rounded-xl border px-3 py-2.5 outline-none focus:border-violet-500 transition-all text-xs"
                      style={{ borderColor: 'var(--border-default)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">End Date</label>
                    <input
                      type="date" value={form.endDate}
                      onChange={(e) => set('endDate', e.target.value)}
                      className="w-full rounded-xl border px-3 py-2.5 outline-none focus:border-violet-500 transition-all text-xs"
                      style={{ borderColor: 'var(--border-default)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                {/* Color */}
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Accent Color</label>
                  <div className="flex gap-2.5 flex-wrap">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => set('color', c)}
                        style={{ backgroundColor: c }}
                        className={`h-9 w-9 rounded-full transition-all shadow-md ${
                          form.color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-950' : 'hover:scale-110'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Preview Card */}
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Preview</label>
                  <div
                    className="relative overflow-hidden rounded-2xl border p-4"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl opacity-80" style={{ backgroundColor: form.color }} />
                    <div className="flex items-center gap-3 mt-2">
                      <div className="w-12 h-12 flex items-center justify-center rounded-xl border text-2xl" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-card)' }}>
                        {form.icon}
                      </div>
                      <div>
                        <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{form.title || 'Your Habit Name'}</p>
                        <div className="flex gap-1.5 mt-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                            {CATEGORIES.find(c => c.value === form.category)?.label || form.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
                      <div className="flex items-center gap-1.5 text-amber-500">
                        <FiZap size={13} className="fill-amber-500" />
                        <span className="text-sm font-bold">0</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">streak</span>
                      </div>
                      <div className="rounded-xl border px-3 py-1 text-xs font-bold text-slate-400 border-white/10">
                        ○ Mark Done
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 border-t border-white/5 p-5 pt-4">
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 rounded-full transition-all"
                  style={{ width: step === i ? 20 : 8, backgroundColor: step === i ? (form.color || '#6366f1') : 'rgba(255,255,255,0.1)' }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              {step > 0 && (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
                >Back</button>
              )}
              <button onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-400 hover:bg-white/5 hover:text-white transition-colors">
                Cancel
              </button>
              {step < STEPS.length - 1 ? (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setStep(s => s + 1)}
                  className="rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all"
                  style={{ backgroundColor: form.color || '#6366f1' }}
                >Next →</motion.button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSave}
                  className="rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all flex items-center gap-2"
                  style={{ backgroundColor: form.color || '#6366f1' }}
                >
                  <FiCheck size={14} />
                  {initialData ? 'Save Changes' : 'Create Habit'}
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ─── Action Button ────────────────────────────────────────────────── */
const ActionBtn = ({ icon, label, onClick, className }) => (
  <button
    title={label}
    onClick={onClick}
    className={`rounded-xl p-2 text-slate-400 backdrop-blur-md transition-colors bg-slate-900/90 border border-white/10 shadow-lg ${className}`}
  >
    {icon}
  </button>
);

/* ─── Habit Card ──────────────────────────────────────────────────── */
const HabitCard = ({ habit, tab, onEdit, onDelete, onArchive, onRestore, onComplete, onClick }) => {
  const [hovering, setHovering]     = useState(false);
  const [completing, setCompleting] = useState(false);

  const done       = habit.completedToday || habit.todayCompleted;
  const pm         = PRIORITY_META[habit.priority] ?? PRIORITY_META.Medium;
  const catLabel   = CATEGORIES.find((c) => c.value.toLowerCase() === habit.category?.toLowerCase())?.label ?? habit.category;
  const rate       = getCompletionRate(habit);
  const accentColor = habit.color ?? '#6366f1';

  const handleComplete = (e) => {
    e.stopPropagation();
    setCompleting(true);
    onComplete(habit._id);
    setTimeout(() => setCompleting(false), 600);
  };

  return (
    <motion.div
      variants={cardVariants}
      layout
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border backdrop-blur-md shadow-lg transition-all hover:shadow-xl"
      style={{
        background: done ? 'var(--bg-card)' : 'var(--bg-card)',
        borderColor: done ? 'rgba(16,185,129,0.2)' : 'var(--border-default)',
        color: 'var(--text-primary)',
        boxShadow: hovering ? `0 8px 40px ${accentColor}15` : undefined,
      }}
      onClick={() => onClick(habit._id)}
    >
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 opacity-80"
        style={{ backgroundColor: accentColor }}
      />

      {/* Completed overlay shimmer */}
      {done && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.03), transparent 60%)' }} />
      )}

      {/* Hover Actions */}
      <AnimatePresence>
        {hovering && (
          <motion.div
            key="actions"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute top-3.5 right-3.5 flex gap-1.5 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {tab === 'active' ? (
              <>
                <ActionBtn icon={<FiEdit2 size={12} />} label="Edit"    onClick={() => onEdit(habit)}   className="hover:bg-violet-500/20 hover:text-violet-300" />
                <ActionBtn icon={<FiArchive size={12} />} label="Archive" onClick={() => onArchive(habit._id)} className="hover:bg-amber-500/20 hover:text-amber-300" />
              </>
            ) : (
              <ActionBtn icon={<FiRotateCcw size={12} />} label="Restore" onClick={() => onRestore(habit._id)} className="hover:bg-emerald-500/20 hover:text-emerald-300" />
            )}
            <ActionBtn icon={<FiTrash2 size={12} />} label="Delete" onClick={() => onDelete(habit._id)} className="hover:bg-rose-500/20 hover:text-rose-300" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 pt-5">
        {/* Header row: icon + title + progress ring */}
        <div className="flex items-start gap-3 mt-1">
          <div className="relative flex-shrink-0">
            <ProgressRing percent={rate} size={52} strokeWidth={3.5} color={accentColor} />
            <div className="absolute inset-0 flex items-center justify-center text-2xl leading-none">
              {habit.icon ?? '🎯'}
            </div>
          </div>
          <div className="flex-1 min-w-0 pr-8">
            <p className="truncate font-bold text-sm leading-snug" style={{ color: 'var(--text-primary)' }}>
              {habit.title}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className="rounded-md px-2 py-0.5 text-[10px] font-semibold border"
                style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                {catLabel}
              </span>
              <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${pm.textClass} ${pm.bgClass} ${pm.border}`}>
                {pm.label}
              </span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-3 flex items-center gap-3 py-2.5 px-3 rounded-xl" style={{ background: 'var(--bg-primary)', opacity: 0.8 }}>
          <div className="flex items-center gap-1 flex-1">
            <FiZap size={12} className="text-amber-400 fill-amber-400 flex-shrink-0" />
            <span className="text-xs font-bold text-amber-400">{habit.currentStreak ?? 0}</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wide">streak</span>
          </div>
          <div className="w-px h-4 bg-white/5" />
          <div className="flex items-center gap-1 flex-1">
            <FiTrendingUp size={11} className="text-violet-400 flex-shrink-0" />
            <span className="text-xs font-bold text-violet-400">{rate}%</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wide">rate</span>
          </div>
          <div className="w-px h-4 bg-white/5" />
          <div className="flex items-center gap-1 flex-1">
            <FiStar size={11} className="text-slate-400 flex-shrink-0" />
            <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>{habit.totalCompletions ?? 0}</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wide">done</span>
          </div>
        </div>

        {/* Action Row */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[10px] text-slate-500">
            <FiCalendar size={10} />
            <span>{habit.frequency || 'daily'}</span>
          </div>

          {tab === 'active' && (
            <motion.button
              whileTap={{ scale: 0.88 }}
              animate={completing ? { scale: [1, 1.2, 1] } : {}}
              onClick={handleComplete}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all select-none ${
                done
                  ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400 shadow-sm shadow-emerald-500/10'
                  : 'border-white/10 text-slate-400 hover:border-violet-500/60 hover:text-violet-300 hover:bg-violet-500/5'
              }`}
            >
              {done ? <><FiCheck size={11} /> Done!</> : '○ Mark Done'}
            </motion.button>
          )}

          {tab === 'archived' && (
            <span className="text-[10px] text-amber-500 font-semibold flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <FiArchive size={10} /> Archived
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* ─── Stats Card ──────────────────────────────────────────────────── */
const StatsCard = ({ icon, label, value, sub, color }) => (
  <motion.div
    className="flex items-center gap-3.5 rounded-2xl border p-4"
    style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
    whileHover={{ y: -2 }}
    transition={{ duration: 0.2 }}
  >
    <div className="h-10 w-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${color}20` }}>
      <span style={{ color }}>{icon}</span>
    </div>
    <div>
      <p className="text-xl font-extrabold leading-none" style={{ color: 'var(--text-primary)' }}>{value}</p>
      <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
      {sub && <p className="text-[10px] mt-0.5" style={{ color }}>{sub}</p>}
    </div>
  </motion.div>
);

/* ─── Main Page ───────────────────────────────────────────────────── */
const HabitsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { habits, archivedHabits, loading } = useSelector((s) => s.habits);
  const notif = useNotifications();

  const [tab,             setTab]             = useState('active');
  const [search,          setSearch]          = useState('');
  const [categoryFilter,  setCategoryFilter]  = useState('');
  const [priorityFilter,  setPriorityFilter]  = useState('');
  const [modalOpen,       setModalOpen]       = useState(false);
  const [editingHabit,    setEditingHabit]    = useState(null);
  const [deleteConfirm,   setDeleteConfirm]   = useState(null);
  const [reminderTime,    setReminderTime]    = useState(notif.getReminderTime?.() ?? '08:00');
  const [showReminderPanel, setShowReminderPanel] = useState(false);
  const [notifEnabled,    setNotifEnabled]    = useState(notif.isReminderEnabled?.() ?? false);
  const [viewMode,        setViewMode]        = useState('grid'); // 'grid' | 'list'

  /* Fetch on tab change */
  useEffect(() => {
    dispatch(fetchHabits({ archived: tab === 'archived' ? 'true' : 'false' }));
  }, [dispatch, tab]);

  /* Auto-open create modal if ?new=true */
  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setEditingHabit(null);
      setModalOpen(true);
    }
  }, [searchParams]);

  /* Reminder handlers */
  const handleEnableNotifications = async () => {
    try {
      const perm = await notif.requestPermission?.();
      if (perm === 'granted') {
        notif.scheduleDailyReminder?.(reminderTime);
        setNotifEnabled(true);
        toast.success(`Reminder set for ${reminderTime} every day! 🔔`);
      } else {
        toast.error('Notification permission denied. Enable in browser settings.');
      }
    } catch {
      toast.error('Notifications not supported in this browser.');
    }
  };

  const handleDisableNotifications = () => {
    notif.cancelReminder?.();
    setNotifEnabled(false);
    toast.success('Daily reminder cancelled.');
  };

  const handleExportCSV = () => {
    exportHabitsToCSV(habits);
    toast.success('Habits exported to CSV! 📊');
  };

  /* Modal handlers */
  const openCreate  = () => { setEditingHabit(null);  setModalOpen(true); };
  const openEdit    = useCallback((habit) => { setEditingHabit(habit); setModalOpen(true); }, []);
  const closeModal  = () => setModalOpen(false);

  const handleSave = (formData) => {
    if (editingHabit) {
      dispatch(updateHabit({ id: editingHabit._id, data: formData }))
        .unwrap()
        .then(() => toast.success('Habit updated! ✨'))
        .catch((err) => toast.error(err || 'Failed to update habit'));
    } else {
      dispatch(createHabit(formData))
        .unwrap()
        .then(() => toast.success('Habit created! 🚀'))
        .catch((err) => toast.error(err || 'Failed to create habit'));
    }
    closeModal();
  };

  const handleDelete = useCallback((id) => {
    if (deleteConfirm === id) {
      dispatch(deleteHabit(id))
        .unwrap()
        .then(() => toast.success('Habit deleted'))
        .catch((err) => toast.error(err || 'Failed to delete'));
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  }, [dispatch, deleteConfirm]);

  const handleArchive = useCallback((id) => {
    dispatch(archiveHabit(id))
      .unwrap()
      .then(() => toast.success('Habit archived 📦'))
      .catch((err) => toast.error(err || 'Failed to archive'));
  }, [dispatch]);

  const handleRestore = useCallback((id) => {
    dispatch(restoreHabit(id))
      .unwrap()
      .then(() => toast.success('Habit restored 🚀'))
      .catch((err) => toast.error(err || 'Failed to restore'));
  }, [dispatch]);

  const handleComplete = useCallback((id) => {
    dispatch(completeHabit(id))
      .unwrap()
      .then((res) => {
        if (res.log?.completed) {
          confetti({
            particleCount: 120, spread: 80, origin: { y: 0.65 },
            colors: ['#7c3aed', '#6366f1', '#10b981', '#f59e0b', '#ec4899'],
          });
          toast.success('🎉 Habit complete! XP earned', {
            duration: 3000,
            style: { background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(16,185,129,0.4)', borderRadius: 12 },
            iconTheme: { primary: '#10b981', secondary: '#0f172a' },
          });
        } else {
          toast.success('Habit marked incomplete', {
            duration: 2000,
            style: { background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 },
          });
        }
      })
      .catch((err) => toast.error(err || 'Failed to complete'));
  }, [dispatch]);

  /* Filtered list */
  const habitsToFilter = tab === 'archived' ? archivedHabits : habits;

  const filtered = useMemo(() => {
    const list = (habitsToFilter || []).filter(Boolean);
    return list.filter((h) => {
      const matchSearch = !search || (h.title && h.title.toLowerCase().includes(search.toLowerCase()));
      const matchCat    = !categoryFilter || h.category?.toLowerCase() === categoryFilter.toLowerCase();
      const matchPri    = !priorityFilter || h.priority?.toLowerCase() === priorityFilter.toLowerCase();
      const matchDone   = tab === 'done' ? (h.completedToday || h.todayCompleted) : true;
      return matchSearch && matchCat && matchPri && matchDone;
    });
  }, [habitsToFilter, search, categoryFilter, priorityFilter, tab]);

  /* Stats */
  const stats = useMemo(() => {
    const active    = (habits || []).filter(Boolean);
    const completed = active.filter((h) => h.completedToday || h.todayCompleted);
    const maxStreak = active.reduce((m, h) => Math.max(m, h.currentStreak ?? 0), 0);
    const avgRate   = active.length
      ? Math.round(active.reduce((s, h) => s + getCompletionRate(h), 0) / active.length)
      : 0;
    return { total: active.length, completed: completed.length, maxStreak, avgRate };
  }, [habits]);

  const tabCounts = useMemo(() => {
    const active   = (habits || []).filter(Boolean);
    const done     = active.filter((h) => h.completedToday || h.todayCompleted);
    const archived = (archivedHabits || []).filter(Boolean);
    return { active: active.length, done: done.length, archived: archived.length };
  }, [habits, archivedHabits]);

  return (
    <div className="min-h-screen px-4 py-8 sm:px-8 space-y-6" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ── Page Header ── */}
        <motion.div
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2.5" style={{ color: 'var(--text-primary)' }}>
              <FiActivity className="text-violet-500" /> My Habits
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {stats.total} active habit{stats.total !== 1 ? 's' : ''} · {stats.completed} completed today
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Reminder toggle */}
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => setShowReminderPanel((v) => !v)}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all border cursor-pointer"
              style={{
                background:   notifEnabled ? 'rgba(245,158,11,0.15)' : 'var(--bg-card)',
                color:        notifEnabled ? '#f59e0b' : 'var(--text-secondary)',
                borderColor:  notifEnabled ? 'rgba(245,158,11,0.3)' : 'var(--border-default)',
              }}
            >
              <FiBell size={14} />
              <span className="hidden sm:inline">{notifEnabled ? 'Reminder On' : 'Remind Me'}</span>
            </motion.button>

            {/* Export */}
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={handleExportCSV}
              className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
            >
              <FiDownload size={14} />
              <span className="hidden sm:inline">Export</span>
            </motion.button>

            {/* Refresh */}
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97, rotate: 180 }}
              onClick={() => dispatch(fetchHabits({ archived: tab === 'archived' ? 'true' : 'false' }))}
              className="flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all cursor-pointer"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
              title="Refresh habits"
            >
              <FiRefreshCw size={14} />
            </motion.button>

            {/* Add Habit */}
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={openCreate}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:bg-violet-500 transition-all cursor-pointer"
            >
              <FiPlus size={16} /> Add Habit
            </motion.button>
          </div>
        </motion.div>

        {/* ── Stats Bar ── */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <StatsCard icon={<FiActivity size={18} />} label="Active Habits"    value={stats.total}     color="#6366f1" />
          <StatsCard icon={<FiCheck size={18} />}    label="Done Today"       value={stats.completed} sub={stats.total > 0 ? `${Math.round(stats.completed / stats.total * 100)}% complete` : undefined} color="#10b981" />
          <StatsCard icon={<FiZap size={18} />}      label="Best Streak"      value={stats.maxStreak} sub="days" color="#f59e0b" />
          <StatsCard icon={<FiTrendingUp size={18} />} label="Avg Rate"       value={`${stats.avgRate}%`} color="#8b5cf6" />
        </motion.div>

        {/* ── Reminder Panel ── */}
        <AnimatePresence>
          {showReminderPanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap items-center gap-3 rounded-2xl p-4 border" style={{ background: 'rgba(245,158,11,0.07)', borderColor: 'rgba(245,158,11,0.2)' }}>
                <FiBell className="text-amber-400" size={18} />
                <p className="text-sm text-amber-300 font-medium">Daily reminder time:</p>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="rounded-xl border px-3 py-1.5 text-sm outline-none focus:border-amber-400"
                  style={{ borderColor: 'var(--border-default)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                />
                {notifEnabled ? (
                  <button onClick={handleDisableNotifications}
                    className="rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-1.5 text-sm font-semibold hover:bg-red-500/30 transition-all cursor-pointer">
                    Cancel Reminder
                  </button>
                ) : (
                  <button onClick={handleEnableNotifications}
                    className="rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 px-4 py-1.5 text-sm font-semibold hover:bg-amber-500/30 transition-all cursor-pointer">
                    Enable Reminder
                  </button>
                )}
                <p className="text-xs text-slate-500">Browser must be open to receive reminders.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Filters + View Toggle ── */}
        <motion.div
          className="flex flex-wrap gap-3 p-4 rounded-2xl border items-center"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <div className="relative flex-1 min-w-[180px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}><FiSearch size={15} /></span>
            <input
              type="text"
              placeholder="Search habits…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border py-2.5 pl-9 pr-4 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all text-sm"
              style={{ borderColor: 'var(--border-default)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:border-violet-500 transition-all"
            style={{ borderColor: 'var(--border-default)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:border-violet-500 transition-all"
            style={{ borderColor: 'var(--border-default)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
          >
            <option value="">All Priorities</option>
            {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>

          {/* View mode toggle */}
          <div className="flex gap-1 p-1 rounded-xl border ml-auto" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-tertiary)' }}>
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-lg p-2 transition-all ${viewMode === 'grid' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Grid view"
            ><FiGrid size={14} /></button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-lg p-2 transition-all ${viewMode === 'list' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="List view"
            ><FiList size={14} /></button>
          </div>
        </motion.div>

        {/* ── Tab Bar ── */}
        <motion.div
          className="flex gap-1.5 p-1.5 rounded-2xl border w-fit"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        >
          {[
            { key: 'active',   label: 'Active',     count: tabCounts.active   },
            { key: 'done',     label: '✅ Done Today', count: tabCounts.done   },
            { key: 'archived', label: '📦 Archived',  count: tabCounts.archived },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="relative rounded-xl px-5 py-2 text-sm font-semibold capitalize transition-all cursor-pointer flex items-center gap-2"
              style={{ color: tab === key ? 'white' : 'var(--text-secondary)' }}
            >
              {tab === key && (
                <motion.div
                  layoutId="tab-bg-habit"
                  className="absolute inset-0 rounded-xl bg-violet-600 shadow-md"
                  style={{ zIndex: -1 }}
                />
              )}
              {label}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${tab === key ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'}`}>
                {count}
              </span>
            </button>
          ))}
        </motion.div>

        {/* ── Habit Grid / List ── */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <motion.div
              className="h-10 w-10 rounded-full border-2 border-violet-500 border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.85, ease: 'linear' }}
            />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-white/10 rounded-3xl"
            style={{ background: 'var(--bg-card)' }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <span className="text-6xl mb-4">
              {tab === 'archived' ? '📦' : tab === 'done' ? '🎯' : '🌱'}
            </span>
            <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {tab === 'archived' ? 'No archived habits' : tab === 'done' ? 'Nothing completed yet today' : search || categoryFilter || priorityFilter ? 'No habits match your filters' : 'No habits yet'}
            </h3>
            <p className="mt-2 max-w-sm text-sm" style={{ color: 'var(--text-secondary)' }}>
              {tab === 'active' && !search && !categoryFilter && !priorityFilter
                ? "Start your habit journey! Track your goals and build lasting routines."
                : tab === 'done'
                  ? "Complete your habits for today to see them here!"
                  : tab === 'archived'
                    ? "Archived habits appear here. You can restore them anytime."
                    : "Try changing or clearing your filters."}
            </p>
            <div className="mt-6 flex gap-3">
              {tab === 'active' && !search && !categoryFilter && !priorityFilter && (
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  onClick={openCreate}
                  className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-violet-500 transition-all flex items-center gap-2"
                >
                  <FiPlus /> Add Your First Habit
                </motion.button>
              )}
              {(search || categoryFilter || priorityFilter) && (
                <button
                  onClick={() => { setSearch(''); setCategoryFilter(''); setPriorityFilter(''); }}
                  className="rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all"
                  style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            className={viewMode === 'grid'
              ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'flex flex-col gap-3'}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((habit) => (
                <HabitCard
                  key={habit._id}
                  habit={habit}
                  tab={tab}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  onArchive={handleArchive}
                  onRestore={handleRestore}
                  onComplete={handleComplete}
                  onClick={(id) => navigate(`/habits/${id}`)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Delete Confirm Toast ── */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div
              key="delete-toast"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 rounded-xl border border-rose-500/30 bg-slate-950 px-5 py-3.5 text-sm shadow-xl"
            >
              <span className="text-rose-400 font-bold flex items-center gap-2">⚠️ Click delete again to confirm</span>
              <button onClick={() => setDeleteConfirm(null)} className="text-slate-400 hover:text-white transition-colors">
                <FiX size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Mobile FAB ── */}
        <motion.button
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
          onClick={openCreate}
          className="fixed bottom-8 right-8 flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 text-xl text-white shadow-2xl shadow-violet-500/40 hover:bg-violet-500 transition-colors z-40 sm:hidden"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 260, damping: 20 }}
        >
          <FiPlus />
        </motion.button>
      </div>

      {/* ── Habit Modal ── */}
      <HabitModal
        open={modalOpen}
        onClose={closeModal}
        initialData={editingHabit}
        onSave={handleSave}
      />
    </div>
  );
};

export default HabitsPage;
