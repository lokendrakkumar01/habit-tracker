import { useState, useEffect } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiChevronDown, FiChevronUp, FiCheck, FiX, FiCalendar, FiList } from 'react-icons/fi';

import api from '../services/api';
import confetti from 'canvas-confetti';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f97316', '#ec4899', '#14b8a6'];
const ICONS = ['🎯', '💪', '📚', '🏆', '💰', '🌿', '🎨', '🚀', '⚡', '🌟'];
const CATEGORIES = ['health', 'fitness', 'learning', 'career', 'finance', 'personal', 'relationships', 'other'];
const EMPTY_FORM = { title: '', description: '', deadline: '', category: 'personal', icon: '🎯', color: '#6366f1', priority: 'medium', milestones: [] };

const inputStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  padding: '10px 14px',
  color: '#fff',
  fontSize: '14px',
  width: '100%',
  outline: 'none',
  transition: 'border-color 0.2s',
};

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filter, setFilter] = useState('active');
  const [expanded, setExpanded] = useState({});
  const [newMilestone, setNewMilestone] = useState('');

  const fetchGoals = async () => {
    try {
      const res = await api.get('/goals');
      setGoals(res.data.goals || []);
    } catch {
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGoals(); 
  }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setEditGoal(null); setModalOpen(true); };
  const openEdit = (g) => { setForm({ ...EMPTY_FORM, ...g }); setEditGoal(g); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title required'); return; }
    try {
      if (editGoal) {
        await api.put(`/goals/${editGoal._id}`, form);
        toast.success('Goal updated! ✨');
      } else {
        await api.post('/goals', form);
        toast.success('Goal created! 🎯');
      }
      setModalOpen(false);
      fetchGoals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save goal');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this goal?')) return;
    try {
      await api.delete(`/goals/${id}`);
      setGoals(goals.filter(g => g._id !== id));
      toast.success('Goal deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleToggleMilestone = async (goalId, milestoneId) => {
    try {
      await api.put(`/goals/${goalId}/milestones/${milestoneId}/toggle`);
      const res = await api.get('/goals');
      setGoals(res.data.goals || []);

      const updatedGoal = (res.data.goals || []).find(g => g._id === goalId);
      if (updatedGoal) {
        const ms = updatedGoal.milestones || [];
        const progress = ms.length ? Math.round((ms.filter(m => m.completed).length / ms.length) * 100) : 0;
        if (progress === 100) {
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#10b981', '#34d399', '#6366f1', '#fbbf24']
          });
          toast.success('Goal Milestones Complete! 🏆');
        }
      }
    } catch { toast.error('Failed to update milestone'); }
  };

  const addMilestone = () => {
    if (!newMilestone.trim()) return;
    setForm(f => ({ ...f, milestones: [...(f.milestones || []), { title: newMilestone, completed: false }] }));
    setNewMilestone('');
  };

  const filteredGoals = goals.filter(g => {
    if (filter === 'active') return g.status !== 'completed' && g.status !== 'abandoned';
    if (filter === 'completed') return g.status === 'completed';
    return true;
  });

  const getProgress = (goal) => {
    const ms = goal.milestones || [];
    if (!ms.length) return 0;
    return Math.round((ms.filter(m => m.completed).length / ms.length) * 100);
  };

  const getDeadlineInfo = (deadline) => {
    if (!deadline) return null;
    const now = new Date();
    const due = new Date(deadline);
    const diffMs = due - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: `Overdue ${Math.abs(diffDays)}d`, color: '#ef4444', bg: 'rgba(239,68,68,0.15)' };
    if (diffDays === 0) return { label: 'Due Today!', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' };
    if (diffDays <= 7)  return { label: `${diffDays}d left`, color: '#f97316', bg: 'rgba(249,115,22,0.15)' };
    if (diffDays <= 30) return { label: `${diffDays}d left`, color: '#6366f1', bg: 'rgba(99,102,241,0.15)' };
    return { label: `${diffDays}d left`, color: '#10b981', bg: 'rgba(16,185,129,0.15)' };
  };

  const ProgressRing = ({ progress, color, size = 72 }) => {
    const r = (size - 10) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (progress / 100) * circ;
    return (
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color || '#6366f1'} strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
    );
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ background: '#020617' }}>
      <div className="mx-auto max-w-7xl space-y-6">
        
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Goals</h1>
            <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Track your long-term objectives</p>
          </div>
          <motion.button onClick={openCreate} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 4px 20px rgba(124,58,237,0.3)' }}>
            <FiPlus size={16} /> New Goal
          </motion.button>
        </motion.div>

        <div className="flex gap-2">
          {['active', 'completed', 'all'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all"
              style={{
                background: filter === f ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${filter === f ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: filter === f ? '#a78bfa' : 'rgba(255,255,255,0.5)',
              }}>
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-48 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
            ))}
          </div>
        ) : filteredGoals.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-6xl mb-4">🎯</span>
            <h3 className="text-lg font-semibold text-white mb-2">No goals yet</h3>
            <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>Set meaningful goals to track your progress</p>
            <button onClick={openCreate} className="btn-primary">Create First Goal</button>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredGoals.map(goal => {
                const progress = getProgress(goal);
                const isExpanded = expanded[goal._id];
                return (
                  <motion.div key={goal._id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                    className="rounded-2xl p-5 space-y-4"
                    style={{ background: 'rgba(30,41,59,0.6)', border: `1px solid rgba(255,255,255,0.08)`, borderLeft: `4px solid ${goal.color || '#6366f1'}` }}>
                    
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{goal.icon || '🎯'}</span>
                        <div>
                          <h3 className="font-bold text-white text-base leading-tight">{goal.title}</h3>
                          <span className="text-xs capitalize" style={{ color: 'rgba(255,255,255,0.4)' }}>{goal.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(goal)} className="p-1.5 rounded-lg hover:bg-white/10 transition-all" style={{ color: 'rgba(255,255,255,0.4)' }}><FiEdit2 size={13} /></button>
                        <button onClick={() => handleDelete(goal._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-all text-red-400/60 hover:text-red-400"><FiTrash2 size={13} /></button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span style={{ color: 'rgba(255,255,255,0.4)' }}>Progress</span>
                          <span style={{ color: goal.color || '#6366f1', fontWeight: 700 }}>{progress}%</span>
                        </div>
                        <div className="h-2 w-48 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${goal.color || '#6366f1'}, ${goal.color || '#6366f1'}88)` }} />
                        </div>
                      </div>
                      <div className="relative flex-shrink-0">
                        <ProgressRing progress={progress} color={goal.color} size={64} />
                        <div className="absolute inset-0 flex items-center justify-center rotate-90">
                          <span className="text-[11px] font-bold" style={{ color: goal.color || '#6366f1' }}>{progress}%</span>
                        </div>
                      </div>
                    </div>

                    {goal.deadline && (() => {
                      const info = getDeadlineInfo(goal.deadline);
                      return info ? (
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                            style={{ background: info.bg, color: info.color, border: `1px solid ${info.color}30` }}>
                            <FiCalendar size={10} />{info.label}
                          </span>
                          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            {new Date(goal.deadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      ) : null;
                    })()}

                    {(goal.milestones || []).length > 0 && (
                      <>
                        <button onClick={() => setExpanded(e => ({ ...e, [goal._id]: !e[goal._id] }))}
                          className="flex items-center gap-1.5 text-xs font-medium w-full text-left transition-colors"
                          style={{ color: 'rgba(255,255,255,0.5)' }}>
                          <FiList size={12} /> {goal.milestones.filter(m => m.completed).length}/{goal.milestones.length} milestones
                          {isExpanded ? <FiChevronUp size={12} className="ml-auto" /> : <FiChevronDown size={12} className="ml-auto" />}
                        </button>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden space-y-2">
                              {goal.milestones.map((m, i) => (
                                <div key={i} className="flex items-center gap-2.5 text-sm">
                                  <button onClick={() => handleToggleMilestone(goal._id, m._id || i)}
                                    className="w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center transition-all"
                                    style={{ background: m.completed ? (goal.color || '#6366f1') : 'rgba(255,255,255,0.08)', border: `1px solid ${m.completed ? 'transparent' : 'rgba(255,255,255,0.15)'}` }}>
                                    {m.completed && <FiCheck size={11} className="text-white" />}
                                  </button>
                                  <span style={{ color: m.completed ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.8)', textDecoration: m.completed ? 'line-through' : 'none' }}>{m.title}</span>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl"
              style={{ background: 'rgba(15,23,42,0.98)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>
              
              <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <h2 className="text-lg font-bold text-white">{editGoal ? 'Edit Goal' : 'New Goal'}</h2>
                <button onClick={() => setModalOpen(false)} className="p-2 rounded-xl hover:bg-white/10 transition-all" style={{ color: 'rgba(255,255,255,0.5)' }}><FiX size={18} /></button>
              </div>

              <div className="p-6 space-y-5">
                
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'rgba(255,255,255,0.4)' }}>Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {ICONS.map(ic => (
                      <button key={ic} onClick={() => setForm(f => ({ ...f, icon: ic }))}
                        className="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all"
                        style={{ background: form.icon === ic ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.05)', border: `2px solid ${form.icon === ic ? '#7c3aed' : 'transparent'}` }}>
                        {ic}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'rgba(255,255,255,0.4)' }}>Title *</label>
                  <input style={inputStyle} placeholder="e.g. Run a Marathon" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'rgba(255,255,255,0.4)' }}>Description</label>
                  <textarea rows={2} style={{ ...inputStyle, resize: 'none' }} placeholder="Optional description..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'rgba(255,255,255,0.4)' }}>Category</label>
                    <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                      {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#0f172a' }}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'rgba(255,255,255,0.4)' }}>Deadline</label>
                    <input type="date" style={{ ...inputStyle, colorScheme: 'dark' }} value={form.deadline ? form.deadline.slice(0, 10) : ''} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'rgba(255,255,255,0.4)' }}>Color</label>
                  <div className="flex gap-3">
                    {COLORS.map(c => (
                      <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                        className="w-8 h-8 rounded-full transition-all"
                        style={{ background: c, transform: form.color === c ? 'scale(1.25)' : 'scale(1)', boxShadow: form.color === c ? `0 0 0 3px rgba(255,255,255,0.9)` : 'none' }} />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'rgba(255,255,255,0.4)' }}>Milestones</label>
                  <div className="flex gap-2 mb-2">
                    <input style={{ ...inputStyle, flex: 1 }} placeholder="Add milestone..." value={newMilestone} onChange={e => setNewMilestone(e.target.value)} onKeyDown={e => e.key === 'Enter' && addMilestone()} />
                    <button onClick={addMilestone} className="px-3 rounded-xl font-semibold text-white text-sm" style={{ background: 'rgba(124,58,237,0.4)', border: '1px solid rgba(124,58,237,0.3)' }}>Add</button>
                  </div>
                  <div className="space-y-1.5">
                    {(form.milestones || []).map((m, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <span className="text-sm text-white">{m.title}</span>
                        <button onClick={() => setForm(f => ({ ...f, milestones: f.milestones.filter((_, idx) => idx !== i) }))} className="text-red-400/60 hover:text-red-400"><FiX size={13} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)' }}>Cancel</button>
                <motion.button onClick={handleSave} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="px-6 py-2.5 rounded-xl font-semibold text-white text-sm"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 4px 20px rgba(124,58,237,0.3)' }}>
                  {editGoal ? 'Save Changes' : 'Create Goal'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
