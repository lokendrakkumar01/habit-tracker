import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchGoals = createAsyncThunk('goals/fetchAll', async (_, { rejectWithValue }) => {
  try { const res = await api.get('/goals'); return res.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const createGoal = createAsyncThunk('goals/create', async (data, { rejectWithValue }) => {
  try { const res = await api.post('/goals', data); return res.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateGoal = createAsyncThunk('goals/update', async ({ id, data }, { rejectWithValue }) => {
  try { const res = await api.put(`/goals/${id}`, data); return res.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const deleteGoal = createAsyncThunk('goals/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/goals/${id}`); return id; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const toggleMilestone = createAsyncThunk('goals/toggleMilestone', async ({ goalId, milestoneId }, { rejectWithValue }) => {
  try { const res = await api.put(`/goals/${goalId}/milestones/${milestoneId}/toggle`); return res.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const goalSlice = createSlice({
  name: 'goals',
  initialState: { goals: [], loading: false, error: null },
  reducers: { clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoals.pending, (state) => { state.loading = true; })
      .addCase(fetchGoals.fulfilled, (state, action) => { state.loading = false; state.goals = action.payload.goals; })
      .addCase(fetchGoals.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createGoal.fulfilled, (state, action) => { state.goals.unshift(action.payload.goal); })
      .addCase(updateGoal.fulfilled, (state, action) => {
        const idx = state.goals.findIndex(g => g._id === action.payload.goal._id);
        if (idx !== -1) state.goals[idx] = action.payload.goal;
      })
      .addCase(deleteGoal.fulfilled, (state, action) => { state.goals = state.goals.filter(g => g._id !== action.payload); })
      .addCase(toggleMilestone.fulfilled, (state, action) => {
        const idx = state.goals.findIndex(g => g._id === action.payload.goal._id);
        if (idx !== -1) state.goals[idx] = action.payload.goal;
      });
  },
});

export const { clearError } = goalSlice.actions;
export default goalSlice.reducer;
