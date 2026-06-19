import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Flame,
  Calendar,
  Award,
  BarChart2,
  Activity,
  Target,
  Zap,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  Clock,
  Layers,
} from 'lucide-react';
import {
  fetchDashboardStats,
  fetchWeeklyData,
} from '../features/analytics/analyticsSlice';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const MOCK_STATS = {
  totalCompletions: 347,
  successRate: 82,
  bestDay: 'Wednesday',
  longestStreak: 21,
  totalCompletionsDelta: 12,
  successRateDelta: 4,
  longestStreakDelta: 3,
};

const MOCK_AREA_DATA = [
  { day: 'Mon', rate: 65, completions: 5 },
  { day: 'Tue', rate: 78, completions: 7 },
  { day: 'Wed', rate: 92, completions: 9 },
  { day: 'Thu', rate: 71, completions: 6 },
  { day: 'Fri', rate: 85, completions: 8 },
  { day: 'Sat', rate: 58, completions: 4 },
  { day: 'Sun', rate: 88, completions: 8 },
];

const MOCK_BAR_DATA = [
  { day: 'Mon', completed: 5, total: 8 },
  { day: 'Tue', completed: 7, total: 8 },
  { day: 'Wed', completed: 9, total: 10 },
  { day: 'Thu', completed: 6, total: 9 },
  { day: 'Fri', completed: 8, total: 9 },
  { day: 'Sat', completed: 4, total: 7 },
  { day: 'Sun', completed: 8, total: 9 },
];

const MOCK_RADAR_DATA = [
  { category: 'Fitness', score: 88 },
  { category: 'Study', score: 72 },
  { category: 'Health', score: 91 },
  { category: 'Coding', score: 65 },
  { category: 'Mindfulness', score: 78 },
];

const MOCK_PIE_DATA = [
  { name: 'Fitness', value: 32, color: '#a78bfa' },
  { name: 'Study', value: 24, color: '#38bdf8' },
  { name: 'Health', value: 20, color: '#34d399' },
  { name: 'Coding', value: 14, color: '#f59e0b' },
  { name: 'Mindfulness', value: 10, color: '#f87171' },
];

const MOCK_MONTHLY_DATA = [
  { week: 'W1', rate: 70, completions: 38 },
  { week: 'W2', rate: 75, completions: 42 },
  { week: 'W3', rate: 82, completions: 51 },
  { week: 'W4', rate: 79, completions: 48 },
];

const MOCK_YEARLY_DATA = [
  { month: 'Jan', rate: 60, completions: 120 },
  { month: 'Feb', rate: 65, completions: 132 },
  { month: 'Mar', rate: 72, completions: 148 },
  { month: 'Apr', rate: 68, completions: 140 },
  { month: 'May', rate: 80, completions: 165 },
  { month: 'Jun', rate: 77, completions: 158 },
  { month: 'Jul', rate: 85, completions: 175 },
  { month: 'Aug', rate: 83, completions: 170 },
  { month: 'Sep', rate: 78, completions: 160 },
  { month: 'Oct', rate: 86, completions: 177 },
  { month: 'Nov', rate: 82, completions: 168 },
  { month: 'Dec', rate: 88, completions: 181 },
];

const MOCK_CATEGORIES = [
  { name: 'Fitness', icon: '🏋️', completion: 88, habits: 4, color: '#a78bfa', bgColor: 'rgba(167,139,250,0.12)' },
  { name: 'Study', icon: '📚', completion: 72, habits: 3, color: '#38bdf8', bgColor: 'rgba(56,189,248,0.12)' },
  { name: 'Health', icon: '🥗', completion: 91, habits: 5, color: '#34d399', bgColor: 'rgba(52,211,153,0.12)' },
  { name: 'Coding', icon: '💻', completion: 65, habits: 3, color: '#f59e0b', bgColor: 'rgba(245,158,11,0.12)' },
  { name: 'Mindfulness', icon: '🧘', completion: 78, habits: 2, color: '#f87171', bgColor: 'rgba(248,113,113,0.12)' },
];

