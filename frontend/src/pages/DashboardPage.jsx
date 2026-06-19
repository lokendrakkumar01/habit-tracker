import React, { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, AreaChart, Area,
} from 'recharts';
import { fetchDashboardStats, fetchWeeklyData } from '../features/analytics/analyticsSlice';
import { fetchHabits, completeHabit } from '../features/habits/habitSlice';
import { fetchMe } from '../features/auth/authSlice';
import api from '../services/api';
import AICoachView from '../components/dashboard/AICoachView';
import {
  FiTrendingUp, FiAward, FiZap, FiActivity, FiClock,
  FiTarget, FiCheckCircle, FiArrowRight, FiPlus, FiBarChart2,
  FiBook, FiShield, FiArrowUp, FiArrowDown,
} from 'react-icons/fi';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS & HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_WEEKLY = [
  { day: 'Mon', value: 45 },
  { day: 'Tue', value: 72 },
  { day: 'Wed', value: 85 },
  { day: 'Thu', value: 60 },
  { day: 'Fri', value: 90 },
  { day: 'Sat', value: 78 },
  { day: 'Sun', value: 95 },
];

const MOCK_HABITS = [
  { _id: 'm1', title: 'Morning Meditation', emoji: '🧘', category: 'Mindfulness', streak: 12, completedToday: false },
  { _id: 'm2', title: 'Read 30 Minutes',    emoji: '📚', category: 'Learning',    streak: 7,  completedToday: false },
  { _id: 'm3', title: 'Drink 8 Glasses',    emoji: '💧', category: 'Health',      streak: 21, completedToday: true  },
  { _id: 'm4', title: 'Evening Walk',        emoji: '🚶', category: 'Fitness',     streak: 5,  completedToday: false },
];

const MOCK_BADGES = [
  { emoji: '🔥', name: '7-Day Streak'    },
  { emoji: '💎', name: 'Diamond Coder'   },
  { emoji: '🎯', name: 'Goal Getter'     },
  { emoji: '⚡', name: 'Streak Master'   },
  { emoji: '🌟', name: 'Top Performer'   },
  { emoji: '🧘', name: 'Zen Achiever'    },
  { emoji: '🏆', name: 'Hall of Fame'    },
  { emoji: '🚀', name: 'Launchpad'       },
];

const CATEGORY_COLORS = {
  Mindfulness:  '#a78bfa',
  Learning:     '#6366f1',
  Health:       '#10b981',
  Fitness:      '#f59e0b',
  Productivity: '#38bdf8',
  Sleep:        '#ec4899',
};

const BAR_PALETTE = ['#6366f1', '#7c3aed', '#8b5cf6', '#6366f1', '#7c3aed', '#8b5cf6', '#a78bfa'];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function getDateString() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// REUSABLE SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

/** Glassmorphism card wrapper */
const GlassCard = ({ children, className = '', style = {}, ...rest }) => (
  <div
    className={className}
    style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderRadius: 20,
      ...style,
    }}
    {...rest}
  >
    {children}
  </div>
);

// ── Circular SVG Ring (Apple Health style) ──────────────────────────────────
function CircularRing({ value = 0, max = 100, color = '#10b981', size = 88, stroke = 7, children }) {
  const r      = (size - stroke * 2) / 2;
  const circ   = 2 * Math.PI * r;
  const pct    = Math.min(Math.max(value / max, 0), 1);
  const offset = circ * (1 - pct);

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
        />
        {/* Fill */}
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: 'easeOut', delay: 0.4 }}
          style={{ filter: `drop-shadow(0 0 7px ${color}99)` }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column',
      }}>
        {children}
      </div>
    </div>
  );
}

