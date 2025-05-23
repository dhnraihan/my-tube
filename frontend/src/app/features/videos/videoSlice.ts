import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Types
export interface Video {
  id: string;
  title: string;
  description: string;
  file: string;
  thumbnail: string;
  uploader: {
    id: string;
    username: string;
    email: string;
  };
  category: {
    id: number;
    name: string;
    slug: string;
  } | null;
  privacy: 'public' | 'private' | 'unlisted';
  views: number;
  slug: string;
  duration: number;
  created_at: string;
  updated_at: string;
  tags: string;
  likes_count: number;
  dislikes_count: number;
  comments_count: number;
}

export interface Comment {
  id: number;
  video: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
  parent: number | null;
  text: string;
  created_at: string;
  updated_at: string;
  replies: Comment[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  created_at: string;
}

interface VideoState {
  videos: Video[];
  featuredVideos: Video[];
  relatedVideos: Video[];
  currentVideo: Video | null;
  comments: Comment[];
  categories: Category[];
  searchResults: Video[];
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: VideoState = {
  videos: [],
  featuredVideos: [],
  relatedVideos: [],
  currentVideo: null,
  comments: [],
  categories: [],
  searchResults: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchVideos = createAsyncThunk(
  'videos/fetchVideos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/videos/');
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
      const response = await axios.get('/api/videos/?ordering=-views');
      return response.data.results.slice(0, 5);
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
      const response = await axios.get(`/api/videos/${slug}/`);
      // Record view
      await axios.post(`/api/videos/${slug}/view/`);
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
      const response = await axios.get(`/api/videos/${slug}/related/`);
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
      const response = await axios.get(`/api/videos/${slug}/comments/`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue('Failed to fetch comments');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'videos/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/categories/');
      return response.data;
    } catch (error: any) {
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
      const response = await axios.get(`/api/search/?q=${query}`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue('Failed to search videos');
    }
  }
);

export const uploadVideo = createAsyncThunk(
  'videos/uploadVideo',
  async (formData: FormData, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.token;
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      };
      
      const response = await axios.post('/api/videos/', formData, config);
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
  async ({ videoId, likeType }: { videoId: string; likeType: 'like' | 'dislike' }, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.token;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      
      const response = await axios.post('/api/like/', { video: videoId, like_type: likeType }, config);
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
  async (
    { videoId, text, parentId }: { videoId: string; text: string; parentId?: number },
    { rejectWithValue, getState }
  ) => {
    try {
      const state: any = getState();
      const token = state.auth.token;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      
      const data = {
        video: videoId,
        text,
        parent: parentId || null,
      };
      
      const response = await axios.post('/api/comments/', data, config);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue('Failed to add comment');
    }
  }
);

// Slice
const videoSlice = createSlice({
  name: 'videos',
  initialState,
  reducers: {
    clearCurrentVideo: (state) => {
      state.currentVideo = null;
      state.relatedVideos = [];
      state.comments = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch videos
      .addCase(fetchVideos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVideos.fulfilled, (state, action: PayloadAction<{ results: Video[] }>) => {
        state.isLoading = false;
        state.videos = action.payload.results;
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch featured videos
      .addCase(fetchFeaturedVideos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedVideos.fulfilled, (state, action: PayloadAction<Video[]>) => {
        state.isLoading = false;
        state.featuredVideos = action.payload;
      })
      .addCase(fetchFeaturedVideos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch video by ID
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
      // Fetch related videos
      .addCase(fetchRelatedVideos.fulfilled, (state, action: PayloadAction<Video[]>) => {
        state.relatedVideos = action.payload;
      })
      // Fetch comments
      .addCase(fetchComments.fulfilled, (state, action: PayloadAction<Comment[]>) => {
        state.comments = action.payload;
      })
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Search videos
      .addCase(searchVideos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchVideos.fulfilled, (state, action: PayloadAction<{ results: Video[] }>) => {
        state.isLoading = false;
        state.searchResults = action.payload.results;
      })
      .addCase(searchVideos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Add comment
      .addCase(addComment.fulfilled, (state, action: PayloadAction<Comment>) => {
        const newComment = action.payload;
        if (newComment.parent) {
          // Add reply to parent comment
          const parentComment = state.comments.find(comment => comment.id === newComment.parent);
          if (parentComment) {
            parentComment.replies.push(newComment);
          }
        } else {
          // Add as a new comment
          state.comments.unshift(newComment);
        }
        
        // Update comment count in current video
        if (state.currentVideo) {
          state.currentVideo.comments_count += 1;
        }
      });
  },
});

export const { clearCurrentVideo, clearError } = videoSlice.actions;
export default videoSlice.reducer;
