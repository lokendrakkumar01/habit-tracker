import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiArchive, FiX, FiCheck, FiRotateCcw, FiCalendar, FiClock, FiActivity, FiStar, FiChevronRight } from 'react-icons/fi';

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
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

const PRESET_COLORS = [
  '#6366f1', // indigo
  '#10b981', // emerald
  '#f59e0b', // amber
  '#f97316', // orange
  '#ec4899', // pink
  '#14b8a6', // teal
];

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

// ─────────────────────────────────────────────
// Animation variants
// ─────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const cardVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 16 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.9, y: -10, transition: { duration: 0.2 } },
};

// ─────────────────────────────────────────────
// HabitModal (inline)
// ─────────────────────────────────────────────
const HabitModal = ({ open, onClose, initialData, onSave }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (initialData) {
        // Map backend enums to frontend lowercase if necessary
        const mappedData = {
          ...initialData,
          category: initialData.category?.toLowerCase() || 'health',
          priority: initialData.priority?.toLowerCase() || 'medium',
          startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().slice(0, 10) : EMPTY_FORM.startDate,
          endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().slice(0, 10) : '',
        };
        setForm({ ...EMPTY_FORM, ...mappedData });
      } else {
        setForm(EMPTY_FORM);
      }
      setErrors({});
    }
  }, [open, initialData]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const toggleDay = (day) => {
    setForm((f) => ({
      ...f,
      targetDays: f.targetDays.includes(day)
        ? f.targetDays.filter((d) => d !== day)
        : [...f.targetDays, day],
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (form.targetDays.length === 0) e.targetDays = 'Select at least one day';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (validate()) onSave(form);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-3xl border border-white/10 bg-slate-950 p-6 sm:p-8 shadow-2xl space-y-6"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FiActivity className="text-violet-500" />
              {initialData ? 'Edit Habit' : 'Create New Habit'}
            </h2>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors border border-white/5"
            >
              <FiX size={16} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Icon picker */}
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Choose Habit Icon
              </label>
              <div className="flex flex-wrap gap-2">
                {ICONS.map((ic) => (
                  <button
                    key={ic}
                    onClick={() => set('icon', ic)}
                    className={`rounded-xl p-2 text-xl transition-all ${
                      form.icon === ic
                        ? 'bg-violet-600 text-white ring-2 ring-violet-400 ring-offset-2 ring-offset-slate-950 scale-110'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Habit Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="e.g. 15-Minute Meditation"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
              />
              {errors.title && <p className="mt-1.5 text-xs text-rose-400 font-semibold">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Description (Optional)
              </label>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={2}
                placeholder="Describe your goal or guidelines..."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 resize-none transition-all"
              />
            </div>

            {/* Category + Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => set('category', e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-3 text-white outline-none focus:border-violet-500 transition-all"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Priority
                </label>
                <select
                  value={form.priority}
                  onChange={(e) => set('priority', e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-3 text-white outline-none focus:border-violet-500 transition-all"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Color picker */}
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Card Accent Color
              </label>
              <div className="flex gap-3">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => set('color', c)}
                    style={{ backgroundColor: c }}
                    className={`h-8 w-8 rounded-full transition-transform ${
                      form.color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-950' : ''
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Frequency */}
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Frequency
              </label>
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
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Target days */}
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Target Days *
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {DAYS.map((day) => {
                  const selected = form.targetDays.includes(day);
                  return (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`flex-1 min-w-[48px] rounded-lg py-2 text-xs font-bold transition-all border ${
                        selected
                          ? 'bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-500/10'
                          : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              {errors.targetDays && (
                <p className="mt-1.5 text-xs text-rose-400 font-semibold">{errors.targetDays}</p>
              )}
            </div>

            {/* Reminder + Dates */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Reminder
                </label>
                <input
                  type="time"
                  value={form.reminderTime}
                  onChange={(e) => set('reminderTime', e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-violet-500 transition-all text-xs"
                />
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Start Date
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => set('startDate', e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-violet-500 transition-all text-xs"
                />
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  End Date
                </label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => set('endDate', e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-violet-500 transition-all text-xs"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3 border-t border-white/5 pt-4">
            <button
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-450 hover:bg-white/5 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              style={{ backgroundColor: form.color }}
              className="rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:brightness-115"
            >
              {initialData ? 'Save Changes' : 'Create Habit'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─────────────────────────────────────────────
// HabitCard
// ─────────────────────────────────────────────
const HabitCard = ({ habit, tab, onEdit, onDelete, onArchive, onRestore, onComplete, onClick }) => {
  const [hovering, setHovering] = useState(false);
  const done = habit.completedToday;
  const pm = PRIORITY_META[habit.priority?.toLowerCase()] ?? PRIORITY_META.medium;
  const catLabel = CATEGORIES.find((c) => c.value === habit.category?.toLowerCase())?.label ?? habit.category;

  return (
    <motion.div
      variants={cardVariants}
      layout
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-md shadow-lg transition-shadow hover:shadow-indigo-500/5 hover:border-white/20"
      onClick={() => onClick(habit._id)}
    >
      {/* Color accent top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5 opacity-80"
        style={{ backgroundColor: habit.color ?? '#6366f1' }}
      />

      {/* Hover action row */}
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
                <ActionBtn
                  icon={<FiEdit2 size={12} />}
                  label="Edit"
                  onClick={() => onEdit(habit)}
                  className="hover:bg-violet-500/20 hover:text-violet-300"
                />
                <ActionBtn
                  icon={<FiArchive size={12} />}
                  label="Archive"
                  onClick={() => onArchive(habit._id)}
                  className="hover:bg-amber-500/20 hover:text-amber-300"
                />
              </>
            ) : (
              <ActionBtn
                icon={<FiRotateCcw size={12} />}
                label="Restore"
                onClick={() => onRestore(habit._id)}
                className="hover:bg-emerald-500/20 hover:text-emerald-300"
              />
            )}
            <ActionBtn
              icon={<FiTrash2 size={12} />}
              label="Delete"
              onClick={() => onDelete(habit._id)}
              className="hover:bg-rose-500/20 hover:text-rose-300"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Icon + title */}
      <div className="flex items-center gap-3.5 mt-2">
        <span className="text-4xl leading-none w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 shadow-inner">{habit.icon ?? '🎯'}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-white text-base tracking-tight leading-snug">{habit.title}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className="rounded-lg bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-slate-350 border border-white/5">
              {catLabel}
            </span>
            <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold border border-current/10 ${pm.color} ${pm.bg}`}>
              {pm.label}
            </span>
          </div>
        </div>
      </div>

      {/* Streak and Completion */}
      <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-3.5">
        <div className="flex items-center gap-1.5 text-amber-500">
          <FiZap size={14} className="fill-amber-500" />
          <span className="text-sm font-bold">{habit.currentStreak ?? 0}</span>
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">streak</span>
        </div>

        {/* Complete toggle */}
        {tab === 'active' && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              if (!done) onComplete(habit._id);
            }}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
              done
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                : 'border-white/10 text-slate-400 hover:border-violet-500/55 hover:text-violet-300'
            }`}
          >
            {done ? (
              <>
                <FiCheck size={12} /> Done
              </>
            ) : (
              '○ Mark Done'
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

const ActionBtn = ({ icon, label, onClick, className }) => (
  <button
    title={label}
    onClick={onClick}
    className={`rounded-xl p-2 text-slate-400 backdrop-blur-md transition-colors bg-slate-900 border border-white/10 shadow-lg ${className}`}
  >
    {icon}
  </button>
);

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
const HabitsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { habits, archivedHabits, loading } = useSelector((s) => s.habits);

  // UI state
  const [tab, setTab] = useState('active'); // 'active' | 'archived'
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch habits based on active tab
  useEffect(() => {
    dispatch(fetchHabits({ archived: tab === 'archived' ? 'true' : 'false' }));
  }, [dispatch, tab]);

  // Open modal if ?new=true is in URL
  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setEditingHabit(null);
      setModalOpen(true);
    }
  }, [searchParams]);

  const openCreate = () => {
    setEditingHabit(null);
    setModalOpen(true);
  };

  const openEdit = useCallback((habit) => {
    setEditingHabit(habit);
    setModalOpen(true);
  }, []);

  const closeModal = () => setModalOpen(false);

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

  const handleDelete = useCallback(
    (id) => {
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
    },
    [dispatch, deleteConfirm]
  );

  const handleArchive = useCallback(
    (id) => {
      dispatch(archiveHabit(id))
        .unwrap()
        .then(() => toast.success('Habit archived 📦'))
        .catch((err) => toast.error(err || 'Failed to archive'));
    },
    [dispatch]
  );

  const handleRestore = useCallback(
    (id) => {
      dispatch(restoreHabit(id))
        .unwrap()
        .then(() => toast.success('Habit restored 🚀'))
        .catch((err) => toast.error(err || 'Failed to restore'));
    },
    [dispatch]
  );

  const handleComplete = useCallback(
    (id) => {
      dispatch(completeHabit(id))
        .unwrap()
        .then(() => toast.success('Habit checked off! 🔥'))
        .catch((err) => toast.error(err || 'Failed to complete'));
    },
    [dispatch]
  );

  const habitsToFilter = tab === 'archived' ? archivedHabits : habits;

  const filtered = useMemo(() => {
    return (habitsToFilter || []).filter((h) => {
      const matchSearch =
        !search || h.title.toLowerCase().includes(search.toLowerCase());
      const matchCat = !categoryFilter || h.category?.toLowerCase() === categoryFilter.toLowerCase();
      const matchPri = !priorityFilter || h.priority?.toLowerCase() === priorityFilter.toLowerCase();
      return matchSearch && matchCat && matchPri;
    });
  }, [habitsToFilter, search, categoryFilter, priorityFilter]);

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-8 space-y-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <motion.div
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-white/5"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <FiActivity className="text-violet-500" /> My Habits
            </h1>
            <p className="mt-1 text-slate-400 text-sm">
              {filtered.length} active habit{filtered.length !== 1 ? 's' : ''} currently tracking
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:bg-violet-500 transition-all"
          >
            <FiPlus size={16} />
            Add Habit
          </motion.button>
        </motion.div>

        {/* Filter bar */}
        <motion.div
          className="flex flex-wrap gap-3 bg-slate-900/40 p-4 rounded-2xl border border-white/5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
        >
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><FiSearch size={16} /></span>
            <input
              type="text"
              placeholder="Search habits by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-white placeholder-slate-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-sm"
            />
          </div>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2.5 text-sm text-slate-300 outline-none focus:border-violet-500 transition-all"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2.5 text-sm text-slate-300 outline-none focus:border-violet-500 transition-all"
          >
            <option value="">All Priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </motion.div>

        {/* Tabs list */}
        <motion.div
          className="flex gap-1.5 bg-slate-900/60 p-1.5 rounded-2xl border border-white/5 w-fit"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          {['active', 'archived'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative rounded-xl px-5 py-2 text-sm font-semibold capitalize transition-all ${
                tab === t ? 'text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === t && (
                <motion.div
                  layoutId="tab-bg-habit"
                  className="absolute inset-0 rounded-xl bg-violet-600 shadow-md"
                  style={{ zIndex: -1 }}
                />
              )}
              {t}
            </button>
          ))}
        </motion.div>

        {/* Habit Grid */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <motion.div
              className="h-10 w-10 rounded-full border-2 border-violet-500 border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
            />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-white/10 rounded-3xl bg-slate-900/10"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <span className="text-6xl mb-4">🌱</span>
            <h3 className="text-xl font-bold text-white">
              {tab === 'archived' ? 'No archived habits' : 'No habits found'}
            </h3>
            <p className="mt-2 text-slate-400 max-w-sm text-sm">
              {tab === 'active'
                ? "You haven't added any habits yet. Start tracking your progress today!"
                : 'Archive habits you want to temporarily hide or pause.'}
            </p>
            {tab === 'active' && (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={openCreate}
                className="mt-6 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-violet-500 transition-all flex items-center gap-2"
              >
                <FiPlus /> Add Your First Habit
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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

        {/* Delete confirmation toast */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div
              key="toast"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 rounded-xl border border-rose-500/30 bg-slate-950 px-5 py-3.5 text-sm shadow-xl"
            >
              <span className="text-rose-400 font-bold flex items-center gap-2">⚠️ Click delete again to confirm deletion</span>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <FiX size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAB */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          onClick={openCreate}
          className="fixed bottom-8 right-8 flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 text-xl text-white shadow-2xl shadow-violet-500/40 hover:bg-violet-500 transition-colors z-45 sm:hidden"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 260, damping: 20 }}
        >
          <FiPlus />
        </motion.button>
      </div>

      {/* Modal */}
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
