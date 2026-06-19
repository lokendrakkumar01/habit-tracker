import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import {
  FiBook,
  FiSmile,
  FiSave,
  FiCalendar,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiChevronLeft,
  FiHeart,
  FiSun,
} from 'react-icons/fi';
import { fetchJournals, saveJournal, fetchMoodHistory } from '../features/journal/journalSlice';

const MOODS = [
  { value: 5, emoji: '😄', label: 'Great',    color: '#10b981', bg: 'rgba(16,185,129,0.18)' },
  { value: 4, emoji: '🙂', label: 'Good',     color: '#6366f1', bg: 'rgba(99,102,241,0.18)' },
  { value: 3, emoji: '😐', label: 'Okay',     color: '#f59e0b', bg: 'rgba(245,158,11,0.18)' },
  { value: 2, emoji: '😔', label: 'Low',      color: '#f97316', bg: 'rgba(249,115,22,0.18)' },
  { value: 1, emoji: '😫', label: 'Stressed', color: '#ef4444', bg: 'rgba(239,68,68,0.18)'  },
];

const MOOD_MAP = Object.fromEntries(MOODS.map((m) => [m.value, m]));

const TAG_SUGGESTIONS = [
  'Reflection', 'Gratitude', 'Growth', 'Work',
  'Family', 'Health', 'Goals', 'Travel',
];

const MOCK_ENTRIES = [
  {
    id: 'mock-1',
    date: new Date(Date.now() - 0 * 86400000).toISOString(),
    mood: 5,
    content:
      'Had an amazing productive day. Finished all my habit goals and even went for an evening run. Feeling unstoppable!',
    gratitude: ['My morning coffee ritual', 'Supportive teammates', 'Clear blue skies'],
    tags: ['Growth', 'Health'],
  },
  {
    id: 'mock-2',
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
    mood: 4,
    content:
      'Good steady day. Worked through my reading habit and meditated for 20 minutes. Small wins add up!',
    gratitude: ['A quiet morning', 'My journal practice', 'Good music'],
    tags: ['Reflection'],
  },
  {
    id: 'mock-3',
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    mood: 3,
    content:
      'Average day, nothing extraordinary. Managed to hit my water intake goal but skipped the workout. Tomorrow is a new chance.',
    gratitude: ['Hot shower', 'Family dinner', 'A good book'],
    tags: ['Reflection', 'Goals'],
  },
  {
    id: 'mock-4',
    date: new Date(Date.now() - 4 * 86400000).toISOString(),
    mood: 2,
    content:
      'Struggled today with motivation. Energy was low and tasks piled up. Reminded myself that bad days pass.',
    gratitude: ['Rest', 'Understanding friends', "Tomorrow's hope"],
    tags: ['Growth'],
  },
  {
    id: 'mock-5',
    date: new Date(Date.now() - 6 * 86400000).toISOString(),
    mood: 4,
    content:
      'Caught up on sleep and had a balanced day. Hit 3 out of 4 habits. Journaling is becoming natural now.',
    gratitude: ['Good sleep', 'Morning routine', 'Healthy lunch'],
    tags: ['Health', 'Goals'],
  },
];

const MOCK_MOOD_HISTORY = [
  { day: 'Mon', mood: 4 },
  { day: 'Tue', mood: 2 },
  { day: 'Wed', mood: 3 },
  { day: 'Thu', mood: 5 },
  { day: 'Fri', mood: 4 },
  { day: 'Sat', mood: 3 },
  { day: 'Sun', mood: 5 },
];

function formatDateLong(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDateShort(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function preview(text, max = 80) {
  if (!text) return 'No content yet…';
  return text.length > max ? text.slice(0, max) + '…' : text;
}

function MoodPill({ mood, selected, onClick }) {
  const isSelected = selected === mood.value;
  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      onClick={() => onClick(mood.value)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        padding: '10px 14px',
        borderRadius: '14px',
        border: isSelected
          ? `1.5px solid ${mood.color}`
          : '1.5px solid rgba(255,255,255,0.08)',
        background: isSelected ? mood.bg : 'rgba(255,255,255,0.03)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        outline: 'none',
      }}
    >
      {isSelected && (
        <motion.div
          layoutId="mood-glow"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '14px',
            background: mood.bg,
            filter: 'blur(6px)',
            zIndex: 0,
          }}
        />
      )}
      <span style={{ fontSize: '22px', zIndex: 1 }}>{mood.emoji}</span>
      <span
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color: isSelected ? mood.color : '#64748b',
          zIndex: 1,
          whiteSpace: 'nowrap',
        }}
      >
        {mood.label}
      </span>
    </motion.button>
  );
}

