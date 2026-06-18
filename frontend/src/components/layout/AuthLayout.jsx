import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function AuthLayout() {
  const location = useLocation();
  const isRegister = location.pathname.includes('register');

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12"
      style={{
        background:
          'radial-gradient(ellipse at 20% 20%, rgba(124,58,237,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(99,102,241,0.12) 0%, transparent 50%), #020617',
      }}
    >
      {/* ── Animated orbs ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.1, 0.95, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full"
          style={{ background: 'rgba(124,58,237,0.18)', filter: 'blur(120px)' }}
        />
        <motion.div
          animate={{ x: [0, -50, 30, 0], y: [0, 40, -15, 0], scale: [1, 0.9, 1.05, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full"
          style={{ background: 'rgba(99,102,241,0.15)', filter: 'blur(140px)' }}
        />
        <motion.div
          animate={{ x: [0, 25, -10, 0], y: [0, -20, 35, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[300px] w-[300px] rounded-full"
          style={{ background: 'rgba(139,92,246,0.1)', filter: 'blur(90px)' }}
        />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* ── Card container ── */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full"
        style={{ maxWidth: isRegister ? '440px' : '420px' }}
      >
        {/* Logo */}
        <div className="mb-7 flex flex-col items-center gap-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
            className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
            style={{
              background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
              boxShadow: '0 8px 32px rgba(124,58,237,0.4)',
            }}
          >
            🎯
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold"
            style={{ background: 'linear-gradient(135deg,#a78bfa,#818cf8,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            HabitFlow
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            Build better habits, one day at a time
          </motion.p>
        </div>

        {/* Glass card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4, ease: 'easeOut' }}
          className="rounded-2xl p-8"
          style={{
            background: 'rgba(15,23,42,0.7)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
          }}
        >
          <Outlet />
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-5 text-center text-xs"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          © {new Date().getFullYear()} HabitFlow. All rights reserved.
        </motion.p>
      </motion.div>
    </div>
  );
}
