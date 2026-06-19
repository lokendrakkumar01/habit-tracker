import { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  MdDashboard, MdMenu, MdClose, MdChevronLeft, MdChevronRight,
} from 'react-icons/md';
import {
  FiActivity, FiBarChart2, FiCalendar, FiFlag, FiBook,
  FiUsers, FiStar, FiUser, FiShield, FiBell, FiSun, FiMoon, FiLogOut, FiDownload,
  FiCheck, FiCheckCircle, FiInfo, FiAlertCircle, FiX, FiZap,
} from 'react-icons/fi';
import { toggleSidebarCollapse } from '../../features/ui/uiSlice';
import { logoutUser } from '../../features/auth/authSlice';
import { useDarkMode } from '../../hooks/useDarkMode';
import { exportHabitsToCSV } from '../../utils/exportCSV';
import api from '../../services/api';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: MdDashboard },
  { to: '/habits',    label: 'Habits',    icon: FiActivity  },
  { to: '/analytics', label: 'Analytics', icon: FiBarChart2 },
  { to: '/calendar',  label: 'Calendar',  icon: FiCalendar  },
  { to: '/goals',     label: 'Goals',     icon: FiFlag      },
  { to: '/journal',   label: 'Journal',   icon: FiBook      },
  { to: '/social',    label: 'Social',    icon: FiUsers     },
  { to: '/premium',   label: 'Premium',   icon: FiStar      },
  { to: '/profile',   label: 'Profile',   icon: FiUser      },
];

const PAGE_TITLES = {
  '/dashboard': 'Dashboard', '/habits': 'My Habits', '/analytics': 'Analytics',
  '/calendar': 'Calendar', '/goals': 'Goals', '/journal': 'Journal',
  '/social': 'Social', '/premium': 'Premium', '/profile': 'Profile', '/admin': 'Admin',
};

