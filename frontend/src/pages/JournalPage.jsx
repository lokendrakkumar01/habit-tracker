import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { FiBook, FiSmile, FiSave, FiCalendar, FiPlus, FiTrash2 } from 'react-icons/fi';
import { fetchJournals, saveJournal, fetchMoodHistory } from '../features/journal/journalSlice';

const MOODS = [
  { emoji: '😄', label: 'Great', value: 5, color: '#10b981' },
  { emoji: '🙂', label: 'Good', value: 4, color: '#6366f1' },
  { emoji: '😐', label: 'Okay', value: 3, color: '#f59e0b' },
  { emoji: '😕', label: 'Low', value: 2, color: '#f97316' },
  { emoji: '😞', label: 'Bad', value: 1, color: '#ef4444' },
];

const inputStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  padding: '12px 14px',
  color: '#fff',
  fontSize: '14px',
  width: '100%',
  outline: 'none',
  resize: 'none',
  fontFamily: 'Inter, sans-serif',
};

export default function JournalPage() {
  const dispatch = useDispatch();
  const { journals, moodHistory, loading } = useSelector(s => s.journal);
  const { user } = useSelector(s => s.auth);

  const [selectedJournal, setSelectedJournal] = useState(null);
  const [form, setForm] = useState({ mood: null, content: '', gratitude: ['', '', ''] });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchJournals());
    dispatch(fetchMoodHistory());
  }, [dispatch]);

  useEffect(() => {
    // Load today's journal if exists
    if (journals && journals.length > 0) {
      const today = new Date().toISOString().slice(0, 10);
      const todayEntry = journals.find(j => j.date?.slice(0, 10) === today);
      if (todayEntry) {
        setForm({
          mood: todayEntry.mood || null,
          content: todayEntry.content || '',
          gratitude: todayEntry.gratitude?.length ? [...todayEntry.gratitude, '', '', ''].slice(0, 3) : ['', '', ''],
        });
      }
    }
  }, [journals]);

  const handleSave = async () => {
    if (!form.mood) { toast.error('Please select your mood'); return; }
    if (!form.content.trim()) { toast.error('Write something in your journal'); return; }
    setSaving(true);
    try {
      const payload = {
        mood: form.mood,
        content: form.content,
        gratitude: form.gratitude.filter(g => g.trim()),
      };
      await dispatch(saveJournal(payload)).unwrap();
      toast.success('Journal saved! 📝');
    } catch (err) {
      toast.error(err || 'Failed to save journal');
    } finally {
      setSaving(false);
    }
  };

  const setGratitude = (i, val) => setForm(f => {
    const g = [...f.gratitude];
    g[i] = val;
    return { ...f, gratitude: g };
  });

  const chartData = (moodHistory || []).map(m => ({
    date: new Date(m.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    mood: m.mood,
  }));

  const selectedMoodMeta = MOODS.find(m => m.value === form.mood);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ background: '#020617' }}>
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <FiBook className="text-violet-400" /> Daily Journal
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: History */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>History</h2>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {(journals || []).map((j, i) => {
                const mood = MOODS.find(m => m.value === j.mood);
                return (
                  <motion.button key={j._id || i}
                    onClick={() => setSelectedJournal(selectedJournal?._id === j._id ? null : j)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                    style={{
                      background: selectedJournal?._id === j._id ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${selectedJournal?._id === j._id ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.06)'}`,
                    }}>
                    <span className="text-xl">{mood?.emoji || '📓'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white">{new Date(j.date || j.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</p>
                      <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{j.content?.slice(0, 40)}...</p>
                    </div>
                    {mood && <span className="text-xs font-medium flex-shrink-0" style={{ color: mood.color }}>{mood.label}</span>}
                  </motion.button>
                );
              })}
              {(!journals || journals.length === 0) && (
                <div className="text-center py-8 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No entries yet</div>
              )}
            </div>

            {/* Mood Chart */}
            {chartData.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>30-Day Mood</h3>
                <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <ResponsiveContainer width="100%" height={100}>
                    <AreaChart data={chartData.slice(-14)}>
                      <defs>
                        <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                      <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 9 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 5]} tick={false} axisLine={false} tickLine={false} width={0} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px', color: '#fff' }} />
                      <Area type="monotone" dataKey="mood" stroke="#7c3aed" fill="url(#moodGrad)" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </motion.div>

          {/* Right: Editor */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-5">

            {/* Selected journal view */}
            <AnimatePresence>
              {selectedJournal && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="rounded-2xl p-5" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-violet-400">
                      {new Date(selectedJournal.date || selectedJournal.createdAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                    <button onClick={() => setSelectedJournal(null)} className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Close ×</button>
                  </div>
                  <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{selectedJournal.content}</p>
                  {selectedJournal.gratitude?.length > 0 && (
                    <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                      <p className="text-xs font-medium text-violet-400 mb-2">Gratitude:</p>
                      {selectedJournal.gratitude.map((g, i) => <p key={i} className="text-sm text-white">• {g}</p>)}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mood selector */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-3 block" style={{ color: 'rgba(255,255,255,0.4)' }}>
                How are you feeling today?
              </label>
              <div className="flex gap-3">
                {MOODS.map(m => (
                  <motion.button key={m.value} onClick={() => setForm(f => ({ ...f, mood: m.value }))}
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all text-center"
                    style={{
                      background: form.mood === m.value ? `${m.color}22` : 'rgba(255,255,255,0.04)',
                      border: `2px solid ${form.mood === m.value ? m.color : 'rgba(255,255,255,0.08)'}`,
                    }}>
                    <span className="text-2xl">{m.emoji}</span>
                    <span className="text-xs hidden sm:block" style={{ color: form.mood === m.value ? m.color : 'rgba(255,255,255,0.4)' }}>{m.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Journal editor */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Today's reflection
              </label>
              <textarea rows={6} style={inputStyle} placeholder="What's on your mind today? How did your habits go? What are you proud of?..."
                value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>{form.content.length} characters</p>
            </div>

            {/* Gratitude */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-3 block" style={{ color: 'rgba(255,255,255,0.4)' }}>
                3 things I'm grateful for
              </label>
              <div className="space-y-2">
                {form.gratitude.map((g, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa' }}>{i + 1}</span>
                    <input style={inputStyle} placeholder={`I'm grateful for...`} value={g} onChange={e => setGratitude(i, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>

            {/* Save */}
            <motion.button onClick={handleSave} disabled={saving}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 4px 20px rgba(124,58,237,0.3)', opacity: saving ? 0.7 : 1 }}>
              {saving ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
              ) : <><FiSave size={16} /> Save Journal</>}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
