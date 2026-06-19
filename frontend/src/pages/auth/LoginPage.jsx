import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { loginUser, clearError } from '../../features/auth/authSlice';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { FaGoogle } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
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
        <p className="text-sm text-slate-400">
          Sign in to continue your journey
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider text-slate-400">
            Email Address
          </label>
          <div className="relative flex items-center text-slate-500 focus-within:text-violet-400">
            <FiMail
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none"
            />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-xl py-3 pl-10 pr-4 text-sm text-white outline-none bg-white/5 border border-white/10 focus:border-violet-500/80 focus:ring-4 focus:ring-violet-500/10 transition-all duration-200"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider text-slate-400">
            Password
          </label>
          <div className="relative flex items-center text-slate-500 focus-within:text-violet-400">
            <FiLock
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none"
            />
            <input
              id="password"
              name="password"
              type={showPwd ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-xl py-3 pl-10 pr-11 text-sm text-white outline-none bg-white/5 border border-white/10 focus:border-violet-500/80 focus:ring-4 focus:ring-violet-500/10 transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors p-1 hover:text-white"
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
              className={`w-4 h-4 rounded border flex items-center justify-center transition-all flex-shrink-0 ${
                rememberMe ? 'bg-violet-600 border-violet-600' : 'bg-white/5 border-white/20'
              }`}
            >
              {rememberMe && (
                <svg viewBox="0 0 10 8" className="w-2.5 h-2 fill-none stroke-white" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M1 4l2.5 2.5L9 1" />
                </svg>
              )}
            </button>
            <span className="text-xs text-slate-400">Remember me</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.01 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm transition-all shadow-md ${
            loading
              ? 'bg-violet-600/50 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-violet-600/20 hover:shadow-lg hover:shadow-violet-650/30'
          }`}
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 rounded-full border-white/30 border-t-white"
            />
          ) : (
            <>Sign In <FiArrowRight size={15} /></>
          )}
        </motion.button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs uppercase tracking-widest text-slate-500">or</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <motion.button
        type="button"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => { window.location.href = `${API_URL}/auth/google`; }}
        className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-semibold transition-all bg-white/5 border border-white/10 hover:bg-white/10 text-white"
      >
        <FaGoogle size={16} className="text-red-400" />
        Continue with Google
      </motion.button>

      <p className="mt-6 text-center text-xs text-slate-400">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-semibold text-violet-400 hover:text-violet-300 transition-colors">
          Create one free
        </Link>
      </p>
    </motion.div>
  );
}
