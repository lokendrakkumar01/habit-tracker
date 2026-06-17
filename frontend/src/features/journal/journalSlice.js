import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchJournals = createAsyncThunk('journal/fetchAll', async (params, { rejectWithValue }) => {
  try { const res = await api.get('/journals', { params }); return res.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const saveJournal = createAsyncThunk('journal/save', async (data, { rejectWithValue }) => {
  try { const res = await api.post('/journals', data); return res.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchMoodHistory = createAsyncThunk('journal/moodHistory', async (_, { rejectWithValue }) => {
  try { const res = await api.get('/journals/mood-history'); return res.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const journalSlice = createSlice({
  name: 'journal',
  initialState: { journals: [], moodHistory: [], todayJournal: null, loading: false, error: null },
  reducers: { clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJournals.pending, (state) => { state.loading = true; })
      .addCase(fetchJournals.fulfilled, (state, action) => { state.loading = false; state.journals = action.payload.journals; })
      .addCase(fetchJournals.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(saveJournal.fulfilled, (state, action) => {
        state.todayJournal = action.payload.journal;
        const idx = state.journals.findIndex(j => j._id === action.payload.journal._id);
        if (idx !== -1) state.journals[idx] = action.payload.journal;
        else state.journals.unshift(action.payload.journal);
      })
      .addCase(fetchMoodHistory.fulfilled, (state, action) => { state.moodHistory = action.payload.moodHistory; });
  },
});

export const { clearError } = journalSlice.actions;
export default journalSlice.reducer;
