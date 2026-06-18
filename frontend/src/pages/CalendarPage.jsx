import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import {
  FiCalendar,
  FiTrendingUp,
  FiZap,
  FiAward,
  FiActivity,
  FiPercent,
  FiChevronLeft,
  FiChevronRight,
  FiInfo,
} from "react-icons/fi";
import {
  format,
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachWeekOfInterval,
  isSameMonth,
  isToday,
  getDay,
  addMonths,
  subMonths,
  differenceInDays,
  subDays,
} from "date-fns";

// ─── Mock Data Generation ─────────────────────────────────────────────────────

function generateYearData() {
  const today = new Date();
  const yearStart = startOfYear(today);
  const yearEnd = endOfYear(today);
  const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd });
  const data = {};

  allDays.forEach((day) => {
    if (day > today) {
      data[format(day, "yyyy-MM-dd")] = null;
      return;
    }
    const daysAgo = differenceInDays(today, day);

    let baseProbability;
    if (daysAgo < 14)       baseProbability = 0.82;
    else if (daysAgo < 30)  baseProbability = 0.72;
    else if (daysAgo < 90)  baseProbability = 0.60;
    else                    baseProbability = 0.48;

    const weekOfYear = Math.floor(daysAgo / 7);
    const clusterBonus = Math.sin(weekOfYear * 0.7) * 0.15;
    const probability = Math.max(0, Math.min(1, baseProbability + clusterBonus));

    if (Math.random() < probability) {
      const completion = 0.4 + Math.random() * 0.6;
      data[format(day, "yyyy-MM-dd")] = Math.round(completion * 100);
    } else {
      data[format(day, "yyyy-MM-dd")] = 0;
    }
  });

  return data;
}

// Generate once — stable reference across renders
const YEAR_DATA = generateYearData();

// ─── Color Utilities ──────────────────────────────────────────────────────────

function getHeatmapColor(value) {
  if (value === null) return "transparent";
  if (value === 0)    return "#1e293b";
  if (value < 25)     return "#2d1b69";
  if (value < 50)     return "#4c1d95";
  if (value < 70)     return "#6d28d9";
  if (value < 85)     return "#7c3aed";
  if (value < 95)     return "#8b5cf6";
  return "#a78bfa";
}

function getDotColor(value) {
  if (!value) return null;
  if (value < 40) return "#6d28d9";
  if (value < 70) return "#7c3aed";
  if (value < 90) return "#8b5cf6";
  return "#a78bfa";
}

// ─── Animation Variants ───────────────────────────────────────────────────────

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
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeIn = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

// ─── Computed Stats ───────────────────────────────────────────────────────────

function computeStats(data) {
  const today = new Date();
  const todayKey = format(today, "yyyy-MM-dd");

  const pastKeys = Object.keys(data)
    .filter((k) => data[k] !== null && k <= todayKey)
    .sort();

  // Current streak
  let currentStreak = 0;
  let checkDate = new Date(today);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const key = format(checkDate, "yyyy-MM-dd");
    const val = data[key];
    if (val === undefined || val === null || val === 0) break;
    currentStreak++;
    checkDate = subDays(checkDate, 1);
  }

  // Longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  pastKeys.forEach((k) => {
    if (data[k] > 0) {
      tempStreak++;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    } else {
      tempStreak = 0;
    }
  });

  // Total active days
  const totalActiveDays = pastKeys.filter((k) => data[k] > 0).length;

  // This month completion rate
  const monthStart = startOfMonth(today);
  const monthDays = eachDayOfInterval({ start: monthStart, end: today });
  const monthActive = monthDays.filter((d) => {
    const k = format(d, "yyyy-MM-dd");
    return data[k] > 0;
  }).length;
  const monthRate = Math.round((monthActive / monthDays.length) * 100);

  // Average completion on active days
  const activeDayValues = pastKeys.filter((k) => data[k] > 0).map((k) => data[k]);
  const avgCompletion =
    activeDayValues.length > 0
      ? Math.round(activeDayValues.reduce((a, b) => a + b, 0) / activeDayValues.length)
      : 0;

  return { currentStreak, longestStreak, totalActiveDays, monthRate, avgCompletion };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// Flame streak badge
