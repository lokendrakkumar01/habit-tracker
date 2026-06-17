import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { registerUser, clearError } from '../../features/auth/authSlice';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import { FaGoogle } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getStrength = (pwd) => {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score; // 0–4
};

const strengthLabel  = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColor  = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

export default function RegisterPage() {
  const dispatch = useDispatch();
  const { loading, error, successMessage } = useSelector((s) => s.auth);

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd]     = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [terms, setTerms]         = useState(false);
  const [focused, setFocused]     = useState('');
  const [done, setDone]           = useState(false);

  const strength = getStrength(form.password);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error, dispatch]);

  useEffect(() => {
    if (successMessage) { setDone(true); }
  }, [successMessage]);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('Fill in all fields'); return; }
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (!terms) { toast.error('Please accept the terms'); return; }
    dispatch(registerUser({ name: form.name, email: form.email, password: form.password }));
  };

  const inputClass = (name) =>
    `w-full bg-white/5 border rounded-xl px-4 py-3 pl-11 text-white text-sm placeholder-white/30 outline-none transition-all duration-300 ${
      focused === name
        ? 'border-violet-500 shadow-[0_0_0_3px_rgba(139,92,246,0.15)]'
        : 'border-white/10 hover:border-white/20'
    }`;

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
          className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto mb-6"
        >
          <FiCheck size={36} className="text-green-400" />
        </motion.div>
        <h3 className="text-xl font-bold text-white mb-2">
          {isEmailVerify ? 'Check your email! 📬' : 'Registration Successful! 🎉'}
        </h3>
        <p className="text-white/50 text-sm mb-6 animate-pulse">
          {isEmailVerify ? (
            <>
              We sent a verification link to <span className="text-violet-400">{form.email}</span>.<br/>
              Click it to activate your account.
            </>
          ) : (
            <>
              Your account has been created successfully.<br/>
              You can now sign in using your credentials.
            </>
          )}
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}
        >
          Back to Login
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-white">Create account ✨</h2>
        <p className="mt-1 text-sm text-white/40">Start building better habits today</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Name */}
        <div className="relative">
          <FiUser size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${focused === 'name' ? 'text-violet-400' : 'text-white/30'}`} />
          <input name="name" type="text" placeholder="Full name" value={form.name} onChange={handleChange}
            onFocus={() => setFocused('name')} onBlur={() => setFocused('')}
            className={inputClass('name')} autoComplete="name" />
        </div>

        {/* Email */}
        <div className="relative">
          <FiMail size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${focused === 'email' ? 'text-violet-400' : 'text-white/30'}`} />
          <input name="email" type="email" placeholder="Email address" value={form.email} onChange={handleChange}
            onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
            className={inputClass('email')} autoComplete="email" />
        </div>

        {/* Password */}
        <div>
          <div className="relative">
            <FiLock size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${focused === 'password' ? 'text-violet-400' : 'text-white/30'}`} />
            <input name="password" type={showPwd ? 'text' : 'password'} placeholder="Password (min. 6 chars)" value={form.password} onChange={handleChange}
              onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
              className={`${inputClass('password')} pr-11`} autoComplete="new-password" />
            <button type="button" onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
              {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
          {/* Strength bar */}
          {form.password && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 px-1">
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex-1 h-1 rounded-full transition-all duration-500"
                    style={{ background: strength >= i ? strengthColor[strength] : 'rgba(255,255,255,0.08)' }} />
                ))}
              </div>
              <p className="text-xs" style={{ color: strength ? strengthColor[strength] : 'transparent' }}>
                {strengthLabel[strength]}
              </p>
            </motion.div>
          )}
        </div>

        {/* Confirm */}
        <div className="relative">
          <FiLock size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${focused === 'confirm' ? 'text-violet-400' : 'text-white/30'}`} />
          <input name="confirm" type={showConf ? 'text' : 'password'} placeholder="Confirm password" value={form.confirm} onChange={handleChange}
            onFocus={() => setFocused('confirm')} onBlur={() => setFocused('')}
            className={`${inputClass('confirm')} pr-11 ${form.confirm && form.confirm !== form.password ? 'border-red-500/60' : ''}`}
            autoComplete="new-password" />
          <button type="button" onClick={() => setShowConf((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
            {showConf ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        </div>
        {form.confirm && form.confirm !== form.password && (
          <p className="text-xs text-red-400 -mt-2 px-1">Passwords do not match</p>
        )}

        {/* Terms */}
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <div onClick={() => setTerms((v) => !v)}
            className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${terms ? 'bg-violet-600 border-violet-600' : 'border-white/20 bg-white/5'}`}>
            {terms && <FiCheck size={10} className="text-white" strokeWidth={3} />}
          </div>
          <span className="text-xs text-white/40 leading-relaxed">
            I agree to the{' '}
            <span className="text-violet-400 cursor-pointer">Terms of Service</span> and{' '}
            <span className="text-violet-400 cursor-pointer">Privacy Policy</span>
          </span>
        </label>

        {/* Submit */}
        <motion.button type="submit" disabled={loading}
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white text-sm"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}>
          {loading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
          ) : 'Create Account 🚀'}
        </motion.button>
      </form>

      {/* Divider */}
      <div className="my-5 flex items-center gap-3">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-white/30 uppercase tracking-widest">or</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Google */}
      <motion.button type="button" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
        onClick={() => { window.location.href = `${API_URL}/auth/google`; }}
        className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all">
        <FaGoogle size={16} className="text-red-400" />
        Continue with Google
      </motion.button>

      {/* Login link */}
      <p className="mt-6 text-center text-xs text-white/40">
        Already have an account?{' '}
        <Link to="/login" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
