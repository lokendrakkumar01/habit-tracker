import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiSearch, FiUsers, FiUserPlus, FiCheck, FiX, FiAward, FiZap,
  FiMessageSquare, FiFlag, FiHeart, FiSend, FiPlusCircle
} from 'react-icons/fi';
import { MdLeaderboard } from 'react-icons/md';
import api from '../services/api';
import {
  fetchLeaderboard, fetchFriends, searchUsers, sendFriendRequest, acceptFriendRequest
} from '../features/social/socialSlice';

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

const TABS = [
  { id: 'leaderboard', label: 'Leaderboard', icon: MdLeaderboard },
  { id: 'friends', label: 'Friends', icon: FiUsers },
  { id: 'communities', label: 'Communities', icon: FiMessageSquare },
  { id: 'challenges', label: 'Challenges', icon: FiFlag },
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
  const { leaderboard, friends, friendRequests, searchResults } = useSelector(s => s.social);
  const { user } = useSelector(s => s.auth);
  
  const [tab, setTab] = useState('leaderboard');
  const [query, setQuery] = useState('');
  const [pendingRequests, setPendingRequests] = useState(new Set());

  // Communities State
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [postContent, setPostContent] = useState('');
  const [newCommunityName, setNewCommunityName] = useState('');
  const [newCommunityDesc, setNewCommunityDesc] = useState('');
  const [showCreateCommunity, setShowCreateCommunity] = useState(false);

  // Challenges State
  const [challenges, setChallenges] = useState([]);
  const [newChallengeForm, setNewChallengeForm] = useState({
    title: '', description: '', category: 'Productivity', targetDays: 7, xpReward: 100, badgeReward: '🏆', endDate: ''
  });
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);

  const fetchCommunities = async () => {
    try {
      const res = await api.get('/social/communities');
      setCommunities(res.data.communities || []);
      if (selectedCommunity) {
        const updated = res.data.communities.find(c => c._id === selectedCommunity._id);
        if (updated) setSelectedCommunity(updated);
      }
    } catch { toast.error('Failed to load communities'); }
  };

  const fetchChallenges = async () => {
    try {
      const res = await api.get('/social/challenges');
      setChallenges(res.data.challenges || []);
    } catch { toast.error('Failed to load challenges'); }
  };

  useEffect(() => {
    dispatch(fetchLeaderboard());
    dispatch(fetchFriends());
    fetchCommunities();
    fetchChallenges();
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

  // Community handlers
  const handleCreateCommunity = async () => {
    if (!newCommunityName.trim()) return;
    try {
      await api.post('/social/communities', { name: newCommunityName, description: newCommunityDesc });
      toast.success('Community created! 👥');
      setNewCommunityName('');
      setNewCommunityDesc('');
      setShowCreateCommunity(false);
      fetchCommunities();
    } catch { toast.error('Failed to create community'); }
  };

  const handleJoinCommunity = async (id) => {
    try {
      await api.post(`/social/communities/join/${id}`);
      toast.success('Joined community! 🎉');
      fetchCommunities();
    } catch { toast.error('Failed to join community'); }
  };

  const handleCreatePost = async () => {
    if (!postContent.trim()) return;
    try {
      await api.post(`/social/communities/post/${selectedCommunity._id}`, { content: postContent });
      setPostContent('');
      fetchCommunities();
      toast.success('Post shared!');
    } catch { toast.error('Failed to post'); }
  };

  const handleLikePost = async (postId) => {
    try {
      await api.post(`/social/communities/like/${selectedCommunity._id}/${postId}`);
      fetchCommunities();
    } catch { toast.error('Failed to like post'); }
  };

  // Challenge handlers
  const handleJoinChallenge = async (id) => {
    try {
      await api.post(`/social/challenges/join/${id}`);
      toast.success('Joined challenge! Get ready to crush it! 🚀');
      fetchChallenges();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join challenge');
    }
  };

  const handleCreateChallenge = async () => {
    if (!newChallengeForm.title.trim() || !newChallengeForm.endDate) {
      toast.error('Title and Deadline required');
      return;
    }
    try {
      await api.post('/social/challenges', newChallengeForm);
      toast.success('Challenge created! 🏆');
      setNewChallengeForm({
        title: '', description: '', category: 'Productivity', targetDays: 7, xpReward: 100, badgeReward: '🏆', endDate: ''
      });
      setShowCreateChallenge(false);
      fetchChallenges();
    } catch { toast.error('Failed to create challenge'); }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ background: '#020617' }}>
      <div className="mx-auto max-w-5xl space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <FiUsers className="text-violet-400" /> Social Ecosystem
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Connect, compete, share strategies and join challenges</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.04)' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all"
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
                    <div className="w-8 text-center flex-shrink-0">
                      {rankStyle ? <span className="text-xl">{rankStyle.label}</span> : <span className="text-base font-bold text-slate-500">#{rank}</span>}
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
                      <div className="text-xs text-slate-500">{(u.badges || []).length} badges</div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* FRIENDS */}
          {tab === 'friends' && (
            <motion.div key="friends" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-6">
              {friendRequests?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 text-slate-400">Pending Requests</h3>
                  <div className="space-y-2">
                    {friendRequests.map(fr => (
                      <div key={fr._id} className="flex items-center gap-3 p-3 rounded-xl glass-card">
                        <Avatar user={fr} size={36} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{fr.name}</p>
                        </div>
                        <button onClick={() => handleAccept(fr._id)} className="btn-primary py-1.5 px-3 text-xs">Accept</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 text-slate-400">All Friends</h3>
                {friends?.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-sm">No friends added yet.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {friends?.map(f => (
                      <div key={f._id} className="flex items-center gap-3 p-3 rounded-xl glass-card">
                        <Avatar user={f} size={44} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white text-sm">{f.name}</p>
                          <XPBar xp={f.xp} />
                        </div>
                        <span className="text-xs text-indigo-400">Lvl {f.level}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* COMMUNITIES */}
          {tab === 'communities' && (
            <motion.div key="comm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Groups list */}
              <div className="lg:col-span-1 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Groups</h3>
                  <button onClick={() => setShowCreateCommunity(!showCreateCommunity)} className="text-xs text-indigo-400 flex items-center gap-1">
                    <PlusCircle size={14} /> Create
                  </button>
                </div>

                {showCreateCommunity && (
                  <div className="p-4 rounded-xl glass-card space-y-3">
                    <input className="input-field" placeholder="Group Name" value={newCommunityName} onChange={e => setNewCommunityName(e.target.value)} />
                    <textarea className="input-field" rows={2} placeholder="Description" value={newCommunityDesc} onChange={e => setNewCommunityDesc(e.target.value)} />
                    <div className="flex gap-2">
                      <button onClick={handleCreateCommunity} className="btn-primary py-1 px-3 text-xs">Create</button>
                      <button onClick={() => setShowCreateCommunity(false)} className="btn-secondary py-1 px-3 text-xs">Cancel</button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {communities.map(c => {
                    const isMember = c.members.some(m => m._id === user?._id);
                    return (
                      <button key={c._id} onClick={() => setSelectedCommunity(c)}
                        className={`w-full text-left p-3 rounded-xl transition flex justify-between items-center ${
                          selectedCommunity?._id === c._id ? 'bg-indigo-500/10 border border-indigo-500/30' : 'glass-card'
                        }`}>
                        <div>
                          <h4 className="font-bold text-sm text-white">{c.name}</h4>
                          <p className="text-xs text-slate-400">{c.members.length} members</p>
                        </div>
                        {!isMember && (
                          <button onClick={(e) => { e.stopPropagation(); handleJoinCommunity(c._id); }} className="btn-primary py-1 px-2.5 text-[10px]">
                            Join
                          </button>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Community Feed */}
              <div className="lg:col-span-2 space-y-4">
                {selectedCommunity ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border border-white/5 bg-slate-900/40">
                      <h3 className="font-black text-white text-base">{selectedCommunity.name}</h3>
                      <p className="text-xs text-slate-400 mt-1">{selectedCommunity.description}</p>
                    </div>

                    {/* Create Post */}
                    <div className="glass-card p-4 space-y-3">
                      <div className="flex gap-2">
                        <Avatar user={user} size={36} />
                        <textarea className="input-field py-2" rows={2} placeholder="Share your progress, tips, or milestones..." value={postContent} onChange={e => setPostContent(e.target.value)} />
                      </div>
                      <div className="flex justify-end">
                        <button onClick={handleCreatePost} className="btn-primary py-1.5 px-4 text-xs flex items-center gap-1">
                          <FiSend size={12} /> Post
                        </button>
                      </div>
                    </div>

                    {/* Posts list */}
                    <div className="space-y-3">
                      {selectedCommunity.posts && selectedCommunity.posts.map(post => {
                        const hasLiked = post.likes.includes(user?._id);
                        return (
                          <div key={post._id} className="glass-card p-4 space-y-3">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Avatar user={post.user} size={32} />
                                <div>
                                  <span className="text-xs font-bold text-white">{post.user?.name}</span>
                                  <span className="text-[10px] text-slate-500 block">
                                    {new Date(post.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <button onClick={() => handleLikePost(post._id)} className={`flex items-center gap-1 text-xs ${hasLiked ? 'text-rose-500' : 'text-slate-400'}`}>
                                <FiHeart size={14} className={hasLiked ? 'fill-rose-500' : ''} /> {post.likes.length}
                              </button>
                            </div>
                            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                          </div>
                        );
                      })}
                      {(!selectedCommunity.posts || selectedCommunity.posts.length === 0) && (
                        <div className="text-center py-10 text-slate-500 text-xs">No posts yet. Be the first to share!</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 text-slate-500 text-sm glass-card">
                    Select a community from the left column to view the conversation feed.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* CHALLENGES */}
          {tab === 'challenges' && (
            <motion.div key="chall" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-6">
              
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Available Community Challenges</h3>
                <button onClick={() => setShowCreateChallenge(!showCreateChallenge)} className="btn-primary py-1.5 px-4 text-xs flex items-center gap-1">
                  <PlusCircle size={14} /> Launch Challenge
                </button>
              </div>

              {showCreateChallenge && (
                <div className="glass-card p-6 space-y-4 max-w-lg">
                  <h4 className="font-bold text-white text-sm">Create Challenge</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <input className="input-field col-span-2" placeholder="Challenge Title" value={newChallengeForm.title} onChange={e => setNewChallengeForm(e.target.value)} />
                    <textarea className="input-field col-span-2" placeholder="Description" value={newChallengeForm.description} onChange={e => setNewChallengeForm(e.target.value)} />
                    <select className="input-field" value={newChallengeForm.category} onChange={e => setNewChallengeForm(e.target.value)}>
                      <option value="Productivity">Productivity</option>
                      <option value="Fitness">Fitness</option>
                      <option value="Health">Health</option>
                      <option value="Coding">Coding</option>
                    </select>
                    <input className="input-field" type="number" placeholder="Target Days" value={newChallengeForm.targetDays} onChange={e => setNewChallengeForm({ ...newChallengeForm, targetDays: parseInt(e.target.value) })} />
                    <input className="input-field" type="date" placeholder="End Date" value={newChallengeForm.endDate} onChange={e => setNewChallengeForm({ ...newChallengeForm, endDate: e.target.value })} />
                    <input className="input-field" type="number" placeholder="XP Reward" value={newChallengeForm.xpReward} onChange={e => setNewChallengeForm({ ...newChallengeForm, xpReward: parseInt(e.target.value) })} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleCreateChallenge} className="btn-primary py-1.5 px-4 text-xs">Launch</button>
                    <button onClick={() => setShowCreateChallenge(false)} className="btn-secondary py-1.5 px-4 text-xs">Cancel</button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {challenges.map(c => {
                  const isJoined = c.participants.some(p => p.user === user?._id || p.user?._id === user?._id);
                  const progressObj = c.participants.find(p => p.user === user?._id || p.user?._id === user?._id);
                  const progressPct = progressObj ? Math.round((progressObj.progress / c.targetDays) * 100) : 0;
                  
                  return (
                    <div key={c._id} className="glass-card p-5 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-3xl">{c.badgeReward}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold">{c.category}</span>
                        </div>
                        <h4 className="font-bold text-white text-base mt-2">{c.title}</h4>
                        <p className="text-xs text-slate-400 mt-1">{c.description}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>Reward: <strong className="text-amber-400">{c.xpReward} XP</strong></span>
                          <span>{c.participants.length} joined</span>
                        </div>
                        {isJoined && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-400">
                              <span>Your Progress</span>
                              <span>{progressObj.progress}/{c.targetDays} days ({progressPct}%)</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-indigo-500 h-full" style={{ width: `${progressPct}%` }}></div>
                            </div>
                          </div>
                        )}
                      </div>

                      {!isJoined ? (
                        <button onClick={() => handleJoinChallenge(c._id)} className="btn-primary w-full py-2 text-xs">
                          Join Challenge
                        </button>
                      ) : (
                        <button disabled className="btn-secondary w-full py-2 text-xs text-indigo-400 cursor-not-allowed">
                          Active Participant
                        </button>
                      )}
                    </div>
                  );
                })}
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
                      className="flex items-center gap-3 p-3 rounded-xl glass-card">
                      <Avatar user={u} size={40} />
                      <div className="flex-1">
                        <p className="font-medium text-white text-sm">{u.name}</p>
                        <p className="text-xs text-slate-500">Level {u.level} · {u.xp} XP</p>
                      </div>
                      {isAlreadyFriend ? (
                        <span className="text-xs px-2 py-1 rounded-lg font-medium bg-emerald-500/10 text-emerald-400">Friends</span>
                      ) : isPending ? (
                        <span className="text-xs px-2 py-1 rounded-lg font-medium text-slate-500">Sent</span>
                      ) : (
                        <button onClick={() => handleSendRequest(u._id)} className="btn-primary py-1 px-3 text-xs">Add</button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