function StreakBadge({ count }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 20 }}>🔥</span>
      <span
        style={{
          fontSize: 26,
          fontWeight: 800,
          background: "linear-gradient(135deg, #f97316, #ef4444)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          lineHeight: 1,
        }}
      >
        {count}
      </span>
      <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>days</span>
    </div>
  );
}

// Stat card
function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <motion.div
      variants={itemVariants}
      className="glass-card"
      style={{ padding: "20px", borderRadius: "16px", position: "relative", overflow: "hidden" }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div
        style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: color,
          opacity: 0.08,
          filter: "blur(20px)",
        }}
      />
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: `${color}22`,
            border: `1px solid ${color}33`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={18} style={{ color }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 12, color: "#64748b", marginBottom: 4, fontWeight: 500 }}>
            {label}
          </p>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#f8fafc", lineHeight: 1.1, marginBottom: 4 }}>
            {value}
          </div>
          {sub && <p style={{ fontSize: 11, color: "#475569" }}>{sub}</p>}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Heatmap Tooltip ──────────────────────────────────────────────────────────

function HeatmapTooltip({ tooltip }) {
  if (!tooltip) return null;
  return (
    <motion.div
      key={tooltip.dateStr}
      initial={{ opacity: 0, y: 6, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.12 }}
      style={{
        position: "fixed",
        left: tooltip.x,
        top: tooltip.y,
        transform: "translate(-50%, -120%)",
        background: "rgba(10,10,20,0.97)",
        border: "1px solid rgba(124,58,237,0.4)",
        borderRadius: 10,
        padding: "8px 14px",
        pointerEvents: "none",
        zIndex: 9999,
        backdropFilter: "blur(16px)",
        whiteSpace: "nowrap",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
      }}
    >
      <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 3 }}>{tooltip.dateStr}</p>
      <p style={{ fontSize: 13, fontWeight: 600, color: "#f8fafc" }}>
        {tooltip.value === null
          ? "Future date"
          : tooltip.value === 0
          ? "No habits completed"
          : `${tooltip.value}% completed`}
      </p>
    </motion.div>
  );
}

// ─── GitHub-style Year Heatmap ────────────────────────────────────────────────

