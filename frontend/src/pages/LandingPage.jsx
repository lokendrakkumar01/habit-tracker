import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import {
  FiCheck, FiArrowRight, FiZap, FiTrendingUp, FiAward,
  FiCalendar, FiUsers, FiStar, FiBarChart2, FiTarget,
  FiBookOpen, FiCpu, FiShield, FiSmile, FiChevronDown,
  FiPlay, FiGithub, FiTwitter, FiLinkedin, FiFlag,
} from 'react-icons/fi';
import { MdAutoGraph, MdEmojiEvents } from 'react-icons/md';

/* ─── Animation Variants ─────────────────────────────── */
const fade = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

/* ─── Data ───────────────────────────────────────────── */
const features = [
  { icon: FiTarget,    color: '#a78bfa', title: 'Smart Habit Tracking',    desc: 'Create unlimited habits with custom schedules, reminders, and priority levels tailored to your lifestyle.' },
  { icon: FiZap,       color: '#fbbf24', title: 'Streak System',           desc: 'Stay on fire with streak tracking, streak freeze protection, and milestone celebrations.' },
  { icon: FiBarChart2, color: '#38bdf8', title: 'Deep Analytics',          desc: 'Visualize progress with interactive charts, heatmaps, radar plots, and AI-powered insights.' },
  { icon: MdEmojiEvents,color:'#34d399', title: 'Gamification',           desc: 'Earn XP, unlock badges, climb leaderboards, and compete in community challenges.' },
  { icon: FiFlag,      color: '#f87171', title: 'Goal Management',         desc: 'Set meaningful goals, attach habits to milestones, and track every step forward.' },
  { icon: FiBookOpen,  color: '#c084fc', title: 'Reflection Journal',      desc: 'Daily journaling with mood tracking to build self-awareness and long-term motivation.' },
  { icon: FiCpu,       color: '#fb923c', title: 'AI Productivity Coach',   desc: 'Get personalized habit suggestions, burnout alerts, and weekly performance reports.' },
  { icon: FiUsers,     color: '#4ade80', title: 'Social & Communities',    desc: 'Follow friends, join groups, challenge others, and stay accountable together.' },
  { icon: FiShield,    color: '#818cf8', title: 'Enterprise Security',     desc: 'JWT authentication, rate limiting, data encryption, and GDPR-compliant data handling.' },
];

const stats = [
  { value: '50K+',  label: 'Active Users',    icon: FiUsers },
  { value: '2M+',   label: 'Habits Tracked',  icon: FiTarget },
  { value: '98%',   label: 'Satisfaction',    icon: FiSmile },
  { value: '15M+',  label: 'Streak Days',     icon: FiZap },
];

const testimonials = [
  { name: 'Priya Sharma',  role: 'Software Engineer at Google', text: 'HabitFlow completely transformed my daily routine. I\'ve maintained a 90-day coding streak and the analytics show exactly when I\'m most productive.', initials: 'PS', color: '#7c3aed' },
  { name: 'Arjun Verma',   role: 'Fitness Coach & Entrepreneur', text: 'The AI coach caught my burnout pattern before I even noticed it. The streak freeze system saved my 60-day streak twice already!', initials: 'AV', color: '#0ea5e9' },
  { name: 'Meera Patel',   role: 'Medical Student', text: 'Finally an app that understands productivity isn\'t just about checking boxes. The journal + mood analytics combo is absolutely brilliant.', initials: 'MP', color: '#10b981' },
  { name: 'Rahul Singh',   role: 'Product Manager at Swiggy', text: 'I recommended this to my entire team. The community challenges create healthy competition and everyone\'s productivity went up 40%.', initials: 'RS', color: '#f59e0b' },
  { name: 'Ananya Kapoor', role: 'Yoga Instructor', text: 'The minimalist design doesn\'t overwhelm me like other trackers. Clean, beautiful, and it actually helps me build meaningful spiritual habits.', initials: 'AK', color: '#ec4899' },
  { name: 'Vikram Nair',   role: 'CTO at TechStart', text: 'Deployed HabitFlow for my engineering team. The admin panel and analytics give incredible visibility into team well-being and productivity.', initials: 'VN', color: '#8b5cf6' },
];