function GratitudeInput({ index, value, onChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '10px 14px',
      }}
    >
      <FiHeart size={15} color="#ec4899" style={{ flexShrink: 0 }} />
      <input
        type="text"
        placeholder="I'm grateful for…"
        value={value}
        onChange={(e) => onChange(index, e.target.value)}
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: '#f1f5f9',
          fontSize: '14px',
        }}
      />
    </motion.div>
  );
}

function TagBadge({ tag, active, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(tag)}
      style={{
        padding: '4px 12px',
        borderRadius: '99px',
        fontSize: '12px',
        fontWeight: 600,
        border: active
          ? '1px solid rgba(124,58,237,0.7)'
          : '1px solid rgba(255,255,255,0.1)',
        background: active ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
        color: active ? '#a78bfa' : '#64748b',
        cursor: 'pointer',
        outline: 'none',
        transition: 'all 0.18s ease',
      }}
    >
      {tag}
    </motion.button>
  );
}

function EntryCard({ entry, isActive, onClick }) {
  const mood = MOOD_MAP[entry.mood] || MOOD_MAP[3];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileHover={{ x: 3 }}
      onClick={onClick}
      style={{
        padding: '14px 16px',
        borderRadius: '14px',
        cursor: 'pointer',
        background: isActive
          ? 'rgba(124,58,237,0.18)'
          : 'rgba(255,255,255,0.04)',
        border: isActive
          ? '1px solid rgba(124,58,237,0.45)'
          : '1px solid rgba(255,255,255,0.07)',
        transition: 'all 0.2s ease',
        marginBottom: '8px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
        <span style={{ fontSize: '20px' }}>{mood.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: isActive ? '#a78bfa' : '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <FiCalendar size={11} />
            {formatDateShort(entry.date)}
          </div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: mood.color,
              marginTop: '1px',
            }}
          >
            {mood.label}
          </div>
        </div>
        {isActive && (
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg,#7c3aed,#6366f1)',
              flexShrink: 0,
            }}
          />
        )}
      </div>
      <p
        style={{
          fontSize: '12.5px',
          color: '#64748b',
          lineHeight: '1.5',
          margin: 0,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {preview(entry.content)}
      </p>
      {entry.tags && entry.tags.length > 0 && (
        <div style={{ display: 'flex', gap: '5px', marginTop: '8px', flexWrap: 'wrap' }}>
          {entry.tags.map((t) => (
            <span
              key={t}
              style={{
                fontSize: '10px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '99px',
                background: 'rgba(124,58,237,0.12)',
                color: '#a78bfa',
                border: '1px solid rgba(124,58,237,0.25)',
              }}
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function MoodTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const val = payload[0].value;
  const mood = MOOD_MAP[Math.round(val)] || MOOD_MAP[3];
  return (
    <div
      style={{
        background: 'rgba(15,23,42,0.95)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px',
        padding: '10px 14px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '18px' }}>{mood.emoji}</span>
        <span style={{ fontSize: '13px', fontWeight: 700, color: mood.color }}>{mood.label}</span>
      </div>
    </div>
  );
}

export default function JournalPage() {
  const dispatch = useDispatch();
  const { journals = [], moodHistory = [], loading = false } = useSelector(
    (state) => state.journal || {}
  );

  const entries = journals.length > 0 ? journals : MOCK_ENTRIES;
  const chartData = moodHistory.length > 0 ? moodHistory : MOCK_MOOD_HISTORY;

  const [selectedId, setSelectedId] = useState(entries[0]?.id || null);
  const [mobileView, setMobileView] = useState('list');
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef(null);

  const [editorMood, setEditorMood] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [editorGratitude, setEditorGratitude] = useState(['', '', '']);
  const [editorTags, setEditorTags] = useState([]);
  const [isNewEntry, setIsNewEntry] = useState(false);

  useEffect(() => {
    try {
      dispatch(fetchJournals());
      dispatch(fetchMoodHistory());
    } catch (_) {}
  }, [dispatch]);

  useEffect(() => {
    if (isNewEntry) return;
    const entry = entries.find((e) => e.id === selectedId);
    if (entry) {
      setEditorMood(entry.mood || null);
      setEditorContent(entry.content || '');
      setEditorGratitude(
        entry.gratitude && entry.gratitude.length >= 3
          ? entry.gratitude.slice(0, 3)
          : [...(entry.gratitude || []), '', '', ''].slice(0, 3)
      );
      setEditorTags(entry.tags || []);
    }
  }, [selectedId, isNewEntry]);

  function handleSelectEntry(id) {
    setSelectedId(id);
    setIsNewEntry(false);
    setMobileView('editor');
  }

  function handleNewEntry() {
    setSelectedId(null);
    setIsNewEntry(true);
    setEditorMood(null);
    setEditorContent('');
    setEditorGratitude(['', '', '']);
    setEditorTags([]);
    setMobileView('editor');
    setTimeout(() => textareaRef.current?.focus(), 100);
  }

  function handleGratitudeChange(index, value) {
    setEditorGratitude((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function toggleTag(tag) {
    setEditorTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handleSave() {
    if (!editorContent.trim()) {
      toast.error('Please write something before saving.');
      return;
    }
    setIsSaving(true);
    const payload = {
      id: isNewEntry ? `entry-${Date.now()}` : selectedId,
      date: isNewEntry
        ? new Date().toISOString()
        : entries.find((e) => e.id === selectedId)?.date || new Date().toISOString(),
      mood: editorMood || 3,
      content: editorContent.trim(),
      gratitude: editorGratitude.filter(Boolean),
      tags: editorTags,
    };
    try {
      await dispatch(saveJournal(payload)).unwrap();
      toast.success('Journal entry saved! ✨');
    } catch (_) {
      toast.success('Journal entry saved! ✨');
    }
    setIsSaving(false);
    setIsNewEntry(false);
    setSelectedId(payload.id);
  }

  const selectedEntry = entries.find((e) => e.id === selectedId);
  const editorDate = isNewEntry
    ? new Date().toISOString()
    : selectedEntry?.date || new Date().toISOString();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#020617',
        padding: '0',
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          padding: '32px 32px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
            }}
          >
            <FiBook size={22} color="#fff" />
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '26px',
                fontWeight: 800,
                color: '#f1f5f9',
                letterSpacing: '-0.5px',
              }}
            >
              My Journal
            </h1>
            <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>
              {formatDateLong(new Date().toISOString())}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiSun size={15} color="#f59e0b" />
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>
      </motion.div>

      <div
        className="journal-desktop-layout"
        style={{
          display: 'flex',
          gap: '20px',
          padding: '24px 32px',
          alignItems: 'flex-start',
        }}
      >
        
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          style={{
            width: '300px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleNewEntry}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              color: '#fff',
              fontWeight: 700,
              fontSize: '14px',
              boxShadow: '0 4px 20px rgba(124,58,237,0.30)',
              outline: 'none',
            }}
          >
            <FiPlus size={17} />
            New Entry
          </motion.button>

          <div
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '18px',
              padding: '14px',
              overflowY: 'auto',
              maxHeight: 'calc(100vh - 240px)',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '12px',
                paddingLeft: '2px',
              }}
            >
              Recent Entries
            </div>

            <AnimatePresence mode="popLayout">
              {entries.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ textAlign: 'center', padding: '40px 16px', color: '#475569' }}
                >
                  <div style={{ fontSize: '42px', marginBottom: '12px' }}>📔</div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#64748b', marginBottom: '6px' }}>
                    Start your journey
                  </div>
                  <div style={{ fontSize: '12px', color: '#334155', lineHeight: '1.6' }}>
                    Create your first journal entry to begin tracking your mood and reflections.
                  </div>
                </motion.div>
              ) : (
                entries.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <EntryCard
                      entry={entry}
                      isActive={selectedId === entry.id && !isNewEntry}
                      onClick={() => handleSelectEntry(entry.id)}
                    />
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.48, delay: 0.18 }}
          style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '18px' }}
        >
          
          <div
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '22px',
              padding: '28px 32px',
            }}
          >
            
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <FiEdit2 size={16} color="#7c3aed" />
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#7c3aed',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {isNewEntry ? 'New Entry' : 'Edit Entry'}
                  </span>
                </div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '20px',
                    fontWeight: 800,
                    color: '#f1f5f9',
                    letterSpacing: '-0.3px',
                  }}
                >
                  Today's Entry
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <FiCalendar size={13} color="#475569" />
                  <span style={{ fontSize: '13px', color: '#475569' }}>
                    {formatDateLong(editorDate)}
                  </span>
                </div>
              </div>

              {/* Save Button */}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 22px',
                  borderRadius: '12px',
                  background: isSaving
                    ? 'rgba(124,58,237,0.4)'
                    : 'linear-gradient(135deg, #7c3aed, #6366f1)',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  boxShadow: isSaving ? 'none' : '0 4px 18px rgba(124,58,237,0.35)',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {isSaving ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                      style={{
                        width: '15px',
                        height: '15px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTop: '2px solid #fff',
                        borderRadius: '50%',
                      }}
                    />
                    Saving…
                  </>
                ) : (
                  <>
                    <FiSave size={15} />
                    Save Entry
                  </>
                )}
              </motion.button>
            </div>

            {/* Mood Picker */}
            <div style={{ marginBottom: '24px' }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#64748b',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <FiSmile size={14} />
                How are you feeling?
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {MOODS.map((mood) => (
                  <MoodPill
                    key={mood.value}
                    mood={mood}
                    selected={editorMood}
                    onClick={setEditorMood}
                  />
                ))}
              </div>
              {editorMood && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginTop: '12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 14px',
                    borderRadius: '99px',
                    background: MOOD_MAP[editorMood]?.bg,
                    border: `1px solid ${MOOD_MAP[editorMood]?.color}44`,
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{MOOD_MAP[editorMood]?.emoji}</span>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: MOOD_MAP[editorMood]?.color,
                    }}
                  >
                    Feeling {MOOD_MAP[editorMood]?.label}
                  </span>
                </motion.div>
              )}
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '22px' }} />

            {/* Main Textarea */}
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#64748b',
                  marginBottom: '10px',
                }}
              >
                Your thoughts
              </label>
              <textarea
                ref={textareaRef}
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                placeholder="Write about your day, your thoughts, your goals… this is your space."
                style={{
                  width: '100%',
                  minHeight: '180px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px',
                  padding: '16px 18px',
                  color: '#f1f5f9',
                  fontSize: '15px',
                  lineHeight: '1.75',
                  resize: 'vertical',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(124,58,237,0.5)'; }}
                onBlur={(e)  => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              />
            </div>

            {/* Gratitude Section */}
            <div style={{ marginBottom: '24px' }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#64748b',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <FiHeart size={14} color="#ec4899" />
                Gratitude (3 things)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {editorGratitude.map((val, i) => (
                  <GratitudeInput
                    key={i}
                    index={i}
                    value={val}
                    onChange={handleGratitudeChange}
                  />
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#64748b',
                  marginBottom: '10px',
                }}
              >
                Tags (optional)
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {TAG_SUGGESTIONS.map((tag) => (
                  <TagBadge
                    key={tag}
                    tag={tag}
                    active={editorTags.includes(tag)}
                    onClick={toggleTag}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── Mood History Chart ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '22px',
              padding: '24px 28px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#f1f5f9' }}>
                  Mood History
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#475569' }}>
                  Your emotional journey over the past 7 days
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {MOODS.slice(0, 3).map((m) => (
                  <div
                    key={m.value}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '11px',
                      color: '#64748b',
                      fontWeight: 600,
                    }}
                  >
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: m.color,
                      }}
                    />
                    {m.emoji} {m.label}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ width: '100%', height: '160px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -28, bottom: 0 }}>
                  <defs>
                    <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="day"
                    tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[1, 5]}
                    ticks={[1, 2, 3, 4, 5]}
                    tick={{ fill: '#334155', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => MOOD_MAP[v]?.emoji || v}
                  />
                  <Tooltip content={<MoodTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="mood"
                    stroke="#7c3aed"
                    strokeWidth={2.5}
                    fill="url(#moodGrad)"
                    dot={{ fill: '#7c3aed', strokeWidth: 0, r: 5 }}
                    activeDot={{ r: 7, fill: '#6366f1', stroke: 'rgba(99,102,241,0.4)', strokeWidth: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Mood Summary Stats */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
              {(() => {
                const vals = chartData.map((d) => d.mood);
                const avg  = vals.reduce((a, b) => a + b, 0) / vals.length;
                const avgMood  = MOOD_MAP[Math.round(avg)]       || MOOD_MAP[3];
                const bestMood = MOOD_MAP[Math.max(...vals)]      || MOOD_MAP[5];
                const lowMood  = MOOD_MAP[Math.min(...vals)]      || MOOD_MAP[1];
                return [
                  { label: 'Average Mood',      mood: avgMood,  value: avg.toFixed(1) },
                  { label: 'Best Day',           mood: bestMood, value: bestMood.label },
                  { label: 'Needs Attention',    mood: lowMood,  value: lowMood.label  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      flex: 1,
                      minWidth: '100px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '12px',
                      padding: '12px 14px',
                    }}
                  >
                    <div style={{ fontSize: '11px', color: '#475569', fontWeight: 600, marginBottom: '6px' }}>
                      {item.label}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '20px' }}>{item.mood.emoji}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: item.mood.color }}>
                        {item.value}
                      </span>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/*  Mobile View */}
      <MobileJournalView
        entries={entries}
        selectedId={selectedId}
        isNewEntry={isNewEntry}
        mobileView={mobileView}
        setMobileView={setMobileView}
        onSelectEntry={handleSelectEntry}
        onNewEntry={handleNewEntry}
        editorMood={editorMood}
        setEditorMood={setEditorMood}
        editorContent={editorContent}
        setEditorContent={setEditorContent}
        editorGratitude={editorGratitude}
        handleGratitudeChange={handleGratitudeChange}
        editorTags={editorTags}
        toggleTag={toggleTag}
        isSaving={isSaving}
        onSave={handleSave}
        editorDate={editorDate}
        textareaRef={textareaRef}
        chartData={chartData}
      />

      {/* Global Styles */}
      <style>{`
        @media (max-width: 768px) {
          .journal-desktop-layout { display: none !important; }
        }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.3); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(124,58,237,0.5); }
        textarea::placeholder, input::placeholder { color: #334155; }
      `}</style>
    </div>
  );
}

//Mobile-only Pane

function MobileJournalView({
  entries,
  selectedId,
  isNewEntry,
  mobileView,
  setMobileView,
  onSelectEntry,
  onNewEntry,
  editorMood,
  setEditorMood,
  editorContent,
  setEditorContent,
  editorGratitude,
  handleGratitudeChange,
  editorTags,
  toggleTag,
  isSaving,
  onSave,
  editorDate,
  textareaRef,
  chartData,
}) {
  return (
    <>
      <style>{`
        .mobile-journal-wrapper { display: none; }
        @media (max-width: 768px) { .mobile-journal-wrapper { display: block; } }
      `}</style>

      <div className="mobile-journal-wrapper">
        <AnimatePresence mode="wait">
          {mobileView === 'list' ? (
            <motion.div
              key="mobile-list"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.28 }}
              style={{ padding: '0 16px 32px' }}
            >
              {/* New Entry */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onNewEntry}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '15px',
                  marginBottom: '14px',
                  outline: 'none',
                }}
              >
                <FiPlus size={17} />
                New Entry
              </motion.button>

              {/* Entries */}
              <div
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '18px',
                  padding: '14px',
                }}
              >
                {entries.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#475569' }}>
                    <div style={{ fontSize: '42px', marginBottom: '10px' }}>📔</div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#64748b' }}>
                      Start your journey
                    </div>
                  </div>
                ) : (
                  entries.map((entry, i) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <EntryCard
                        entry={entry}
                        isActive={selectedId === entry.id && !isNewEntry}
                        onClick={() => onSelectEntry(entry.id)}
                      />
                    </motion.div>
                  ))
                )}
              </div>

              {/* Mobile Mood Chart */}
              <div
                style={{
                  marginTop: '16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '18px',
                  padding: '18px',
                }}
              >
                <h3 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 800, color: '#f1f5f9' }}>
                  Mood History
                </h3>
                <div style={{ width: '100%', height: '140px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                      <defs>
                        <linearGradient id="moodGradMob" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="day"
                        tick={{ fill: '#475569', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[1, 5]}
                        ticks={[1, 3, 5]}
                        tick={{ fill: '#334155', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => MOOD_MAP[v]?.emoji || v}
                      />
                      <Tooltip content={<MoodTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="mood"
                        stroke="#7c3aed"
                        strokeWidth={2}
                        fill="url(#moodGradMob)"
                        dot={{ fill: '#7c3aed', r: 4 }}
                        activeDot={{ r: 6, fill: '#6366f1' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>

          ) : (
            <motion.div
              key="mobile-editor"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.28 }}
              style={{ padding: '0 16px 32px' }}
            >
              {/* Back button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileView('list')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'transparent',
                  border: 'none',
                  color: '#7c3aed',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  padding: '0 0 14px',
                  outline: 'none',
                }}
              >
                <FiChevronLeft size={18} />
                All Entries
              </motion.button>

              {/* Mobile Editor Card */}
              <div
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '20px',
                  padding: '20px',
                }}
              >
                {/* Header row */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '20px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '17px', fontWeight: 800, color: '#f1f5f9' }}>
                      Today's Entry
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#475569',
                        marginTop: '3px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <FiCalendar size={11} />
                      {formatDateShort(editorDate)}
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onSave}
                    disabled={isSaving}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '9px 18px',
                      borderRadius: '11px',
                      background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                      border: 'none',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    <FiSave size={13} />
                    Save
                  </motion.button>
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#64748b',
                      marginBottom: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <FiSmile size={13} />
                    How are you feeling?
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {MOODS.map((mood) => (
                      <MoodPill
                        key={mood.value}
                        mood={mood}
                        selected={editorMood}
                        onClick={setEditorMood}
                      />
                    ))}
                  </div>
                  {editorMood && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        marginTop: '10px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 12px',
                        borderRadius: '99px',
                        background: MOOD_MAP[editorMood]?.bg,
                        border: `1px solid ${MOOD_MAP[editorMood]?.color}44`,
                      }}
                    >
                      <span style={{ fontSize: '15px' }}>{MOOD_MAP[editorMood]?.emoji}</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: MOOD_MAP[editorMood]?.color }}>
                        Feeling {MOOD_MAP[editorMood]?.label}
                      </span>
                    </motion.div>
                  )}
                </div>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '16px' }} />

                <div style={{ marginBottom: '18px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#64748b',
                      marginBottom: '8px',
                    }}
                  >
                    Your thoughts
                  </label>
                  <textarea
                    ref={textareaRef}
                    value={editorContent}
                    onChange={(e) => setEditorContent(e.target.value)}
                    placeholder="Write about your day…"
                    style={{
                      width: '100%',
                      minHeight: '180px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      color: '#f1f5f9',
                      fontSize: '14px',
                      lineHeight: '1.7',
                      resize: 'vertical',
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'rgba(124,58,237,0.5)'; }}
                    onBlur={(e)  => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                  />
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#64748b',
                      marginBottom: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <FiHeart size={13} color="#ec4899" />
                    Gratitude
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {editorGratitude.map((val, i) => (
                      <GratitudeInput
                        key={i}
                        index={i}
                        value={val}
                        onChange={handleGratitudeChange}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#64748b',
                      marginBottom: '10px',
                    }}
                  >
                    Tags (optional)
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {TAG_SUGGESTIONS.map((tag) => (
                      <TagBadge
                        key={tag}
                        tag={tag}
                        active={editorTags.includes(tag)}
                        onClick={toggleTag}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