const generateHeatmapData = () => {
  const cells = [];
  for (let col = 0; col < 53; col++) {
    for (let row = 0; row < 7; row++) {
      const rand = Math.random();
      let level = 0;
      if (rand > 0.65) level = 1;
      if (rand > 0.78) level = 2;
      if (rand > 0.88) level = 3;
      if (rand > 0.95) level = 4;
      cells.push({ col, row, level });
    }
  }
  return cells;
};

const HEATMAP_DATA = generateHeatmapData();

const HEATMAP_COLORS = [
  'rgba(255,255,255,0.05)',
  'rgba(16,185,129,0.25)',
  'rgba(16,185,129,0.45)',
  'rgba(16,185,129,0.70)',
  'rgba(16,185,129,0.95)',
];

const HEATMAP_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const HEATMAP_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TABS = ['Overview', 'Weekly', 'Monthly', 'Yearly'];

const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        background: 'rgba(10,10,20,0.95)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '12px',
        padding: '10px 16px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        minWidth: '140px',
      }}
    >
      {label && (
        <p style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '6px' }}>
          {label}
        </p>
      )}
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: i > 0 ? '4px' : 0 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color || entry.fill }} />
          <span style={{ color: '#94a3b8', fontSize: '12px' }}>{entry.name}:</span>
          <span style={{ color: '#f8fafc', fontSize: '13px', fontWeight: 700 }}>
            {typeof entry.value === 'number' && String(entry.name).toLowerCase().includes('rate')
              ? `${entry.value}%`
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0];
  return (
    <div
      style={{
        background: 'rgba(10,10,20,0.95)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '12px',
        padding: '10px 16px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.payload.color }} />
        <span style={{ color: '#94a3b8', fontSize: '12px' }}>{item.name}</span>
        <span style={{ color: '#f8fafc', fontSize: '13px', fontWeight: 700 }}>{item.value}%</span>
      </div>
    </div>
  );
};

const RadarTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        background: 'rgba(10,10,20,0.95)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '12px',
        padding: '10px 16px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      }}
    >
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#94a3b8', fontSize: '12px' }}>{entry.payload.category}:</span>
          <span style={{ color: '#a78bfa', fontSize: '13px', fontWeight: 700 }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, delta, color, bgColor, suffix }) => {
  const isPositive = delta >= 0;
  return (
    <motion.div
      variants={itemVariants}
      className="stat-card"
      style={{ background: 'rgba(255,255,255,0.03)' }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, ${color}55, transparent)`,
      }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: bgColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1px solid ${color}30`,
        }}>
          <Icon size={20} style={{ color }} />
        </div>
        {delta !== undefined && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 3,
            padding: '4px 8px', borderRadius: 8,
            background: isPositive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${isPositive ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
          }}>
            {isPositive
              ? <ArrowUpRight size={12} style={{ color: '#34d399' }} />
              : <ArrowDownRight size={12} style={{ color: '#f87171' }} />}
            <span style={{ color: isPositive ? '#34d399' : '#f87171', fontSize: 11, fontWeight: 700 }}>
              {isPositive ? '+' : ''}{delta}%
            </span>
          </div>
        )}
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#f8fafc', lineHeight: 1, marginBottom: 6, fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
          {value}
          {suffix && <span style={{ fontSize: 15, fontWeight: 500, color: '#94a3b8', marginLeft: 3 }}>{suffix}</span>}
        </div>
        <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{label}</div>
      </div>
    </motion.div>
  );
};

