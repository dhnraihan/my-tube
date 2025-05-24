import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../../utils/api';

// Types
export interface Comment {
  id: number;
  content: string;
  created_at: string;
  user: {
    id: number;
    username: string;
    profile_picture: string;
  };
  replies?: Comment[];
}

export interface Video {
  id: number;
  title: string;
  description: string;
  file: string;
  thumbnail: string;
  views: number;
  likes: number;
  slug: string;
  duration: number;
  created_at: string;
  uploader: {
    id: number;
    username: string;
    profile_picture: string;
  };
  category: {
    id: number;
    name: string;
    slug: string;
  };
  tags: string;
  is_liked?: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
}

interface VideoState {
  videos: Video[];
  featuredVideos: Video[];
  currentVideo: Video | null;
  relatedVideos: Video[];
  searchResults: Video[];
  comments: Comment[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
}

// Async thunks
export const createCategory = createAsyncThunk(
  'videos/createCategory',
  async (categoryData: { name: string; icon?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/categories/', categoryData);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue('Failed to create category');
    }
  }
);

export const fetchVideos = createAsyncThunk(
  'videos/fetchVideos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/videos/');
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue('Failed to fetch videos');
    }
  }
);

export const fetchFeaturedVideos = createAsyncThunk(
  'videos/fetchFeaturedVideos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/videos/featured/');
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue('Failed to fetch featured videos');
    }
  }
);

export const fetchVideoById = createAsyncThunk(
  'videos/fetchVideoById',
  async (slug: string, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.get(`/api/videos/${slug}/`);
      // Record view
      await api.post(`/api/videos/${slug}/view/`);
      // Fetch related videos
      dispatch(fetchRelatedVideos(slug));
      // Fetch comments
      dispatch(fetchComments(slug));
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue('Failed to fetch video');
    }
  }
);

export const fetchRelatedVideos = createAsyncThunk(
  'videos/fetchRelatedVideos',
  async (slug: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/videos/${slug}/related/`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue('Failed to fetch related videos');
    }
  }
);

export const fetchComments = createAsyncThunk(
  'videos/fetchComments',
  async (slug: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/videos/${slug}/comments/`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue('Failed to fetch comments');
    }
  }
);

export const uploadVideo = createAsyncThunk(
  'videos/uploadVideo',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      
      const response = await api.post('/api/videos/', formData, config);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue('Failed to upload video');
    }
  }
);

export const likeVideo = createAsyncThunk(
  'videos/likeVideo',
  async (slug: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/videos/${slug}/like/`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue('Failed to like video');
    }
  }
);

export const addComment = createAsyncThunk(
  'videos/addComment',
  async ({ slug, content, parent_id = null }: { slug: string; content: string; parent_id?: number | null }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/videos/${slug}/comments/`, { content, parent_id });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue('Failed to add comment');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'videos/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/categories/');
      return response.data;
    } catch (error: any) {
      // If it's an auth error (401), handle it silently without redirecting
      if (error.response?.status === 401) {
        console.warn('Categories endpoint requires authentication');
        return rejectWithValue('Authentication required for categories');
      }
      
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue('Failed to fetch categories');
    }
  }
);

