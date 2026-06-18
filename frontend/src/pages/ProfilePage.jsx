import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { updateProfile, fetchMe } from '../features/auth/authSlice';
import {
  FiUser, FiLock, FiAward, FiTrash2, FiCamera, FiEye,
  FiEyeOff, FiCheck, FiSave, FiMail, FiGlobe, FiBell, FiShield, FiStar
} from 'react-icons/fi';
import api from '../services/api';
import { format } from 'date-fns';
import { useNotifications } from '../hooks/useNotifications';

const ACHIEVEMENTS = [
  { type: 'first_habit', badge: '🌱', title: 'First Step', desc: 'Created your first habit' },
  { type: 'first_complete', badge: '✅', title: 'Getting Started', desc: 'Completed a habit for the first time' },
  { type: 'streak_7', badge: '🔥', title: 'Week Warrior', desc: '7-day streak' },
  { type: 'streak_30', badge: '💪', title: 'Monthly Master', desc: '30-day streak' },
  { type: 'streak_100', badge: '🏆', title: 'Century Club', desc: '100-day streak' },
  { type: 'consistency_master', badge: '⭐', title: 'Consistency Master', desc: '90% rate for 30 days' },
  { type: 'habit_5', badge: '📚', title: 'Habit Builder', desc: 'Created 5 habits' },
  { type: 'account_verified', badge: '✉️', title: 'Verified', desc: 'Verified email address' },
];

