import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchDashboardStats = createAsyncThunk('analytics/dashboard', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/analytics/dashboard');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchWeeklyData = createAsyncThunk('analytics/weekly', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/analytics/weekly');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchMonthlyData = createAsyncThunk('analytics/monthly', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/analytics/monthly', { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchYearlyData = createAsyncThunk('analytics/yearly', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/analytics/yearly', { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchHabitPerformance = createAsyncThunk('analytics/habits', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/analytics/habits');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    dashboardStats: null,
    weeklyData: [],
    monthlyData: null,
    yearlyData: [],
    habitPerformance: [],
    categories: {},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => { state.loading = true; })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardStats = action.payload.stats;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchWeeklyData.fulfilled, (state, action) => {
        state.weeklyData = action.payload.weeklyData;
      })
      .addCase(fetchMonthlyData.fulfilled, (state, action) => {
        state.monthlyData = action.payload.monthlyData;
      })
      .addCase(fetchYearlyData.fulfilled, (state, action) => {
        state.yearlyData = action.payload.yearlyData;
      })
      .addCase(fetchHabitPerformance.fulfilled, (state, action) => {
        state.habitPerformance = action.payload.habits;
        state.categories = action.payload.categories;
      });
  },
});

export default analyticsSlice.reducer;
