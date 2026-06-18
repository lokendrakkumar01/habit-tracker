import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FiCheck, FiX, FiStar, FiChevronDown, FiChevronUp, FiAward, FiCreditCard } from 'react-icons/fi';
import { FaCrown, FaStripe, FaRegCreditCard } from 'react-icons/fa';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import api from '../services/api';
import { fetchMe } from '../features/auth/authSlice';

const FREE_FEATURES = [
  'Up to 5 habits',
  'Basic weekly analytics',
  'Standard daily reminders',
  'Streak tracking',
  'Journal access',
  'Basic goals'
];

const PREMIUM_FEATURES = [
  'Unlimited active habits',
  'Advanced analytics & monthly charts',
  'Calendar heatmap visualization',
  'Unlimited daily reminders',
  'Habit challenges & milestones',
  'Export data to CSV & PDF',
  'Priority 24/7 client support',
  'Full social & leaderboard features',
  'Unlimited linked goals'
];

const FAQS = [
  { q: 'Can I cancel anytime?', a: 'Yes! You can cancel your subscription at any time. You\'ll retain premium access until the end of your billing period.' },
  { q: 'Is there a free trial?', a: 'Yes, we offer a 14-day free trial of Premium. No credit card is required to start.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit cards (Visa, Mastercard, Amex), UPI, and net banking via Stripe/Razorpay.' },
];

