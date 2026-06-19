import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, AlertTriangle, ShieldAlert, CheckCircle, Plus, ChevronRight, HelpCircle, Compass, Zap } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AICoachView() {
  const queryClient = useQueryClient();
  const [askActive, setAskActive] = useState(false);
  const [coachResponse, setCoachResponse] = useState(null);

  const { data: suggestionsData, isLoading: suggestionsLoading } = useQuery({
    queryKey: ['aiSuggestions'],
    queryFn: async () => {
      const res = await api.get('/ai/suggestions');
      return res.data.suggestions;
    }
  });

  const { data: burnoutData } = useQuery({
    queryKey: ['aiBurnout'],
    queryFn: async () => {
      const res = await api.get('/ai/burnout');
      return res.data;
    }
  });

  const { data: predictionsData } = useQuery({
    queryKey: ['aiPredictions'],
    queryFn: async () => {
      const res = await api.get('/ai/predictions');
      return res.data.predictions;
    }
  });

  const addHabitMutation = useMutation({
    mutationFn: async (habit) => {
      return await api.post('/habits', {
        title: habit.title,
        description: habit.description,
        category: habit.category,
        priority: habit.difficulty === 'Easy' ? 'Low' : habit.difficulty === 'Medium' ? 'Medium' : 'High',
        icon: habit.icon,
        frequency: 'daily'
      });
    },
    onSuccess: () => {
      toast.success('Habit added successfully!');
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['aiSuggestions'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to add habit');
    }
  });

  const askCoachMutation = useMutation({
    mutationFn: async () => {
      const res = await api.get('/ai/growth-report');
      return res.data.growthReport;
    },
    onSuccess: (data) => {
      setCoachResponse(data.summary);
      setAskActive(true);
    }
  });

  return (
    <div className="space-y-6">
      
      <div className="glass-card p-6 relative overflow-hidden bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sparkles size={80} className="text-purple-400" />
        </div>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-500/20 rounded-2xl border border-purple-500/30 text-purple-400">
            <Sparkles className="animate-pulse" size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold tracking-tight">AI Productivity Coach</h3>
            <p className="text-sm text-slate-400 dark:text-slate-400 text-balance leading-relaxed">
              Your personalized workspace optimizer. Harnessing local patterns to protect streaks, prevent burnout, and design customized habits.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => askCoachMutation.mutate()}
            disabled={askCoachMutation.isPending}
            className="btn-primary py-2 px-4 text-xs font-semibold rounded-xl flex items-center gap-2"
          >
            <Zap size={14} />
            {askCoachMutation.isPending ? 'Consulting Coach...' : 'Get Daily Strategy Session'}
          </button>
        </div>

        <AnimatePresence>
          {askActive && coachResponse && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-xs text-slate-300 dark:text-slate-300 leading-relaxed"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-indigo-400">Coach Advice:</span>
                <button onClick={() => setAskActive(false)} className="text-slate-500 hover:text-slate-300">Close</button>
              </div>
              <p>{coachResponse}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {burnoutData && burnoutData.burnoutStatus !== 'low' && (
        <div className={`p-4 rounded-2xl border flex gap-3 ${
          burnoutData.burnoutStatus === 'high'
            ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
            : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
        }`}>
          {burnoutData.burnoutStatus === 'high' ? <ShieldAlert size={20} className="shrink-0" /> : <AlertTriangle size={20} className="shrink-0" />}
          <div className="space-y-1">
            <h4 className="text-sm font-bold capitalize">Burnout Risk: {burnoutData.burnoutStatus}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{burnoutData.coachMessage}</p>
          </div>
        </div>
      )}

      <div className="glass-card p-6">
        <h4 className="text-sm font-bold text-slate-200 dark:text-slate-300 mb-4 flex items-center gap-2">
          <Compass size={16} className="text-indigo-400" />
          Smart Habits Suggestion
        </h4>

        {suggestionsLoading ? (
          <div className="space-y-3">
            <div className="h-12 skeleton w-full"></div>
            <div className="h-12 skeleton w-full"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestionsData && suggestionsData.map((s, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-800 dark:border-slate-800 bg-slate-900/40 hover:bg-slate-900/60 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{s.icon}</span>
                  <div>
                    <h5 className="text-xs font-bold text-slate-200">{s.title}</h5>
                    <p className="text-[10px] text-slate-400">{s.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => addHabitMutation.mutate(s)}
                  disabled={addHabitMutation.isPending}
                  className="p-2 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded-lg border border-indigo-500/20 transition duration-300"
                >
                  <Plus size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {predictionsData && predictionsData.length > 0 && (
        <div className="glass-card p-6">
          <h4 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-rose-400" />
            Productivity & Miss Prediction
          </h4>

          <div className="space-y-4">
            {predictionsData.map((pred, idx) => (
              <div key={idx} className="space-y-2 border-b border-slate-800/60 pb-3 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-300">{pred.title} ({pred.dayOfWeek})</span>
                  <span className="font-bold text-rose-400">{pred.probability}% miss rate</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full" style={{ width: `${pred.probability}%` }}></div>
                </div>
                <p className="text-[10px] text-slate-400 italic leading-relaxed">{pred.tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