// ── Level + XP badge (top-right header) ────────────────────────────────────
function LevelBadge({ level = 1, xp = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.25, duration: 0.5 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'rgba(124,58,237,0.15)',
        border: '1px solid rgba(124,58,237,0.35)',
        borderRadius: 99, padding: '8px 16px',
      }}
    >
      <div style={{
        width: 30, height: 30, borderRadius: '50%',
        background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 900, color: '#fff',
        boxShadow: '0 0 14px rgba(124,58,237,0.55)',
        flexShrink: 0,
      }}>
        {level}
      </div>
      <div>
        <p style={{ color: '#a78bfa', fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', margin: 0, lineHeight: 1 }}>
          LEVEL {level}
        </p>
        <p style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
          ⚡ {xp.toLocaleString()} XP
        </p>
      </div>
    </motion.div>
  );
}

// ── Individual stat card ────────────────────────────────────────────────────
function StatCard({ icon, label, value, accent, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
    >
      <GlassCard style={{ padding: '18px 20px', position: 'relative', overflow: 'hidden', height: '100%' }}>
        {/* Ambient glow */}
        <div style={{
          position: 'absolute', top: -24, right: -24,
          width: 90, height: 90, borderRadius: '50%',
          background: `${accent}1A`,
          filter: 'blur(22px)',
          pointerEvents: 'none',
        }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              color: '#475569', fontSize: 10, fontWeight: 800,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              marginBottom: 10, margin: '0 0 10px',
            }}>
              {label}
            </p>
            <p style={{
              color: '#f1f5f9', fontSize: 28, fontWeight: 900,
              lineHeight: 1, margin: 0, letterSpacing: '-0.02em',
            }}>
              {value ?? '—'}
            </p>
          </div>
          <div style={{
            width: 40, height: 40, borderRadius: 13, flexShrink: 0,
            background: `${accent}1A`,
            border: `1px solid ${accent}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, color: accent,
          }}>
            {icon}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

// ── Wellness metric tile with circular ring ─────────────────────────────────
function WellnessTile({ label, value, max = 100, color, unit = '%', trend, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      style={{ flex: '1 1 120px' }}
    >
      <GlassCard style={{
        padding: '20px 16px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 12,
      }}>
        <p style={{
          color: '#475569', fontSize: 10, fontWeight: 800,
          letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0,
        }}>
          {label}
        </p>
        <CircularRing value={value} max={max} color={color} size={88} stroke={7}>
          <span style={{ color: '#f1f5f9', fontSize: 19, fontWeight: 900, lineHeight: 1 }}>
            {value}
          </span>
          <span style={{ color: '#475569', fontSize: 11 }}>{unit}</span>
        </CircularRing>
        {trend !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {trend >= 0
              ? <FiArrowUp size={11} style={{ color: '#10b981', flexShrink: 0 }} />
              : <FiArrowDown size={11} style={{ color: '#ef4444', flexShrink: 0 }} />
            }
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: trend >= 0 ? '#10b981' : '#ef4444',
            }}>
              {Math.abs(trend)}% vs last wk
            </span>
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}

// ── Custom recharts tooltip ─────────────────────────────────────────────────
function CustomBarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(10,16,36,0.97)',
      border: '1px solid rgba(99,102,241,0.45)',
      borderRadius: 12, padding: '10px 16px',
      color: '#f1f5f9', fontSize: 13,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      <p style={{ color: '#64748b', fontSize: 11, margin: '0 0 4px' }}>{label}</p>
      <p style={{ fontWeight: 800, color: '#a78bfa', margin: 0 }}>{payload[0].value} pts</p>
    </div>
  );
}

// ── Individual habit row ─────────────────────────────────────────────────────
function HabitRow({ habit, onComplete }) {
  const done     = habit.completedToday;
  const catColor = CATEGORY_COLORS[habit.category] || '#6366f1';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: done ? 0.58 : 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.35 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 14px',
        borderRadius: 14,
        background: done ? 'rgba(16,185,129,0.055)' : 'rgba(255,255,255,0.028)',
        border: done ? '1px solid rgba(16,185,129,0.28)' : '1px solid rgba(255,255,255,0.06)',
        marginBottom: 8, position: 'relative', overflow: 'hidden',
        transition: 'background 0.3s, border 0.3s',
      }}
    >
      {done && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(90deg, rgba(16,185,129,0.04) 0%, transparent 55%)',
        }} />
      )}

      {/* Emoji icon */}
      <div style={{
        width: 42, height: 42, borderRadius: 13, flexShrink: 0,
        background: 'rgba(255,255,255,0.055)',
        border: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 21,
      }}>
        {habit.emoji || '✨'}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          color: done ? '#475569' : '#f1f5f9',
          fontSize: 14, fontWeight: 650,
          textDecoration: done ? 'line-through' : 'none',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          margin: 0,
        }}>
          {habit.title}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 4 }}>
          <span style={{
            fontSize: 10, fontWeight: 800, padding: '2px 9px',
            borderRadius: 99, letterSpacing: '0.07em',
            background: `${catColor}16`, color: catColor,
            border: `1px solid ${catColor}32`,
          }}>
            {habit.category}
          </span>
          {habit.streak > 0 && (
            <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700 }}>
              🔥 {habit.streak}d
            </span>
          )}
        </div>
      </div>

      {/* Check button */}
      <motion.button
        whileHover={done ? {} : { scale: 1.1 }}
        whileTap={done ? {} : { scale: 0.88 }}
        onClick={() => !done && onComplete(habit._id)}
        disabled={done}
        style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          border: done ? '2px solid #10b981' : '2px solid rgba(255,255,255,0.14)',
          background: done ? 'rgba(16,185,129,0.22)' : 'transparent',
          color: done ? '#10b981' : '#334155',
          cursor: done ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 17, transition: 'all 0.25s',
        }}
      >
        <AnimatePresence mode="wait">
          {done ? (
            <motion.span
              key="done"
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >✓</motion.span>
          ) : (
            <motion.span
              key="empty"
              style={{
                display: 'block', width: 12, height: 12,
                borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
              }}
            />
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}

// ── Quick action button ─────────────────────────────────────────────────────
function QuickAction({ icon, label, sublabel, accent, onClick, delay = 0 }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45 }}
      whileHover={{ scale: 1.03, y: -3 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{
        flex: '1 1 180px',
        background: `linear-gradient(135deg, ${accent}16 0%, ${accent}07 100%)`,
        border: `1px solid ${accent}2E`,
        borderRadius: 16, padding: '14px 16px',
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
        textAlign: 'left',
      }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 13, flexShrink: 0,
        background: `${accent}22`, border: `1px solid ${accent}3E`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 19, color: accent,
      }}>
        {icon}
      </div>
      <div>
        <p style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 700, margin: '0 0 2px' }}>{label}</p>
        {sublabel && <p style={{ color: '#475569', fontSize: 11, margin: 0 }}>{sublabel}</p>}
      </div>
    </motion.button>
  );
}

// ── Achievement badge tile ──────────────────────────────────────────────────
function AchievementBadge({ badge, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.75 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 280, damping: 18 }}
      whileHover={{ scale: 1.1, y: -4 }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
        padding: '14px 18px',
        background: 'rgba(167,139,250,0.07)',
        border: '1px solid rgba(167,139,250,0.18)',
        borderRadius: 16, cursor: 'default', minWidth: 80,
      }}
    >
      <div style={{
        width: 50, height: 50, borderRadius: '50%',
        background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, boxShadow: '0 0 18px rgba(124,58,237,0.4)',
      }}>
        {badge.emoji || '🏆'}
      </div>
      <p style={{
        color: '#c4b5fd', fontSize: 11, fontWeight: 700,
        textAlign: 'center', margin: 0, maxWidth: 80, lineHeight: 1.3,
      }}>
        {badge.name || 'Achievement'}
      </p>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user }          = useSelector(s => s.auth);
  const { habits = [] }   = useSelector(s => s.habits);
  const analytics         = useSelector(s => s.analytics || {});
  const stats             = analytics.stats || {};
  const weeklyData        = analytics.weeklyData || [];

  const [localHabits, setLocalHabits] = useState([]);
  const [completing, setCompleting]   = useState(null);

  // ── On mount: fetch all data ────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchMe());
    dispatch(fetchHabits());
    dispatch(fetchDashboardStats());
    dispatch(fetchWeeklyData());
  }, [dispatch]);

  // ── Sync local habits (with mock fallback) ──────────────────────────────
  useEffect(() => {
    setLocalHabits(habits.length > 0 ? habits : MOCK_HABITS);
  }, [habits]);

  // ── Derived values ──────────────────────────────────────────────────────
  const firstName      = user?.name?.split(' ')[0] || 'Explorer';
  const userLevel      = stats.level          ?? user?.level          ?? 7;
  const xpPoints       = stats.xpPoints       ?? user?.xp             ?? 2450;
  const totalHabits    = stats.totalHabits    ?? localHabits.length;
  const completedToday = stats.completedToday ?? localHabits.filter(h => h.completedToday).length;
  const currentStreak  = stats.currentStreak  ?? user?.streak         ?? 12;
  const streakFreezes  = stats.streakFreezes  ?? user?.streakFreezes  ?? 3;

  const productivityScore = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
  const wellnessScore     = Math.min(100, Math.round((productivityScore * 0.6) + (Math.min(currentStreak, 30) / 30) * 40));
  const focusScore        = Math.min(100, Math.round(productivityScore * 0.85 + 12));
  const consistencyScore  = Math.min(100, Math.round((Math.min(currentStreak, 30) / 30) * 100));
  const momentumValue     = Math.min(100, Math.round((Math.min(currentStreak, 7) / 7) * 55 + productivityScore * 0.45));

  const chartData  = weeklyData.length > 0 ? weeklyData : MOCK_WEEKLY;
  const avgScore   = Math.round(chartData.reduce((a, c) => a + c.value, 0) / chartData.length);
  const bestDay    = chartData.reduce((a, c) => (c.value > a.value ? c : a), chartData[0])?.day || '—';
  const totalScore = chartData.reduce((a, c) => a + c.value, 0);

  const displayBadges = (user?.badges?.length > 0 ? user.badges : MOCK_BADGES);

  // ── Complete a habit ────────────────────────────────────────────────────
  const handleComplete = useCallback(async (habitId) => {
    if (completing) return;
    setCompleting(habitId);

    // Optimistic update immediately
    setLocalHabits(prev =>
      prev.map(h => h._id === habitId ? { ...h, completedToday: true } : h)
    );

    // Confetti burst
    confetti({
      particleCount: 130,
      spread: 85,
      origin: { y: 0.6 },
      colors: ['#7c3aed', '#6366f1', '#10b981', '#f59e0b', '#ec4899'],
    });

    toast.success('🎉 Habit complete! +50 XP earned', {
      duration: 3000,
      style: {
        background: '#0f172a',
        color: '#f1f5f9',
        border: '1px solid rgba(16,185,129,0.4)',
        borderRadius: 12,
      },
      iconTheme: { primary: '#10b981', secondary: '#0f172a' },
    });

    try {
      await dispatch(completeHabit(habitId)).unwrap();
    } catch (_) {
      // silently fail – UI is already updated optimistically
    }
    setCompleting(null);
  }, [completing, dispatch]);

  // ── Streak freeze ───────────────────────────────────────────────────────
  const handleStreakFreeze = useCallback(async () => {
    if (streakFreezes <= 0) {
      toast.error('No streak freezes remaining!');
      return;
    }
    try {
      await api.post('/users/streak-freeze');
      toast.success('❄️ Streak freeze activated!', {
        style: {
          background: '#0f172a', color: '#f1f5f9',
          border: '1px solid rgba(56,189,248,0.4)', borderRadius: 12,
        },
      });
    } catch (_) {
      toast.error('Could not activate streak freeze.');
    }
  }, [streakFreezes]);

  // Incomplete habits first
  const sortedHabits = [...localHabits].sort((a, b) => Number(a.completedToday) - Number(b.completedToday));

  const STAT_CARDS = [
    { icon: <FiActivity />,    label: 'Total Habits',        value: totalHabits,                  accent: '#6366f1', delay: 0.06 },
    { icon: <FiCheckCircle />, label: 'Completed Today',     value: completedToday,               accent: '#10b981', delay: 0.11 },
    { icon: '🔥',              label: 'Current Streak',      value: `${currentStreak}d`,          accent: '#f59e0b', delay: 0.16 },
    { icon: '❄️',              label: 'Streak Freezes',      value: streakFreezes,                accent: '#38bdf8', delay: 0.21 },
    { icon: '⚡',              label: 'XP Points',           value: xpPoints.toLocaleString(),    accent: '#a78bfa', delay: 0.26 },
    { icon: <FiTrendingUp />,  label: 'Productivity Score',  value: `${productivityScore}%`,      accent: '#34d399', delay: 0.31 },
  ];

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#020617', padding: '24px 24px 48px', overflowX: 'hidden' }}>

      {/* ── Ambient background glows ─────────────────────────────────── */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: -220, left: -220, width: 660, height: 660,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.09) 0%, transparent 70%)',
          filter: 'blur(44px)',
        }} />
        <div style={{
          position: 'absolute', bottom: -180, right: -180, width: 520, height: 520,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', top: '40%', right: '20%', width: 300, height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 70%)',
          filter: 'blur(36px)',
        }} />
      </div>

      {/* ── Page content ─────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1440, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 1 – GREETING ROW
        ══════════════════════════════════════════════════════════════ */}
        <div style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', flexWrap: 'wrap',
          gap: 14, marginBottom: 28,
        }}>
          <motion.div
            initial={{ opacity: 0, x: -22 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            <h1 style={{
              color: '#f1f5f9', margin: 0,
              fontSize: 'clamp(22px, 3.2vw, 32px)',
              fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 1.15,
            }}>
              {getGreeting()},{' '}
              <span style={{
                background: 'linear-gradient(90deg, #c4b5fd, #6366f1)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {firstName}
              </span>
              ! 👋
            </h1>
            <p style={{ color: '#475569', fontSize: 14, marginTop: 6, fontWeight: 500 }}>
              📅 {getDateString()} &nbsp;·&nbsp;
              <span style={{ color: '#94a3b8' }}>{completedToday}/{totalHabits} habits complete</span>
            </p>
          </motion.div>
          <LevelBadge level={userLevel} xp={xpPoints} />
        </div>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 2 – STAT CARDS (6-up)
        ══════════════════════════════════════════════════════════════ */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))',
          gap: 12, marginBottom: 22,
        }}>
          {STAT_CARDS.map((card, i) => (
            <StatCard key={i} {...card} />
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 3 – WELLNESS DASHBOARD
        ══════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.5 }}
          style={{ marginBottom: 22 }}
        >
          <GlassCard style={{ padding: '24px 28px' }}>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', flexWrap: 'wrap',
              gap: 10, marginBottom: 22,
            }}>
              <div>
                <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>
                  🧬 Wellness Dashboard
                </h2>
                <p style={{ color: '#475569', fontSize: 12, marginTop: 4 }}>
                  Holistic health snapshot · auto-calculated from your habits
                </p>
              </div>
              <div style={{
                padding: '5px 14px', borderRadius: 99,
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.28)',
                color: '#10b981', fontSize: 12, fontWeight: 800, letterSpacing: '0.04em',
              }}>
                ✦ Live
              </div>
            </div>
            {/* Rings row */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <WellnessTile label="Wellness"    value={wellnessScore}    color="#10b981" unit="%" trend={+8}  delay={0.42} />
              <WellnessTile label="Focus"       value={focusScore}       color="#6366f1" unit="%" trend={+5}  delay={0.47} />
              <WellnessTile label="Consistency" value={consistencyScore} color="#f59e0b" unit="%" trend={-2}  delay={0.52} />
              <WellnessTile label="Momentum"    value={momentumValue}    color="#ec4899" unit="%" trend={+12} delay={0.57} />
            </div>
          </GlassCard>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 4 – THREE-COLUMN GRID
        ══════════════════════════════════════════════════════════════ */}
        <div
          className="dashboard-main-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
            gap: 20, marginBottom: 22, alignItems: 'start',
          }}
        >
          {/* ── LEFT COLUMN ──────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* TODAY'S HABITS ───────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.43, duration: 0.5 }}
            >
              <GlassCard style={{ padding: '24px' }}>
                {/* Header */}
                <div style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', flexWrap: 'wrap',
                  gap: 10, marginBottom: 18,
                }}>
                  <div>
                    <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 800, margin: 0 }}>
                      📋 Today's Habits
                    </h2>
                    <p style={{ color: '#475569', fontSize: 12, marginTop: 4 }}>
                      {completedToday} of {totalHabits} completed
                    </p>
                  </div>
                  {/* Progress bar */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
                    <div style={{
                      width: 120, height: 6, borderRadius: 99,
                      background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
                    }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${productivityScore}%` }}
                        transition={{ duration: 1.1, delay: 0.65, ease: 'easeOut' }}
                        style={{
                          height: '100%', borderRadius: 99,
                          background: 'linear-gradient(90deg, #7c3aed, #10b981)',
                        }}
                      />
                    </div>
                    <span style={{ color: '#475569', fontSize: 11 }}>{productivityScore}% done</span>
                  </div>
                </div>

                {/* Habit list */}
                <AnimatePresence>
                  {sortedHabits.length > 0 ? (
                    sortedHabits.map(habit => (
                      <HabitRow key={habit._id} habit={habit} onComplete={handleComplete} />
                    ))
                  ) : (
                    <motion.div
                      key="empty-state"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        padding: '40px 20px', gap: 14, textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: 60 }}>🌱</div>
                      <p style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 17, margin: 0 }}>
                        No habits yet
                      </p>
                      <p style={{ color: '#475569', fontSize: 13, maxWidth: 230, margin: 0 }}>
                        Start your journey by adding your first habit!
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => navigate('/habits/new')}
                        style={{
                          marginTop: 4,
                          background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                          color: '#fff', border: 'none', borderRadius: 12,
                          padding: '10px 26px', fontWeight: 800, fontSize: 14,
                          cursor: 'pointer',
                          boxShadow: '0 4px 22px rgba(124,58,237,0.45)',
                        }}
                      >
                        + Add First Habit
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            </motion.div>

            {/* WEEKLY PROGRESS CHART ─────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5 }}
            >
              <GlassCard style={{ padding: '24px' }}>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', flexWrap: 'wrap',
                  gap: 10, marginBottom: 20,
                }}>
                  <div>
                    <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 800, margin: 0 }}>
                      📈 Weekly Progress
                    </h2>
                    <p style={{ color: '#475569', fontSize: 12, marginTop: 4 }}>Your activity this week</p>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['W', 'M', 'Y'].map((t, i) => (
                      <button key={t} style={{
                        padding: '4px 11px', borderRadius: 8,
                        fontSize: 11, fontWeight: 800, cursor: 'pointer',
                        background: i === 0 ? 'rgba(99,102,241,0.22)' : 'rgba(255,255,255,0.04)',
                        border: i === 0 ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.07)',
                        color: i === 0 ? '#a78bfa' : '#475569',
                      }}>{t}</button>
                    ))}
                  </div>
                </div>

                {/* Bar chart */}
                <div style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barSize={30} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7c3aed" stopOpacity={1} />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity={0.65} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                      <XAxis
                        dataKey="day"
                        tick={{ fill: '#475569', fontSize: 12, fontWeight: 700 }}
                        axisLine={false} tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: '#334155', fontSize: 11 }}
                        axisLine={false} tickLine={false}
                      />
                      <Tooltip
                        content={<CustomBarTooltip />}
                        cursor={{ fill: 'rgba(255,255,255,0.025)', radius: 6 }}
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="url(#barGradient)">
                        {chartData.map((_, idx) => (
                          <Cell key={`cell-${idx}`} fill={BAR_PALETTE[idx % BAR_PALETTE.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Summary pills */}
                <div style={{
                  display: 'flex', gap: 12, marginTop: 16,
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 12,
                }}>
                  {[
                    { label: 'Avg Score', value: avgScore,   color: '#6366f1' },
                    { label: 'Best Day',  value: bestDay,    color: '#10b981' },
                    { label: 'Total',     value: totalScore, color: '#f59e0b' },
                  ].map(({ label, value, color }, i) => (
                    <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                      <p style={{
                        color: '#334155', fontSize: 10, fontWeight: 800,
                        letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 5px',
                      }}>{label}</p>
                      <p style={{ color, fontSize: 20, fontWeight: 900, margin: 0 }}>{value}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN – AI COACH ──────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 22 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.48, duration: 0.5 }}
          >
            <AICoachView />
          </motion.div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 5 – QUICK ACTIONS
        ══════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.62, duration: 0.5 }}
          style={{ marginBottom: 22 }}
        >
          <p style={{
            color: '#334155', fontSize: 11, fontWeight: 800,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            marginBottom: 12,
          }}>
            ⚡ Quick Actions
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <QuickAction
              icon={<FiPlus />}
              label="Add Habit"
              sublabel="Track something new"
              accent="#6366f1"
              onClick={() => navigate('/habits/new')}
              delay={0.64}
            />
            <QuickAction
              icon="❄️"
              label="Streak Freeze"
              sublabel="200 XP · Protect your streak"
              accent="#38bdf8"
              onClick={handleStreakFreeze}
              delay={0.68}
            />
            <QuickAction
              icon={<FiBarChart2 />}
              label="View Analytics"
              sublabel="Deep dive into stats"
              accent="#a78bfa"
              onClick={() => navigate('/analytics')}
              delay={0.72}
            />
            <QuickAction
              icon={<FiBook />}
              label="Journal Today"
              sublabel="Reflect & record"
              accent="#f59e0b"
              onClick={() => navigate('/journal')}
              delay={0.76}
            />
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 6 – ACHIEVEMENT BADGES
        ══════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <GlassCard style={{ padding: '24px' }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', flexWrap: 'wrap',
              gap: 10, marginBottom: 18,
            }}>
              <div>
                <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 800, margin: 0 }}>
                  🏆 Achievement Badges
                </h2>
                <p style={{ color: '#475569', fontSize: 12, marginTop: 4 }}>
                  {displayBadges.length} badges earned · keep going!
                </p>
              </div>
              <motion.button
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
                onClick={() => navigate('/achievements')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'transparent', border: 'none',
                  color: '#6366f1', fontSize: 13, fontWeight: 800,
                  cursor: 'pointer', padding: 0,
                }}
              >
                View All <FiArrowRight size={14} />
              </motion.button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {displayBadges.slice(0, 8).map((badge, i) => (
                <AchievementBadge key={i} badge={badge} delay={0.72 + i * 0.04} />
              ))}
            </div>
          </GlassCard>
        </motion.div>

      </div>{/* /max-width */}

      {/* ── Responsive overrides ─────────────────────────────────────── */}
      <style>{`
        @media (max-width: 900px) {
          .dashboard-main-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 540px) {
          .dashboard-main-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
