import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheck, FiTrendingUp, FiZap, FiAward, FiCalendar, FiUsers, FiArrowRight, FiStar } from 'react-icons/fi';

const features = [
  { icon: '🎯', title: 'Smart Habit Tracking', desc: 'Create unlimited habits with custom schedules, reminders, and priority levels.' },
  { icon: '🔥', title: 'Streak Tracking', desc: 'Stay motivated with streaks, milestones, and consecutive completion tracking.' },
  { icon: '📊', title: 'Deep Analytics', desc: 'Visualize your progress with beautiful charts, heatmaps, and performance reports.' },
  { icon: '🏆', title: 'Gamification', desc: 'Earn XP, unlock achievements, climb leaderboards, and level up your habits.' },
  { icon: '🎯', title: 'Goal Setting', desc: 'Set meaningful goals, link habits, and track milestones toward your dreams.' },
  { icon: '📔', title: 'Reflection Journal', desc: 'Daily journaling with mood tracking to stay self-aware and motivated.' },
];

const stats = [
  { value: '50K+', label: 'Active Users' },
  { value: '2M+', label: 'Habits Tracked' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '15M+', label: 'Streak Days' },
];

const testimonials = [
  { name: 'Priya Sharma', role: 'Software Engineer', text: 'HabitFlow transformed my daily routine. I\'ve maintained a 60-day coding streak!', avatar: '👩‍💻' },
  { name: 'Arjun Verma', role: 'Fitness Coach', text: 'The analytics are incredible. I can see exactly where I need to improve.', avatar: '💪' },
  { name: 'Meera Patel', role: 'Student', text: 'The gamification keeps me going even on tough days. Love the achievement badges!', avatar: '📚' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-hero text-dark-100 font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 glass-dark border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          <span className="text-xl font-bold gradient-text">HabitFlow</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-dark-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-secondary text-sm px-4 py-2">Sign In</Link>
          <Link to="/register" className="btn-primary text-sm px-4 py-2">Get Started Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center max-w-6xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 badge-primary">
            <FiZap className="text-yellow-400" /> New: AI-powered habit suggestions
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            Build Habits That
            <span className="gradient-text block">Actually Stick</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-xl text-dark-400 max-w-2xl mx-auto mb-10 text-balance">
            Track habits, build streaks, achieve goals, and transform your life with the most powerful habit tracker built for serious achievers.
          </motion.p>
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-lg px-8 py-4 rounded-2xl">
              Start Free Today <FiArrowRight />
            </Link>
            <Link to="/login" className="btn-secondary text-lg px-8 py-4 rounded-2xl">
              Sign In
            </Link>
          </motion.div>
          <motion.p variants={itemVariants} className="mt-4 text-dark-500 text-sm">
            Free forever • No credit card required • 5 habits included
          </motion.p>

          {/* Hero Visual */}
          <motion.div variants={itemVariants} className="mt-16 relative">
            <div className="glass-card p-6 max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-dark-500 text-sm ml-2">habitflow.app/dashboard</span>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                  { label: 'Today\'s Habits', value: '6/8', color: 'text-primary-400' },
                  { label: 'Current Streak', value: '🔥 42', color: 'text-orange-400' },
                  { label: 'XP Points', value: '⭐ 2,840', color: 'text-yellow-400' },
                ].map((s, i) => (
                  <div key={i} className="glass rounded-xl p-4 text-center">
                    <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-dark-500 text-xs mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {[
                  { icon: '🏃', name: 'Morning Run', streak: 42, done: true },
                  { icon: '📚', name: 'Read 30 mins', streak: 28, done: true },
                  { icon: '💻', name: 'Code Daily', streak: 60, done: false },
                ].map((h, i) => (
                  <div key={i} className="flex items-center gap-3 glass rounded-xl p-3">
                    <span className="text-2xl">{h.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-dark-100">{h.name}</div>
                      <div className="text-xs text-dark-500">🔥 {h.streak} day streak</div>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${h.done ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'border border-white/10 text-dark-500'}`}>
                      {h.done ? '✓' : '○'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Glow */}
            <div className="absolute -inset-4 bg-primary-500/10 blur-3xl rounded-full -z-10"></div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="text-center">
              <div className="text-4xl font-black gradient-text mb-1">{stat.value}</div>
              <div className="text-dark-500 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 gradient-text">Everything You Need</h2>
            <p className="text-dark-400 text-lg">Powerful features to help you build lasting habits</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="glass-card p-6 group">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold text-dark-100 mb-2">{f.title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 gradient-text">Simple Pricing</h2>
            <p className="text-dark-400">Start free, upgrade when you need more</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Free */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} className="glass-card p-8">
              <div className="text-lg font-semibold text-dark-300 mb-1">Free</div>
              <div className="text-5xl font-black text-white mb-1">$0</div>
              <div className="text-dark-500 text-sm mb-6">Forever free</div>
              {['Up to 5 habits', 'Basic analytics', 'Standard reminders', 'Streak tracking', 'Journal access'].map((f, i) => (
                <div key={i} className="flex items-center gap-2 mb-3 text-sm text-dark-300">
                  <FiCheck className="text-green-400" /> {f}
                </div>
              ))}
              <Link to="/register" className="btn-secondary w-full justify-center mt-6 rounded-xl">Get Started Free</Link>
            </motion.div>
            {/* Premium */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} className="glass-card p-8 border border-primary-500/30 glow-primary relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 badge-primary text-xs px-3 py-1">MOST POPULAR</div>
              <div className="text-lg font-semibold gradient-text mb-1">Premium</div>
              <div className="text-5xl font-black text-white mb-1">$9.99<span className="text-lg text-dark-400">/mo</span></div>
              <div className="text-dark-500 text-sm mb-6">or $79.99/year (save 33%)</div>
              {['Unlimited habits', 'Advanced analytics', 'Unlimited reminders', 'Goal management', 'Social features', 'Export CSV & PDF', 'Priority support', 'AI suggestions'].map((f, i) => (
                <div key={i} className="flex items-center gap-2 mb-3 text-sm text-dark-200">
                  <FiCheck className="text-primary-400" /> {f}
                </div>
              ))}
              <Link to="/register" className="btn-primary w-full justify-center mt-6 rounded-xl">Get Premium</Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 gradient-text">Loved by Thousands</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <FiStar key={j} className="text-yellow-400 fill-yellow-400" size={14} />)}
                </div>
                <p className="text-dark-300 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full glass flex items-center justify-center text-xl">{t.avatar}</div>
                  <div>
                    <div className="text-sm font-semibold text-dark-100">{t.name}</div>
                    <div className="text-xs text-dark-500">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto text-center glass-card p-12">
          <div className="text-5xl mb-4">🚀</div>
          <h2 className="text-4xl font-bold mb-4 gradient-text">Start Your Journey Today</h2>
          <p className="text-dark-400 mb-8">Join thousands of people building better habits with HabitFlow.</p>
          <Link to="/register" className="btn-primary text-lg px-10 py-4 rounded-2xl">
            Get Started Free <FiArrowRight />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-2xl">🎯</span>
          <span className="font-bold gradient-text">HabitFlow</span>
        </div>
        <p className="text-dark-500 text-sm">© 2024 HabitFlow. Build better habits, build a better life.</p>
      </footer>
    </div>
  );
}
