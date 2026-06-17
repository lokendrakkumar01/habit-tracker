import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { FiCheck, FiX, FiLoader } from 'react-icons/fi';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('No verification token found.'); return; }
    api.get(`/auth/verify-email?token=${token}`)
      .then((res) => { setStatus('success'); setMessage(res.data.message || 'Email verified!'); })
      .catch((err) => { setStatus('error'); setMessage(err.response?.data?.message || 'Verification failed.'); });
  }, [token]);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
      {status === 'loading' && (
        <>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-violet-500/20 border-t-violet-500 rounded-full mx-auto mb-6" />
          <h3 className="text-xl font-bold text-white">Verifying...</h3>
          <p className="text-white/40 text-sm mt-2">Please wait a moment</p>
        </>
      )}
      {status === 'success' && (
        <>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto mb-6">
            <FiCheck size={36} className="text-green-400" />
          </motion.div>
          <h3 className="text-xl font-bold text-white mb-2">Email Verified! 🎉</h3>
          <p className="text-white/50 text-sm mb-6">{message}</p>
          <Link to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}>
            Sign In →
          </Link>
        </>
      )}
      {status === 'error' && (
        <>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center mx-auto mb-6">
            <FiX size={36} className="text-red-400" />
          </motion.div>
          <h3 className="text-xl font-bold text-white mb-2">Verification Failed</h3>
          <p className="text-white/50 text-sm mb-6">{message}</p>
          <Link to="/login"
            className="text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors">
            Back to Login
          </Link>
        </>
      )}
    </motion.div>
  );
}