const LEVEL_THRESHOLDS = [0, 500, 1500, 3000, 6000, 10000, 20000, 50000];
const LEVEL_NAMES = ['Beginner', 'Novice', 'Apprentice', 'Practitioner', 'Expert', 'Master', 'Grand Master', 'Legend'];

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const notif = useNotifications();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({
    name: '',
    settings: {
      theme: 'dark',
      notifications: { email: true, browser: true }
    }
  });
  const [browserNotifEnabled, setBrowserNotifEnabled] = useState(notif.isReminderEnabled());

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        settings: user.settings || {
          theme: 'dark',
          notifications: { email: true, browser: true }
        }
      });
    }
  }, [user]);

  const currentXP = user?.xp || 0;
  const currentLevel = user?.level || 1;
  const nextThreshold = LEVEL_THRESHOLDS[currentLevel] || currentXP;
  const prevThreshold = LEVEL_THRESHOLDS[currentLevel - 1] || 0;
  const xpProgress = nextThreshold > prevThreshold ? ((currentXP - prevThreshold) / (nextThreshold - prevThreshold)) * 100 : 100;
  const unlockedTypes = new Set((user?.achievements || []).map((a) => a.type));

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await dispatch(updateProfile(form)).unwrap();
      toast.success('Profile updated successfully! ✨');
    } catch (err) {
      toast.error(err || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (passwordForm.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    try {
      await api.put('/users/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success('Password changed successfully! 🔐');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/users/account');
      localStorage.removeItem('token');
      toast.success('Account deleted successfully');
      window.location.href = '/';
    } catch (err) {
      toast.error('Failed to delete account');
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (e.g. 3MB limit)
    if (file.size > 3 * 1024 * 1024) {
      return toast.error('Image size must be less than 3MB');
    }

    const formData = new FormData();
    formData.append('avatar', file);

    const loadingToast = toast.loading('Uploading avatar...');
    try {
      await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Avatar uploaded successfully! ✨', { id: loadingToast });
      dispatch(fetchMe());
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload avatar', { id: loadingToast });
    }
  };

  if (!user) return null;

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 text-white min-h-screen">
      {/* Profile Card Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-2xl p-6 sm:p-8"
      >
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-800 opacity-60 rounded-t-3xl -z-10" />
        <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 pt-12">
          {/* Avatar Area */}
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-slate-900 bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-4xl font-bold overflow-hidden shadow-xl">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
              ) : (
                user.name?.[0]?.toUpperCase() || 'U'
              )}
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
              <FiCamera className="text-white text-2xl" />
            </div>
            <button className="absolute bottom-1 right-1 w-8 h-8 bg-violet-600 hover:bg-violet-500 text-white rounded-full flex items-center justify-center shadow-lg transition-colors border-2 border-slate-900">
              <FiCamera size={14} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* User Details */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start">
              <h2 className="text-3xl font-extrabold tracking-tight text-white">{user.name}</h2>
              <div className="flex gap-2 justify-center">
                <span className="rounded-full bg-violet-500/20 border border-violet-500/30 px-3 py-0.5 text-xs font-semibold text-violet-300">
                  {LEVEL_NAMES[currentLevel - 1] || 'Legend'}
                </span>
                {user.subscription?.plan === 'premium' && (
                  <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-3 py-0.5 text-xs font-semibold text-amber-300 flex items-center gap-1">
                    <FiStar className="fill-amber-300" size={10} /> Premium
                  </span>
                )}
              </div>
            </div>
            <p className="text-slate-400 text-sm">{user.email}</p>
            
            {/* XP progress bar */}
            <div className="max-w-md mx-auto md:mx-0 pt-2">
              <div className="flex justify-between text-xs font-medium text-slate-400 mb-1.5">
                <span>Level {currentLevel}</span>
                <span>{currentXP.toLocaleString()} / {nextThreshold.toLocaleString()} XP</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/5 border border-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, xpProgress)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                />
              </div>
              {nextThreshold > currentXP && (
                <p className="text-[10px] text-slate-500 mt-1">
                  {(nextThreshold - currentXP).toLocaleString()} XP remaining to Level {currentLevel + 1}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick stats grid */}
        <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/5 text-center">
          {[
            { label: 'Member Since', value: user.createdAt ? format(new Date(user.createdAt), 'MMM yyyy') : 'Now' },
            { label: 'Habits Created', value: user.totalHabitsCreated || 0 },
            { label: 'Longest Streak', value: `${user.longestStreakEver || 0}d` },
          ].map((s, i) => (
            <div key={i} className="space-y-1">
              <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">{s.value}</div>
              <div className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tabs list */}
      <div className="flex gap-1.5 bg-slate-900/60 p-1.5 rounded-2xl border border-white/5 w-full sm:w-fit">
        {[
          { id: 'profile', label: 'Edit Profile', icon: FiUser },
          { id: 'security', label: 'Security & Auth', icon: FiLock },
          { id: 'achievements', label: 'Achievements', icon: FiAward },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t.id
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        {tab === 'profile' && (
          <motion.div
            key="profile-panel"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-md p-6 sm:p-8 space-y-6"
          >
            <div className="flex items-center gap-3 pb-2 border-b border-white/5">
              <FiUser className="text-violet-400 text-xl" />
              <h3 className="text-lg font-bold text-white">Profile Details</h3>
            </div>

            <div className="space-y-4 max-w-lg">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Display Name</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><FiUser size={16} /></span>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
                <div className="relative opacity-60">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><FiMail size={16} /></span>
                  <input
                    type="email"
                    disabled
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-slate-300 outline-none cursor-not-allowed"
                    value={user.email}
                  />
                </div>
              </div>

              {/* Notification preferences */}
              <div className="pt-4 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <FiBell className="text-indigo-400" /> Notifications Settings
                </h4>
                
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold">Email Alerts</p>
                    <p className="text-xs text-slate-400">Receive summaries, streaks, and product updates</p>
                  </div>
                  <button
                    onClick={() => setForm(f => ({
                      ...f,
                      settings: {
                        ...f.settings,
                        notifications: { ...f.settings.notifications, email: !f.settings.notifications.email }
                      }
                    }))}
                    className={`w-12 h-6 rounded-full transition-all relative ${
                      form.settings.notifications.email ? 'bg-violet-600' : 'bg-slate-800'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                      form.settings.notifications.email ? 'left-7' : 'left-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold">Browser Reminders</p>
                    <p className="text-xs text-slate-400">
                      {notif.permission === 'denied'
                        ? '⚠️ Blocked in browser — enable in site settings'
                        : browserNotifEnabled
                        ? '🔔 Daily reminders are active'
                        : 'Get push notifications for habit completions'}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      if (browserNotifEnabled) {
                        notif.cancelReminder();
                        setBrowserNotifEnabled(false);
                        setForm(f => ({ ...f, settings: { ...f.settings, notifications: { ...f.settings.notifications, browser: false } } }));
                        toast.success('Browser reminders disabled');
                      } else {
                        const perm = await notif.requestPermission();
                        if (perm === 'granted') {
                          notif.scheduleDailyReminder('09:00');
                          setBrowserNotifEnabled(true);
                          setForm(f => ({ ...f, settings: { ...f.settings, notifications: { ...f.settings.notifications, browser: true } } }));
                          toast.success('Browser reminders enabled! 🔔 Daily at 9:00 AM');
                        } else {
                          toast.error('Permission denied. Please allow notifications in browser settings.');
                        }
                      }
                    }}
                    className={`w-12 h-6 rounded-full transition-all relative ${
                      browserNotifEnabled ? 'bg-violet-600' : 'bg-slate-800'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                      browserNotifEnabled ? 'left-7' : 'left-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-violet-500 disabled:opacity-50 transition-colors"
              >
                <FiSave />
                {saving ? 'Saving...' : 'Save Profile'}
              </motion.button>
            </div>

            {/* Danger Zone */}
            <div className="border-t border-rose-500/20 pt-6 mt-6">
              <h4 className="text-sm font-bold text-rose-400 mb-2 flex items-center gap-2">
                <FiShield /> Danger Zone
              </h4>
              <p className="text-xs text-slate-400 mb-4">
                Once you delete your account, there is no going back. All your stats, logs, and habits will be deleted.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 rounded-xl border border-rose-500/30 hover:bg-rose-500/10 px-5 py-2.5 text-sm font-semibold text-rose-400 transition"
              >
                <FiTrash2 size={14} />
                Delete Account
              </button>
            </div>
          </motion.div>
        )}

        {tab === 'security' && (
          <motion.div
            key="security-panel"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-md p-6 sm:p-8 space-y-6"
          >
            <div className="flex items-center gap-3 pb-2 border-b border-white/5">
              <FiLock className="text-violet-400 text-xl" />
              <h3 className="text-lg font-bold text-white">Change Password</h3>
            </div>

            <div className="space-y-4 max-w-lg">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><FiLock size={16} /></span>
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-10 text-white outline-none focus:border-violet-500 transition-all"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showCurrentPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">New Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><FiLock size={16} /></span>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-10 text-white outline-none focus:border-violet-500 transition-all"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showNewPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirm New Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><FiLock size={16} /></span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-10 text-white outline-none focus:border-violet-500 transition-all"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleChangePassword}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-violet-500 transition-colors"
              >
                <FiLock />
                Update Password
              </motion.button>
            </div>
          </motion.div>
        )}

        {tab === 'achievements' && (
          <motion.div
            key="achievements-panel"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 pb-2 border-b border-white/5">
              <FiAward className="text-violet-400 text-xl" />
              <h3 className="text-lg font-bold text-white">Achievements Gallery</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {ACHIEVEMENTS.map((a) => {
                const unlocked = unlockedTypes.has(a.type);
                return (
                  <motion.div
                    key={a.type}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className={`relative overflow-hidden rounded-2xl border p-5 text-center transition-all ${
                      unlocked
                        ? 'border-violet-500/30 bg-violet-500/5 shadow-lg shadow-violet-500/5'
                        : 'border-white/5 bg-slate-900/20 opacity-40 grayscale'
                    }`}
                  >
                    {unlocked && (
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-indigo-500" />
                    )}
                    <div className="text-5xl mb-4 leading-none">{a.badge}</div>
                    <h4 className="text-sm font-bold text-white mb-1.5">{a.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{a.desc}</p>
                    
                    <div className="mt-4">
                      {unlocked ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                          <FiCheck size={10} /> Unlocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-semibold text-slate-500">
                          🔒 Locked
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-rose-500/20 bg-slate-950 p-6 shadow-2xl z-10 text-center"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 mb-4">
                <FiTrash2 size={24} />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">Are you absolutely sure?</h3>
              <p className="text-sm text-slate-400 mb-6">
                This action is permanent and cannot be undone. All your stats, levels, history, and habits will be deleted forever.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-850 px-4 py-2.5 text-sm font-semibold text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
