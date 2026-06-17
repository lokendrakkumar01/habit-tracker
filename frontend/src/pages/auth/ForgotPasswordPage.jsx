import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { forgotPassword, clearError } from '../../features/auth/authSlice';
import { FiMail, FiArrowLeft, FiSend } from 'react-icons/fi';

export default function ForgotPasswordPage() {
  const dispatch = useDispatch();
  const { loading, error, successMessage } = useSelector((s) => s.auth);
  const [email, setEmail]   = useState('');
  const [focused, setFocused] = useState(false);
  const [sent, setSent]     = useState(false);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error, dispatch]);

  useEffect(() => {
    if (successMessage) setSent(true);
  }, [successMessage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) { toast.error('Enter your email'); return; }
    dispatch(forgotPassword(email));
  };

  if (sent) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
        <div className="text-6xl mb-4">📧</div>
        <h3 className="text-xl font-bold text-white mb-2">Check your inbox</h3>
        <p className="text-white/50 text-sm mb-6">
          If <span className="text-violet-400">{email}</span> is registered,<br />
          you'll receive a reset link shortly.
        </p>
        <Link to="/login" className="text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors flex items-center gap-1 justify-center">
          <FiArrowLeft size={14} /> Back to Login
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="mb-8 text-center">
        <div className="text-4xl mb-3">🔐</div>
        <h2 className="text-2xl font-bold text-white">Forgot password?</h2>
        <p className="mt-1 text-sm text-white/40">Enter your email and we'll send a reset link</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <FiMail size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${focused ? 'text-violet-400' : 'text-white/30'}`} />
          <input type="email" placeholder="Email address" value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            className={`w-full bg-white/5 border rounded-xl px-4 py-3 pl-11 text-white text-sm placeholder-white/30 outline-none transition-all ${focused ? 'border-violet-500 shadow-[0_0_0_3px_rgba(139,92,246,0.15)]' : 'border-white/10'}`} />
        </div>

        <motion.button type="submit" disabled={loading}
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white text-sm"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}>
          {loading
            ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
            : <><FiSend size={14} /> Send Reset Link</>}
        </motion.button>
      </form>

      <p className="mt-6 text-center text-xs text-white/40">
        <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1 justify-center">
          <FiArrowLeft size={12} /> Back to Login
        </Link>
      </p>
    </motion.div>
  );
}
