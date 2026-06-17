import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { setToken, fetchMe } from '../../features/auth/authSlice';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'; // eslint-disable-line no-unused-vars

export default function GoogleSuccessPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useSelector((state) => state.auth); // eslint-disable-line no-unused-vars

  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const token = searchParams.get('token');

    if (!token) {
      toast.error('Google login failed. No token received.');
      navigate('/login', { replace: true });
      return;
    }

    // Persist token + update Redux
    localStorage.setItem('token', token);
    dispatch(setToken(token));

    // Load user data from server
    dispatch(fetchMe()).then(() => {
      toast.success('Signed in with Google! 🎉');
    });

    // Redirect after animation
    const timer = setTimeout(() => {
      navigate('/dashboard', { replace: true });
    }, 1500);

    return () => clearTimeout(timer);
  }, [dispatch, navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-10 text-center">
          {/* Google logo */}
          <div className="flex items-center justify-center mb-5">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <svg className="w-8 h-8" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Google Sign-In Successful</h2>
          <p className="text-gray-400 text-sm mb-6">
            Authenticating your account, redirecting you now…
          </p>

          {/* Animated progress bar */}
          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-indigo-500 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.4, ease: 'easeInOut' }}
            />
          </div>

          <p className="mt-8 text-xs text-gray-600">
            Not redirecting?{' '}
            <Link to="/dashboard" className="text-indigo-400 hover:text-indigo-300 transition-colors underline">
              Go to dashboard
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
