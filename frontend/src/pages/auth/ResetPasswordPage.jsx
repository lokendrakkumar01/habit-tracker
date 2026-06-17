import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { resetPassword, clearError } from '../../features/auth/authSlice';
import { FiLock, FiEye, FiEyeOff, FiCheck, FiArrowLeft } from 'react-icons/fi';

export default function ResetPasswordPage() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { loading, error } = useSelector((s) => s.auth);

  const [form, setForm]      = useState({ password: '', confirm: '' });
  const [showPwd, setShowPwd]  = useState(false);
  const [done, setDone]      = useState(false);
  const [focused, setFocused] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) { toast.error('Invalid reset link'); return; }
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    const res = await dispatch(resetPassword({ token, password: form.password }));
    if (resetPassword.fulfilled.match(res)) setDone(true);
  };

  const inputCls = (name) =>
    `w-full bg-white/5 border rounded-xl px-4 py-3 pl-11 text-white text-sm placeholder-white/30 outline-none transition-all pr-11 ${focused === name ? 'border-violet-500 shadow-[0_0_0_3px_rgba(139,92,246,0.15)]' : 'border-white/10'}`;

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto mb-6">
          <FiCheck size={36} className="text-green-400" />
        </motion.div>
        <h3 className="text-xl font-bold text-white mb-2">Password Reset! 🎉</h3>
        <p className="text-white/50 text-sm mb-6">Your password has been updated. You can now sign in.</p>
        <Link to="/login"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}>
          Sign In
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="mb-8 text-center">
        <div className="text-4xl mb-3">🔑</div>
        <h2 className="text-2xl font-bold text-white">New password</h2>
        <p className="mt-1 text-sm text-white/40">Choose a strong password for your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <FiLock size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${focused === 'password' ? 'text-violet-400' : 'text-white/30'}`} />
          <input type={showPwd ? 'text' : 'password'} placeholder="New password" value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
            className={inputCls('password')} />
          <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
            {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        </div>
        <div className="relative">
          <FiLock size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${focused === 'confirm' ? 'text-violet-400' : 'text-white/30'}`} />
          <input type="password" placeholder="Confirm new password" value={form.confirm}
            onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))}
            onFocus={() => setFocused('confirm')} onBlur={() => setFocused('')}
            className={inputCls('confirm')} />
        </div>

        <motion.button type="submit" disabled={loading}
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white text-sm"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}>
          {loading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> : 'Reset Password'}
        </motion.button>
      </form>

      <p className="mt-6 text-center">
        <Link to="/login" className="text-violet-400 hover:text-violet-300 text-xs font-medium flex items-center gap-1 justify-center">
          <FiArrowLeft size={12} /> Back to Login
        </Link>
      </p>
    </motion.div>
  );
}
