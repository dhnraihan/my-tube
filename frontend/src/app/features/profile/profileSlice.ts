import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../store';
import api from '../../../utils/api';

// Types
export interface Profile {
  id: number;
  user: {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  bio: string;
  profile_picture: string | null;
  location: string;
  website: string;
  date_of_birth: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  bio?: string;
  location?: string;
  website?: string;
  date_of_birth?: string | null;
  profile_picture?: File | null;
}

interface ProfileState {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

// Initial state
const initialState: ProfileState = {
  profile: null,
  isLoading: false,
  error: null,
  success: false,
};

// Async thunks
export const fetchUserProfile = createAsyncThunk(
  'profile/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/profile/');
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue('Failed to fetch profile');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'profile/updateUserProfile',
  async (profileData: UpdateProfileData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      // Append all fields to formData if they exist
      if (profileData.first_name) formData.append('first_name', profileData.first_name);
      if (profileData.last_name) formData.append('last_name', profileData.last_name);
      if (profileData.bio !== undefined) formData.append('bio', profileData.bio || '');
      if (profileData.location !== undefined) formData.append('location', profileData.location || '');
      if (profileData.website !== undefined) formData.append('website', profileData.website || '');
      if (profileData.date_of_birth !== undefined) {
        formData.append('date_of_birth', profileData.date_of_birth || '');
      }
      if (profileData.profile_picture) {
        formData.append('profile_picture', profileData.profile_picture);
      }
      
      const response = await api.patch('/api/profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue('Failed to update profile');
    }
  }
);

// Slice
const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfileError: (state) => {
      state.error = null;
    },
    resetProfileSuccess: (state) => {
      state.success = false;
    },
    setProfileError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Fetch profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<Profile>) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to fetch profile';
      })
      // Update profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateUserProfile.fulfilled, (state, action: PayloadAction<Profile>) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.success = true;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to update profile';
        state.success = false;
      });
  },
});

export const { clearProfileError, resetProfileSuccess, setProfileError } = profileSlice.actions;
export default profileSlice.reducer;
