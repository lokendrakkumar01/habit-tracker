import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <div
      style={{ background: 'radial-gradient(ellipse at top, rgba(124,58,237,0.1) 0%, transparent 60%), #020617' }}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
    >
      {}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ background: 'rgba(124,58,237,0.2)', filter: 'blur(130px)' }}
          className="absolute -top-40 -left-40 h-96 w-96 rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          style={{ background: 'rgba(99,102,241,0.2)', filter: 'blur(130px)' }}
          className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full"
        />
      </div>

      {}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {}
        <div className="relative flex h-28 w-28 items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, transparent 70%, #7c3aed, #6366f1, #7c3aed)',
              padding: '3px',
            }}
          >
            <div className="h-full w-full rounded-full" style={{ background: '#020617' }} />
          </motion.div>

          <motion.span
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="relative z-10 text-4xl select-none"
          >
            🎯
          </motion.span>
        </div>

        {}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-extrabold"
          style={{ background: 'linear-gradient(135deg,#a78bfa,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          HabitFlow
        </motion.h1>

        {}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: '#a78bfa' }}>Loading</span>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span key={i}
                animate={{ opacity: [0.2, 1, 0.2], y: [0, -4, 0] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut', delay: i * 0.18 }}
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: 'linear-gradient(135deg,#a78bfa,#818cf8)' }}
              />
            ))}
          </div>
        </div>

        {}
        <div className="h-0.5 w-48 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            className="h-full w-1/2 rounded-full"
            style={{ background: 'linear-gradient(90deg, transparent, #7c3aed, transparent)' }}
          />
        </div>
      </div>
    </div>
  );
}
