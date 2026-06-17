import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};
import { FiSearch, FiUsers, FiUserPlus, FiCheck, FiX, FiAward, FiZap } from 'react-icons/fi';
import { MdLeaderboard } from 'react-icons/md';
import {
  fetchLeaderboard, fetchFriends, searchUsers, sendFriendRequest, acceptFriendRequest
} from '../features/social/socialSlice';

const TABS = [
  { id: 'leaderboard', label: 'Leaderboard', icon: MdLeaderboard },
  { id: 'friends', label: 'Friends', icon: FiUsers },
  { id: 'search', label: 'Search', icon: FiSearch },
];

const RANK_COLORS = {
  1: { bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.4)', text: '#fbbf24', label: '🥇' },
  2: { bg: 'rgba(148,163,184,0.15)', border: 'rgba(148,163,184,0.4)', text: '#94a3b8', label: '🥈' },
  3: { bg: 'rgba(234,88,12,0.15)', border: 'rgba(234,88,12,0.4)', text: '#ea8c0b', label: '🥉' },
};

const Avatar = ({ user, size = 40 }) => {
  const initials = (user?.name || 'U').slice(0, 2).toUpperCase();
  const colors = ['#7c3aed', '#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626'];
  const colorIdx = initials.charCodeAt(0) % colors.length;
  return (
    <div className="rounded-full overflow-hidden flex items-center justify-center font-bold text-white flex-shrink-0"
      style={{ width: size, height: size, background: user?.avatar ? 'transparent' : colors[colorIdx], fontSize: size * 0.36 }}>
      {user?.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : initials}
    </div>
  );
};

const XPBar = ({ xp = 0 }) => {
  const levelXP = [0, 500, 1500, 3000, 6000, 10000];
  const level = levelXP.filter(t => xp >= t).length;
  const curr = levelXP[level - 1] || 0;
  const next = levelXP[level] || curr + 1;
  const pct = Math.min(100, Math.round(((xp - curr) / (next - curr)) * 100));
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#7c3aed,#a78bfa)' }} />
      </div>
      <span className="text-xs font-medium" style={{ color: '#a78bfa', minWidth: 40 }}>{xp.toLocaleString()} XP</span>
    </div>
  );
};

