import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import { FiUsers, FiShield, FiSearch, FiTrash2, FiEdit2, FiCheck, FiStar, FiTarget, FiBarChart2, FiCalendar, FiClock, FiX } from 'react-icons/fi';
import { format } from 'date-fns';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ role: 'user', 'subscription.plan': 'free' });

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [search, page]);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data.stats);
    } catch {
      toast.error('Failed to load system statistics');
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users', { params: { search, page, limit: 15 } });
      setUsers(data.users);
      setTotal(data.total);
    } catch {
      toast.error('Failed to load user list');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this user? This will delete all of their habits, stats, and logs permanently.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted successfully');
      fetchUsers();
      fetchStats();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const handleUpdateUser = async () => {
    try {
      await api.put(`/admin/users/${editUser._id}`, {
        role: editForm.role,
        'subscription.plan': editForm['subscription.plan'],
      });
      toast.success('User details updated successfully');
      setEditUser(null);
      fetchUsers();
      fetchStats();
    } catch {
      toast.error('Failed to update user details');
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 text-white min-h-screen">
      
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="pb-4 border-b border-white/5">
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <FiShield className="text-violet-500" /> Admin Control Center
        </h1>
        <p className="text-slate-400 mt-1">Monitor site activity, adjust user subscription plans, and manage platform roles</p>
      </motion.div>

      {stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: FiUsers, color: '#6366f1' },
            { label: 'Verified Users', value: stats.verifiedUsers, icon: FiCheck, color: '#10b981' },
            { label: 'Premium Users', value: stats.premiumUsers, icon: FiStar, color: '#f59e0b' },
            { label: 'Habits Tracked', value: stats.totalHabits, icon: FiTarget, color: '#8b5cf6' },
            { label: 'Total Completions', value: stats.totalLogs, icon: FiBarChart2, color: '#06b6d4' },
            { label: 'Joined Today', value: stats.newUsersToday, icon: FiCalendar, color: '#ec4899' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 p-4 text-center backdrop-blur-md shadow-lg"
              >
                <div className="flex justify-center text-xl mb-2" style={{ color: s.color }}>
                  <Icon />
                </div>
                <div className="text-xl font-bold tracking-tight text-white mb-0.5">
                  {s.value?.toLocaleString() || 0}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-450">
                  {s.label}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl border border-white/5 bg-slate-900/20 animate-pulse" />
          ))}
        </div>
      )}

      <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-base font-bold text-white">Registered Users ({total})</h2>
          
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><FiSearch size={14} /></span>
            <input
              className="w-full sm:w-64 rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-3 pr-4">Profile</th>
                <th className="py-3 pr-4">Email</th>
                <th className="py-3 pr-4 text-center">Role</th>
                <th className="py-3 pr-4 text-center">Subscription</th>
                <th className="py-3 pr-4 text-center">Status</th>
                <th className="py-3 pr-4">Joined Date</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="py-4 pr-4"><div className="h-4 w-28 rounded bg-white/5 animate-pulse" /></td>
                    <td className="py-4 pr-4"><div className="h-4 w-36 rounded bg-white/5 animate-pulse" /></td>
                    <td className="py-4 pr-4 text-center"><div className="h-4 w-12 rounded bg-white/5 animate-pulse mx-auto" /></td>
                    <td className="py-4 pr-4 text-center"><div className="h-4 w-16 rounded bg-white/5 animate-pulse mx-auto" /></td>
                    <td className="py-4 pr-4 text-center"><div className="h-4 w-8 rounded bg-white/5 animate-pulse mx-auto" /></td>
                    <td className="py-4 pr-4"><div className="h-4 w-20 rounded bg-white/5 animate-pulse" /></td>
                    <td className="py-4 text-right"><div className="h-4 w-12 rounded bg-white/5 animate-pulse ml-auto" /></td>
                  </tr>
                ))
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-sm font-bold text-white overflow-hidden flex-shrink-0 border border-white/10">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                          ) : (
                            u.name?.[0]?.toUpperCase()
                          )}
                        </div>
                        <span className="font-semibold text-slate-200">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-400 font-mono">{u.email}</td>
                    <td className="py-3.5 pr-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        u.role === 'admin' 
                          ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' 
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        u.subscription?.plan === 'premium'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-500'
                      }`}>
                        {u.subscription?.plan || 'free'}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-center">
                      {u.isVerified ? (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 pr-4 text-slate-400">{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
                    <td className="py-3.5 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditUser(u);
                            setEditForm({ role: u.role, 'subscription.plan': u.subscription?.plan || 'free' });
                          }}
                          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
                          title="Edit User settings"
                        >
                          <FiEdit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(u._id)}
                          className="p-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                          title="Delete User permanently"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-medium">
                    No matching users found in the system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {total > 15 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
            <span className="text-slate-450 text-xs">
              Showing {Math.min((page - 1) * 15 + 1, total)}–{Math.min(page * 15, total)} of {total} users
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-xl border border-white/10 bg-slate-900 hover:bg-slate-850 px-4 py-2 text-xs font-bold text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                ← Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * 15 >= total}
                className="rounded-xl border border-white/10 bg-slate-900 hover:bg-slate-850 px-4 py-2 text-xs font-bold text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {editUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditUser(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl z-10 space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              
              <div className="flex items-center justify-between border-b border-white/5 pb-3.5">
                <h3 className="text-base font-bold text-white">Adjust User Roles & Subscription</h3>
                <button
                  onClick={() => setEditUser(null)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors border border-white/5"
                >
                  <FiX size={14} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-450 uppercase block mb-1">Target Account</span>
                  <p className="text-sm font-semibold text-white truncate">{editUser.name} <span className="text-xs font-mono text-slate-500">({editUser.email})</span></p>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-450 uppercase block mb-1.5">User System Role</label>
                  <select
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-3 text-sm text-white outline-none focus:border-violet-500 transition"
                    value={editForm.role}
                    onChange={(e) => setEditForm(f => ({ ...f, role: e.target.value }))}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-[10px] font-bold text-slate-450 uppercase block mb-1.5">Subscription Tier</label>
                  <select
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-3 text-sm text-white outline-none focus:border-violet-500 transition"
                    value={editForm['subscription.plan']}
                    onChange={(e) => setEditForm(f => ({ ...f, 'subscription.plan': e.target.value }))}
                  >
                    <option value="free">Free</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-3.5 border-t border-white/5">
                <button
                  onClick={() => setEditUser(null)}
                  className="flex-1 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-850 px-4 py-2.5 text-xs font-bold text-slate-350 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateUser}
                  className="flex-1 rounded-xl bg-violet-600 hover:bg-violet-500 px-4 py-2.5 text-xs font-bold text-white transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
