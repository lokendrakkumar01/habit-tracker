import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  FiHeart,
  FiMessageCircle,
  FiAward,
  FiZap,
  FiUsers,
  FiTrendingUp,
  FiPlus,
  FiX,
  FiFilter,
  FiStar,
  FiFlag,
  FiBookOpen,
  FiCpu,
  FiCheck,
  FiShare2,
  FiChevronRight,
  FiActivity,
  FiClock,
  FiSmile,
  FiGithub,
  FiTwitter,
  FiLinkedin,
  FiGlobe,
} from "react-icons/fi";

const MOCK_FEED = [
  {
    id: 1,
    name: "Aria Chen",
    initials: "AC",
    color: "#7c3aed",
    action: "completed",
    detail: "Morning Meditation",
    type: "habit",
    icon: "🧘",
    timeAgo: "2m ago",
    likes: 14,
    comments: 3,
    liked: false,
  },
  {
    id: 2,
    name: "James Okafor",
    initials: "JO",
    color: "#0891b2",
    action: "hit a",
    detail: "30-Day Streak",
    type: "streak",
    icon: "🔥",
    timeAgo: "18m ago",
    likes: 42,
    comments: 9,
    liked: true,
  },
  {
    id: 3,
    name: "Priya Sharma",
    initials: "PS",
    color: "#059669",
    action: "achieved",
    detail: "Level 10 — Habit Master",
    type: "milestone",
    icon: "🏆",
    timeAgo: "1h ago",
    likes: 87,
    comments: 21,
    liked: false,
  },
  {
    id: 4,
    name: "Liam Torres",
    initials: "LT",
    color: "#d97706",
    action: "completed",
    detail: "5km Morning Run",
    type: "habit",
    icon: "🏃",
    timeAgo: "2h ago",
    likes: 19,
    comments: 2,
    liked: false,
  },
  {
    id: 5,
    name: "Sofia Müller",
    initials: "SM",
    color: "#db2777",
    action: "joined the challenge",
    detail: "30-Day Fitness Blitz",
    type: "challenge",
    icon: "⚡",
    timeAgo: "3h ago",
    likes: 11,
    comments: 1,
    liked: false,
  },
  {
    id: 6,
    name: "Marcus Webb",
    initials: "MW",
    color: "#7c3aed",
    action: "unlocked badge",
    detail: "Early Bird — 7 days straight before 7am",
    type: "badge",
    icon: "🌅",
    timeAgo: "5h ago",
    likes: 33,
    comments: 7,
    liked: true,
  },
  {
    id: 7,
    name: "Yuki Tanaka",
    initials: "YT",
    color: "#0891b2",
    action: "completed",
    detail: "Read 30 Pages",
    type: "habit",
    icon: "📚",
    timeAgo: "7h ago",
    likes: 8,
    comments: 0,
    liked: false,
  },
  {
    id: 8,
    name: "Nadia Kowalski",
    initials: "NK",
    color: "#16a34a",
    action: "hit a",
    detail: "100-Day Streak",
    type: "streak",
    icon: "🔥",
    timeAgo: "Yesterday",
    likes: 204,
    comments: 56,
    liked: false,
  },
];

const MOCK_LEADERBOARD_ALL = [
  { id: 1,  name: "Nadia Kowalski", initials: "NK", color: "#f59e0b", level: 24, xp: 48200, streak: 100, isCurrentUser: false },
  { id: 2,  name: "Priya Sharma",   initials: "PS", color: "#059669", level: 20, xp: 41500, streak: 63,  isCurrentUser: false },
  { id: 3,  name: "James Okafor",   initials: "JO", color: "#0891b2", level: 18, xp: 37900, streak: 30,  isCurrentUser: false },
  { id: 4,  name: "Marcus Webb",    initials: "MW", color: "#7c3aed", level: 16, xp: 32400, streak: 21,  isCurrentUser: false },
  { id: 5,  name: "You",            initials: "ME", color: "#6366f1", level: 14, xp: 28100, streak: 15,  isCurrentUser: true  },
  { id: 6,  name: "Aria Chen",      initials: "AC", color: "#7c3aed", level: 13, xp: 24700, streak: 12,  isCurrentUser: false },
  { id: 7,  name: "Sofia Müller",   initials: "SM", color: "#db2777", level: 12, xp: 21300, streak: 9,   isCurrentUser: false },
  { id: 8,  name: "Liam Torres",    initials: "LT", color: "#d97706", level: 11, xp: 18900, streak: 7,   isCurrentUser: false },
  { id: 9,  name: "Yuki Tanaka",    initials: "YT", color: "#0891b2", level: 10, xp: 15600, streak: 5,   isCurrentUser: false },
  { id: 10, name: "Alex Rivera",    initials: "AR", color: "#16a34a", level: 9,  xp: 12100, streak: 3,   isCurrentUser: false },
];