export default function PremiumPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [billingCycle, setBillingCycle] = useState('yearly');
  const [openFaq, setOpenFaq] = useState(null);
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [paymentGateway, setPaymentGateway] = useState('stripe');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [processing, setProcessing] = useState(false);

  const isPremium = user?.subscription?.plan === 'premium';

  const monthlyPrice = 9.99;
  const yearlyPrice = 79.99;
  const yearlyMonthly = (yearlyPrice / 12).toFixed(2);

  const handleOpenCheckout = () => {
    setCheckoutModal(true);
  };

  const handleCompleteCheckout = async () => {
    setProcessing(true);
    const loadToast = toast.loading('Initializing payment session...');
    try {
      // 1. Create Checkout Session
      const checkoutRes = await api.post('/payments/checkout', {
        plan: 'premium',
        billingCycle,
        gateway: paymentGateway
      });

      const { sessionId, amount } = checkoutRes.data;
      toast.loading(`Processing $${amount} payment via ${paymentGateway === 'stripe' ? 'Stripe Secure' : 'Razorpay Gateway'}...`, { id: loadToast });

      // Simulate a small network latency
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 2. Verify Payment
      const verifyRes = await api.post('/payments/verify', {
        sessionId,
        status: 'success'
      });

      toast.success('Welcome to HabitFlow Premium! 👑✨', { id: loadToast });
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#6366f1', '#a78bfa']
      });

      setCheckoutModal(false);
      dispatch(fetchMe());
    } catch (e) {
      toast.error('Payment verification failed. Please try again.', { id: loadToast });
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    const loadToast = toast.loading('Processing cancellation request...');
    try {
      await api.put('/users/unsubscribe');
      toast.success('Subscription cancelled successfully. You are now on the Free plan.', { id: loadToast });
      dispatch(fetchMe());
    } catch (e) {
      toast.error('Failed to cancel subscription.', { id: loadToast });
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 text-white min-h-screen">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-6 relative overflow-hidden rounded-3xl border border-white/5 bg-slate-900/40 p-8"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/10 to-indigo-600/5 -z-10 animate-pulse-slow" />
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-3xl mx-auto mb-6 shadow-lg shadow-amber-500/10">
          <FaCrown />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-violet-300 to-indigo-200 bg-clip-text text-transparent mb-4">
          {isPremium ? "You're a Premium Member!" : 'Supercharge Your Habit Tracking'}
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          {isPremium
            ? 'Thank you for supporting HabitFlow! Your account has access to all elite tracking features, custom analytics, and social leaderboards.'
            : 'Unlock unlimited habits, full analytics history, reminder customization, and priority support to build consistent, positive daily routines.'}
        </p>

        {isPremium && (
          <div className="mt-6 flex flex-col items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/30 px-5 py-2 text-sm font-semibold text-amber-300">
              <FiStar className="fill-amber-300" size={14} /> Active Premium Membership
            </span>
            <button
              onClick={handleCancel}
              className="mt-2 text-xs font-semibold text-rose-400 hover:text-rose-350 hover:underline transition"
            >
              Cancel Subscription
            </button>
          </div>
        )}
      </motion.div>

      {!isPremium && (
        <div className="space-y-12">
          {/* Billing Cycle Toggle */}
          <div className="flex justify-center">
            <div className="bg-slate-900 border border-white/10 p-1.5 rounded-2xl inline-flex gap-1.5 shadow-inner">
              {['monthly', 'yearly'].map((cycle) => (
                <button
                  key={cycle}
                  onClick={() => setBillingCycle(cycle)}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${
                    billingCycle === cycle
                      ? 'bg-violet-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cycle}
                  {cycle === 'yearly' && (
                    <span className="ml-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded-lg">
                      Save 33%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Free Tier Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-3xl border border-white/5 bg-slate-900/30 p-8 backdrop-blur-md flex flex-col justify-between"
            >
              <div>
                <h2 className="text-lg font-bold text-slate-300 mb-1">Standard Free</h2>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-black text-white">$0</span>
                  <span className="text-slate-400 text-sm">/ forever</span>
                </div>
                <p className="text-xs text-slate-400 mb-6">Simple habit tracking for beginners.</p>
                <div className="space-y-3.5 mb-8">
                  {FREE_FEATURES.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-350">
                      <FiCheck className="text-emerald-500 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2.5 text-xs text-slate-650">
                    <FiX className="flex-shrink-0" />
                    <span>Advanced calendar heatmap</span>
                  </div>
                </div>
              </div>
              <button
                disabled
                className="w-full rounded-xl bg-slate-900 border border-white/10 py-3 text-sm font-bold text-slate-400 cursor-not-allowed"
              >
                Current Plan
              </button>
            </motion.div>

            {/* Premium Tier Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-3xl border border-violet-500/30 bg-slate-900/60 p-8 backdrop-blur-md relative flex flex-col justify-between shadow-2xl shadow-violet-500/5"
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] font-black tracking-widest uppercase px-4 py-1.5 rounded-full border border-violet-400/30 shadow-lg">
                {billingCycle === 'yearly' ? '⭐ Best Value' : '🔥 Premium Access'}
              </div>
              
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Elite Premium</h2>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-black text-white">
                    ${billingCycle === 'yearly' ? yearlyMonthly : monthlyPrice}
                  </span>
                  <span className="text-slate-400 text-sm">/ month</span>
                </div>
                {billingCycle === 'yearly' && (
                  <p className="text-[10px] text-slate-400 mb-4">Billed annually (${yearlyPrice}/year)</p>
                )}
                <p className="text-xs text-slate-400 mb-6">Unrestricted tools for peak consistency.</p>
                <div className="space-y-3.5 mb-8">
                  {PREMIUM_FEATURES.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-200">
                      <FiCheck className="text-violet-400 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleOpenCheckout}
                className="w-full rounded-xl bg-violet-600 hover:bg-violet-500 py-3 text-sm font-bold text-white shadow-xl shadow-violet-500/20 transition-all flex items-center justify-center gap-2"
              >
                <FiStar className="fill-white" size={14} /> Upgrade Now
              </motion.button>
            </motion.div>
          </div>

          {/* Feature Comparison Table */}
          <div className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 sm:p-8 backdrop-blur-md">
            <h2 className="text-lg font-bold text-white mb-6 text-center">Feature Matrix</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="py-3 text-slate-400 font-bold uppercase tracking-wider">Feature</th>
                    <th className="py-3 text-center text-slate-400 font-bold uppercase tracking-wider">Free</th>
                    <th className="py-3 text-center text-violet-400 font-bold uppercase tracking-wider">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Active Habits', 'Up to 5', 'Unlimited'],
                    ['Analytics Depth', 'Weekly basic', 'Yearly & Monthly'],
                    ['Heatmap Calendar', '❌ Unavailable', '✅ Full Heatmap'],
                    ['Daily Reminders', '1 per habit', 'Unlimited'],
                    ['Linked Goals', '3 max', 'Unlimited'],
                    ['Data Export (CSV/PDF)', '❌ Unavailable', '✅ Included'],
                    ['Global Leaderboards', 'View only', '✅ Fully active'],
                    ['Priority Support', 'Email support', '24/7 VIP chat'],
                  ].map(([feat, free, premium], i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="py-3.5 font-medium text-slate-350">{feat}</td>
                      <td className="py-3.5 text-center text-slate-400">{free}</td>
                      <td className="py-3.5 text-center text-violet-400 font-semibold">{premium}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 sm:p-8 backdrop-blur-md">
            <h2 className="text-lg font-bold text-white mb-6 text-center">Frequently Asked Questions</h2>
            <div className="space-y-3 max-w-3xl mx-auto">
              {FAQS.map((faq, i) => (
                <div key={i} className="border border-white/5 rounded-2xl bg-slate-950/40 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full text-left px-5 py-4.5 flex items-center justify-between transition-colors hover:bg-white/2"
                  >
                    <span className="font-semibold text-slate-200 text-sm">{faq.q}</span>
                    {openFaq === i ? <FiChevronUp className="text-slate-400" /> : <FiChevronDown className="text-slate-400" />}
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-4.5 text-xs text-slate-400 leading-relaxed border-t border-white/5 pt-3">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      <AnimatePresence>
        {checkoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-slate-900 border border-white/15 rounded-2xl overflow-hidden shadow-2xl p-6 space-y-6"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FaCrown className="text-amber-400" /> Secure Checkout
                </h3>
                <button
                  onClick={() => setCheckoutModal(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Order summary */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Product</span>
                  <span>HabitFlow Elite Premium</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Billing Cycle</span>
                  <span className="capitalize">{billingCycle}</span>
                </div>
                <div className="border-t border-white/5 my-2 pt-2 flex justify-between text-sm font-bold text-white">
                  <span>Total Amount</span>
                  <span className="text-amber-400">${billingCycle === 'yearly' ? yearlyPrice : monthlyPrice}</span>
                </div>
              </div>

              {/* Gateway selector */}
              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-semibold uppercase block">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentGateway('stripe')}
                    className={`py-3 rounded-xl font-bold text-sm border flex justify-center items-center gap-2 transition ${
                      paymentGateway === 'stripe'
                        ? 'border-violet-500 bg-violet-500/10 text-violet-400'
                        : 'border-white/5 bg-slate-950/40 text-slate-400'
                    }`}
                  >
                    <FaStripe size={24} />
                  </button>
                  <button
                    onClick={() => setPaymentGateway('razorpay')}
                    className={`py-3 rounded-xl font-bold text-[13px] border flex justify-center items-center gap-1.5 transition ${
                      paymentGateway === 'razorpay'
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                        : 'border-white/5 bg-slate-950/40 text-slate-400'
                    }`}
                  >
                    💳 Razorpay UPI
                  </button>
                </div>
              </div>

              {/* Simulated Card inputs */}
              <div className="space-y-3">
                <label className="text-xs text-slate-400 font-semibold uppercase block">Card Information</label>
                <div className="relative">
                  <FaRegCreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/5 text-sm outline-none focus:border-violet-500 transition"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="Card Number"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/5 text-sm outline-none focus:border-violet-500 transition"
                    placeholder="MM / YY"
                    defaultValue="12 / 29"
                  />
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/5 text-sm outline-none focus:border-violet-500 transition"
                    placeholder="CVC"
                    defaultValue="000"
                  />
                </div>
              </div>

              <button
                onClick={handleCompleteCheckout}
                disabled={processing}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 font-bold text-white text-sm hover:from-violet-500 hover:to-indigo-500 transition shadow-xl shadow-violet-500/10 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <FiCreditCard />
                {processing ? 'Processing Payment...' : `Pay $${billingCycle === 'yearly' ? yearlyPrice : monthlyPrice}`}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