const faqs = [
  { q: 'Is HabitFlow really free?', a: 'Yes! The free plan includes up to 5 habits, basic analytics, streak tracking, and journal access. No credit card required.' },
  { q: 'How does the AI Coach work?', a: 'Our AI analyzes your habit completion patterns, identifies your peak productivity windows, predicts which habits you\'re likely to miss, and gives personalized recommendations weekly.' },
  { q: 'What is Streak Freeze?', a: 'Streak Freeze lets you protect your current streak if you miss a day due to travel or illness. You earn freezes by accumulating XP points through consistent habit completion.' },
  { q: 'Can I export my data?', a: 'Absolutely. Premium users can export all habit data, analytics reports, and journal entries as CSV or PDF at any time.' },
  { q: 'Is my data secure?', a: 'We use JWT authentication, bcrypt password hashing, rate limiting, NoSQL injection prevention, and MongoDB Atlas for secure cloud storage. Your data is never sold.' },
  { q: 'Do you have a mobile app?', a: 'HabitFlow is a fully responsive Progressive Web App (PWA) that works perfectly on all mobile browsers. A native iOS/Android app is on our roadmap.' },
];

/* ─── Sub-components ─────────────────────────────────── */

function AnimatedCounter({ target, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) setStarted(true);
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const numeric = parseInt(target.replace(/\D/g, ''));
    let start = 0;
    const step = numeric / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= numeric) { setCount(numeric); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

function FAQItem({ q, a, index }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      viewport={{ once: true }}
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="font-semibold text-white text-sm sm:text-base">{q}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="text-gray-400 flex-shrink-0"
        >
          <FiChevronDown size={18} />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-5 text-sm text-gray-400 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Main Page ──────────────────────────────────────── */
export default function LandingPage() {
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 80], ['rgba(10,10,15,0)', 'rgba(10,10,15,0.95)']);
  const navBorder = useTransform(scrollY, [0, 80], ['rgba(255,255,255,0)', 'rgba(255,255,255,0.07)']);

  const [pricingAnnual, setPricingAnnual] = useState(true);

  const monthlyPrice = pricingAnnual ? 6.99 : 9.99;
  const annualTotal  = (monthlyPrice * 12).toFixed(0);

  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{ background: '#0a0a0f' }}>

      {/* ── Navbar ────────────────────────────────────── */}
      <motion.nav
        style={{ backgroundColor: navBg, borderBottomColor: navBorder }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b backdrop-blur-xl"
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="sm:gap-2.5">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-base sm:text-lg flex-shrink-0" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 4px 16px rgba(124,58,237,0.4)' }}>
            🎯
          </div>
          <span className="text-base sm:text-lg font-bold gradient-text">HabitFlow</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: '#94a3b8' }}>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/login" className="btn-secondary text-xs sm:text-sm px-2.5 py-1.5 sm:px-4 sm:py-2 whitespace-nowrap">Sign In</Link>
          <Link to="/register" className="btn-primary text-xs sm:text-sm px-2.5 py-1.5 sm:px-4 sm:py-2 whitespace-nowrap">
            <span className="hidden sm:inline">Get Started Free</span>
            <span className="sm:hidden">Sign Up</span>
          </Link>
        </div>
      </motion.nav>

      {/* ── Hero ──────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-6 text-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-30"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)' }} />
          <div className="absolute top-1/3 left-0 w-[400px] h-[400px] rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.4) 0%, transparent 70%)' }} />
          <div className="absolute top-1/4 right-0 w-[350px] h-[350px] rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)' }} />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)',
            backgroundSize: '80px 80px',
          }} />
        </div>

        <motion.div className="relative max-w-5xl mx-auto" variants={stagger} initial="hidden" animate="visible">
          {/* Badge */}
          <motion.div variants={fade} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 badge badge-primary">
            <FiZap className="text-yellow-400" size={13} />
            ✨ AI-Powered Habit Intelligence — Now Live
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={fade} className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-[1.1] tracking-tight font-display">
            Build Habits That{' '}
            <span className="block gradient-text">Actually Stick</span>
          </motion.h1>

          {/* Sub */}
          <motion.p variants={fade} className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: '#94a3b8' }}>
            The most powerful habit tracker for serious achievers. Track habits, crush streaks, achieve goals, and transform your life with AI coaching.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fade} className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link to="/register" className="btn-primary text-sm sm:text-base px-6 py-3.5 sm:px-8 sm:py-4 rounded-2xl">
              Start Free Today <FiArrowRight size={16} />
            </Link>
            <button className="btn-secondary text-sm sm:text-base px-6 py-3.5 sm:px-8 sm:py-4 rounded-2xl flex items-center gap-2 justify-center">
              <FiPlay size={16} /> Watch Demo
            </button>
          </motion.div>
          <motion.p variants={fade} className="text-sm" style={{ color: '#475569' }}>
            Free forever · No credit card · 5 habits included
          </motion.p>

          {/* App Preview */}
          <motion.div variants={fade} className="mt-16 relative max-w-4xl mx-auto">
            <div className="absolute -inset-8 rounded-full opacity-20 blur-3xl pointer-events-none"
              style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.6),rgba(56,189,248,0.4))' }} />
            <div className="relative rounded-3xl overflow-hidden" style={{
              background: 'rgba(15,15,25,0.9)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
            }}>
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-3 text-xs" style={{ color: '#475569' }}>habitflow.app/dashboard</span>
              </div>
              {/* Dashboard preview */}
              <div className="p-6">
                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {[
                    { label: "Today's Habits", value: '6/8', color: '#a78bfa' },
                    { label: 'Current Streak', value: '🔥 42d', color: '#fb923c' },
                    { label: 'XP Points', value: '⚡ 2,840', color: '#fbbf24' },
                    { label: 'Productivity', value: '94%', color: '#34d399' },
                  ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.1 }}
                      className="rounded-xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
                      <div className="text-xs mt-1" style={{ color: '#475569' }}>{s.label}</div>
                    </motion.div>
                  ))}
                </div>
                {/* Habit list */}
                <div className="space-y-2">
                  {[
                    { icon: '🏃', name: 'Morning Run', streak: 42, done: true, cat: 'Fitness' },
                    { icon: '📚', name: 'Read 30 mins', streak: 28, done: true, cat: 'Learning' },
                    { icon: '💻', name: 'Code Daily', streak: 60, done: false, cat: 'Coding' },
                    { icon: '🧘', name: 'Meditate', streak: 15, done: false, cat: 'Wellness' },
                  ].map((h, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 + i * 0.1 }}
                      className="flex items-center gap-3 rounded-xl px-4 py-3"
                      style={{
                        background: h.done ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${h.done ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}`,
                      }}>
                      <span className="text-xl">{h.icon}</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium" style={{ color: h.done ? '#6b7280' : '#f1f5f9', textDecoration: h.done ? 'line-through' : 'none' }}>{h.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}>{h.cat}</span>
                          <span className="text-xs text-amber-400">🔥 {h.streak}d</span>
                        </div>
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${h.done ? 'text-emerald-400' : 'text-gray-600'}`}
                        style={{ background: h.done ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${h.done ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)'}` }}>
                        {h.done ? '✓' : '○'}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Stats ─────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="text-center glass-card-static p-6">
                <div className="flex justify-center mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.15)' }}>
                    <s.icon size={18} style={{ color: '#a78bfa' }} />
                  </div>
                </div>
                <div className="text-3xl font-black gradient-text mb-1">
                  {s.value.includes('+') ? (
                    <><AnimatedCounter target={s.value} suffix="+" /></>
                  ) : s.value.includes('%') ? (
                    <><AnimatedCounter target={s.value} suffix="%" /></>
                  ) : s.value}
                </div>
                <div className="text-sm" style={{ color: '#64748b' }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="badge badge-primary mb-4 inline-flex">Everything You Need</div>
            <h2 className="text-4xl md:text-5xl font-black mb-5 font-display">
              <span className="gradient-text">Supercharged</span> Habit Building
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#94a3b8' }}>
              Every feature you need to build lasting habits and achieve your goals — no fluff, just results.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }} viewport={{ once: true }}
                whileHover={{ y: -4 }}
                className="glass-card p-6 group cursor-default">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                  style={{ background: `${f.color}18`, border: `1px solid ${f.color}30` }}>
                  <f.icon size={22} style={{ color: f.color }} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social Proof ──────────────────────────────── */}
      <section id="testimonials" className="py-24 px-6" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="badge badge-success mb-4 inline-flex">💬 Real Stories</div>
            <h2 className="text-4xl md:text-5xl font-black mb-5 font-display">Loved by <span className="gradient-text">Thousands</span></h2>
            <p style={{ color: '#94a3b8' }}>Join 50,000+ achievers building better habits every day</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }} viewport={{ once: true }}
                className="glass-card p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <FiStar key={j} size={13} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: '#cbd5e1' }}>"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: `linear-gradient(135deg,${t.color},${t.color}99)` }}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs" style={{ color: '#64748b' }}>{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <div className="badge badge-info mb-4 inline-flex">💎 Simple Pricing</div>
            <h2 className="text-4xl md:text-5xl font-black mb-5 font-display">Start <span className="gradient-text">Free</span>, Scale Later</h2>

            {/* Billing toggle */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <span className={`text-sm font-medium ${!pricingAnnual ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
              <button
                onClick={() => setPricingAnnual(v => !v)}
                className="relative w-14 h-7 rounded-full transition-colors"
                style={{ background: pricingAnnual ? 'linear-gradient(135deg,#7c3aed,#6366f1)' : 'rgba(255,255,255,0.1)' }}
              >
                <motion.div animate={{ x: pricingAnnual ? 28 : 2 }} className="absolute top-1 w-5 h-5 rounded-full bg-white shadow" />
              </button>
              <span className={`text-sm font-medium ${pricingAnnual ? 'text-white' : 'text-gray-500'}`}>
                Annual <span className="badge badge-success ml-1 text-xs">Save 30%</span>
              </span>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Free */}
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="glass-card p-6 sm:p-8">
              <div className="text-sm font-semibold text-gray-400 mb-2">Free Plan</div>
              <div className="text-5xl font-black text-white mb-1">$0</div>
              <div className="text-sm mb-8" style={{ color: '#64748b' }}>Forever free, no credit card</div>
              {['Up to 5 habits', 'Basic analytics', 'Streak tracking', 'Journal access', 'Standard reminders'].map((f, i) => (
                <div key={i} className="flex items-center gap-3 mb-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(16,185,129,0.15)' }}>
                    <FiCheck size={11} className="text-emerald-400" />
                  </div>
                  <span className="text-sm text-gray-300">{f}</span>
                </div>
              ))}
              <Link to="/register" className="btn-secondary w-full justify-center mt-8 rounded-2xl">Get Started Free</Link>
            </motion.div>

            {/* Premium */}
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-card p-6 sm:p-8 glow-brand relative" style={{ border: '1px solid rgba(139,92,246,0.4)' }}>
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 badge badge-primary text-xs px-4 py-1.5">⭐ MOST POPULAR</div>
              <div className="text-sm font-semibold mb-2 gradient-text">Premium Plan</div>
              <div className="flex items-end gap-2 mb-1">
                <div className="text-5xl font-black text-white">${monthlyPrice}</div>
                <div className="text-gray-400 mb-2">/month</div>
              </div>
              {pricingAnnual && <div className="text-sm text-emerald-400 mb-8">Billed ${annualTotal}/year — save 30%!</div>}
              {!pricingAnnual && <div className="text-sm text-gray-500 mb-8">Billed monthly</div>}
              {['Unlimited habits', 'Advanced analytics & reports', 'AI Productivity Coach', 'Unlimited reminders', 'Goal management', 'Social & communities', 'Export CSV & PDF', 'Priority support', 'Streak Freeze'].map((f, i) => (
                <div key={i} className="flex items-center gap-3 mb-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(139,92,246,0.2)' }}>
                    <FiCheck size={11} style={{ color: '#a78bfa' }} />
                  </div>
                  <span className="text-sm text-gray-200">{f}</span>
                </div>
              ))}
              <Link to="/register" className="btn-primary w-full justify-center mt-8 rounded-2xl">
                Get Premium {pricingAnnual ? '(Best Value)' : ''}
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────── */}
      <section id="faq" className="py-24 px-6" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <div className="badge badge-warning mb-4 inline-flex">❓ FAQ</div>
            <h2 className="text-4xl font-black font-display">Common <span className="gradient-text">Questions</span></h2>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((faq, i) => <FAQItem key={i} {...faq} index={i} />)}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────── */}
      <section className="py-24 px-6">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center glass-card p-6 sm:p-12 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.4) 0%, transparent 70%)' }} />
          </div>
          <div className="relative">
            <div className="text-5xl sm:text-6xl mb-6">🚀</div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-5 font-display">
              Your Best Self Starts <span className="gradient-text">Today</span>
            </h2>
            <p className="text-base sm:text-lg mb-8" style={{ color: '#94a3b8' }}>
              Join 50,000+ people building extraordinary lives with HabitFlow. Free forever, no credit card required.
            </p>
            <Link to="/register" className="btn-primary text-sm sm:text-lg px-6 py-3.5 sm:px-10 sm:py-4 rounded-2xl inline-flex items-center justify-center gap-2">
              Start Your Journey Free <FiArrowRight size={18} />
            </Link>
            <p className="mt-4 text-sm" style={{ color: '#475569' }}>
              ⚡ Set up in 60 seconds · 🔒 Cancel anytime · 💎 Free plan forever
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ────────────────────────────────────── */}
      <footer className="py-12 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
                  🎯
                </div>
                <span className="font-bold gradient-text">HabitFlow</span>
              </div>
              <p className="text-sm leading-relaxed mb-4" style={{ color: '#64748b' }}>
                The premium habit tracker for serious achievers. Build better habits, build a better life.
              </p>
              <div className="flex gap-3">
                {[FiTwitter, FiGithub, FiLinkedin].map((Icon, i) => (
                  <button key={i} className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#f1f5f9'}
                    onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
                    <Icon size={15} />
                  </button>
                ))}
              </div>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
              { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="text-sm font-semibold text-white mb-4">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="text-sm transition-colors" style={{ color: '#64748b' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#f1f5f9'}
                        onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="divider" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm" style={{ color: '#475569' }}>
            <span>© {new Date().getFullYear()} HabitFlow. All rights reserved.</span>
            <span>Made with ❤️ for habit builders worldwide</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
