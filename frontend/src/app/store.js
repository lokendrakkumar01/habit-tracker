import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import habitReducer from '../features/habits/habitSlice';
import analyticsReducer from '../features/analytics/analyticsSlice';
import goalReducer from '../features/goals/goalSlice';
import journalReducer from '../features/journal/journalSlice';
import uiReducer from '../features/ui/uiSlice';
import notificationReducer from '../features/notifications/notificationSlice';
import socialReducer from '../features/social/socialSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    habits: habitReducer,
    analytics: analyticsReducer,
    goals: goalReducer,
    journal: journalReducer,
    ui: uiReducer,
    notifications: notificationReducer,
    social: socialReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/loginSuccess'],
      },
    }),
});

export default store;
