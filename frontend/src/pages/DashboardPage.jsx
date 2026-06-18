import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  fetchDashboardStats,
  fetchWeeklyData,
} from '../features/analytics/analyticsSlice';
import { fetchHabits, completeHabit } from '../features/habits/habitSlice';
import { fetchMe } from '../features/auth/authSlice';
import api from '../services/api';
import AICoachView from '../components/dashboard/AICoachView';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

/** Glassy stat card */
const StatCard = ({ label, value, icon, accent, sub }) => (
  <motion.div
    variants={itemVariants}
    whileHover={{ scale: 1.03, y: -2 }}
    className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md shadow-lg"
  >
    {/* accent glow */}
    <div
      className="absolute -top-6 -right-6 h-24 w-24 rounded-full opacity-20 blur-2xl"
      style={{ background: accent }}
    />
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-gray-400">{label}</p>
        <p className="mt-1 text-3xl font-bold text-white">{value ?? '—'}</p>
        {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
      </div>
      <div
        className="flex h-11 w-11 items-center justify-center rounded-xl text-2xl shadow-inner"
        style={{ background: `${accent}22` }}
      >
        {icon}
      </div>
    </div>
  </motion.div>
);

/** Circular check button with animated completion */
const CompleteButton = ({ done, onClick }) => (
  <motion.button
    onClick={onClick}
    whileTap={{ scale: 0.85 }}
    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-300 ${
      done
        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
        : 'border-gray-600 bg-transparent text-gray-500 hover:border-indigo-500 hover:text-indigo-400'
    }`}
    aria-label={done ? 'Completed' : 'Mark complete'}
  >
    <AnimatePresence mode="wait">
      {done ? (
        <motion.span
          key="check"
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 20 }}
          className="text-lg leading-none"
        >
          ✓
        </motion.span>
      ) : (
        <motion.span
          key="empty"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className="h-3 w-3 rounded-full border border-gray-500"
        />
      )}
    </AnimatePresence>
  </motion.button>
);

/** Today's habit list item */
const HabitRow = ({ habit, onComplete }) => {
  const done = habit.completedToday;
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ x: 4 }}
      className={`flex items-center gap-4 rounded-xl border px-4 py-3 transition-colors ${
        done
          ? 'border-emerald-500/20 bg-emerald-500/5'
          : 'border-white/8 bg-white/3 hover:border-white/15'
      }`}
    >
      <span className="text-2xl">{habit.icon || '🎯'}</span>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold truncate ${done ? 'text-gray-400 line-through' : 'text-white'}`}>
          {habit.title}
        </p>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs font-medium text-indigo-300">
            {habit.category}
          </span>
          <span className="text-xs text-amber-400">🔥 {habit.currentStreak ?? 0}</span>
        </div>
      </div>
      <CompleteButton done={done} onClick={() => !done && onComplete(habit._id)} />
    </motion.div>
  );
};

/** Custom Recharts tooltip */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-gray-900 px-4 py-2 shadow-xl">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-lg font-bold text-indigo-400">{payload[0].value}%</p>
    </div>
  );
};

/** Achievement badge pill */
const BadgePill = ({ badge }) => (
  <motion.div
    variants={itemVariants}
    whileHover={{ scale: 1.08 }}
    className="flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-white/5 p-3 text-center"
  >
    <span className="text-3xl">{badge.icon || '🏆'}</span>
    <span className="text-xs font-medium text-gray-300">{badge.name || badge}</span>
  </motion.div>
);

