import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './app/store';
import { fetchMe } from './features/auth/authSlice';

// Layouts
import AppLayout from './components/layout/AppLayout';
import AuthLayout from './components/layout/AuthLayout';

// Pages - Auth
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import GoogleSuccessPage from './pages/auth/GoogleSuccessPage';

// Pages - App
import DashboardPage from './pages/DashboardPage';
import HabitsPage from './pages/HabitsPage';
import HabitDetailPage from './pages/HabitDetailPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CalendarPage from './pages/CalendarPage';
import GoalsPage from './pages/GoalsPage';
import JournalPage from './pages/JournalPage';
import SocialPage from './pages/SocialPage';
import ProfilePage from './pages/ProfilePage';
import PremiumPage from './pages/PremiumPage';
import AdminPage from './pages/AdminPage';

// Components
import LoadingScreen from './components/common/LoadingScreen';

// ─── Route Guards ──────────────────────────────────────────────────────────

const ProtectedRoute = ({ adminOnly = false }) => {
  const { isAuthenticated, user, initializing } = useSelector((s) => s.auth);
  if (initializing) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

const PublicRoute = () => {
  const { isAuthenticated, initializing } = useSelector((s) => s.auth);
  if (initializing) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

// ─── App Content ───────────────────────────────────────────────────────────

function AppContent() {
  const dispatch = useDispatch();
  const { token } = useSelector((s) => s.auth);

  useEffect(() => {
    if (token) dispatch(fetchMe());
  }, [dispatch, token]);

  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />

      <Routes>
        {/* ── Landing ── */}
        <Route path="/" element={<LandingPage />} />

        {/* ── Google OAuth callback ── */}
        <Route path="/auth/google/success" element={<GoogleSuccessPage />} />

        {/* ── Verify / Reset (no auth guard) ── */}
        <Route element={<AuthLayout />}>
          <Route path="/verify-email"    element={<VerifyEmailPage />} />
          <Route path="/reset-password"  element={<ResetPasswordPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* ── Public routes (redirect to /dashboard if already logged in) ── */}
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
        </Route>

        {/* ── Protected app routes ── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard"   element={<DashboardPage />} />
            <Route path="/habits"      element={<HabitsPage />} />
            <Route path="/habits/:id"  element={<HabitDetailPage />} />
            <Route path="/analytics"   element={<AnalyticsPage />} />
            <Route path="/calendar"    element={<CalendarPage />} />
            <Route path="/goals"       element={<GoalsPage />} />
            <Route path="/journal"     element={<JournalPage />} />
            <Route path="/social"      element={<SocialPage />} />
            <Route path="/profile"     element={<ProfilePage />} />
            <Route path="/premium"     element={<PremiumPage />} />
          </Route>
        </Route>

        {/* ── Admin routes ── */}
        <Route element={<ProtectedRoute adminOnly />}>
          <Route element={<AppLayout />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Route>

        {/* ── Catch-all ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