const MOCK_LEADERBOARD_WEEK = [
  { id: 3,  name: "James Okafor",   initials: "JO", color: "#0891b2", level: 18, xp: 3200, streak: 30,  isCurrentUser: false },
  { id: 5,  name: "You",            initials: "ME", color: "#6366f1", level: 14, xp: 2900, streak: 15,  isCurrentUser: true  },
  { id: 1,  name: "Nadia Kowalski", initials: "NK", color: "#f59e0b", level: 24, xp: 2700, streak: 100, isCurrentUser: false },
  { id: 6,  name: "Aria Chen",      initials: "AC", color: "#7c3aed", level: 13, xp: 2400, streak: 12,  isCurrentUser: false },
  { id: 4,  name: "Marcus Webb",    initials: "MW", color: "#7c3aed", level: 16, xp: 2100, streak: 21,  isCurrentUser: false },
  { id: 2,  name: "Priya Sharma",   initials: "PS", color: "#059669", level: 20, xp: 1980, streak: 63,  isCurrentUser: false },
  { id: 7,  name: "Sofia Müller",   initials: "SM", color: "#db2777", level: 12, xp: 1750, streak: 9,   isCurrentUser: false },
  { id: 8,  name: "Liam Torres",    initials: "LT", color: "#d97706", level: 11, xp: 1500, streak: 7,   isCurrentUser: false },
  { id: 9,  name: "Yuki Tanaka",    initials: "YT", color: "#0891b2", level: 10, xp: 1200, streak: 5,   isCurrentUser: false },
  { id: 10, name: "Alex Rivera",    initials: "AR", color: "#16a34a", level: 9,  xp: 900,  streak: 3,   isCurrentUser: false },
];

const MOCK_LEADERBOARD_MONTH = [
  { id: 2,  name: "Priya Sharma",   initials: "PS", color: "#059669", level: 20, xp: 14200, streak: 63,  isCurrentUser: false },
  { id: 1,  name: "Nadia Kowalski", initials: "NK", color: "#f59e0b", level: 24, xp: 13800, streak: 100, isCurrentUser: false },
  { id: 4,  name: "Marcus Webb",    initials: "MW", color: "#7c3aed", level: 16, xp: 12100, streak: 21,  isCurrentUser: false },
  { id: 3,  name: "James Okafor",   initials: "JO", color: "#0891b2", level: 18, xp: 11400, streak: 30,  isCurrentUser: false },
  { id: 6,  name: "Aria Chen",      initials: "AC", color: "#7c3aed", level: 13, xp: 10200, streak: 12,  isCurrentUser: false },
  { id: 5,  name: "You",            initials: "ME", color: "#6366f1", level: 14, xp: 9800,  streak: 15,  isCurrentUser: true  },
  { id: 7,  name: "Sofia Müller",   initials: "SM", color: "#db2777", level: 12, xp: 8700,  streak: 9,   isCurrentUser: false },
  { id: 8,  name: "Liam Torres",    initials: "LT", color: "#d97706", level: 11, xp: 7400,  streak: 7,   isCurrentUser: false },
  { id: 9,  name: "Yuki Tanaka",    initials: "YT", color: "#0891b2", level: 10, xp: 6100,  streak: 5,   isCurrentUser: false },
  { id: 10, name: "Alex Rivera",    initials: "AR", color: "#16a34a", level: 9,  xp: 4800,  streak: 3,   isCurrentUser: false },
];

const MOCK_CHALLENGES = [
  {
    id: 1,
    title: "30-Day Fitness Blitz",
    description: "Complete at least one workout every day for 30 days. Any workout counts — just move!",
    category: "Fitness",
    categoryColor: "#f97316",
    categoryIconName: "zap",
    participants: 312,
    durationDays: 30,
    daysLeft: 18,
    progress: 40,
    joined: true,
    difficulty: "Medium",
  },
  {
    id: 2,
    title: "Morning Pages",
    description: "Write 3 pages of longhand stream-of-consciousness journaling every morning for 21 days.",
    category: "Mindfulness",
    categoryColor: "#8b5cf6",
    categoryIconName: "smile",
    participants: 87,
    durationDays: 21,
    daysLeft: 21,
    progress: 0,
    joined: false,
    difficulty: "Easy",
  },
  {
    id: 3,
    title: "Read 12 Books in 12 Weeks",
    description: "Commit to finishing one book per week — fiction, non-fiction, anything goes. Log your chapters daily.",
    category: "Learning",
    categoryColor: "#0ea5e9",
    categoryIconName: "book",
    participants: 145,
    durationDays: 84,
    daysLeft: 56,
    progress: 33,
    joined: true,
    difficulty: "Hard",
  },
  {
    id: 4,
    title: "Digital Detox Evenings",
    description: "No screens after 9 PM for 14 consecutive evenings. Replace screen time with mindful activities.",
    category: "Mindfulness",
    categoryColor: "#8b5cf6",
    categoryIconName: "smile",
    participants: 203,
    durationDays: 14,
    daysLeft: 14,
    progress: 0,
    joined: false,
    difficulty: "Medium",
  },
  {
    id: 5,
    title: "Deep Work Sprints",
    description: "Log 4 hours of uninterrupted deep work every weekday. No notifications, no distractions.",
    category: "Productivity",
    categoryColor: "#10b981",
    categoryIconName: "cpu",
    participants: 58,
    durationDays: 30,
    daysLeft: 22,
    progress: 27,
    joined: false,
    difficulty: "Hard",
  },
  {
    id: 6,
    title: "Gratitude Streak",
    description: "Write down 3 things you're grateful for every single day for 30 days. Build the positivity habit.",
    category: "Mindfulness",
    categoryColor: "#8b5cf6",
    categoryIconName: "smile",
    participants: 429,
    durationDays: 30,
    daysLeft: 5,
    progress: 83,
    joined: true,
    difficulty: "Easy",
  },
];