export const searchVideos = createAsyncThunk(
  'videos/searchVideos',
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/videos/search/?q=${query}`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue('Failed to search videos');
    }
  }
);

// Initial state
const initialState: VideoState = {
  videos: [],
  featuredVideos: [],
  currentVideo: null,
  relatedVideos: [],
  searchResults: [],
  comments: [],
  categories: [],
  isLoading: false,
  error: null,
};

// Create the slice
const videoSlice = createSlice({
  name: 'videos',
  initialState,
  reducers: {
    clearVideoState: (state) => {
      state.currentVideo = null;
      state.relatedVideos = [];
      state.comments = [];
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Videos
      .addCase(fetchVideos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVideos.fulfilled, (state, action: PayloadAction<Video[]>) => {
        state.isLoading = false;
        // Ensure videos is always an array
        state.videos = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.isLoading = false;
        // Handle the formatted error response
        const errorMessage = typeof action.payload === 'object' && action.payload !== null
          ? (action.payload as any).data?.detail || 'Failed to fetch videos'
          : String(action.payload || 'Failed to fetch videos');
        state.error = errorMessage;
        // Set videos to an empty array when the API call fails
        state.videos = [];
      })
      
      // Fetch Featured Videos
      .addCase(fetchFeaturedVideos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedVideos.fulfilled, (state, action: PayloadAction<Video[]>) => {
        state.isLoading = false;
        // Ensure featuredVideos is always an array
        state.featuredVideos = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchFeaturedVideos.rejected, (state, action) => {
        state.isLoading = false;
        // Handle the formatted error response
        const errorMessage = typeof action.payload === 'object' && action.payload !== null
          ? (action.payload as any).data?.detail || 'Failed to fetch featured videos'
          : String(action.payload || 'Failed to fetch featured videos');
        state.error = errorMessage;
        // Set featuredVideos to an empty array when the API call fails
        state.featuredVideos = [];
      })
      
      // Fetch Video By ID
      .addCase(fetchVideoById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVideoById.fulfilled, (state, action: PayloadAction<Video>) => {
        state.isLoading = false;
        state.currentVideo = action.payload;
      })
      .addCase(fetchVideoById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Related Videos
      .addCase(fetchRelatedVideos.fulfilled, (state, action: PayloadAction<Video[]>) => {
        state.relatedVideos = action.payload;
      })
      
      // Fetch Comments
      .addCase(fetchComments.fulfilled, (state, action: PayloadAction<Comment[]>) => {
        state.comments = action.payload;
      })
      
      // Upload Video
      .addCase(uploadVideo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadVideo.fulfilled, (state, action: PayloadAction<Video>) => {
        state.isLoading = false;
        state.videos = [action.payload, ...state.videos];
      })
      .addCase(uploadVideo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Like Video
      .addCase(likeVideo.fulfilled, (state, action: PayloadAction<{ likes: number; is_liked: boolean }>) => {
        if (state.currentVideo) {
          state.currentVideo.likes = action.payload.likes;
          state.currentVideo.is_liked = action.payload.is_liked;
        }
      })
      
      // Add Comment
      .addCase(addComment.fulfilled, (state, action: PayloadAction<Comment>) => {
        const comment = action.payload;
        if (comment.replies) {
          // This is a reply to an existing comment
          const parentIndex = state.comments.findIndex(c => c.id === comment.id);
          if (parentIndex !== -1) {
            if (!state.comments[parentIndex].replies) {
              state.comments[parentIndex].replies = [];
            }
            state.comments[parentIndex].replies!.push(comment);
          }
        } else {
          // This is a new top-level comment
          state.comments = [comment, ...state.comments];
        }
      })
      
      // Create Category
      .addCase(createCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.isLoading = false;
        // Add the new category to the categories array
        state.categories = [action.payload, ...state.categories];
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isLoading = false;
        // Handle the formatted error response
        const errorMessage = typeof action.payload === 'object' && action.payload !== null
          ? (action.payload as any).detail || 'Failed to create category'
          : String(action.payload || 'Failed to create category');
        state.error = errorMessage;
      })
      
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.isLoading = false;
        // Ensure categories is always an array
        state.categories = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        // Handle the formatted error response
        const errorMessage = typeof action.payload === 'object' && action.payload !== null
          ? (action.payload as any).data?.detail || 'Failed to fetch categories'
          : String(action.payload || 'Failed to fetch categories');
        state.error = errorMessage;
        // Set categories to an empty array when the API call fails
        state.categories = [];
      })
      
      // Search Videos
      .addCase(searchVideos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchVideos.fulfilled, (state, action: PayloadAction<Video[]>) => {
        state.isLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchVideos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearVideoState, clearSearchResults } = videoSlice.actions;
export default videoSlice.reducer;