/** Quick action button */
const QuickAction = ({ icon, label, onClick, accent }) => (
  <motion.button
    variants={itemVariants}
    whileHover={{ scale: 1.04, y: -2 }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-semibold text-white shadow-md transition-colors hover:border-white/20 hover:bg-white/10"
  >
    <span className="text-xl">{icon}</span>
    {label}
  </motion.button>
);

// Bar chart gradient colours per day index
const BAR_COLORS = [
  '#6366f1', '#818cf8', '#6366f1', '#a78bfa',
  '#6366f1', '#c084fc', '#6366f1',
];

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { dashboardStats, weeklyData } = useSelector((s) => s.analytics);
  const { habits } = useSelector((s) => s.habits);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchWeeklyData());
    dispatch(fetchHabits({ status: 'active' }));
  }, [dispatch]);

  const handleComplete = useCallback(
    (id) => {
      dispatch(completeHabit(id)).then(() => {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#6366f1', '#a78bfa', '#34d399']
        });
        dispatch(fetchDashboardStats());
      });
    },
    [dispatch]
  );

  const handleRedeemFreeze = async () => {
    try {
      const res = await api.post('/users/profile/freeze');
      dispatch(fetchMe());
      toast.success(res.data.message || 'Streak Freeze redeemed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to redeem Streak Freeze');
    }
  };

  const statCards = [
    {
      label: 'Total Habits',
      value: dashboardStats?.totalHabits,
      icon: '📋',
      accent: '#6366f1',
      sub: 'Active habits',
    },
    {
      label: 'Completed Today',
      value: dashboardStats?.completedToday,
      icon: '✅',
      accent: '#10b981',
      sub: `of ${dashboardStats?.totalHabits ?? 0} habits`,
    },
    {
      label: 'Current Streak',
      value: dashboardStats?.currentStreak ? `${dashboardStats.currentStreak}d` : '0d',
      icon: '🔥',
      accent: '#f59e0b',
      sub: 'Keep going!',
    },
    {
      label: 'Streak Freezes',
      value: `${user?.streakFreezesCount ?? 0}`,
      icon: '❄️',
      accent: '#38bdf8',
      sub: 'Protects streaks',
    },
    {
      label: 'XP Points',
      value: (dashboardStats?.xp ?? user?.xp ?? 0).toLocaleString(),
      icon: '⚡',
      accent: '#a78bfa',
      sub: `Level ${dashboardStats?.level ?? user?.level ?? 1}`,
    },
    {
      label: 'Productivity Score',
      value: dashboardStats?.productivityScore ? `${dashboardStats.productivityScore}%` : '0%',
      icon: '📈',
      accent: '#34d399',
      sub: 'This week',
    },
  ];

  const chartData = weeklyData?.map((d) => ({
    day: d.day,
    completion: Math.round(d.rate ?? d.completionRate ?? 0),
  })) ?? [];

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8 text-white sm:px-8">
      <motion.div
        className="mx-auto max-w-7xl space-y-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── Page Header ── */}
        <motion.div variants={itemVariants} className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {getGreeting()},{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                {user?.name?.split(' ')[0] ?? 'there'}
              </span>
              ! 👋
            </h1>
            <p className="mt-1 text-gray-400">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <motion.div
            className="hidden rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-gray-300 sm:block"
            whileHover={{ scale: 1.02 }}
          >
            <span className="text-indigo-400 font-semibold">Level {dashboardStats?.level ?? user?.level ?? 1}</span>
            &nbsp;·&nbsp;{(dashboardStats?.xp ?? user?.xp ?? 0).toLocaleString()} XP
          </motion.div>
        </motion.div>

        {/* ── Stat Cards ── */}
        <motion.section variants={containerVariants}>
          <motion.h2
            variants={itemVariants}
            className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500"
          >
            Overview
          </motion.h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
            {statCards.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>
        </motion.section>

        {/* ── Three-column Grid Layout ── */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Columns (Habits & Charts) */}
          <div className="lg:col-span-2 space-y-10">
            {/* Today's Habits */}
            <motion.section variants={itemVariants}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Today's Habits</h2>
                <button
                  onClick={() => navigate('/habits')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  View all →
                </button>
              </div>
              <motion.div
                className="space-y-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {habits.length === 0 && (
                  <motion.div
                    variants={itemVariants}
                    className="rounded-2xl border border-dashed border-white/10 bg-white/3 py-12 text-center"
                  >
                    <p className="text-4xl">🌱</p>
                    <p className="mt-2 text-sm text-gray-400">No habits yet. Add one to get started!</p>
                  </motion.div>
                )}
                {habits.slice(0, 8).map((habit) => (
                  <HabitRow key={habit._id} habit={habit} onComplete={handleComplete} />
                ))}
              </motion.div>
            </motion.section>

            {/* Weekly Progress Chart */}
            <motion.section variants={itemVariants}>
              <h2 className="mb-4 text-lg font-bold text-white">Weekly Progress</h2>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md shadow-lg">
                {chartData.length === 0 ? (
                  <div className="flex h-52 items-center justify-center text-gray-500 text-sm">
                    No weekly data yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData} barCategoryGap="30%">
                      <defs>
                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.95} />
                          <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.6} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0f" vertical={false} />
                      <XAxis
                        dataKey="day"
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        unit="%"
                        domain={[0, 100]}
                        tick={{ fill: '#6b7280', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={36}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff08' }} />
                      <Bar dataKey="completion" radius={[8, 8, 0, 0]} maxBarSize={40}>
                        {chartData.map((_, i) => (
                          <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.section>
          </div>

          {/* Right Column (AI Productivity Coach) */}
          <div className="space-y-10">
            <AICoachView />
          </div>
        </div>

        {/* ── Achievement Badges ── */}
        {user?.badges?.length > 0 && (
          <motion.section variants={itemVariants}>
            <h2 className="mb-4 text-lg font-bold text-white">Achievements</h2>
            <motion.div
              className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-7 xl:grid-cols-10"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {user.badges.map((badge, i) => (
                <BadgePill key={badge._id ?? i} badge={badge} />
              ))}
            </motion.div>
          </motion.section>
        )}

        {/* ── Quick Actions ── */}
        <motion.section variants={itemVariants}>
          <h2 className="mb-4 text-lg font-bold text-white">Quick Actions</h2>
          <motion.div
            className="flex flex-wrap gap-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <QuickAction
              icon="➕"
              label="Add Habit"
              onClick={() => navigate('/habits?new=true')}
            />
            <QuickAction
              icon="❄️"
              label="Redeem Streak Freeze (200 XP)"
              onClick={handleRedeemFreeze}
            />
            <QuickAction
              icon="📊"
              label="View Analytics"
              onClick={() => navigate('/analytics')}
            />
            <QuickAction
              icon="📓"
              label="Journal Today"
              onClick={() => navigate('/journal')}
            />
          </motion.div>
        </motion.section>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
