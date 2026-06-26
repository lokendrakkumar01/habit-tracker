
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';

const colorMap = {
  violet:  { bg: 'bg-violet-500/15',  icon: 'bg-violet-500/20 text-violet-400',  ring: 'ring-violet-500/20',  grad: 'from-violet-500 to-violet-700'  },
  indigo:  { bg: 'bg-indigo-500/15',  icon: 'bg-indigo-500/20 text-indigo-400',  ring: 'ring-indigo-500/20',  grad: 'from-indigo-500 to-indigo-700'  },
  emerald: { bg: 'bg-emerald-500/15', icon: 'bg-emerald-500/20 text-emerald-400',ring: 'ring-emerald-500/20', grad: 'from-emerald-500 to-emerald-700' },
  amber:   { bg: 'bg-amber-500/15',   icon: 'bg-amber-500/20 text-amber-400',    ring: 'ring-amber-500/20',   grad: 'from-amber-500 to-amber-700'   },
  rose:    { bg: 'bg-rose-500/15',    icon: 'bg-rose-500/20 text-rose-400',      ring: 'ring-rose-500/20',    grad: 'from-rose-500 to-rose-700'     },
  sky:     { bg: 'bg-sky-500/15',     icon: 'bg-sky-500/20 text-sky-400',        ring: 'ring-sky-500/20',     grad: 'from-sky-500 to-sky-700'       },
  fuchsia: { bg: 'bg-fuchsia-500/15', icon: 'bg-fuchsia-500/20 text-fuchsia-400',ring: 'ring-fuchsia-500/20', grad: 'from-fuchsia-500 to-fuchsia-700'},
};

const defaultColors = colorMap.violet;

function TrendBadge({ trend }) {
  if (trend === undefined || trend === null) return null;

  const isPositive = trend > 0;
  const isZero     = trend === 0;

  const Icon    = isZero ? FiMinus : isPositive ? FiTrendingUp : FiTrendingDown;
  const classes = isZero
    ? 'bg-gray-500/20 text-gray-400'
    : isPositive
    ? 'bg-emerald-500/20 text-emerald-400'
    : 'bg-rose-500/20 text-rose-400';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${classes}`}
    >
      <Icon className="text-[10px]" />
      {isZero ? '0%' : `${isPositive ? '+' : ''}${trend}%`}
    </span>
  );
}

export default function StatCard({
  title = 'Metric',
  value = '—',
  icon,
  color = 'violet',
  trend,
  subtitle,
}) {
  const c = colorMap[color] ?? defaultColors;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`
        relative overflow-hidden rounded-2xl border border-white/10
        bg-white/5 backdrop-blur-xl p-5 shadow-xl shadow-black/20
        ring-1 ${c.ring}
        transition-shadow duration-300 hover:shadow-2xl
      `}
    >
      
      <div
        className={`pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full ${c.bg} blur-2xl`}
      />

      <div className="relative flex items-start justify-between mb-4">
        
        <div
          className={`
            flex h-11 w-11 items-center justify-center rounded-xl
            ${c.icon} ring-1 ${c.ring} text-xl shadow-md
          `}
        >
          {icon}
        </div>

        <TrendBadge trend={trend} />
      </div>

      <div className="relative">
        <motion.p
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4, type: 'spring', stiffness: 200 }}
          className={`text-3xl font-extrabold tracking-tight bg-gradient-to-br ${c.grad} bg-clip-text text-transparent leading-none`}
        >
          {value}
        </motion.p>

        <p className="mt-1.5 text-sm font-medium text-gray-400">{title}</p>

        {subtitle && (
          <p className="mt-1 text-xs text-gray-600 truncate">{subtitle}</p>
        )}
      </div>

      <div
        className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${c.grad} opacity-40`}
      />
    </motion.div>
  );
}
