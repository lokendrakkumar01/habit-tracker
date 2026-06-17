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

  const [form, setForm]             = useState({ email: '', password: '' });
  const [showPwd, setShowPwd]       = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [focused, setFocused]       = useState('');

  /* Clear redux error when it pops */
  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error, dispatch]);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Fill in all fields'); return; }
    const res = await dispatch(loginUser({ ...form, rememberMe }));
    if (loginUser.fulfilled.match(res)) {
      toast.success('Welcome back! 🎉');
      navigate('/dashboard', { replace: true });
    }
  };

  const inputClass = (name) =>
    `w-full bg-white/5 border rounded-xl px-4 py-3 pl-11 text-white text-sm placeholder-white/30 outline-none transition-all duration-300 ${
      focused === name
        ? 'border-violet-500 shadow-[0_0_0_3px_rgba(139,92,246,0.15)]'
        : 'border-white/10 hover:border-white/20'
    }`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-white">Welcome back 👋</h2>
        <p className="mt-1 text-sm text-white/40">Sign in to continue your journey</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Email */}
        <div className="relative">
          <FiMail
            size={16}
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
              focused === 'email' ? 'text-violet-400' : 'text-white/30'
            }`}
          />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            onFocus={() => setFocused('email')}
            onBlur={() => setFocused('')}
            className={inputClass('email')}
          />
        </div>

        {/* Password */}
        <div className="relative">
          <FiLock
            size={16}
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
              focused === 'password' ? 'text-violet-400' : 'text-white/30'
            }`}
          />
          <input
            id="password"
            name="password"
            type={showPwd ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            onFocus={() => setFocused('password')}
            onBlur={() => setFocused('')}
            className={`${inputClass('password')} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
          >
            {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        </div>

        {/* Remember / Forgot */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={() => setRememberMe((v) => !v)}
              className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                rememberMe
                  ? 'bg-violet-600 border-violet-600'
                  : 'border-white/20 bg-white/5'
              }`}
            >
              {rememberMe && (
                <svg viewBox="0 0 10 8" className="w-2.5 h-2 fill-white">
                  <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                </svg>
              )}
            </div>
            <span className="text-xs text-white/50">Remember me</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white text-sm transition-all"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
          }}
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
            />
          ) : (
            <>Sign In <FiArrowRight size={15} /></>
          )}
        </motion.button>
      </form>

      {/* Divider */}
      <div className="my-5 flex items-center gap-3">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-white/30 uppercase tracking-widest">or</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Google */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => { window.location.href = `${API_URL}/auth/google`; }}
        className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all"
      >
        <FaGoogle size={16} className="text-red-400" />
        Continue with Google
      </motion.button>

      {/* Register link */}
      <p className="mt-6 text-center text-xs text-white/40">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
          Create one free
        </Link>
      </p>
    </motion.div>
  );
}