const RANK_MEDALS = {
  1: { icon: "🥇", color: "#f59e0b" },
  2: { icon: "🥈", color: "#94a3b8" },
  3: { icon: "🥉", color: "#cd7f32" },
};

const getDifficultyColor = (d) =>
  ({ Easy: "#10b981", Medium: "#f59e0b", Hard: "#ef4444" }[d] || "#94a3b8");

const getCategoryIcon = (name, size = 13) => {
  const icons = {
    zap: <FiZap size={size} />,
    smile: <FiSmile size={size} />,
    book: <FiBookOpen size={size} />,
    cpu: <FiCpu size={size} />,
  };
  return icons[name] || <FiStar size={size} />;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const fadeScale = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.28, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.18 } },
};

const AnimatedCounter = ({ target, duration = 1100 }) => {
  const [count, setCount] = useState(0);
  const startRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    startRef.current = null;
    const tick = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.floor(eased * target));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return <span>{count.toLocaleString()}</span>;
};

const FeedItem = ({ item }) => {
  const [liked, setLiked] = useState(item.liked);
  const [likeCount, setLikeCount] = useState(item.likes);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");

  const handleLike = () => {
    setLikeCount((c) => (liked ? c - 1 : c + 1));
    setLiked((l) => !l);
  };

  const handlePostComment = () => {
    if (!showComment) { setShowComment(true); return; }
    if (comment.trim()) {
      toast.success("Comment posted!");
      setComment("");
      setShowComment(false);
    }
  };

  const typeStyle = {
    habit:     { bg: "rgba(99,102,241,0.12)",  border: "rgba(99,102,241,0.28)" },
    streak:    { bg: "rgba(249,115,22,0.12)",  border: "rgba(249,115,22,0.28)" },
    milestone: { bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.28)" },
    challenge: { bg: "rgba(139,92,246,0.12)",  border: "rgba(139,92,246,0.28)" },
    badge:     { bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.28)" },
  }[item.type] || { bg: "rgba(99,102,241,0.12)", border: "rgba(99,102,241,0.28)" };

  return (
    <motion.div variants={itemVariants}>
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16,
          padding: "18px 20px",
          backdropFilter: "blur(12px)",
        }}
      >
        
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${item.color}cc, ${item.color}77)`,
              border: `2px solid ${item.color}55`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
              boxShadow: `0 0 14px ${item.color}33`,
            }}
          >
            {item.initials}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
              <span style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 14 }}>{item.name}</span>
              <span style={{ color: "#64748b", fontSize: 13 }}>{item.action}</span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  background: typeStyle.bg,
                  border: `1px solid ${typeStyle.border}`,
                  borderRadius: 8,
                  padding: "2px 10px",
                  color: "#e2e8f0",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <span style={{ fontSize: 13 }}>{item.icon}</span>
                {item.detail}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5 }}>
              <FiClock size={11} style={{ color: "#334155" }} />
              <span style={{ color: "#334155", fontSize: 12 }}>{item.timeAgo}</span>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 14,
            paddingTop: 12,
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          
          <motion.button
            whileTap={{ scale: 0.86 }}
            onClick={handleLike}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: liked ? "rgba(239,68,68,0.14)" : "rgba(255,255,255,0.04)",
              border: liked ? "1px solid rgba(239,68,68,0.35)" : "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              padding: "6px 14px",
              color: liked ? "#f87171" : "#64748b",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <FiHeart size={13} style={{ fill: liked ? "#f87171" : "none" }} />
            {likeCount}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.86 }}
            onClick={handlePostComment}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: showComment ? "rgba(99,102,241,0.14)" : "rgba(255,255,255,0.04)",
              border: showComment ? "1px solid rgba(99,102,241,0.35)" : "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              padding: "6px 14px",
              color: showComment ? "#a5b4fc" : "#64748b",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <FiMessageCircle size={13} />
            {item.comments}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.86 }}
            onClick={() => toast("Link copied to clipboard!", { icon: "🔗" })}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              padding: "6px 12px",
              color: "#64748b",
              fontSize: 13,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <FiShare2 size={13} />
          </motion.button>
        </div>

        <AnimatePresence>
          {showComment && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <input
                  autoFocus
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handlePostComment(); }}
                  placeholder="Write a comment..."
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 10,
                    padding: "8px 14px",
                    color: "#f8fafc",
                    fontSize: 13,
                    outline: "none",
                  }}
                />
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={handlePostComment}
                  style={{
                    background: "linear-gradient(135deg,#7c3aed,#6366f1)",
                    border: "none",
                    borderRadius: 10,
                    padding: "8px 18px",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Post
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const LeaderboardRow = ({ user, rank, animate }) => {
  const medal = RANK_MEDALS[rank];

  return (
    <motion.div variants={itemVariants}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "13px 18px",
          borderRadius: 14,
          background: user.isCurrentUser
            ? "rgba(99,102,241,0.11)"
            : "rgba(255,255,255,0.02)",
          border: user.isCurrentUser
            ? "1px solid rgba(99,102,241,0.38)"
            : "1px solid rgba(255,255,255,0.06)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        
        {medal && (
          <div
            style={{
              position: "absolute",
              inset: "0 0 auto 0",
              height: 2,
              background: `linear-gradient(90deg, transparent, ${medal.color}77, transparent)`,
            }}
          />
        )}

        <div style={{ width: 36, textAlign: "center", flexShrink: 0 }}>
          {medal ? (
            <span style={{ fontSize: 22 }}>{medal.icon}</span>
          ) : (
            <span style={{ color: user.isCurrentUser ? "#a5b4fc" : "#475569", fontWeight: 700, fontSize: 15 }}>
              #{rank}
            </span>
          )}
        </div>

        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${user.color}cc, ${user.color}66)`,
            border: `2px solid ${user.color}50`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 700,
            color: "#fff",
            flexShrink: 0,
            boxShadow: user.isCurrentUser ? `0 0 18px ${user.color}44` : "none",
          }}
        >
          {user.initials}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                color: user.isCurrentUser ? "#c4b5fd" : "#f1f5f9",
                fontWeight: user.isCurrentUser ? 700 : 600,
                fontSize: 14,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.name}
            </span>
            {user.isCurrentUser && (
              <span
                style={{
                  background: "rgba(99,102,241,0.25)",
                  border: "1px solid rgba(99,102,241,0.5)",
                  borderRadius: 6,
                  padding: "1px 7px",
                  fontSize: 10,
                  color: "#a5b4fc",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                You
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
            <span
              style={{
                background: `${user.color}20`,
                border: `1px solid ${user.color}40`,
                borderRadius: 6,
                padding: "1px 8px",
                fontSize: 11,
                color: user.color,
                fontWeight: 600,
              }}
            >
              Lv {user.level}
            </span>
            <span style={{ color: "#475569", fontSize: 11 }}>🔥 {user.streak}d streak</span>
          </div>
        </div>

        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div
            style={{
              color: rank === 1 ? "#f59e0b" : user.isCurrentUser ? "#a5b4fc" : "#e2e8f0",
              fontWeight: 700,
              fontSize: 17,
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1,
            }}
          >
            {animate ? <AnimatedCounter target={user.xp} /> : user.xp.toLocaleString()}
          </div>
          <div style={{ color: "#334155", fontSize: 11, marginTop: 2 }}>XP</div>
        </div>
      </div>
    </motion.div>
  );
};

const ChallengeCard = ({ challenge }) => {
  const [joined, setJoined] = useState(challenge.joined);
  const [participants, setParticipants] = useState(challenge.participants);

  const handleToggle = () => {
    if (joined) {
      setJoined(false);
      setParticipants((p) => p - 1);
      toast("Left the challenge", { icon: "👋" });
    } else {
      setJoined(true);
      setParticipants((p) => p + 1);
      toast.success(`Joined "${challenge.title}"! 🎯`);
    }
  };

  return (
    <motion.div variants={itemVariants} whileHover={{ y: -4 }} transition={{ duration: 0.22 }}>
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: joined
            ? "1px solid rgba(99,102,241,0.33)"
            : "1px solid rgba(255,255,255,0.07)",
          borderRadius: 18,
          padding: "20px",
          backdropFilter: "blur(12px)",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          position: "relative",
          overflow: "hidden",
          height: "100%",
          boxSizing: "border-box",
        }}
      >
        
        <div
          style={{
            position: "absolute",
            inset: "0 0 auto 0",
            height: 3,
            background: `linear-gradient(90deg, ${challenge.categoryColor}cc, ${challenge.categoryColor}33)`,
            borderRadius: "18px 18px 0 0",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 4 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: `${challenge.categoryColor}18`,
              border: `1px solid ${challenge.categoryColor}35`,
              borderRadius: 8,
              padding: "4px 10px",
              color: challenge.categoryColor,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {getCategoryIcon(challenge.categoryIconName)}
            {challenge.category}
          </span>
          <span
            style={{
              background: `${getDifficultyColor(challenge.difficulty)}18`,
              border: `1px solid ${getDifficultyColor(challenge.difficulty)}35`,
              borderRadius: 8,
              padding: "3px 9px",
              color: getDifficultyColor(challenge.difficulty),
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {challenge.difficulty}
          </span>
        </div>

        <div>
          <h3 style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 15, margin: 0, lineHeight: 1.4 }}>
            {challenge.title}
          </h3>
          <p style={{ color: "#475569", fontSize: 12, margin: "7px 0 0", lineHeight: 1.65 }}>
            {challenge.description}
          </p>
        </div>

        <div style={{ display: "flex", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#64748b", fontSize: 12 }}>
            <FiUsers size={12} />
            <span>{participants.toLocaleString()} participants</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#64748b", fontSize: 12 }}>
            <FiClock size={12} />
            <span>{challenge.daysLeft === 0 ? "Ends today" : `${challenge.daysLeft}d left`}</span>
          </div>
        </div>

        {joined && challenge.progress > 0 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
              <span style={{ color: "#94a3b8", fontSize: 11, fontWeight: 500 }}>Your Progress</span>
              <span style={{ color: "#a5b4fc", fontSize: 11, fontWeight: 700 }}>{challenge.progress}%</span>
            </div>
            <div
              style={{
                height: 6,
                borderRadius: 100,
                background: "rgba(255,255,255,0.07)",
                overflow: "hidden",
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${challenge.progress}%` }}
                transition={{ duration: 1.1, delay: 0.35, ease: "easeOut" }}
                style={{
                  height: "100%",
                  borderRadius: 100,
                  background: "linear-gradient(90deg,#7c3aed,#6366f1)",
                  boxShadow: "0 0 8px #6366f188",
                }}
              />
            </div>
          </div>
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleToggle}
          style={{
            marginTop: "auto",
            width: "100%",
            padding: "11px 0",
            borderRadius: 12,
            border: joined ? "1px solid rgba(239,68,68,0.35)" : "none",
            background: joined
              ? "rgba(239,68,68,0.09)"
              : "linear-gradient(135deg,#7c3aed,#6366f1)",
            color: joined ? "#f87171" : "#fff",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            boxShadow: joined ? "none" : "0 4px 18px rgba(99,102,241,0.38)",
            transition: "all 0.25s",
          }}
        >
          {joined ? (
            <><FiX size={14} /> Leave Challenge</>
          ) : (
            <><FiFlag size={14} /> Join Challenge</>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

const CATEGORIES = ["Fitness", "Mindfulness", "Learning", "Productivity"];
const DURATIONS = ["7", "14", "21", "30", "60", "90"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

const CreateChallengeModal = ({ onClose }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Fitness",
    duration: "30",
    difficulty: "Medium",
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setDirect = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Please enter a challenge title"); return; }
    toast.success("Challenge created! 🚀");
    onClose();
  };

  const inputBase = {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10,
    padding: "10px 14px",
    color: "#f8fafc",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.78)",
        backdropFilter: "blur(8px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 28 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0f0f1a",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 22,
          padding: "30px 28px",
          width: "100%",
          maxWidth: 480,
          boxShadow: "0 40px 80px rgba(0,0,0,0.65)",
        }}
      >
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 26 }}>
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 21,
                fontWeight: 900,
                background: "linear-gradient(135deg,#a78bfa,#6366f1)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Create Challenge
            </h2>
            <p style={{ margin: "5px 0 0", color: "#475569", fontSize: 13 }}>
              Rally your community around a shared goal
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              padding: "8px",
              color: "#64748b",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FiX size={18} />
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          
          <div>
            <label style={{ color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 7 }}>
              Title *
            </label>
            <input
              style={inputBase}
              placeholder="e.g. 21-Day Morning Routine"
              value={form.title}
              onChange={set("title")}
            />
          </div>

          <div>
            <label style={{ color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 7 }}>
              Description
            </label>
            <textarea
              style={{ ...inputBase, resize: "none", minHeight: 82 }}
              placeholder="What do participants need to do each day?"
              value={form.description}
              onChange={set("description")}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 7 }}>
                Category
              </label>
              <select
                style={{ ...inputBase, cursor: "pointer" }}
                value={form.category}
                onChange={set("category")}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} style={{ background: "#0f0f1a" }}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 7 }}>
                Duration
              </label>
              <select
                style={{ ...inputBase, cursor: "pointer" }}
                value={form.duration}
                onChange={set("duration")}
              >
                {DURATIONS.map((d) => (
                  <option key={d} value={d} style={{ background: "#0f0f1a" }}>{d} days</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 10 }}>
              Difficulty
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDirect("difficulty", d)}
                  style={{
                    flex: 1,
                    padding: "9px 0",
                    borderRadius: 10,
                    border: form.difficulty === d
                      ? `1px solid ${getDifficultyColor(d)}55`
                      : "1px solid rgba(255,255,255,0.09)",
                    background: form.difficulty === d
                      ? `${getDifficultyColor(d)}18`
                      : "rgba(255,255,255,0.04)",
                    color: form.difficulty === d ? getDifficultyColor(d) : "#475569",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            style={{
              width: "100%",
              padding: "13px 0",
              marginTop: 4,
              borderRadius: 12,
              border: "none",
              background: "linear-gradient(135deg,#7c3aed,#6366f1)",
              color: "#fff",
              fontWeight: 800,
              fontSize: 15,
              cursor: "pointer",
              boxShadow: "0 6px 24px rgba(99,102,241,0.42)",
            }}
          >
            🚀 Launch Challenge
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

const TABS = [
  { id: "feed",        label: "Feed",        icon: <FiActivity size={15} />    },
  { id: "leaderboard",label: "Leaderboard",  icon: <FiTrendingUp size={15} />  },
  { id: "challenges",  label: "Challenges",  icon: <FiAward size={15} />       },
  { id: "accounts",    label: "Social Links", icon: <FiShare2 size={15} />       },
];

const LB_FILTERS = ["All Time", "This Week", "This Month"];
const LB_DATA_MAP = {
  "All Time":   MOCK_LEADERBOARD_ALL,
  "This Week":  MOCK_LEADERBOARD_WEEK,
  "This Month": MOCK_LEADERBOARD_MONTH,
};

export default function SocialPage() {
  const dispatch = useDispatch();

  const reduxFeed = useSelector((state) => state?.social?.feed);
  const feedData = reduxFeed && reduxFeed.length > 0 ? reduxFeed : MOCK_FEED;

  const [activeTab, setActiveTab]       = useState("feed");
  const [lbFilter, setLbFilter]         = useState("All Time");
  const [showModal, setShowModal]        = useState(false);
  const [animateLb, setAnimateLb]        = useState(true);

  const leaderboardData = LB_DATA_MAP[lbFilter];

  const currentUser = useSelector((state) => state?.auth?.user);
  const [socialLinks, setSocialLinks] = useState({
    github: "",
    twitter: "",
    linkedin: "",
    website: "",
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("habitflow_social_links");
      if (saved) {
        setSocialLinks(JSON.parse(saved));
      }
    } catch (e) {
    }
  }, []);

  const handleSaveLinks = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem("habitflow_social_links", JSON.stringify(socialLinks));
      toast.success("Social links saved successfully! ✨");
    } catch (err) {
      toast.error("Failed to save social links");
    }
  };

  const hasAnyLink = socialLinks.github || socialLinks.twitter || socialLinks.linkedin || socialLinks.website;

  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10,
    padding: "10px 14px",
    color: "#f8fafc",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  };

  useEffect(() => {
    setAnimateLb(false);
    const t = setTimeout(() => setAnimateLb(true), 60);
    return () => clearTimeout(t);
  }, [lbFilter]);

  return (
    <div style={{ minHeight: "100vh", background: "#020617", paddingBottom: 64 }}>
      
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ padding: "32px 24px 0", maxWidth: 900, margin: "0 auto" }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          
          <div>
            <h1
              style={{
                fontSize: 32,
                fontWeight: 900,
                margin: 0,
                letterSpacing: "-0.02em",
                background: "linear-gradient(135deg,#a78bfa,#6366f1,#38bdf8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Community
            </h1>
            <p style={{ margin: "6px 0 0", color: "#334155", fontSize: 14 }}>
              Celebrate progress, compete &amp; grow together
            </p>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            {[
              { label: "Friends", value: "24", icon: <FiUsers size={14} /> },
              { label: "Rank",    value: "#5",  icon: <FiStar size={14} />  },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 13,
                  padding: "10px 18px",
                  textAlign: "center",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div style={{ color: "#6366f1", display: "flex", justifyContent: "center", marginBottom: 4 }}>
                  {s.icon}
                </div>
                <div style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 17 }}>{s.value}</div>
                <div style={{ color: "#334155", fontSize: 11 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 4,
            marginTop: 28,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 14,
            padding: 5,
            width: "fit-content",
          }}
        >
          {TABS.map((tab) => (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "9px 22px",
                borderRadius: 10,
                border: "none",
                background: activeTab === tab.id
                  ? "linear-gradient(135deg,#7c3aed,#6366f1)"
                  : "transparent",
                color: activeTab === tab.id ? "#fff" : "#475569",
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: 14,
                cursor: "pointer",
                boxShadow: activeTab === tab.id
                  ? "0 4px 16px rgba(99,102,241,0.38)"
                  : "none",
                transition: "all 0.22s",
              }}
            >
              {tab.icon}
              {tab.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 24px 0" }}>
        <AnimatePresence mode="wait">

          {activeTab === "feed" && (
            <motion.div key="feed" variants={fadeScale} initial="hidden" animate="visible" exit="exit">
              
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h2 style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 18, margin: 0 }}>
                  Activity Feed
                  <span
                    style={{
                      marginLeft: 10,
                      background: "rgba(99,102,241,0.18)",
                      border: "1px solid rgba(99,102,241,0.32)",
                      borderRadius: 6,
                      padding: "2px 9px",
                      fontSize: 12,
                      color: "#a5b4fc",
                    }}
                  >
                    {feedData.length} updates
                  </span>
                </h2>
                <button
                  onClick={() => toast("Filter options coming soon!")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    padding: "7px 14px",
                    color: "#64748b",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  <FiFilter size={13} />
                  Filter
                </button>
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {feedData.map((item) => (
                  <FeedItem key={item.id} item={item} />
                ))}
              </motion.div>

              <div style={{ textAlign: "center", marginTop: 24 }}>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.55 }}
                  onClick={() => toast("Fetching more updates...")}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    borderRadius: 12,
                    padding: "11px 32px",
                    color: "#64748b",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  Load More <FiChevronRight size={15} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {activeTab === "leaderboard" && (
            <motion.div key="leaderboard" variants={fadeScale} initial="hidden" animate="visible" exit="exit">
              
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
                <h2 style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 18, margin: 0 }}>
                  Top Performers 🏆
                </h2>
                <div
                  style={{
                    display: "flex",
                    gap: 4,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 12,
                    padding: 4,
                  }}
                >
                  {LB_FILTERS.map((f) => (
                    <motion.button
                      key={f}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setLbFilter(f)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 8,
                        border: "none",
                        background: lbFilter === f ? "rgba(99,102,241,0.28)" : "transparent",
                        color: lbFilter === f ? "#a5b4fc" : "#475569",
                        fontWeight: lbFilter === f ? 700 : 500,
                        fontSize: 13,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {f}
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}
              >
                {leaderboardData.slice(0, 3).map((user, i) => {
                  const rank = i + 1;
                  const medal = RANK_MEDALS[rank];
                  return (
                    <motion.div key={user.id} variants={itemVariants} style={{ flex: 1, minWidth: 140 }}>
                      <div
                        style={{
                          background: `linear-gradient(160deg, ${medal.color}12, rgba(255,255,255,0.02))`,
                          border: `1px solid ${medal.color}28`,
                          borderRadius: 18,
                          padding: "22px 16px 18px",
                          textAlign: "center",
                          position: "relative",
                          overflow: "hidden",
                          boxShadow: `0 8px 32px ${medal.color}14`,
                        }}
                      >
                        
                        <div style={{ position: "absolute", inset: "0 0 auto 0", height: 2, background: `linear-gradient(90deg, transparent, ${medal.color}, transparent)` }} />
                        <div style={{ fontSize: 28, marginBottom: 12 }}>{medal.icon}</div>
                        <div
                          style={{
                            width: 54,
                            height: 54,
                            borderRadius: "50%",
                            background: `linear-gradient(135deg, ${user.color}cc, ${user.color}66)`,
                            border: `2px solid ${user.color}60`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 16,
                            fontWeight: 800,
                            color: "#fff",
                            margin: "0 auto 10px",
                            boxShadow: `0 0 22px ${user.color}44`,
                          }}
                        >
                          {user.initials}
                        </div>
                        <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 14, marginBottom: 5 }}>
                          {user.name}
                        </div>
                        <div style={{ color: medal.color, fontWeight: 800, fontSize: 19 }}>
                          {animateLb ? <AnimatedCounter target={user.xp} /> : user.xp.toLocaleString()} XP
                        </div>
                        <div style={{ color: "#334155", fontSize: 11, marginTop: 5 }}>
                          Lv {user.level} · 🔥 {user.streak}d
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              <motion.div
                key={lbFilter}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{ display: "flex", flexDirection: "column", gap: 8 }}
              >
                {leaderboardData.slice(3).map((user, i) => (
                  <LeaderboardRow key={user.id} user={user} rank={i + 4} animate={animateLb} />
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{
                  marginTop: 24,
                  background: "rgba(99,102,241,0.07)",
                  border: "1px solid rgba(99,102,241,0.22)",
                  borderRadius: 16,
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <FiStar size={20} style={{ color: "#a5b4fc", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ color: "#a5b4fc", fontWeight: 700, fontSize: 14 }}>Your Standing</div>
                  <div style={{ color: "#475569", fontSize: 13, marginTop: 3 }}>
                    Only{" "}
                    <span style={{ color: "#c4b5fd", fontWeight: 700 }}>4,300 XP</span>
                    {" "}away from moving up to #4!
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => toast("Opening your XP breakdown...")}
                  style={{
                    background: "linear-gradient(135deg,#7c3aed,#6366f1)",
                    border: "none",
                    borderRadius: 10,
                    padding: "9px 18px",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
                  }}
                >
                  View Breakdown
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {activeTab === "challenges" && (
            <motion.div key="challenges" variants={fadeScale} initial="hidden" animate="visible" exit="exit">
              
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
                <div>
                  <h2 style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 18, margin: 0 }}>
                    Active Challenges
                  </h2>
                  <p style={{ color: "#334155", fontSize: 13, margin: "5px 0 0" }}>
                    {MOCK_CHALLENGES.filter((c) => c.joined).length} joined · {MOCK_CHALLENGES.length} available
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowModal(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "linear-gradient(135deg,#7c3aed,#6366f1)",
                    border: "none",
                    borderRadius: 12,
                    padding: "10px 20px",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 6px 20px rgba(99,102,241,0.42)",
                  }}
                >
                  <FiPlus size={16} />
                  Create Challenge
                </motion.button>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                {[
                  { label: "All",           color: "#6366f1" },
                  { label: "Fitness",       color: "#f97316" },
                  { label: "Mindfulness",   color: "#8b5cf6" },
                  { label: "Learning",      color: "#0ea5e9" },
                  { label: "Productivity",  color: "#10b981" },
                ].map((cat) => (
                  <motion.button
                    key={cat.label}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toast(`Filtered to: ${cat.label}`)}
                    style={{
                      background: `${cat.color}14`,
                      border: `1px solid ${cat.color}32`,
                      borderRadius: 20,
                      padding: "5px 14px",
                      color: cat.color,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {cat.label}
                  </motion.button>
                ))}
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
                  gap: 16,
                }}
              >
                {MOCK_CHALLENGES.map((challenge) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} />
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                style={{
                  marginTop: 28,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 16,
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: "linear-gradient(135deg,#7c3aed,#6366f1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 6px 20px rgba(99,102,241,0.4)",
                  }}
                >
                  <FiUsers size={22} style={{ color: "#fff" }} />
                </div>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 15 }}>
                    Don't see the right challenge?
                  </div>
                  <div style={{ color: "#334155", fontSize: 13, marginTop: 3 }}>
                    Create your own and inspire others to join the journey.
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setShowModal(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    background: "rgba(99,102,241,0.14)",
                    border: "1px solid rgba(99,102,241,0.32)",
                    borderRadius: 12,
                    padding: "10px 20px",
                    color: "#a5b4fc",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <FiPlus size={15} />
                  Create One
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {activeTab === "accounts" && (
            <motion.div key="accounts" variants={fadeScale} initial="hidden" animate="visible" exit="exit">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h2 style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 18, margin: 0 }}>
                  Social Profiles
                </h2>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
                <motion.div
                  variants={itemVariants}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 18,
                    padding: "24px",
                    backdropFilter: "blur(12px)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                  }}
                >
                  <h3 style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 15, margin: 0 }}>Link Accounts</h3>
                  <p style={{ color: "#475569", fontSize: 12, margin: 0, lineHeight: 1.5 }}>
                    Connect your profiles to display them on your dashboard and sharing card.
                  </p>

                  <form onSubmit={handleSaveLinks} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                      <label style={{ color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
                        <FiGithub size={12} style={{ color: "#a78bfa" }} /> GitHub
                      </label>
                      <input
                        style={inputStyle}
                        placeholder="e.g. github.com/username"
                        value={socialLinks.github}
                        onChange={(e) => setSocialLinks(s => ({ ...s, github: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label style={{ color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
                        <FiTwitter size={12} style={{ color: "#0ea5e9" }} /> Twitter / X
                      </label>
                      <input
                        style={inputStyle}
                        placeholder="e.g. twitter.com/username"
                        value={socialLinks.twitter}
                        onChange={(e) => setSocialLinks(s => ({ ...s, twitter: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label style={{ color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
                        <FiLinkedin size={12} style={{ color: "#0284c7" }} /> LinkedIn
                      </label>
                      <input
                        style={inputStyle}
                        placeholder="e.g. linkedin.com/in/username"
                        value={socialLinks.linkedin}
                        onChange={(e) => setSocialLinks(s => ({ ...s, linkedin: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label style={{ color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
                        <FiGlobe size={12} style={{ color: "#10b981" }} /> Personal Website
                      </label>
                      <input
                        style={inputStyle}
                        placeholder="e.g. yourwebsite.com"
                        value={socialLinks.website}
                        onChange={(e) => setSocialLinks(s => ({ ...s, website: e.target.value }))}
                      />
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      type="submit"
                      style={{
                        width: "100%",
                        padding: "12px 0",
                        marginTop: 8,
                        borderRadius: 12,
                        border: "none",
                        background: "linear-gradient(135deg,#7c3aed,#6366f1)",
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: 14,
                        cursor: "pointer",
                        boxShadow: "0 6px 20px rgba(99,102,241,0.35)",
                      }}
                    >
                      💾 Save Connections
                    </motion.button>
                  </form>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 18,
                    padding: "24px",
                    backdropFilter: "blur(12px)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    position: "relative",
                    minHeight: 320,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: "0 0 auto 0",
                      height: 3,
                      background: "linear-gradient(90deg, #7c3aed, #6366f1, #38bdf8)",
                    }}
                  />

                  <div
                    style={{
                      width: 74,
                      height: 74,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #6366f1cc, #6366f144)",
                      border: "3px solid #6366f177",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                      fontWeight: 800,
                      color: "#fff",
                      marginBottom: 16,
                      boxShadow: "0 0 24px rgba(99,102,241,0.3)",
                    }}
                  >
                    {currentUser?.name ? currentUser.name.substring(0, 2).toUpperCase() : "ME"}
                  </div>

                  <h3 style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 18, margin: 0 }}>
                    {currentUser?.name || "Habit Builder"}
                  </h3>
                  
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
                    <span style={{ background: "rgba(99,102,241,0.18)", border: "1px solid rgba(99,102,241,0.35)", borderRadius: 6, padding: "2px 8px", fontSize: 11, color: "#a5b4fc", fontWeight: 600 }}>
                      Lv {currentUser?.level || 14}
                    </span>
                    <span style={{ color: "#475569", fontSize: 12 }}>
                      🔥 {currentUser?.streak || 15}d streak
                    </span>
                  </div>

                  <p style={{ color: "#64748b", fontSize: 13, margin: "16px 0 20px", maxWidth: 280, lineHeight: 1.5 }}>
                    "Building better habits, step by step, day by day."
                  </p>

                  <div style={{ display: "flex", gap: 12, justifyContent: "center", alignItems: "center", minHeight: 40 }}>
                    {hasAnyLink ? (
                      <>
                        {socialLinks.github && (
                          <motion.a
                            href={socialLinks.github.startsWith("http") ? socialLinks.github : `https://${socialLinks.github}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ y: -3, scale: 1.1 }}
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: "50%",
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#e2e8f0",
                              cursor: "pointer",
                              transition: "background 0.2s",
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(167,139,250,0.15)"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)"}
                          >
                            <FiGithub size={18} />
                          </motion.a>
                        )}

                        {socialLinks.twitter && (
                          <motion.a
                            href={socialLinks.twitter.startsWith("http") ? socialLinks.twitter : `https://${socialLinks.twitter}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ y: -3, scale: 1.1 }}
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: "50%",
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#e2e8f0",
                              cursor: "pointer",
                              transition: "background 0.2s",
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(14,165,233,0.15)"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)"}
                          >
                            <FiTwitter size={18} />
                          </motion.a>
                        )}

                        {socialLinks.linkedin && (
                          <motion.a
                            href={socialLinks.linkedin.startsWith("http") ? socialLinks.linkedin : `https://${socialLinks.linkedin}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ y: -3, scale: 1.1 }}
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: "50%",
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#e2e8f0",
                              cursor: "pointer",
                              transition: "background 0.2s",
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(2,132,199,0.15)"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)"}
                          >
                            <FiLinkedin size={18} />
                          </motion.a>
                        )}

                        {socialLinks.website && (
                          <motion.a
                            href={socialLinks.website.startsWith("http") ? socialLinks.website : `https://${socialLinks.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ y: -3, scale: 1.1 }}
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: "50%",
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#e2e8f0",
                              cursor: "pointer",
                              transition: "background 0.2s",
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(16,185,129,0.15)"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)"}
                          >
                            <FiGlobe size={18} />
                          </motion.a>
                        )}
                      </>
                    ) : (
                      <span style={{ color: "#334155", fontSize: 12, fontStyle: "italic" }}>
                        No profiles linked
                      </span>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Create Challenge Modal ── */}
      <AnimatePresence>
        {showModal && <CreateChallengeModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
