import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { loginUser, clearError } from '../../features/auth/authSlice';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { FaGoogle } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate  = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);

  const [form, setForm]           = useState({ email: '', password: '' });
  const [showPwd, setShowPwd]     = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [focused, setFocused]     = useState('');

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error, dispatch]);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill in all fields'); return; }
    const res = await dispatch(loginUser({ ...form, rememberMe }));
    if (loginUser.fulfilled.match(res)) {
      toast.success('Welcome back! 🎉');
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      
      <div className="mb-7 text-center">
        <h2 className="text-2xl font-bold text-white mb-1">Welcome back 👋</h2>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Sign in to continue your journey
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>

        <div>
          <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Email Address
          </label>
          <div className="relative">
            <FiMail
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: focused === 'email' ? '#a78bfa' : 'rgba(255,255,255,0.3)' }}
            />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused('')}
              className="w-full rounded-xl py-3 pl-10 pr-4 text-sm text-white outline-none transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: focused === 'email'
                  ? '1px solid rgba(139,92,246,0.7)'
                  : '1px solid rgba(255,255,255,0.1)',
                boxShadow: focused === 'email' ? '0 0 0 3px rgba(139,92,246,0.12)' : 'none',
              }}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Password
          </label>
          <div className="relative">
            <FiLock
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: focused === 'password' ? '#a78bfa' : 'rgba(255,255,255,0.3)' }}
            />
            <input
              id="password"
              name="password"
              type={showPwd ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused('')}
              className="w-full rounded-xl py-3 pl-10 pr-11 text-sm text-white outline-none transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: focused === 'password'
                  ? '1px solid rgba(139,92,246,0.7)'
                  : '1px solid rgba(255,255,255,0.1)',
                boxShadow: focused === 'password' ? '0 0 0 3px rgba(139,92,246,0.12)' : 'none',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors p-1"
              style={{ color: 'rgba(255,255,255,0.3)' }}
              tabIndex={-1}
            >
              {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <button
              type="button"
              onClick={() => setRememberMe((v) => !v)}
              className="w-4 h-4 rounded border flex items-center justify-center transition-all flex-shrink-0"
              style={{
                background: rememberMe ? '#7c3aed' : 'rgba(255,255,255,0.05)',
                border: rememberMe ? '1px solid #7c3aed' : '1px solid rgba(255,255,255,0.2)',
              }}
            >
              {rememberMe && (
                <svg viewBox="0 0 10 8" className="w-2.5 h-2 fill-none stroke-white" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M1 4l2.5 2.5L9 1" />
                </svg>
              )}
            </button>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Remember me</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-xs font-medium transition-colors"
            style={{ color: '#a78bfa' }}
          >
            Forgot password?
          </Link>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.01 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white text-sm transition-all"
          style={{
            background: loading ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            boxShadow: loading ? 'none' : '0 4px 20px rgba(124,58,237,0.4)',
          }}
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 rounded-full"
              style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }}
            />
          ) : (
            <>Sign In <FiArrowRight size={15} /></>
          )}
        </motion.button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
        <span className="text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>or</span>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
      </div>

      <motion.button
        type="button"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => { window.location.href = `${API_URL}/auth/google`; }}
        className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium transition-all"
        style={{
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'rgba(255,255,255,0.05)',
          color: '#fff',
        }}
      >
        <FaGoogle size={16} className="text-red-400" />
        Continue with Google
      </motion.button>

      <p className="mt-6 text-center text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-semibold transition-colors" style={{ color: '#a78bfa' }}>
          Create one free
        </Link>
      </p>
    </motion.div>
  );
}
