import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { fetchVideosByCategory } from '../app/features/videos/videoSlice';
import { Video } from '../app/features/videos/videoSlice';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CategoryVideosPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useDispatch();
  
  const { 
    videos: videosData = [], 
    categories = [],
    isLoading, 
    error 
  } = useSelector((state: RootState) => state.videos);

  // Ensure data is always arrays with proper typing
  const videos: Video[] = Array.isArray(videosData) ? videosData : [];
  const allCategories = Array.isArray(categories) ? categories : [];
  
  // Find the current category
  const currentCategory = allCategories.find(cat => cat.slug === slug);
  
  // Filter videos by category
  const categoryVideos = videos.filter(video => video.category?.slug === slug);

  useEffect(() => {
    if (slug) {
      dispatch(fetchVideosByCategory(slug) as any);
    }
  }, [dispatch, slug]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="w-full h-40 bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">
          {currentCategory?.name || 'Category'} Videos
        </h1>
        <p className="text-red-500 mb-4">Failed to load videos: {error}</p>
        <button
          onClick={() => slug && dispatch(fetchVideosByCategory(slug) as any)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer position="top-right" autoClose={5000} />
      
      <h1 className="text-3xl font-bold mb-2">
        {currentCategory?.name || 'Category'} Videos
      </h1>
      
      {currentCategory?.description && (
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          {currentCategory.description}
        </p>
      )}
      
      {categoryVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categoryVideos.map((video) => (
            <Link 
              key={video.id} 
              to={`/video/${video.slug}`}
              className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
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
                <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">
                  {video.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {video.uploader?.username}
                </p>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>{video.views} views</span>
                  <span className="mx-1">•</span>
                  <span>{new Date(video.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">No videos found in this category</p>
          <Link 
            to="/" 
            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Browse All Videos
          </Link>
        </div>
      )}
    </div>
  );
};

export default CategoryVideosPage;