export default function SocialPage() {
  const dispatch = useDispatch();
  const { leaderboard, friends, friendRequests, searchResults, loading } = useSelector(s => s.social);
  const { user } = useSelector(s => s.auth);
  const [tab, setTab] = useState('leaderboard');
  const [query, setQuery] = useState('');
  const [pendingRequests, setPendingRequests] = useState(new Set());

  useEffect(() => {
    dispatch(fetchLeaderboard());
    dispatch(fetchFriends());
  }, [dispatch]);

  const doSearch = useCallback(
    debounce((q) => { if (q.trim()) dispatch(searchUsers(q)); }, 400),
    [dispatch]
  );

  useEffect(() => { doSearch(query); }, [query, doSearch]);

  const handleSendRequest = async (userId) => {
    try {
      await dispatch(sendFriendRequest(userId)).unwrap();
      setPendingRequests(prev => new Set([...prev, userId]));
      toast.success('Friend request sent! 👋');
    } catch { toast.error('Failed to send request'); }
  };

  const handleAccept = async (userId) => {
    try {
      await dispatch(acceptFriendRequest(userId)).unwrap();
      dispatch(fetchFriends());
      toast.success('Friend added! 🎉');
    } catch { toast.error('Failed to accept'); }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ background: '#020617' }}>
      <div className="mx-auto max-w-5xl space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <FiUsers className="text-violet-400" /> Social
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Connect, compete, and inspire each other</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.04)' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: tab === t.id ? 'rgba(124,58,237,0.25)' : 'transparent',
                color: tab === t.id ? '#a78bfa' : 'rgba(255,255,255,0.5)',
              }}>
              <t.icon size={15} /> {t.label}
              {t.id === 'friends' && (friendRequests || []).length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold" style={{ background: '#ef4444', color: '#fff' }}>
                  {friendRequests.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* LEADERBOARD */}
          {tab === 'leaderboard' && (
            <motion.div key="lb" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-3">
              {(leaderboard || []).map((u, i) => {
                const rank = i + 1;
                const rankStyle = RANK_COLORS[rank];
                const isMe = u._id === user?._id;
                return (
                  <motion.div key={u._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-4 p-4 rounded-2xl transition-all"
                    style={{
                      background: isMe ? 'rgba(124,58,237,0.12)' : (rankStyle?.bg || 'rgba(255,255,255,0.03)'),
                      border: `1px solid ${isMe ? 'rgba(124,58,237,0.4)' : (rankStyle?.border || 'rgba(255,255,255,0.06)')}`,
                    }}>
                    {/* Rank */}
                    <div className="w-8 text-center flex-shrink-0">
                      {rankStyle ? (
                        <span className="text-xl">{rankStyle.label}</span>
                      ) : (
                        <span className="text-base font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>#{rank}</span>
                      )}
                    </div>
                    <Avatar user={u} size={42} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm truncate">{u.name}</span>
                        {isMe && <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(124,58,237,0.3)', color: '#a78bfa' }}>You</span>}
                      </div>
                      <XPBar xp={u.xp} />
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-bold text-white">Lvl {u.level}</div>
                      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{(u.badges || []).length} badges</div>
                    </div>
                  </motion.div>
                );
              })}
              {(!leaderboard || leaderboard.length === 0) && (
                <div className="text-center py-12 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No leaderboard data yet. Start tracking habits!</div>
              )}
            </motion.div>
          )}

          {/* FRIENDS */}
          {tab === 'friends' && (
            <motion.div key="friends" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-6">
              {/* Friend Requests */}
              {(friendRequests || []).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Pending Requests ({friendRequests.length})
                  </h3>
                  <div className="space-y-2">
                    {friendRequests.map(fr => (
                      <div key={fr._id} className="flex items-center gap-3 p-3 rounded-xl"
                        style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
                        <Avatar user={fr} size={36} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{fr.name}</p>
                          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Level {fr.level}</p>
                        </div>
                        <button onClick={() => handleAccept(fr._id)}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1"
                          style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}>
                          <FiCheck size={13} /> Accept
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Friends list */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Friends ({(friends || []).length})
                </h3>
                {(friends || []).length === 0 ? (
                  <div className="text-center py-10 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    No friends yet. Use Search to find people!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(friends || []).map(f => (
                      <div key={f._id} className="flex items-center gap-3 p-3 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <Avatar user={f} size={44} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white text-sm">{f.name}</p>
                          <XPBar xp={f.xp} />
                        </div>
                        <div className="text-xs font-semibold" style={{ color: '#a78bfa' }}>Lvl {f.level}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* SEARCH */}
          {tab === 'search' && (
            <motion.div key="search" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-4">
              <div className="relative">
                <FiSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.3)' }} />
                <input
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  placeholder="Search by name or email..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                {(searchResults || []).map(u => {
                  const isAlreadyFriend = (friends || []).some(f => f._id === u._id);
                  const isPending = pendingRequests.has(u._id);
                  return (
                    <motion.div key={u._id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <Avatar user={u} size={40} />
                      <div className="flex-1">
                        <p className="font-medium text-white text-sm">{u.name}</p>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Level {u.level} · {u.xp} XP</p>
                      </div>
                      {isAlreadyFriend ? (
                        <span className="text-xs px-2 py-1 rounded-lg font-medium" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>Friends</span>
                      ) : isPending ? (
                        <span className="text-xs px-2 py-1 rounded-lg font-medium" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>Sent</span>
                      ) : (
                        <button onClick={() => handleSendRequest(u._id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium"
                          style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}>
                          <FiUserPlus size={13} /> Add
                        </button>
                      )}
                    </motion.div>
                  );
                })}
                {query.length > 0 && (searchResults || []).length === 0 && (
                  <div className="text-center py-8 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No users found for "{query}"</div>
                )}
                {query.length === 0 && (
                  <div className="text-center py-8 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Type to search for users</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
