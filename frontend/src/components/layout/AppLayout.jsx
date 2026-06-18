import { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdDashboard, MdMenu, MdClose, MdChevronLeft, MdChevronRight,
} from 'react-icons/md';
import {
  FiActivity, FiBarChart2, FiCalendar, FiFlag, FiBook,
  FiUsers, FiStar, FiUser, FiShield, FiBell, FiSun, FiMoon, FiLogOut, FiDownload,
} from 'react-icons/fi';
import { toggleSidebarCollapse } from '../../features/ui/uiSlice';
import { logoutUser } from '../../features/auth/authSlice';
import { useDarkMode } from '../../hooks/useDarkMode';
import { exportHabitsToCSV } from '../../utils/exportCSV';

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

export default function AppLayout() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const location   = useLocation();
  const user       = useSelector((s) => s.auth?.user);
  const habits     = useSelector((s) => s.habits?.habits ?? []);
  const collapsed  = useSelector((s) => s.ui?.sidebarCollapsed ?? false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useDarkMode();

  const pageTitle = PAGE_TITLES[Object.keys(PAGE_TITLES).find((p) => location.pathname.startsWith(p)) || ''] || 'HabitFlow';

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login', { replace: true });
  };

  const handleExportCSV = () => {
    if (habits.length === 0) {
      alert('No habits to export!');
      return;
    }
    exportHabitsToCSV(habits);
  };

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
      <div className="flex flex-1 flex-col overflow-hidden">
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

            {/* Notifications */}
            <button
              onClick={() => navigate('/profile')}
              title="Notifications"
              className="relative h-9 w-9 flex items-center justify-center rounded-xl transition-all text-white/40 hover:text-white"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <FiBell size={16} />
            </button>

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
        <main className="flex-1 overflow-y-auto" style={{ background: '#020617' }}>
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
