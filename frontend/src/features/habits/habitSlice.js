import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchHabits = createAsyncThunk('habits/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await api.get('/habits', { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch habits');
  }
});

export const createHabit = createAsyncThunk('habits/create', async (habitData, { rejectWithValue }) => {
  try {
    const res = await api.post('/habits', habitData);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create habit');
  }
});

export const updateHabit = createAsyncThunk('habits/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/habits/${id}`, data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update habit');
  }
});

export const deleteHabit = createAsyncThunk('habits/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/habits/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete habit');
  }
});

export const archiveHabit = createAsyncThunk('habits/archive', async (id, { rejectWithValue }) => {
  try {
    const res = await api.put(`/habits/${id}/archive`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to archive habit');
  }
});

export const restoreHabit = createAsyncThunk('habits/restore', async (id, { rejectWithValue }) => {
  try {
    const res = await api.put(`/habits/${id}/restore`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to restore habit');
  }
});

export const completeHabit = createAsyncThunk('habits/complete', async (arg, { rejectWithValue }) => {
  try {
    // Accept both: completeHabit(id) and completeHabit({id, data})
    const id   = typeof arg === 'string' ? arg : arg.id;
    const data = typeof arg === 'string' ? {} : (arg.data || {});
    const res = await api.post(`/habits/${id}/complete`, data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to complete habit');
  }
});

export const fetchHabitDetail = createAsyncThunk('habits/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/habits/${id}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch habit');
  }
});

const habitSlice = createSlice({
  name: 'habits',
  initialState: {
    habits: [],
    archivedHabits: [],
    selectedHabit: null,
    habitLogs: [],
    loading: false,
    error: null,
    filter: { category: '', priority: '' },
  },
  reducers: {
    setFilter: (state, action) => { state.filter = { ...state.filter, ...action.payload }; },
    clearError: (state) => { state.error = null; },
    clearSelectedHabit: (state) => { state.selectedHabit = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHabits.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchHabits.fulfilled, (state, action) => {
        state.loading = false;
        if (action.meta.arg?.archived === 'true') {
          state.archivedHabits = action.payload.habits;
        } else {
          state.habits = action.payload.habits;
        }
      })
      .addCase(fetchHabits.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(createHabit.fulfilled, (state, action) => {
        state.habits.unshift(action.payload.habit);
      })
      .addCase(updateHabit.fulfilled, (state, action) => {
        const idx = state.habits.findIndex((h) => h._id === action.payload.habit._id);
        if (idx !== -1) state.habits[idx] = action.payload.habit;
      })
      .addCase(deleteHabit.fulfilled, (state, action) => {
        state.habits = state.habits.filter((h) => h._id !== action.payload);
      })
      .addCase(archiveHabit.fulfilled, (state, action) => {
        state.habits = state.habits.filter((h) => h._id !== action.payload.habit._id);
        state.archivedHabits.unshift(action.payload.habit);
      })
      .addCase(restoreHabit.fulfilled, (state, action) => {
        state.archivedHabits = state.archivedHabits.filter((h) => h._id !== action.payload.habit._id);
        state.habits.unshift(action.payload.habit);
      })
      .addCase(completeHabit.fulfilled, (state, action) => {
        const { habit, log } = action.payload;
        const idx = state.habits.findIndex((h) => h._id === habit._id);
        if (idx !== -1) {
          state.habits[idx] = {
            ...state.habits[idx],
            ...habit,
            completedToday: log.completed,  // match backend field name
            todayCompleted: log.completed,  // keep both for compatibility
            todayLog: log,
          };
        }
      })
      .addCase(fetchHabitDetail.pending, (state) => { state.loading = true; })
      .addCase(fetchHabitDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedHabit = action.payload.habit;
        state.habitLogs = action.payload.logs;
      })
      .addCase(fetchHabitDetail.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { setFilter, clearError, clearSelectedHabit } = habitSlice.actions;
export default habitSlice.reducer;
