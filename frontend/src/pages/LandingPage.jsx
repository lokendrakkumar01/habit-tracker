import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import {
  FiCheck, FiArrowRight, FiZap, FiTrendingUp, FiAward,
  FiCalendar, FiUsers, FiStar, FiBarChart2, FiTarget,
  FiBookOpen, FiCpu, FiShield, FiSmile, FiChevronDown,
  FiPlay, FiGithub, FiTwitter, FiLinkedin, FiFlag,
} from 'react-icons/fi';
import { MdEmojiEvents } from 'react-icons/md';

const fade = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

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
      style={{ border: '1px solid var(--border-default)', background: 'var(--bg-card)' }}
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

export default function LandingPage() {
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 80], ['rgba(2,6,23,0)', 'rgba(2,6,23,0.85)']);
  const navBorder = useTransform(scrollY, [0, 80], ['rgba(255,255,255,0)', 'rgba(255,255,255,0.06)']);

  const [pricingAnnual, setPricingAnnual] = useState(true);

  const monthlyPrice = pricingAnnual ? 6.99 : 9.99;
  const annualTotal  = (monthlyPrice * 12).toFixed(0);

  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{ background: 'var(--bg-primary)' }}>

      <motion.nav
        style={{ backgroundColor: navBg, borderBottomColor: navBorder }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b backdrop-blur-xl transition-all"
      >
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 4px 16px rgba(124,58,237,0.4)' }}>
            🎯
          </div>
          <span className="text-lg font-bold gradient-text">HabitFlow</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-secondary text-xs sm:text-sm px-3.5 py-2 whitespace-nowrap">Sign In</Link>
          <Link to="/register" className="btn-primary text-xs sm:text-sm px-3.5 py-2 whitespace-nowrap">
            <span className="hidden sm:inline">Get Started Free</span>
            <span className="sm:hidden">Sign Up</span>
          </Link>
        </div>
      </motion.nav>

      <section className="relative pt-36 pb-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-35"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)' }} />
          <div className="absolute top-1/3 left-0 w-[450px] h-[450px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.35) 0%, transparent 70%)' }} />
          <div className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)' }} />
          <div className="absolute inset-0 opacity-[0.02] bg-mesh" />
        </div>

        <motion.div className="relative max-w-5xl mx-auto" variants={stagger} initial="hidden" animate="visible">
          <motion.div variants={fade} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8 badge badge-primary">
            <FiZap className="text-yellow-400" size={13} />
            ✨ AI-POWERED PRODUCTIVITY COACH — NOW ACTIVE
          </motion.div>

          <motion.h1 variants={fade} className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-[1.1] tracking-tight font-display">
            Build Habits That<br />
            <span className="gradient-text">Actually Stick</span>
          </motion.h1>

          <motion.p variants={fade} className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            The most powerful habit tracker for serious achievers. Track progress, crush streaks, achieve goals, and transform your routine with AI coaching.
          </motion.p>

          <motion.div variants={fade} className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <Link to="/register" className="btn-primary text-sm sm:text-base px-8 py-4 rounded-2xl w-full sm:w-auto justify-center">
              Start Free Today <FiArrowRight size={16} />
            </Link>
            <button className="btn-secondary text-sm sm:text-base px-8 py-4 rounded-2xl flex items-center gap-2 justify-center w-full sm:w-auto">
              <FiPlay size={16} /> Watch Demo
            </button>
          </motion.div>
          <motion.p variants={fade} className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Free forever · No credit card required · 5 habits included
          </motion.p>

          <div className="w-full flex justify-center mt-20 px-4 md:px-0">
            <motion.div variants={fade} className="relative w-full max-w-5xl">
              <div className="absolute -inset-8 rounded-full opacity-25 blur-3xl pointer-events-none"
                style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.5),rgba(56,189,248,0.3))' }} />
              <div className="relative rounded-3xl overflow-hidden glass-card-static" style={{ border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-lg)' }}>
              
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.01)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="ml-3 text-xs tracking-wider" style={{ color: 'var(--text-muted)' }}>habitflow.app/dashboard</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-1.5 rounded-full" style={{ background: 'var(--border-subtle)' }} />
                  <div className="w-10 h-1.5 rounded-full" style={{ background: 'var(--border-subtle)' }} />
                </div>
              </div>

              <div className="flex flex-col md:flex-row min-h-[460px] text-left">
                
                <div className="w-full md:w-56 p-5 hidden md:flex flex-col gap-6" style={{ borderRight: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.01)' }}>
                  <div className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: 'rgba(124,58,237,0.1)' }}>
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-violet-600 text-xs">📊</div>
                    <span className="text-xs font-semibold text-white">Dashboard</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {[
                      { icon: '🎯', label: 'Habits' },
                      { icon: '🏆', label: 'Goals' },
                      { icon: '📔', label: 'Journal' },
                      { icon: '📈', label: 'Analytics' },
                      { icon: '👥', label: 'Social' },
                      { icon: '⚙️', label: 'Settings' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs">
                          {item.icon}
                        </div>
                        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex-1 p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                      <h3 className="text-xl font-bold text-white">Welcome back, Priya! 👋</h3>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Here is your daily habit breakdown</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)' }}>
                      <span className="text-xs font-black text-violet-300">Level 3</span>
                      <div className="w-20 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                        <div className="h-full rounded-full bg-violet-500" style={{ width: '65%' }} />
                      </div>
                      <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>65% XP</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                      { label: "Today's Progress", value: '6 / 8 Completed', change: '75%', up: true, color: '#a78bfa' },
                      { label: 'Current Streak', value: '🔥 42 Days', change: 'Best: 60d', up: true, color: '#fb923c' },
                      { label: 'Total XP Earned', value: '⚡ 2,840 XP', change: '+180 Today', up: true, color: '#fbbf24' },
                      { label: 'Focus Score', value: '📈 94% Consistency', change: '+2% vs LW', up: true, color: '#34d399' },
                    ].map((stat, i) => (
                      <div key={i} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
                        <div className="text-[10px] uppercase font-bold tracking-wider mb-2.5" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
                        <div className="text-base font-extrabold text-white mb-1.5" style={{ color: stat.color }}>{stat.value}</div>
                        <div className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>{stat.change}</div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Today's Habit Checklist</h4>
                      <div className="space-y-3">
                        {[
                          { icon: '🏃', name: 'Morning Run', streak: 42, done: true, cat: 'Fitness' },
                          { icon: '📚', name: 'Read 30 mins', streak: 28, done: true, cat: 'Learning' },
                          { icon: '💻', name: 'Code Daily', streak: 60, done: false, cat: 'Coding' },
                          { icon: '🧘', name: 'Meditate', streak: 15, done: false, cat: 'Wellness' },
                        ].map((h, i) => (
                          <div key={i} className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-left"
                            style={{
                              background: h.done ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.03)',
                              border: `1px solid ${h.done ? 'rgba(16,185,129,0.18)' : 'rgba(255,255,255,0.06)'}`,
                            }}>
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{h.icon}</span>
                              <div>
                                <div className="text-sm font-semibold" style={{ color: h.done ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: h.done ? 'line-through' : 'none' }}>{h.name}</div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}>{h.cat}</span>
                                  <span className="text-[10px] text-amber-400 font-bold">🔥 {h.streak}d</span>
                                </div>
                              </div>
                            </div>
                            <button className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${h.done ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-white/5 text-gray-500 border border-white/10'}`}>
                              {h.done ? '✓' : '○'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Weekly Consistency Trend</h4>
                      <div className="rounded-2xl p-5 flex flex-col justify-between h-[235px]" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
                        <div className="flex justify-between items-end gap-2 flex-1 pb-4">
                          {[
                            { day: 'M', val: '40%' },
                            { day: 'T', val: '65%' },
                            { day: 'W', val: '80%' },
                            { day: 'T', val: '55%' },
                            { day: 'F', val: '90%' },
                            { day: 'S', val: '75%' },
                            { day: 'S', val: '95%' },
                          ].map((bar, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                              <div className="w-full rounded-t-lg transition-all" style={{ height: bar.val, background: 'linear-gradient(to top, #6366f1, #a78bfa)', boxShadow: '0 0 10px rgba(139,92,246,0.3)' }} />
                              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{bar.day}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                          <span>Avg. Success: 71.4%</span>
                          <span className="text-emerald-400 font-bold">Excellent (+5%)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </motion.div>
      </section>

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
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="badge badge-primary mb-4 inline-flex">Everything You Need</div>
            <h2 className="text-4xl md:text-5xl font-black mb-5 font-display">
              <span className="gradient-text">Supercharged</span> Habit Building
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
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
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-24 px-6" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="badge badge-success mb-4 inline-flex">💬 Real Stories</div>
            <h2 className="text-4xl md:text-5xl font-black mb-5 font-display">Loved by <span className="gradient-text">Thousands</span></h2>
            <p style={{ color: 'var(--text-secondary)' }}>Join 50,000+ achievers building better habits every day</p>
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
                <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: `linear-gradient(135deg,${t.color},${t.color}99)` }}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <div className="badge badge-info mb-4 inline-flex">💎 Simple Pricing</div>
            <h2 className="text-4xl md:text-5xl font-black mb-5 font-display">Start <span className="gradient-text">Free</span>, Scale Later</h2>

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
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="glass-card p-6 sm:p-8">
              <div className="text-sm font-semibold text-gray-400 mb-2">Free Plan</div>
              <div className="text-5xl font-black text-white mb-1">$0</div>
              <div className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Forever free, no credit card</div>
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
            <p className="text-base sm:text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
              Join 50,000+ people building extraordinary lives with HabitFlow. Free forever, no credit card required.
            </p>
            <Link to="/register" className="btn-primary text-sm sm:text-lg px-6 py-3.5 sm:px-10 sm:py-4 rounded-2xl inline-flex items-center justify-center gap-2">
              Start Your Journey Free <FiArrowRight size={18} />
            </Link>
            <p className="mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>
              ⚡ Set up in 60 seconds · 🔒 Cancel anytime · 💎 Free plan forever
            </p>
          </div>
        </motion.div>
      </section>

      <footer className="py-12 px-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
                  🎯
                </div>
                <span className="font-bold gradient-text">HabitFlow</span>
              </div>
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
                The premium habit tracker for serious achievers. Build better habits, build a better life.
              </p>
              <div className="flex gap-3">
                {[FiTwitter, FiGithub, FiLinkedin].map((Icon, i) => (
                  <button key={i} className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors animate-fade-up"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#f1f5f9'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
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
                      <a href="#" className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#f1f5f9'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="divider" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
            <span>© {new Date().getFullYear()} HabitFlow. All rights reserved.</span>
            <span>Made with ❤️ for habit builders worldwide</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
