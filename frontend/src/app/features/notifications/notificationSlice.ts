import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../../utils/api'; // Import the configured axios instance

// Types
export interface Notification {
  id: number;
  recipient: {
    id: string;
    username: string;
    email: string;
  };
  sender: {
    id: string;
    username: string;
    email: string;
  };
  notification_type: 'like' | 'comment' | 'reply' | 'subscribe' | 'mention';
  video: string | null;
  comment: number | null;
  text: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

// Async thunks - Updated to use configured API instance
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      // No need to manually add Authorization header, 
      // it's handled by the axios interceptor
      const response = await api.get('/api/notifications/');
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue('Failed to fetch notifications');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: number, { rejectWithValue }) => {
    try {
      // Authorization header is added automatically by the interceptor
      await api.post(`/api/notifications/${notificationId}/mark_as_read/`, {});
      return notificationId;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue('Failed to mark notification as read');
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      // Authorization header is added automatically by the interceptor
      await api.post('/api/notifications/mark_all_as_read/', {});
      return true;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue('Failed to mark all notifications as read');
    }
  }
);

// Additional notification-related async thunks
export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId: number, { rejectWithValue }) => {
    try {
      await api.delete(`/api/notifications/${notificationId}/`);
      return notificationId;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue('Failed to delete notification');
    }
  }
);

export const clearAllNotifications = createAsyncThunk(
  'notifications/clearAllNotifications',
  async (_, { rejectWithValue }) => {
    try {
      await api.delete('/api/notifications/clear_all/');
      return true;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue('Failed to clear all notifications');
    }
  }
);

// Get notification settings
export const getNotificationSettings = createAsyncThunk(
  'notifications/getNotificationSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/notifications/settings/');
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue('Failed to fetch notification settings');
    }
  }
);

// Update notification settings
export const updateNotificationSettings = createAsyncThunk(
  'notifications/updateNotificationSettings',
  async (settings: any, { rejectWithValue }) => {
    try {
      const response = await api.put('/api/notifications/settings/', settings);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue('Failed to update notification settings');
    }
  }
);

// Slice
const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.is_read) {
        state.unreadCount += 1;
      }
    },
    removeNotification: (state, action: PayloadAction<number>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        const notification = state.notifications[index];
        if (!notification.is_read) {
          state.unreadCount -= 1;
        }
        state.notifications.splice(index, 1);
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    resetNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<Notification[]>) => {
        state.isLoading = false;
        // Ensure action.payload is an array
        const notifications = Array.isArray(action.payload) ? action.payload : [];
        state.notifications = notifications;
        state.unreadCount = notifications.filter(notification => !notification.is_read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        // Handle the formatted error response
        const errorMessage = typeof action.payload === 'object' && action.payload !== null
          ? (action.payload as any).data?.detail || 'Failed to fetch notifications'
          : String(action.payload || 'Failed to fetch notifications');
        state.error = errorMessage;
        state.notifications = [];
      })
      // Mark as read
      .addCase(markAsRead.pending, (state) => {
        state.error = null;
      })
      .addCase(markAsRead.fulfilled, (state, action: PayloadAction<number>) => {
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification && !notification.is_read) {
          notification.is_read = true;
          state.unreadCount -= 1;
        }
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Mark all as read
      .addCase(markAllAsRead.pending, (state) => {
        state.error = null;
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          notification.is_read = true;
        });
        state.unreadCount = 0;
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Delete notification
      .addCase(deleteNotification.fulfilled, (state, action: PayloadAction<number>) => {
        const index = state.notifications.findIndex(n => n.id === action.payload);
        if (index !== -1) {
          const notification = state.notifications[index];
          if (!notification.is_read) {
            state.unreadCount -= 1;
          }
          state.notifications.splice(index, 1);
        }
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Clear all notifications
      .addCase(clearAllNotifications.fulfilled, (state) => {
        state.notifications = [];
        state.unreadCount = 0;
      })
      .addCase(clearAllNotifications.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Get notification settings
      .addCase(getNotificationSettings.fulfilled, (state, action) => {
        // You can add a settings field to the state if needed
        // state.settings = action.payload;
      })
      .addCase(getNotificationSettings.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Update notification settings
      .addCase(updateNotificationSettings.fulfilled, (state, action) => {
        // Handle settings update success
        // state.settings = action.payload;
      })
      .addCase(updateNotificationSettings.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { 
  addNotification, 
  removeNotification, 
  clearError, 
  resetNotifications 
} = notificationSlice.actions;

export default notificationSlice.reducer;