function YearHeatmap({ data }) {
  const [tooltip, setTooltip] = useState(null);
  const today = new Date();
  const yearStart = startOfYear(today);
  const yearEnd = endOfYear(today);

  const weeks = useMemo(() => {
    const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd });
    const weeksArr = [];
    let currentWeek = [];

    // Pad the first week (Sunday = 0)
    const firstDayOfWeek = getDay(yearStart);
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push(null);
    }

    allDays.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeksArr.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeksArr.push(currentWeek);
    }

    return weeksArr;
  }, []);

  const monthLabels = useMemo(() => {
    const labels = [];
    let lastMonth = -1;
    weeks.forEach((week, wi) => {
      const firstReal = week.find((d) => d !== null);
      if (firstReal) {
        const m = firstReal.getMonth();
        if (m !== lastMonth) {
          labels.push({ month: format(firstReal, "MMM"), weekIndex: wi });
          lastMonth = m;
        }
      }
    });
    return labels;
  }, [weeks]);

  const CELL = 14;
  const GAP = 3;
  const LEFT_PAD = 30;
  const TOP_PAD = 24;
  const dayLabels = ["", "Mon", "", "Wed", "", "Fri", ""];

  const gridW = weeks.length * (CELL + GAP) - GAP;
  const gridH = 7 * (CELL + GAP) - GAP;

  return (
    <div style={{ width: "100%", overflowX: "auto", overflowY: "visible", paddingBottom: 4 }}>
      <div style={{ minWidth: gridW + LEFT_PAD + 8, position: "relative" }}>
        <svg
          width={gridW + LEFT_PAD}
          height={gridH + TOP_PAD + 4}
          style={{ display: "block", overflow: "visible" }}
        >
          {/* Month labels */}
          {monthLabels.map(({ month, weekIndex }) => (
            <text
              key={`${month}-${weekIndex}`}
              x={LEFT_PAD + weekIndex * (CELL + GAP)}
              y={14}
              fontSize={11}
              fill="#64748b"
              fontFamily="system-ui, sans-serif"
            >
              {month}
            </text>
          ))}

          {/* Day labels */}
          {dayLabels.map((label, row) => (
            <text
              key={`day-${row}`}
              x={0}
              y={TOP_PAD + row * (CELL + GAP) + CELL - 2}
              fontSize={10}
              fill="#475569"
              fontFamily="system-ui, sans-serif"
            >
              {label}
            </text>
          ))}

          {/* Cells */}
          {weeks.map((week, wi) =>
            week.map((day, di) => {
              if (!day) return null;
              const dateKey = format(day, "yyyy-MM-dd");
              const value = data[dateKey] ?? null;
              const isFuture = day > today;
              const isTodayCell = isToday(day);
              const color = isFuture ? "transparent" : getHeatmapColor(value);
              const x = LEFT_PAD + wi * (CELL + GAP);
              const y = TOP_PAD + di * (CELL + GAP);

              return (
                <g key={dateKey}>
                  <rect
                    x={x}
                    y={y}
                    width={CELL}
                    height={CELL}
                    rx={3}
                    ry={3}
                    fill={color}
                    stroke={isTodayCell ? "#a78bfa" : "rgba(255,255,255,0.03)"}
                    strokeWidth={isTodayCell ? 1.5 : 0.5}
                    style={{ cursor: isFuture ? "default" : "pointer" }}
                    onMouseEnter={(e) => {
                      if (!isFuture) {
                        setTooltip({
                          dateStr: format(day, "EEEE, MMMM d, yyyy"),
                          value,
                          x: e.clientX,
                          y: e.clientY,
                        });
                      }
                    }}
                    onMouseMove={(e) => {
                      if (tooltip) {
                        setTooltip((prev) => ({ ...prev, x: e.clientX, y: e.clientY }));
                      }
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                  {isTodayCell && (
                    <circle cx={x + CELL / 2} cy={y + CELL / 2} r={2} fill="#a78bfa" />
                  )}
                </g>
              );
            })
          )}
        </svg>

        {/* Legend */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 14,
            paddingLeft: LEFT_PAD,
          }}
        >
          <span style={{ fontSize: 11, color: "#475569", marginRight: 4 }}>Less</span>
          {[0, 20, 45, 65, 82, 96].map((v) => (
            <div
              key={v}
              style={{
                width: CELL,
                height: CELL,
                borderRadius: 3,
                background: getHeatmapColor(v),
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            />
          ))}
          <span style={{ fontSize: 11, color: "#475569", marginLeft: 4 }}>More</span>
        </div>
      </div>

      <AnimatePresence>
        {tooltip && <HeatmapTooltip tooltip={tooltip} />}
      </AnimatePresence>
    </div>
  );
}

// ─── Monthly Calendar ─────────────────────────────────────────────────────────

function MonthlyCalendar({ data }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = new Date();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const calendarWeeks = useMemo(() => {
    const weekStarts = eachWeekOfInterval(
      { start: monthStart, end: monthEnd },
      { weekStartsOn: 0 }
    );
    return weekStarts.map((ws) =>
      eachDayOfInterval({ start: ws, end: endOfWeek(ws, { weekStartsOn: 0 }) })
    );
  }, [currentMonth]);

  const canGoNext = addMonths(currentMonth, 1) <= endOfMonth(today);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: "#f8fafc" }}>
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { icon: FiChevronLeft, action: () => setCurrentMonth((m) => subMonths(m, 1)), enabled: true },
            { icon: FiChevronRight, action: () => canGoNext && setCurrentMonth((m) => addMonths(m, 1)), enabled: canGoNext },
          ].map(({ icon: Icon, action, enabled }, i) => (
            <button
              key={i}
              onClick={action}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.04)",
                color: enabled ? "#94a3b8" : "#1e293b",
                cursor: enabled ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
              }}
            >
              <Icon size={14} />
            </button>
          ))}
        </div>
      </div>

      {/* Day headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            style={{
              textAlign: "center",
              fontSize: 11,
              fontWeight: 600,
              color: "#475569",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              padding: "4px 0",
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Weeks */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {calendarWeeks.map((week, wi) => (
          <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {week.map((day) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const value = data[dateKey];
              const inMonth = isSameMonth(day, currentMonth);
              const isFuture = day > today;
              const isTodayDay = isToday(day);
              const dotColor = inMonth && !isFuture ? getDotColor(value) : null;
              const hasActivity = inMonth && !isFuture && value > 0;

              return (
                <motion.div
                  key={dateKey}
                  whileHover={inMonth && !isFuture ? { scale: 1.08 } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  style={{
                    aspectRatio: "1",
                    borderRadius: 10,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: inMonth && !isFuture ? "pointer" : "default",
                    background: isTodayDay
                      ? "rgba(124,58,237,0.18)"
                      : hasActivity
                      ? "rgba(255,255,255,0.03)"
                      : "transparent",
                    border: isTodayDay
                      ? "1.5px solid rgba(167,139,250,0.6)"
                      : "1px solid transparent",
                    transition: "background 0.15s",
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: isTodayDay ? 700 : inMonth ? 500 : 400,
                      color: isTodayDay
                        ? "#a78bfa"
                        : inMonth
                        ? isFuture
                          ? "#334155"
                          : "#94a3b8"
                        : "#1e293b",
                    }}
                  >
                    {format(day, "d")}
                  </span>
                  {dotColor && (
                    <div
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: dotColor,
                        marginTop: 2,
                        boxShadow: `0 0 6px ${dotColor}99`,
                      }}
                    />
                  )}
                  {inMonth && !isFuture && value === 0 && (
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#1e293b", marginTop: 2 }} />
                  )}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Calendar legend */}
      <div style={{ display: "flex", gap: 16, marginTop: 18, flexWrap: "wrap" }}>
        {[
          { color: "#1e293b", label: "No habits" },
          { color: "#6d28d9", label: "Partial" },
          { color: "#8b5cf6", label: "Good" },
          { color: "#a78bfa", label: "All done" },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: color,
                boxShadow: color !== "#1e293b" ? `0 0 6px ${color}80` : "none",
              }}
            />
            <span style={{ fontSize: 11, color: "#475569" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Weekly Bar Chart ─────────────────────────────────────────────────────────

function WeeklyBar({ data }) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i));

  return (
    <div>
      <p style={{ fontSize: 12, color: "#64748b", marginBottom: 14, fontWeight: 600, letterSpacing: "0.03em", textTransform: "uppercase" }}>
        Last 7 Days
      </p>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 72 }}>
        {days.map((day, i) => {
          const key = format(day, "yyyy-MM-dd");
          const val = data[key] || 0;
          const barH = val ? Math.max(8, (val / 100) * 60) : 4;
          const isTodayBar = isToday(day);

          return (
            <div
              key={key}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
            >
              <div
                style={{
                  width: "100%",
                  height: 60,
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.03)",
                  display: "flex",
                  alignItems: "flex-end",
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: barH }}
                  transition={{ delay: i * 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    width: "100%",
                    borderRadius: 8,
                    background:
                      val === 0
                        ? "#1e293b"
                        : isTodayBar
                        ? "linear-gradient(180deg, #c4b5fd, #7c3aed)"
                        : "linear-gradient(180deg, #8b5cf6, #6d28d9)",
                    boxShadow:
                      val > 0
                        ? isTodayBar
                          ? "0 0 14px rgba(167,139,250,0.5)"
                          : "0 0 8px rgba(124,58,237,0.35)"
                        : "none",
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 10,
                  color: isTodayBar ? "#a78bfa" : "#475569",
                  fontWeight: isTodayBar ? 700 : 400,
                }}
              >
                {format(day, "EEE").slice(0, 1)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Month Completion Ring ────────────────────────────────────────────────────

function CompletionRing({ percent }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;

  return (
    <div style={{ position: "relative", width: 92, height: 92 }}>
      <svg width={92} height={92} style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
        <circle cx={46} cy={46} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={8} />
        <motion.circle
          cx={46}
          cy={46}
          r={r}
          fill="none"
          stroke="url(#ringGradient)"
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: 17, fontWeight: 800, color: "#f8fafc" }}>{percent}%</span>
        <span style={{ fontSize: 9, color: "#64748b", marginTop: 1 }}>this month</span>
      </div>
    </div>
  );
}

// ─── CalendarPage ─────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const data = YEAR_DATA;
  const today = new Date();
  const stats = useMemo(() => computeStats(data), []);

  // Graceful Redux fallback
  let habits = [];
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const reduxHabits = useSelector((state) => state.habits?.habits);
    if (Array.isArray(reduxHabits)) habits = reduxHabits;
  } catch (_) {
    // Redux not available in this context
  }

  const dayOfYear = Math.ceil(
    (today - new Date(today.getFullYear(), 0, 0)) / 86400000
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        padding: "32px 20px 80px",
      }}
    >
      {/* Ambient background glows */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -200,
            left: "10%",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -200,
            right: "5%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)",
          }}
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 1 }}
      >
        {/* ── Page Header ── */}
        <motion.div variants={itemVariants} style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: "linear-gradient(135deg, #7c3aed, #6366f1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 24px rgba(124,58,237,0.45)",
                flexShrink: 0,
              }}
            >
              <FiCalendar size={22} color="#fff" />
            </div>
            <div>
              <h1
                style={{
                  fontSize: 30,
                  fontWeight: 800,
                  lineHeight: 1.1,
                  background: "linear-gradient(135deg, #a78bfa 0%, #6366f1 55%, #38bdf8 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Activity Calendar
              </h1>
              <p style={{ fontSize: 14, color: "#475569", marginTop: 3 }}>
                {format(today, "EEEE, MMMM d, yyyy")} &nbsp;·&nbsp; Day {dayOfYear} of {format(today, "yyyy")}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Quick Stats Row ── */}
        <motion.div
          variants={itemVariants}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            marginBottom: 28,
          }}
        >
          <StatCard
            icon={FiZap}
            label="Current Streak"
            value={<StreakBadge count={stats.currentStreak} />}
            sub="Keep the momentum!"
            color="#f97316"
          />
          <StatCard
            icon={FiAward}
            label="Longest Streak"
            value={`${stats.longestStreak} days`}
            sub="Your personal best"
            color="#eab308"
          />
          <StatCard
            icon={FiActivity}
            label="Total Active Days"
            value={String(stats.totalActiveDays)}
            sub={`of ${dayOfYear} days this year`}
            color="#6366f1"
          />
          <StatCard
            icon={FiPercent}
            label="Avg Completion"
            value={`${stats.avgCompletion}%`}
            sub="on active days"
            color="#8b5cf6"
          />
        </motion.div>

        {/* ── Main 2-column Layout ── */}
        <div
          className="cal-main-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 300px",
            gap: 24,
            alignItems: "start",
          }}
        >
          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Heatmap Card */}
            <motion.div
              variants={fadeIn}
              className="glass-card"
              style={{ borderRadius: 20, padding: "28px 24px" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: 24,
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: "#f8fafc", marginBottom: 4 }}>
                    Year Overview
                  </h2>
                  <p style={{ fontSize: 13, color: "#475569" }}>
                    {stats.totalActiveDays} active days &nbsp;·&nbsp; {format(today, "yyyy")}
                  </p>
                </div>
                <div
                  style={{
                    padding: "6px 14px",
                    borderRadius: 20,
                    background: "rgba(124,58,237,0.12)",
                    border: "1px solid rgba(124,58,237,0.25)",
                    fontSize: 12,
                    color: "#a78bfa",
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  GitHub-style heatmap
                </div>
              </div>

              <YearHeatmap data={data} />
            </motion.div>

            {/* Monthly Calendar Card */}
            <motion.div
              variants={fadeIn}
              className="glass-card"
              style={{ borderRadius: 20, padding: "28px 24px" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: "rgba(99,102,241,0.15)",
                    border: "1px solid rgba(99,102,241,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FiCalendar size={15} color="#818cf8" />
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#f8fafc" }}>Monthly View</h2>
              </div>
              <p style={{ fontSize: 13, color: "#475569", marginBottom: 24 }}>
                Day-by-day habit completion — colored dots per activity level
              </p>
              <MonthlyCalendar data={data} />
            </motion.div>
          </div>

          {/* ── Right Sidebar ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Month Stats Ring */}
            <motion.div
              variants={fadeIn}
              className="glass-card"
              style={{ borderRadius: 20, padding: "24px" }}
            >
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#f8fafc",
                  marginBottom: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <FiTrendingUp size={15} color="#8b5cf6" />
                This Month
              </h3>

              <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                <CompletionRing percent={stats.monthRate} />
              </div>

              {[
                {
                  label: "Active days",
                  value: `${Math.round((stats.monthRate / 100) * today.getDate())}`,
                  color: "#8b5cf6",
                },
                {
                  label: "Days elapsed",
                  value: `${today.getDate()}`,
                  color: "#64748b",
                },
                {
                  label: "Completion rate",
                  value: `${stats.monthRate}%`,
                  color: "#a78bfa",
                },
                {
                  label: "Avg per active day",
                  value: `${stats.avgCompletion}%`,
                  color: "#6366f1",
                },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <span style={{ fontSize: 12, color: "#64748b" }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color }}>{value}</span>
                </div>
              ))}
            </motion.div>

            {/* Weekly bar chart */}
            <motion.div
              variants={fadeIn}
              className="glass-card"
              style={{ borderRadius: 20, padding: "24px" }}
            >
              <WeeklyBar data={data} />
            </motion.div>

            {/* Streak Milestones */}
            <motion.div
              variants={fadeIn}
              className="glass-card"
              style={{ borderRadius: 20, padding: "24px" }}
            >
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#f8fafc",
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <FiAward size={15} color="#eab308" />
                Streak Milestones
              </h3>

              {[
                { days: 7,   emoji: "🌱", label: "One Week",   color: "#22c55e" },
                { days: 14,  emoji: "💪", label: "Two Weeks",  color: "#6366f1" },
                { days: 21,  emoji: "⚡", label: "Three Weeks", color: "#38bdf8" },
                { days: 30,  emoji: "🏆", label: "One Month",  color: "#eab308" },
                { days: 60,  emoji: "🔥", label: "Two Months", color: "#f97316" },
                { days: 100, emoji: "👑", label: "100 Days",   color: "#a78bfa" },
              ].map(({ days, emoji, label, color }) => {
                const achieved = stats.longestStreak >= days;
                const pct = Math.min(100, Math.round((stats.longestStreak / days) * 100));

                return (
                  <motion.div
                    key={days}
                    whileHover={achieved ? { x: 2 } : {}}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 12,
                      marginBottom: 6,
                      background: achieved ? `${color}10` : "rgba(255,255,255,0.02)",
                      border: `1px solid ${achieved ? color + "28" : "rgba(255,255,255,0.04)"}`,
                      opacity: achieved ? 1 : 0.5,
                      transition: "all 0.2s",
                    }}
                  >
                    <span style={{ fontSize: 17, flexShrink: 0 }}>{emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: achieved ? color : "#475569",
                          marginBottom: 3,
                        }}
                      >
                        {label}
                      </p>
                      {/* Progress bar towards milestone */}
                      {!achieved && (
                        <div
                          style={{
                            height: 3,
                            borderRadius: 2,
                            background: "rgba(255,255,255,0.06)",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${pct}%`,
                              height: "100%",
                              background: color,
                              borderRadius: 2,
                              opacity: 0.6,
                            }}
                          />
                        </div>
                      )}
                      {achieved && (
                        <p style={{ fontSize: 10, color: "#334155" }}>{days}-day streak</p>
                      )}
                    </div>
                    {achieved ? (
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          boxShadow: `0 0 10px ${color}66`,
                        }}
                      >
                        <svg width={10} height={10} viewBox="0 0 10 10">
                          <path
                            d="M2 5l2 2 4-4"
                            stroke="#fff"
                            strokeWidth={1.5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                          />
                        </svg>
                      </div>
                    ) : (
                      <span style={{ fontSize: 10, color: "#334155", flexShrink: 0 }}>{pct}%</span>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Info note */}
            <motion.div
              variants={fadeIn}
              style={{
                padding: "14px 16px",
                borderRadius: 14,
                background: "rgba(99,102,241,0.06)",
                border: "1px solid rgba(99,102,241,0.15)",
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              <FiInfo size={13} color="#6366f1" style={{ marginTop: 2, flexShrink: 0 }} />
              <p style={{ fontSize: 12, color: "#475569", lineHeight: 1.6 }}>
                The heatmap shows daily completion % across the full year. Hover a cell for details. The{" "}
                <span style={{ color: "#a78bfa", fontWeight: 600 }}>purple ring</span> marks today.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Responsive overrides */}
      <style>{`
        @media (max-width: 960px) {
          .cal-main-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
