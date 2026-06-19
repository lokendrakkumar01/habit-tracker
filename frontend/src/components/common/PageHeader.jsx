import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0, y: -12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.08 },
  },
};

const childVariants = {
  hidden:  { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function PageHeader({ title, subtitle, action }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
    >
      
      <div className="flex flex-col gap-1">
        <motion.h2
          variants={childVariants}
          className="text-2xl font-extrabold tracking-tight sm:text-3xl bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent leading-tight"
        >
          {title}
        </motion.h2>

        {subtitle && (
          <motion.p
            variants={childVariants}
            className="text-sm text-gray-500 max-w-xl leading-relaxed"
          >
            {subtitle}
          </motion.p>
        )}
      </div>

      {action && (
        <motion.div
          variants={childVariants}
          className="flex-shrink-0 self-start sm:self-center"
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
}
