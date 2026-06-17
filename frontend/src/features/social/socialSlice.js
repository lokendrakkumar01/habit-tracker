import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchLeaderboard = createAsyncThunk('social/leaderboard', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/users/leaderboard');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch leaderboard');
  }
});

export const fetchFriends = createAsyncThunk('social/fetchFriends', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/users/profile');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch friends');
  }
});

export const searchUsers = createAsyncThunk('social/search', async (q, { rejectWithValue }) => {
  try {
    const res = await api.get('/users/search', { params: { q } });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Search failed');
  }
});

export const sendFriendRequest = createAsyncThunk('social/sendFriendRequest', async (userId, { rejectWithValue }) => {
  try {
    const res = await api.post(`/users/friend-request/${userId}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to send friend request');
  }
});

export const acceptFriendRequest = createAsyncThunk('social/acceptFriendRequest', async (userId, { rejectWithValue }) => {
  try {
    const res = await api.post(`/users/friend-request/${userId}/accept`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to accept friend request');
  }
});

const socialSlice = createSlice({
  name: 'social',
  initialState: {
    leaderboard: [],
    friends: [],
    friendRequests: [],
    searchResults: [],
    loading: false,
    error: null
  },
  reducers: {
    clearSearch: (state) => {
      state.searchResults = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaderboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.loading = false;
        state.leaderboard = action.payload.leaderboard;
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(fetchFriends.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFriends.fulfilled, (state, action) => {
        state.loading = false;
        state.friends = action.payload.user?.friends || [];
        state.friendRequests = action.payload.user?.friendRequests || [];
      })
      .addCase(fetchFriends.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.searchResults = action.payload.users || [];
      });
  },
});

export const { clearSearch } = socialSlice.actions;
export default socialSlice.reducer;
