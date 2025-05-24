import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store';
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
  video_count?: number;
  description?: string;
}

interface VideoState {
  videos: Video[];
  trendingVideos: Video[];
  userVideos: Video[];
  subscribedVideos: Video[];
  featuredVideos: Video[];
  relatedVideos: Video[];
  categories: Category[];
  searchResults: Video[];
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  currentVideo: Video | null;
  comments: Comment[];
  commentStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  commentError: string | null;
}

// Async thunks
export const fetchTrendingVideos = createAsyncThunk(
  'videos/fetchTrending',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/videos/', {
        params: {
          ordering: '-views,-likes',
          page_size: 20
        }
      });
      return response.data.results || [];
    } catch (error: any) {
      console.error('Error fetching trending videos:', error);
      return rejectWithValue(error.response?.data || 'Failed to fetch trending videos');
    }
  }
);

export const fetchUserVideos = createAsyncThunk(
  'videos/fetchUserVideos',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/videos/?uploader=${userId}`);
      return response.data.results || [];
    } catch (error: any) {
      console.error('Error fetching user videos:', error);
      return rejectWithValue(error.response?.data || 'Failed to fetch user videos');
    }
  }
);

export const fetchSubscribedVideos = createAsyncThunk(
  'videos/fetchSubscribedVideos',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/videos/subscriptions/${userId}/`);
      return response.data.results || [];
    } catch (error: any) {
      console.error('Error fetching subscribed videos:', error);
      return rejectWithValue(error.response?.data || 'Failed to fetch subscribed videos');
    }
  }
);

export const fetchLatestVideos = createAsyncThunk(
  'videos/fetchLatest',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/videos/', {
        params: {
          ordering: '-created_at',
          page_size: 20
        }
      });
      return response.data.results || [];
    } catch (error: any) {
      console.error('Error fetching latest videos:', error);
      return rejectWithValue(error.response?.data || 'Failed to fetch latest videos');
    }
  }
);

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
  async (_, { getState }) => {
    try {
      const state = getState() as RootState;
      const isAuthenticated = state.auth.isAuthenticated;
      
      // Try the main videos endpoint first
      try {
        const response = await api.get('/api/videos/');
        return response.data.results || response.data || [];
      } catch (mainError: any) {
        // If we get a 401 and we're not authenticated, try the public endpoint
        if (!isAuthenticated && mainError.response?.status === 401) {
          try {
            const publicResponse = await api.get('/api/videos/public/');
            return publicResponse.data.results || publicResponse.data || [];
          } catch (publicError) {
            console.log('Public videos endpoint not available, returning empty array');
            return [];
          }
        }
        
        // For other errors, return empty array to prevent UI breaking
        console.error('Error fetching videos:', mainError);
        return [];
      }
    } catch (error: any) {
      console.error('Unexpected error in fetchVideos:', error);
      return [];
    }
  }
);

export const fetchFeaturedVideos = createAsyncThunk(
  'videos/fetchFeaturedVideos',
  async (_, { rejectWithValue }) => {
    try {
      // Try the featured videos endpoint first
      try {
        const response = await api.get('/api/videos/featured/');
        return Array.isArray(response.data) ? response.data : [];
      } catch (featuredError: any) {
        console.warn('Featured videos endpoint not available, falling back to regular videos');
        
        // If featured videos endpoint fails, try to get regular videos instead
        try {
          const response = await api.get('/api/videos/');
          const videos = Array.isArray(response.data) ? response.data : [];
          // Return first few videos as featured
          return videos.slice(0, 4);
        } catch (fallbackError) {
          console.error('Error fetching fallback videos:', fallbackError);
          return [];
        }
      }
    } catch (error: any) {
      console.error('Unexpected error in fetchFeaturedVideos:', error);
      return [];
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
      // First verify the video exists and is accessible
      await api.get(`/api/videos/${slug}/`);
      
      // Then fetch comments
      const response = await api.get(`/api/videos/${slug}/comments/`);
      
      // Handle both paginated and non-paginated responses
      if (response.data && response.data.results) {
        return response.data; // Paginated response
      }
      
      return { results: response.data, count: response.data.length }; // Non-paginated response
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.detail || error.response.data);
      }
      return rejectWithValue('Failed to fetch comments. Please try again.');
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
  async ({ slug, content, parent_id = null }: { slug: string; content: string; parent_id?: number | null }, { rejectWithValue, dispatch }) => {
    try {
      // First, check if the video exists and is accessible
      await api.get(`/api/videos/${slug}/`);
      
      // Then post the comment
      const response = await api.post(`/api/videos/${slug}/comments/`, { 
        content, 
        parent_id: parent_id || null 
      });
      
      // Refresh comments after adding a new one
      await dispatch(fetchComments(slug) as any);
      
      return response.data;
    } catch (error: any) {
      console.error('Error adding comment:', error);
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.detail || error.response.data);
      }
      return rejectWithValue('Failed to add comment. Please try again.');
    }
  }
);

export const fetchVideosByCategory = createAsyncThunk<Video[], string, { rejectValue: any }>(
  'videos/fetchVideosByCategory',
  async (categorySlug: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/videos/?category=${categorySlug}`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error('Error fetching videos by category:', error);
      if (error.response?.data) {
        return rejectWithValue({
          status: error.response.status,
          data: error.response.data
        });
      }
      return rejectWithValue('Failed to fetch category videos');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'videos/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/categories/');
      // Ensure we return an array of categories
      const categories = Array.isArray(response.data) ? response.data : [];
      return categories.map(category => ({
        id: category.id || 0,
        name: category.name || 'Uncategorized',
        slug: category.slug || 'uncategorized',
        icon: category.icon || 'default-icon'
      }));
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      
      // Handle different types of errors
      if (error.response) {
        // The request was made and the server responded with a status code
        if (error.response.status === 401) {
          console.warn('Categories endpoint requires authentication');
          // Return empty array instead of error to prevent UI issues
          return [];
        }
        
        // Handle other error statuses
        if (error.response.data) {
          return rejectWithValue({
            status: error.response.status,
            data: error.response.data
          });
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received from server');
      } else {
        // Something happened in setting up the request
        console.error('Error setting up request:', error.message);
      }
      
      // Return empty array as fallback
      return [];
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
  trendingVideos: [],
  userVideos: [],
  subscribedVideos: [],
  featuredVideos: [],
  relatedVideos: [],
  categories: [],
  searchResults: [],
  searchQuery: '',
  isLoading: false,
  error: null,
  currentVideo: null,
  comments: [],
  commentStatus: 'idle',
  commentError: null,
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
        state.videos = action.payload;
        state.error = null;
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Trending Videos
      .addCase(fetchTrendingVideos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTrendingVideos.fulfilled, (state, action: PayloadAction<Video[]>) => {
        state.isLoading = false;
        state.trendingVideos = action.payload;
        state.error = null;
      })
      .addCase(fetchTrendingVideos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch User Videos
      .addCase(fetchUserVideos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserVideos.fulfilled, (state, action: PayloadAction<Video[]>) => {
        state.isLoading = false;
        state.userVideos = action.payload;
        state.error = null;
      })
      .addCase(fetchUserVideos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Featured Videos
      .addCase(fetchFeaturedVideos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedVideos.fulfilled, (state, action: PayloadAction<Video[]>) => {
        state.isLoading = false;
        state.featuredVideos = action.payload;
        state.error = null;
      })
      .addCase(fetchFeaturedVideos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
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
        state.categories = [action.payload, ...state.categories];
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Categories
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