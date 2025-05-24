import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import videoReducer from './features/videos/videoSlice';
import notificationReducer from './features/notifications/notificationSlice';
import profileReducer from './features/profile/profileSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    videos: videoReducer,
    notifications: notificationReducer,
    profile: profileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
