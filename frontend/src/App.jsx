import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './app/store';
import { fetchMe } from './features/auth/authSlice';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Layouts
import AppLayout from './components/layout/AppLayout';
import AuthLayout from './components/layout/AuthLayout';

// Loading screen (eager - needed immediately)
import LoadingScreen from './components/common/LoadingScreen';

// Lazy-loaded Pages
// Landing page loaded eagerly for fast first paint
import LandingPage from './pages/LandingPage';

// Auth pages
const LoginPage         = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage      = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage= lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const VerifyEmailPage   = lazy(() => import('./pages/auth/VerifyEmailPage'));
const GoogleSuccessPage = lazy(() => import('./pages/auth/GoogleSuccessPage'));

// App pages (code-split per route)
const DashboardPage   = lazy(() => import('./pages/DashboardPage'));
const HabitsPage      = lazy(() => import('./pages/HabitsPage'));
const HabitDetailPage = lazy(() => import('./pages/HabitDetailPage'));
const AnalyticsPage   = lazy(() => import('./pages/AnalyticsPage'));
const CalendarPage    = lazy(() => import('./pages/CalendarPage'));
const GoalsPage       = lazy(() => import('./pages/GoalsPage'));
const JournalPage     = lazy(() => import('./pages/JournalPage'));
const SocialPage      = lazy(() => import('./pages/SocialPage'));
const ProfilePage     = lazy(() => import('./pages/ProfilePage'));
const PremiumPage     = lazy(() => import('./pages/PremiumPage'));
const AdminPage       = lazy(() => import('./pages/AdminPage'));
const NotFoundPage    = lazy(() => import('./pages/NotFoundPage'));

// Page Fallback (for Suspense)
function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-10 h-10 rounded-full border-2 animate-spin"
          style={{ borderColor: 'rgba(139,92,246,0.3)', borderTopColor: '#8b5cf6' }}
        />
        <p className="text-sm" style={{ color: '#475569' }}>Loading...</p>
      </div>
    </div>
  );
}

//  Route Guards

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

// App Content

function AppContent() {
  const dispatch = useDispatch();
  const { token, user } = useSelector((s) => s.auth);

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchMe());
    }
  }, [dispatch, token, user]);

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

      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/*Landing */}
          <Route path="/" element={<LandingPage />} />

          {/*Google OAuth callback*/}
          <Route path="/auth/google/success" element={<GoogleSuccessPage />} />

          {/*Verify / Reset (no auth guard)*/}
          <Route element={<AuthLayout />}>
            <Route path="/verify-email"    element={<VerifyEmailPage />} />
            <Route path="/reset-password"  element={<ResetPasswordPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/*Public routes (redirect to /dashboard if already logged in)*/}
          <Route element={<PublicRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login"    element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>
          </Route>

          {/*Protected app routes*/}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard"   element={<DashboardPage />} />
              <Route path="/habits/new"  element={<Navigate to="/habits?new=true" replace />} />
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

          {/*Admin routes*/}
          <Route element={<ProtectedRoute adminOnly />}>
            <Route element={<AppLayout />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>
          </Route>

          {/*404 Catch-all*/}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30 * 1000, // 30 seconds
    },
  },
});

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </Provider>
  );
}
