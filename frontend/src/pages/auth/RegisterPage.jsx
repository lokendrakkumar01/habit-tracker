import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { registerUser, clearError } from '../../features/auth/authSlice';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiCheck, FiArrowRight } from 'react-icons/fi';
import { FaGoogle } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getStrength = (pwd) => {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
};

const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

export default function RegisterPage() {
  const dispatch = useDispatch();
  const { loading, error, successMessage } = useSelector((s) => s.auth);

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [terms, setTerms] = useState(false);
  const [done, setDone] = useState(false);

  const strength = getStrength(form.password);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (successMessage) setDone(true);
  }, [successMessage]);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!form.email) {
      toast.error('Please enter your email');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (!terms) {
      toast.error('Please accept the terms');
      return;
    }
    dispatch(registerUser({ name: form.name, email: form.email, password: form.password }));
  };

  const isEmailVerify = successMessage?.toLowerCase().includes('verify') || successMessage?.toLowerCase().includes('email');

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-emerald-500/15 border-2 border-emerald-500"
        >
          <FiCheck size={36} className="text-emerald-400" />
        </motion.div>
        <h3 className="text-xl font-bold text-white mb-3">
          {isEmailVerify ? 'Check your email! 📬' : 'Account Created! 🎉'}
        </h3>
        <p className="text-sm mb-6 text-slate-400 leading-relaxed">
          {isEmailVerify ? (
            <>We sent a verification link to <span className="text-violet-400 font-semibold">{form.email}</span>.<br />Click it to activate your account.</>
          ) : (
            <>Your account has been created successfully.<br />You can now sign in using your credentials.</>
          )}
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-600/20 hover:shadow-xl hover:shadow-violet-650/30 transition-all duration-200"
        >
          Go to Login <FiArrowRight size={14} />
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-1">Create account ✨</h2>
        <p className="text-sm text-slate-400">Start building better habits today</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider text-slate-450">
            Full Name
          </label>
          <div className="relative flex items-center text-slate-500 focus-within:text-violet-400">
            <FiUser size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
            <input
              name="name"
              type="text"
              placeholder="Lokendra Kumar"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
              className="w-full rounded-xl py-3 pl-10 pr-4 text-sm text-white outline-none bg-white/5 border border-white/10 focus:border-violet-500/80 focus:ring-4 focus:ring-violet-500/10 transition-all duration-200"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider text-slate-450">
            Email Address
          </label>
          <div className="relative flex items-center text-slate-500 focus-within:text-violet-400">
            <FiMail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              className="w-full rounded-xl py-3 pl-10 pr-4 text-sm text-white outline-none bg-white/5 border border-white/10 focus:border-violet-500/80 focus:ring-4 focus:ring-violet-500/10 transition-all duration-200"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider text-slate-450">
            Password
          </label>
          <div className="relative flex items-center text-slate-500 focus-within:text-violet-400">
            <FiLock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
            <input
              name="password"
              type={showPwd ? 'text' : 'password'}
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              className="w-full rounded-xl py-3 pl-10 pr-11 text-sm text-white outline-none bg-white/5 border border-white/10 focus:border-violet-500/80 focus:ring-4 focus:ring-violet-500/10 transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              tabIndex={-1}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 transition-colors hover:text-white"
            >
              {showPwd ? <FiEyeOff size={15} /> : <FiEye size={15} />}
            </button>
          </div>

          <AnimatePresence>
            {form.password && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 px-1"
              >
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="flex-1 h-1 rounded-full transition-all duration-500"
                      style={{ background: strength >= i ? strengthColor[strength] : 'rgba(255,255,255,0.08)' }}
                    />
                  ))}
                </div>
                <p
                  className="text-xs font-semibold"
                  style={{ color: strength ? strengthColor[strength] : 'transparent' }}
                >
                  {strengthLabel[strength]}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider text-slate-455">
            Confirm Password
          </label>
          <div className="relative flex items-center text-slate-500 focus-within:text-violet-400">
            <FiLock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
            <input
              name="confirm"
              type={showConf ? 'text' : 'password'}
              placeholder="Repeat your password"
              value={form.confirm}
              onChange={handleChange}
              autoComplete="new-password"
              className={`w-full rounded-xl py-3 pl-10 pr-11 text-sm text-white outline-none bg-white/5 border transition-all duration-200 ${
                form.confirm && form.confirm !== form.password
                  ? 'border-red-500/50 focus:border-red-500/80 focus:ring-4 focus:ring-red-500/10'
                  : 'border-white/10 focus:border-violet-500/80 focus:ring-4 focus:ring-violet-500/10'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConf((v) => !v)}
              tabIndex={-1}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 transition-colors hover:text-white"
            >
              {showConf ? <FiEyeOff size={15} /> : <FiEye size={15} />}
            </button>
          </div>
          {form.confirm && form.confirm !== form.password && (
            <p className="mt-1 text-xs font-semibold text-red-400">Passwords do not match</p>
          )}
        </div>

        <label className="flex items-start gap-3 cursor-pointer select-none pt-1">
          <button
            type="button"
            onClick={() => setTerms((v) => !v)}
            className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
              terms ? 'bg-violet-600 border-violet-600' : 'bg-white/5 border-white/20'
            }`}
          >
            {terms && <FiCheck size={10} className="text-white" strokeWidth={3} />}
          </button>
          <span className="text-xs leading-relaxed text-slate-400">
            I agree to the{' '}
            <span className="text-violet-400 hover:text-violet-300 cursor-pointer hover:underline">Terms of Service</span>
            {' '}and{' '}
            <span className="text-violet-400 hover:text-violet-300 cursor-pointer hover:underline">Privacy Policy</span>
          </span>
        </label>

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
            <>Create Account 🚀</>
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
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-violet-400 hover:text-violet-300 transition-colors">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