// ─── Notification type styles ───────────────────────────────────────────────
const NOTIF_ICONS = {
  achievement: { icon: FiZap, color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' },
  streak:      { icon: FiStar, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  reminder:    { icon: FiBell, color: '#38bdf8', bg: 'rgba(56,189,248,0.15)' },
  info:        { icon: FiInfo, color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
  success:     { icon: FiCheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  warning:     { icon: FiAlertCircle, color: '#f97316', bg: 'rgba(249,115,22,0.15)' },
};

// Mock notifications fallback
const MOCK_NOTIFICATIONS = [
  { _id: '1', type: 'achievement', title: 'Badge Unlocked! 🎉', message: 'You earned the "Week Warrior" badge for a 7-day streak!', read: false, createdAt: new Date(Date.now() - 5 * 60000).toISOString() },
  { _id: '2', type: 'streak', title: 'Streak Milestone', message: 'Amazing! You\'re on a 14-day streak. Keep going!', read: false, createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
  { _id: '3', type: 'reminder', title: 'Daily Reminder', message: 'You have 3 habits left to complete today.', read: true, createdAt: new Date(Date.now() - 6 * 3600000).toISOString() },
  { _id: '4', type: 'success', title: 'Goal Progress', message: 'You\'re 80% toward your "Read 12 Books" goal!', read: true, createdAt: new Date(Date.now() - 24 * 3600000).toISOString() },
];

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Notification Bell Dropdown ─────────────────────────────────────────────
function NotificationDropdown({ onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await api.get('/notifications');
        const data = res.data?.notifications || res.data || [];
        setNotifications(Array.isArray(data) && data.length > 0 ? data : MOCK_NOTIFICATIONS);
      } catch {
        setNotifications(MOCK_NOTIFICATIONS);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifs();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
    } catch {}
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
    } catch {}
    setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <motion.div
      ref={dropdownRef}
      initial={{ opacity: 0, y: -8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        right: 0,
        top: '48px',
        zIndex: 50,
        width: '320px',
        background: '#0f172a',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <FiBell size={15} className="text-violet-400" />
          <span className="text-sm font-bold text-white">Notifications</span>
          {unreadCount > 0 && (
            <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white" style={{ background: '#7c3aed' }}>
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-[11px] font-semibold text-violet-400 hover:text-violet-300 transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-3xl mb-2">🔔</p>
            <p className="text-sm text-slate-500">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notif) => {
            const meta = NOTIF_ICONS[notif.type] || NOTIF_ICONS.info;
            const Icon = meta.icon;
            return (
              <motion.button
                key={notif._id}
                onClick={() => markRead(notif._id)}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', opacity: notif.read ? 0.65 : 1 }}
              >
                <div className="flex-shrink-0 mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: meta.bg }}>
                  <Icon size={14} style={{ color: meta.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-white leading-tight">{notif.title}</p>
                    {!notif.read && (
                      <span className="flex-shrink-0 mt-1 h-1.5 w-1.5 rounded-full bg-violet-500" />
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-400 leading-relaxed line-clamp-2">{notif.message}</p>
                  <p className="mt-1 text-[10px] text-slate-600">{timeAgo(notif.createdAt)}</p>
                </div>
              </motion.button>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} className="px-4 py-2.5 text-center">
        <button
          onClick={onClose}
          className="text-[11px] font-semibold text-violet-400 hover:text-violet-300 transition-colors"
        >
          View all notifications →
        </button>
      </div>
    </motion.div>
  );
}

// ─── Sidebar Link ────────────────────────────────────────────────────────────
function SidebarLink({ to, label, icon: Icon, collapsed }) {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);

  return (
    <NavLink to={to}
      className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200"
      style={({ isActive: navActive }) => ({
        color: (navActive || isActive) ? '#fff' : 'rgba(148,163,184,1)',
        background: (navActive || isActive)
          ? 'linear-gradient(135deg,rgba(124,58,237,0.25),rgba(79,70,229,0.15))'
          : 'transparent',
        border: (navActive || isActive) ? '1px solid rgba(124,58,237,0.3)' : '1px solid transparent',
      })}
    >
      <span className="flex-shrink-0 text-base transition-transform duration-200 group-hover:scale-110">
        <Icon />
      </span>
      <AnimatePresence>
        {!collapsed && (
          <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2 }}
            className="overflow-hidden whitespace-nowrap">
            {label}
          </motion.span>
        )}
      </AnimatePresence>
      {/* Tooltip for collapsed mode */}
      {collapsed && (
        <div className="pointer-events-none absolute left-full ml-2 z-50 hidden rounded-lg px-2.5 py-1.5 text-xs text-white shadow-xl border group-hover:block whitespace-nowrap"
          style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
          {label}
        </div>
      )}
    </NavLink>
  );
}

// ─── Main AppLayout ──────────────────────────────────────────────────────────
export default function AppLayout() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const location   = useLocation();
  const user       = useSelector((s) => s.auth?.user);
  const habits     = useSelector((s) => s.habits?.habits ?? []);
  const collapsed  = useSelector((s) => s.ui?.sidebarCollapsed ?? false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { darkMode, toggleDarkMode } = useDarkMode();
  const notifBtnRef = useRef(null);

  const pageTitle = PAGE_TITLES[Object.keys(PAGE_TITLES).find((p) => location.pathname.startsWith(p)) || ''] || 'HabitFlow';

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.get('/notifications/unread-count');
        setUnreadCount(res.data?.count ?? 0);
      } catch {
        setUnreadCount(2); // mock fallback
      }
    };
    fetchUnread();
  }, []);

  // Close notif dropdown when navigating
  useEffect(() => {
    setNotifOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login', { replace: true });
  };

  const handleExportCSV = () => {
    if (habits.length === 0) {
      toast.error('No habits to export!');
      return;
    }
    exportHabitsToCSV(habits);
    toast.success('Habits exported to CSV! 📊');
  };

  const toggleNotif = useCallback(() => setNotifOpen((o) => !o), []);

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 ${collapsed && !isMobile ? 'justify-center' : ''}`}>
        <span className="text-2xl flex-shrink-0">🎯</span>
        <AnimatePresence>
          {(!collapsed || isMobile) && (
            <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap text-lg font-bold"
              style={{ background: 'linear-gradient(135deg,#a78bfa,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              HabitFlow
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Divider */}
      <div className="mx-3 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

      {/* Nav */}
      <nav className="mt-4 flex-1 space-y-0.5 px-3 overflow-y-auto">
        {NAV.map((item) => (
          <SidebarLink key={item.to} {...item} collapsed={collapsed && !isMobile} />
        ))}
        {user?.role === 'admin' && (
          <SidebarLink to="/admin" label="Admin" icon={FiShield} collapsed={collapsed && !isMobile} />
        )}
      </nav>

      {/* Divider */}
      <div className="mx-3 my-3 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

      {/* User card */}
      <AnimatePresence>
        {(!collapsed || isMobile) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="mx-3 mb-4 rounded-xl p-3 flex items-center gap-3"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 overflow-hidden"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
              {user?.avatar
                ? <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                : user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
              <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>Level {user?.level || 1} · {(user?.xp || 0).toLocaleString()} XP</p>
            </div>
            <button onClick={handleLogout} title="Logout"
              className="text-red-400 hover:text-red-300 transition-colors p-1 rounded-lg hover:bg-red-500/10">
              <FiLogOut size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {(collapsed && !isMobile) && (
        <div className="flex justify-center mb-4">
          <div className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold text-white overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
            {user?.avatar
              ? <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
              : user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#020617' }}>

      {/* ── Desktop Sidebar ── */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col relative z-30 overflow-hidden flex-shrink-0"
        style={{ background: '#0a0f1e', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        <SidebarContent />
        {/* Collapse toggle */}
        <button onClick={() => dispatch(toggleSidebarCollapse())}
          className="absolute top-5 -right-3 z-40 flex h-6 w-6 items-center justify-center rounded-full text-white/40 shadow-lg hover:text-white transition-all"
          style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }}>
          {collapsed ? <MdChevronRight size={14} /> : <MdChevronLeft size={14} />}
        </button>
      </motion.aside>

      {/* ── Mobile Sidebar ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 lg:hidden" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
              onClick={() => setMobileOpen(false)} />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 z-50 h-full w-64 lg:hidden"
              style={{ background: '#0a0f1e', borderRight: '1px solid rgba(255,255,255,0.06)' }}
            >
              <button onClick={() => setMobileOpen(false)}
                className="absolute right-4 top-4 text-white/40 hover:text-white transition-colors">
                <MdClose size={22} />
              </button>
              <SidebarContent isMobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Navbar */}
        <header className="flex h-16 items-center justify-between px-4 lg:px-6 z-20 flex-shrink-0"
          style={{ background: 'rgba(10,15,30,0.8)', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden text-white/40 hover:text-white transition-colors">
              <MdMenu size={22} />
            </button>
            <h1 className="text-base font-semibold text-white hidden sm:block">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* CSV Export */}
            <button
              onClick={handleExportCSV}
              title="Export habits to CSV"
              className="h-9 px-3 flex items-center gap-1.5 rounded-xl transition-all text-white/40 hover:text-white text-xs font-medium"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <FiDownload size={14} />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Dark / Light Mode */}
            <button onClick={toggleDarkMode}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="h-9 w-9 flex items-center justify-center rounded-xl transition-all text-white/40 hover:text-white"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {darkMode ? <FiSun size={16} /> : <FiMoon size={16} />}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                ref={notifBtnRef}
                onClick={toggleNotif}
                title="Notifications"
                className="relative h-9 w-9 flex items-center justify-center rounded-xl transition-all text-white/40 hover:text-white"
                style={{ background: notifOpen ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.05)', border: notifOpen ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(255,255,255,0.08)' }}>
                <FiBell size={16} />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
                    style={{ background: '#7c3aed' }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <NotificationDropdown onClose={() => setNotifOpen(false)} />
                )}
              </AnimatePresence>
            </div>

            {/* Avatar */}
            <button onClick={() => navigate('/profile')}
              className="h-9 w-9 flex items-center justify-center rounded-xl overflow-hidden text-sm font-bold text-white transition-all hover:ring-2 hover:ring-violet-500"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
              {user?.avatar
                ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                : user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto min-w-0" style={{ background: '#020617' }}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