const CategoryRow = ({ item, index }) => (
  <motion.div
    variants={itemVariants}
    style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 16px', borderRadius: 14,
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(255,255,255,0.07)',
      marginBottom: 8,
    }}
    whileHover={{ x: 3, background: 'rgba(255,255,255,0.05)', transition: { duration: 0.15 } }}
  >
    <div style={{
      width: 40, height: 40, borderRadius: 12,
      background: item.bgColor, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontSize: 18, flexShrink: 0,
      border: `1px solid ${item.color}25`,
    }}>
      {item.icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>{item.name}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: item.color }}>{item.completion}%</span>
      </div>
      <div className="progress-bar" style={{ height: 5 }}>
        <motion.div
          className="progress-fill"
          style={{ background: `linear-gradient(90deg, ${item.color}bb, ${item.color})`, width: 0 }}
          animate={{ width: `${item.completion}%` }}
          transition={{ duration: 1.2, delay: 0.1 * index, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </div>
    </div>
    <div style={{ textAlign: 'right', flexShrink: 0 }}>
      <div style={{ fontSize: 12, color: '#64748b' }}>{item.habits} habits</div>
    </div>
  </motion.div>
);

const ActivityHeatmap = () => {
  const [hoveredCell, setHoveredCell] = useState(null);
  const CELL_SIZE = 11;
  const GAP = 2;
  const COLS = 53;
  const ROWS = 7;

  const cellsByCol = useMemo(() => {
    const map = {};
    HEATMAP_DATA.forEach(cell => {
      if (!map[cell.col]) map[cell.col] = {};
      map[cell.col][cell.row] = cell;
    });
    return map;
  }, []);

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
      <div style={{ display: 'flex', marginLeft: 32, marginBottom: 4 }}>
        {HEATMAP_MONTHS.map((m) => (
          <div key={m} style={{
            width: `${Math.floor(COLS / 12) * (CELL_SIZE + GAP)}px`,
            fontSize: 10, color: '#475569', fontWeight: 600,
          }}>
            {m}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: GAP, marginRight: 6, paddingTop: 1 }}>
          {HEATMAP_DAYS.map((d, i) => (
            <div key={d} style={{
              height: CELL_SIZE, fontSize: 9, color: '#475569',
              fontWeight: 600, display: 'flex', alignItems: 'center',
              visibility: i % 2 === 0 ? 'visible' : 'hidden',
            }}>
              {d}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: GAP }}>
          {Array.from({ length: COLS }, (_, col) => (
            <div key={col} style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
              {Array.from({ length: ROWS }, (_, row) => {
                const cell = cellsByCol[col]?.[row];
                const level = cell?.level ?? 0;
                const cellId = `${col}-${row}`;
                const isHovered = hoveredCell === cellId;
                return (
                  <div
                    key={row}
                    onMouseEnter={() => setHoveredCell(cellId)}
                    onMouseLeave={() => setHoveredCell(null)}
                    style={{
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      borderRadius: 2,
                      background: HEATMAP_COLORS[level],
                      border: `1px solid ${level > 0 ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)'}`,
                      cursor: 'pointer',
                      transition: 'transform 0.1s ease',
                      transform: isHovered ? 'scale(1.4)' : 'scale(1)',
                    }}
                    title={`Level ${level} activity`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 10, color: '#475569' }}>Less</span>
        {HEATMAP_COLORS.map((c, i) => (
          <div key={i} style={{
            width: 11, height: 11, borderRadius: 2,
            background: c,
            border: `1px solid ${i > 0 ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}`,
          }} />
        ))}
        <span style={{ fontSize: 10, color: '#475569' }}>More</span>
      </div>
    </div>
  );
};

const OverviewTab = ({ areaData, barData, radarData, pieData }) => (
  <motion.div key="overview" variants={containerVariants} initial="hidden" animate="visible">
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 20 }}>
      
      <motion.div variants={itemVariants} className="glass-card-static" style={{ padding: 24 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(167,139,250,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={16} style={{ color: '#a78bfa' }} />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>Completion Rate</h3>
          </div>
          <p style={{ fontSize: 12, color: '#64748b', marginLeft: 42 }}>7-day trend overview</p>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={areaData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip content={<DarkTooltip />} />
            <Area type="monotone" dataKey="rate" name="Rate" stroke="#a78bfa" strokeWidth={2.5} fill="url(#rateGrad)" dot={{ fill: '#a78bfa', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#a78bfa', stroke: 'rgba(167,139,250,0.4)', strokeWidth: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card-static" style={{ padding: 24 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(56,189,248,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart2 size={16} style={{ color: '#38bdf8' }} />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>Daily Completions</h3>
          </div>
          <p style={{ fontSize: 12, color: '#64748b', marginLeft: 42 }}>Habits completed per day</p>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }} barCategoryGap="35%">
            <defs>
              <linearGradient id="barCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={1} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.85} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<DarkTooltip />} />
            <Bar dataKey="total" name="Total" fill="rgba(255,255,255,0.06)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="completed" name="Completed" fill="url(#barCompleted)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 20 }}>
      
      <motion.div variants={itemVariants} className="glass-card-static" style={{ padding: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(52,211,153,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={16} style={{ color: '#34d399' }} />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>Category Performance</h3>
          </div>
          <p style={{ fontSize: 12, color: '#64748b', marginLeft: 42 }}>Score across all categories</p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
            <PolarGrid stroke="rgba(255,255,255,0.07)" />
            <PolarAngleAxis dataKey="category" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} />
            <Radar name="Score" dataKey="score" stroke="#a78bfa" strokeWidth={2} fill="rgba(167,139,250,0.15)" dot={{ fill: '#a78bfa', r: 3 }} />
            <Tooltip content={<RadarTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card-static" style={{ padding: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={16} style={{ color: '#f59e0b' }} />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>Category Breakdown</h3>
          </div>
          <p style={{ fontSize: 12, color: '#64748b', marginLeft: 42 }}>Habit distribution by type</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <ResponsiveContainer width={180} height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ flex: 1, minWidth: 100 }}>
            {pieData.map((item) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#94a3b8', flex: 1 }}>{item.name}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9' }}>{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  </motion.div>
);

const WeeklyTab = ({ areaData, barData }) => (
  <motion.div key="weekly" variants={containerVariants} initial="hidden" animate="visible">
    <motion.div variants={itemVariants} className="glass-card-static" style={{ padding: 28, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>Weekly Completion Trend</h3>
          <p style={{ fontSize: 12, color: '#64748b' }}>Your habit success rate across 7 days</p>
        </div>
        <div className="badge badge-primary">This Week</div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={areaData} margin={{ top: 10, right: 10, bottom: 0, left: -15 }}>
          <defs>
            <linearGradient id="weekRate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="weekComp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip content={<DarkTooltip />} />
          <Legend wrapperStyle={{ paddingTop: 16 }} formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{value}</span>} />
          <Area type="monotone" dataKey="rate" name="Rate (%)" stroke="#a78bfa" strokeWidth={2.5} fill="url(#weekRate)" dot={{ fill: '#a78bfa', r: 4 }} activeDot={{ r: 6 }} />
          <Area type="monotone" dataKey="completions" name="Completions" stroke="#38bdf8" strokeWidth={2} fill="url(#weekComp)" dot={{ fill: '#38bdf8', r: 4 }} activeDot={{ r: 6 }} />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>

    <motion.div variants={itemVariants} className="glass-card-static" style={{ padding: 28 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>Completed vs Total</h3>
      <p style={{ fontSize: 12, color: '#64748b', marginBottom: 24 }}>Habits completed against daily targets</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={barData} margin={{ top: 10, right: 10, bottom: 0, left: -15 }} barCategoryGap="30%">
          <defs>
            <linearGradient id="wkCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip content={<DarkTooltip />} />
          <Legend formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{value}</span>} />
          <Bar dataKey="total" name="Total" fill="rgba(255,255,255,0.06)" radius={[6, 6, 0, 0]} />
          <Bar dataKey="completed" name="Completed" fill="url(#wkCompleted)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  </motion.div>
);

const MonthlyTab = ({ monthlyData }) => (
  <motion.div key="monthly" variants={containerVariants} initial="hidden" animate="visible">
    <motion.div variants={itemVariants} className="glass-card-static" style={{ padding: 28, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>Monthly Overview</h3>
          <p style={{ fontSize: 12, color: '#64748b' }}>Weekly breakdown for this month</p>
        </div>
        <div className="badge badge-success">June 2026</div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={monthlyData} margin={{ top: 10, right: 10, bottom: 0, left: -15 }}>
          <defs>
            <linearGradient id="monthRate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34d399" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="monthComp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="week" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip content={<DarkTooltip />} />
          <Legend formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{value}</span>} />
          <Area type="monotone" dataKey="rate" name="Rate (%)" stroke="#34d399" strokeWidth={2.5} fill="url(#monthRate)" dot={{ fill: '#34d399', r: 5 }} activeDot={{ r: 7 }} />
          <Area type="monotone" dataKey="completions" name="Completions" stroke="#f59e0b" strokeWidth={2} fill="url(#monthComp)" dot={{ fill: '#f59e0b', r: 4 }} activeDot={{ r: 6 }} />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
      {[
        { label: 'Best Week', value: 'Week 3', sub: '82% completion', color: '#34d399', Icon: Star },
        { label: 'Total Completions', value: '179', sub: 'This month', color: '#a78bfa', Icon: CheckCircle },
        { label: 'Avg Daily Rate', value: '76%', sub: 'Mon–Sun average', color: '#38bdf8', Icon: Target },
        { label: 'Habits Active', value: '12', sub: 'Across 5 categories', color: '#f59e0b', Icon: Zap },
      ].map((item) => (
        <motion.div key={item.label} variants={itemVariants} className="glass-card-static" style={{ padding: 20 }} whileHover={{ y: -2 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <item.Icon size={18} style={{ color: item.color }} />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#f8fafc', marginBottom: 2 }}>{item.value}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 2 }}>{item.label}</div>
          <div style={{ fontSize: 11, color: '#475569' }}>{item.sub}</div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

const YearlyTab = ({ yearlyData }) => (
  <motion.div key="yearly" variants={containerVariants} initial="hidden" animate="visible">
    <motion.div variants={itemVariants} className="glass-card-static" style={{ padding: 28, marginBottom: 20 }}>
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>Year at a Glance</h3>
        <p style={{ fontSize: 12, color: '#64748b' }}>Completion rate and total habits done across 12 months</p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={yearlyData} margin={{ top: 10, right: 10, bottom: 0, left: -15 }} barCategoryGap="25%">
          <defs>
            <linearGradient id="yrBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="left" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<DarkTooltip />} />
          <Legend formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{value}</span>} />
          <Bar yAxisId="left" dataKey="completions" name="Completions" fill="url(#yrBar)" radius={[6, 6, 0, 0]} />
          <Bar yAxisId="right" dataKey="rate" name="Rate (%)" fill="rgba(56,189,248,0.3)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>

    <motion.div variants={itemVariants} className="glass-card-static" style={{ padding: 28 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>Trend Line</h3>
      <p style={{ fontSize: 12, color: '#64748b', marginBottom: 24 }}>Overall progression throughout the year</p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={yearlyData} margin={{ top: 10, right: 10, bottom: 0, left: -15 }}>
          <defs>
            <linearGradient id="yrArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} domain={[40, 100]} />
          <Tooltip content={<DarkTooltip />} />
          <Area type="monotone" dataKey="rate" name="Rate (%)" stroke="#6366f1" strokeWidth={2.5} fill="url(#yrArea)" dot={{ fill: '#6366f1', r: 3 }} activeDot={{ r: 6, fill: '#a78bfa', stroke: 'rgba(167,139,250,0.4)', strokeWidth: 4 }} />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  </motion.div>
);

export default function AnalyticsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('Overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { dashboardStats, weeklyData, monthlyData, yearlyData } = useSelector(
    (state) => state.analytics ?? {}
  );

  const stats = dashboardStats ?? MOCK_STATS;
  const areaData = (weeklyData && weeklyData.length > 0) ? weeklyData : MOCK_AREA_DATA;
  const barData = MOCK_BAR_DATA;
  const radarData = MOCK_RADAR_DATA;
  const pieData = MOCK_PIE_DATA;
  const categories = MOCK_CATEGORIES;
  const mMonthly = (monthlyData && Array.isArray(monthlyData) && monthlyData.length > 0) ? monthlyData : MOCK_MONTHLY_DATA;
  const mYearly = (yearlyData && yearlyData.length > 0) ? yearlyData : MOCK_YEARLY_DATA;

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchWeeklyData());
  }, [dispatch]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        dispatch(fetchDashboardStats()).unwrap(),
        dispatch(fetchWeeklyData()).unwrap(),
      ]);
      toast.success('Analytics refreshed!', {
        style: { background: 'rgba(10,10,20,0.95)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: 12 },
      });
    } catch (_) {
      
    } finally {
      setIsRefreshing(false);
    }
  };

  const statCards = [
    {
      icon: CheckCircle,
      label: 'Total Completions',
      value: stats.totalCompletions ?? 347,
      delta: stats.totalCompletionsDelta ?? 12,
      color: '#34d399',
      bgColor: 'rgba(52,211,153,0.12)',
    },
    {
      icon: Target,
      label: 'Success Rate',
      value: `${stats.successRate ?? 82}%`,
      delta: stats.successRateDelta ?? 4,
      color: '#a78bfa',
      bgColor: 'rgba(167,139,250,0.12)',
    },
    {
      icon: Star,
      label: 'Best Day',
      value: stats.bestDay ?? 'Wednesday',
      delta: undefined,
      color: '#f59e0b',
      bgColor: 'rgba(245,158,11,0.12)',
    },
    {
      icon: Flame,
      label: 'Longest Streak',
      value: `${stats.longestStreak ?? 21}`,
      delta: stats.longestStreakDelta ?? 3,
      color: '#f87171',
      bgColor: 'rgba(248,113,113,0.12)',
      suffix: 'days',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#020617', position: 'relative', overflow: 'hidden' }}>
      
      <div style={{ position: 'fixed', top: -200, left: -200, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '30%', right: -200, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.04) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: -100, left: '40%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, padding: '28px 24px', maxWidth: 1280, margin: '0 auto' }}>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(99,102,241,0.2))',
              border: '1px solid rgba(167,139,250,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 24px rgba(124,58,237,0.2)',
            }}>
              <BarChart2 size={22} style={{ color: '#a78bfa' }} />
            </div>
            <div>
              <h1 className="gradient-text" style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.1, fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
                Analytics
              </h1>
              <p style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleRefresh}
              className="btn-secondary"
              style={{ padding: '9px 16px', fontSize: 13 }}
              disabled={isRefreshing}
            >
              <RefreshCw size={14} style={{ color: '#94a3b8', animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary"
              style={{ padding: '9px 18px', fontSize: 13 }}
              onClick={() => toast.success('Export coming soon!', { icon: '📊' })}
            >
              <Download size={14} />
              Export
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 28 }}
        >
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          style={{ marginBottom: 24 }}
        >
          <div className="tab-list" style={{ display: 'inline-flex' }}>
            {TABS.map((tab) => (
              <button
                key={tab}
                className={`tab-item${activeTab === tab ? ' active' : ''}`}
                onClick={() => setActiveTab(tab)}
                style={{
                  minWidth: 90,
                  fontWeight: activeTab === tab ? 700 : 500,
                  position: 'relative',
                }}
              >
                {activeTab === tab && (
                  <motion.span
                    layoutId="activeTabIndicator"
                    style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(99,102,241,0.15))',
                      borderRadius: 'calc(var(--radius-md) - 2px)',
                      border: '1px solid rgba(167,139,250,0.2)',
                    }}
                    transition={{ type: 'spring', duration: 0.4, bounce: 0.2 }}
                  />
                )}
                <span style={{ position: 'relative', zIndex: 1 }}>{tab}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === 'Overview' && (
            <OverviewTab key="overview-tab" areaData={areaData} barData={barData} radarData={radarData} pieData={pieData} />
          )}
          {activeTab === 'Weekly' && (
            <WeeklyTab key="weekly-tab" areaData={areaData} barData={barData} />
          )}
          {activeTab === 'Monthly' && (
            <MonthlyTab key="monthly-tab" monthlyData={mMonthly} />
          )}
          {activeTab === 'Yearly' && (
            <YearlyTab key="yearly-tab" yearlyData={mYearly} />
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="glass-card-static"
          style={{ padding: 28, marginTop: 24, marginBottom: 24 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(52,211,153,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={16} style={{ color: '#34d399' }} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>Activity Heatmap</h3>
              </div>
              <p style={{ fontSize: 12, color: '#64748b', marginLeft: 42 }}>Your habit activity over the past year</p>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="badge badge-success">2026</span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="btn-ghost" style={{ padding: '6px 10px' }}>
                  <ChevronLeft size={14} />
                </button>
                <button className="btn-ghost" style={{ padding: '6px 10px' }}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
          <ActivityHeatmap />
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="glass-card-static"
            style={{ padding: 28 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(167,139,250,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layers size={16} style={{ color: '#a78bfa' }} />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>Category Analytics</h3>
                <p style={{ fontSize: 11, color: '#64748b' }}>Completion rate per category</p>
              </div>
            </div>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              {categories.map((item, index) => (
                <CategoryRow key={item.name} item={item} index={index} />
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="glass-card-static"
            style={{ padding: 28 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(56,189,248,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={16} style={{ color: '#38bdf8' }} />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>Quick Insights</h3>
                <p style={{ fontSize: 11, color: '#64748b' }}>AI-powered observations</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { Icon: TrendingUp, color: '#34d399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.18)', title: 'Trending Up', desc: 'Your Health habits improved by 9% this week. Keep it up!' },
                { Icon: Flame, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.18)', title: '21-Day Streak', desc: "You're on your longest streak ever. Don't break it now!" },
                { Icon: Clock, color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.18)', title: 'Best Time', desc: 'You complete most habits between 7–9 AM. Morning champion!' },
                { Icon: TrendingDown, color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.18)', title: 'Needs Attention', desc: 'Coding habits dropped 12% this month. Try scheduling them.' },
                { Icon: Award, color: '#38bdf8', bg: 'rgba(56,189,248,0.08)', border: 'rgba(56,189,248,0.18)', title: 'Top Category', desc: 'Health leads with 91% completion — a personal best!' },
              ].map((insight, i) => (
                <motion.div
                  key={insight.title}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.07, duration: 0.35 }}
                  style={{ display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 12, background: insight.bg, border: `1px solid ${insight.border}` }}
                  whileHover={{ x: 3, transition: { duration: 0.15 } }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 10, flexShrink: 0, background: `${insight.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <insight.Icon size={15} style={{ color: insight.color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 2 }}>{insight.title}</div>
                    <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>{insight.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          style={{ textAlign: 'center', paddingTop: 8, paddingBottom: 32 }}
        >
          <div className="divider" />
          <p style={{ fontSize: 12, color: '#334155', marginTop: 16 }}>
            HabitFlow Analytics · Data synced{' '}
            <span style={{ color: '#475569' }}>
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </p>
        </motion.div>

      </div>
    </div>
  );
}
