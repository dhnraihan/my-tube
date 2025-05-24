import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { fetchVideos, fetchFeaturedVideos, fetchCategories } from '../app/features/videos/videoSlice';
import { Video } from '../types/video';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  thumbnail?: string;
}

const HomePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Get data from Redux store
  const { 
    videos: videosFromStore = [], 
    featuredVideos: featuredVideosFromStore = [], 
    categories: categoriesFromStore = [],
    isLoading = false,
    error: videoError 
  } = useSelector((state: RootState) => state.videos);
  
  // Get authentication state
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  
  // Ensure we have arrays with proper types
  const videos: Video[] = Array.isArray(videosFromStore) ? videosFromStore : [];
  const featuredVideos: Video[] = Array.isArray(featuredVideosFromStore) ? featuredVideosFromStore : [];
  const categories: Category[] = Array.isArray(categoriesFromStore) ? categoriesFromStore : [];

  // Handle errors
  useEffect(() => {
    if (videoError) {
      toast.error(videoError);
    }
  }, [videoError]);

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          dispatch(fetchVideos()).unwrap(),
          dispatch(fetchFeaturedVideos()).unwrap(),
          dispatch(fetchCategories()).unwrap()
        ]);
      } catch (error) {
        console.error('Failed to load data:', error);
        // Even if there's an error, we want to stop the initial load state
      } finally {
        setIsInitialLoad(false);
      }
    };

    loadData();
  }, [dispatch]);

  // Check if categories are loading
  const isCategoriesLoading = isLoading && categories.length === 0;

  // Format view count
  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M';
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K';
    }
    return views.toString();
  };

  // Format date to relative time (e.g., "2 days ago", "3 months ago")
  const formatDate = (dateString: string): string => {
    try {
      // Parse the input date string
      const date = new Date(dateString);
      
      // Validate the date
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString);
        return '';
      }
      
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      // Define time intervals in seconds
      const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
      };
      
      // Calculate time difference in different units
      for (const [unit, seconds] of Object.entries(intervals)) {
        const interval = Math.floor(diffInSeconds / seconds);
        
        if (interval >= 1) {
          // For more than a month, show actual date
          if (unit === 'month' && interval > 3) {
            return date.toLocaleDateString(undefined, { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            });
          }
          
          // For less than a month, show relative time
          return interval === 1 
            ? `${interval} ${unit} ago`
            : `${interval} ${unit}s ago`;
        }
      }
      
      // If less than a minute
      return 'Just now';
      
    } catch (error) {
      console.error('Error formatting date:', error, 'Date string:', dateString);
      return '';
    }
  };

  // Featured section (Hero)
  const FeaturedSection = () => {
    if (isInitialLoad) {
      return (
        <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"></div>
      );
    }

    if (featuredVideos.length === 0) {
      return (
        <div className="w-full h-96 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">No featured videos available</p>
        </div>
      );
    }

    const featuredVideo = featuredVideos[0];
    
    return (
      <div className="relative w-full h-96 rounded-lg overflow-hidden mb-8">
        <img 
          src={featuredVideo.thumbnail || `https://i.ytimg.com/vi/${featuredVideo.id}/maxresdefault.jpg`} 
          alt={featuredVideo.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
          <div className="max-w-3xl">
            <h1 className="text-white text-3xl font-bold mb-2">{featuredVideo.title}</h1>
            <p className="text-gray-200 mb-4 line-clamp-2">{featuredVideo.description}</p>
            <div className="flex items-center text-gray-300 mb-4">
              <span>{formatViews(featuredVideo.views)} views</span>
              <span className="mx-2">•</span>
              <span>{formatDate(featuredVideo.created_at)}</span>
            </div>
            <div className="flex space-x-3">
              <Link 
                to={`/video/${featuredVideo.slug}`}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md inline-flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Watch Now
              </Link>
              <button className="bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-md inline-flex items-center border border-white/20">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
                More
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      <ToastContainer position="top-right" autoClose={5000} />
      {/* Featured Video Section */}
      <FeaturedSection />
      
      {/* Video Categories */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h2>
          {categories.length > 0 && (
            <Link to="/categories" className="text-blue-600 dark:text-blue-400 hover:underline">
              View All
            </Link>
          )}
        </div>
        
        {isCategoriesLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((category) => (
              <Link 
                key={category.id}
                to={`/category/${category.slug}`}
                className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex flex-col items-center justify-center h-20"
              >
                <h3 className="font-medium text-gray-900 dark:text-white">{category.name}</h3>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">No categories available</p>
            <button 
              onClick={() => dispatch(fetchCategories() as any)}
              className="mt-2 text-blue-600 dark:text-blue-400 hover:underline"
            >
              Try again
            </button>
          </div>
        )}
      </div>
      
      {/* Latest Videos */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Latest Videos</h2>
          <div className="flex items-center">
            <span className="mr-2 bangla-text text-gray-500 dark:text-gray-400">সর্বশেষ ভিডিও</span>
            <Link to="/latest" className="text-blue-600 dark:text-blue-400 hover:underline">
              View All
            </Link>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden animate-pulse">
                <div className="w-full h-40 bg-gray-300 dark:bg-gray-600"></div>
                <div className="p-3">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {videos.slice(0, 8).map((video) => (
              <Link key={video.id} to={`/video/${video.slug}`} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative">
                  <img 
                    src={video.thumbnail || `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`} 
                    alt={video.title}
                    className="w-full h-40 object-cover"
                  />
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1 rounded">
                    {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">{video.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{video.uploader?.username || 'Unknown'}</p>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>{formatViews(video.views)} views</span>
                    <span className="mx-1">•</span>
                    <span>{formatDate(video.created_at)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No videos available</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {isAuthenticated 
                ? 'Get started by uploading your first video.'
                : 'Sign in to upload videos or browse public content.'}
            </p>
            <div className="mt-6">
              {isAuthenticated ? (
                <Link
                  to="/upload"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg
                    className="-ml-1 mr-2 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  New Video
                </Link>
              ) : (
                <div className="space-x-3">
                  <Link
                    to="/login"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Popular Videos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Popular Videos</h2>
          <div className="flex items-center">
            <span className="mr-2 bangla-text text-gray-500 dark:text-gray-400">জনপ্রিয় ভিডিও</span>
            <Link to="/trending" className="text-blue-600 dark:text-blue-400 hover:underline">
              View All
            </Link>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden animate-pulse">
                <div className="w-full h-40 bg-gray-300 dark:bg-gray-600"></div>
                <div className="p-3">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredVideos.slice(1, 5).map((video) => (
              <Link key={video.id} to={`/video/${video.slug}`} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative">
                  <img 
                    src={video.thumbnail || `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`} 
                    alt={video.title}
                    className="w-full h-40 object-cover"
                  />
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1 rounded">
                    {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">{video.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{video.uploader.username}</p>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>{formatViews(video.views)} views</span>
                    <span className="mx-1">•</span>
                    <span>{formatDate(video.created_at)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
