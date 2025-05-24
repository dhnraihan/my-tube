import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { fetchVideos, fetchFeaturedVideos } from '../app/features/videos/videoSlice';

const HomePage: React.FC = () => {
  const dispatch = useDispatch();
  const { videos: videosData, featuredVideos: featuredVideosData, isLoading, categories: categoriesData } = useSelector((state: RootState) => state.videos);
  
  // Ensure data is always arrays
  const categories = Array.isArray(categoriesData) ? categoriesData : [];
  const videos = Array.isArray(videosData) ? videosData : [];
  const featuredVideos = Array.isArray(featuredVideosData) ? featuredVideosData : [];

  useEffect(() => {
    dispatch(fetchVideos() as any);
    dispatch(fetchFeaturedVideos() as any);
  }, [dispatch]);

  // Format view count
  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M';
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K';
    }
    return views.toString();
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return '1 day ago';
    } else if (diffDays < 30) {
      return `${diffDays} days ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} ${years === 1 ? 'year' : 'years'} ago`;
    }
  };

  // Featured section (Hero)
  const FeaturedSection = () => {
    if (isLoading || featuredVideos.length === 0) {
      return (
        <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"></div>
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
          <h1 className="text-white text-3xl font-bold mb-2">{featuredVideo.title}</h1>
          <p className="text-gray-200 mb-4 line-clamp-2">{featuredVideo.description}</p>
          <div className="flex items-center text-gray-300 mb-4">
            <span>{formatViews(featuredVideo.views)} views</span>
            <span className="mx-2">•</span>
            <span>{formatDate(featuredVideo.created_at)}</span>
          </div>
          <Link 
            to={`/video/${featuredVideo.slug}`}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md inline-block w-max"
          >
            Watch Now
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Featured Video Section */}
      <FeaturedSection />
      
      {/* Video Categories */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h2>
          <Link to="/categories" className="text-blue-600 dark:text-blue-400 hover:underline">
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.slice(0, 6).map((category) => (
            <Link 
              key={category.id}
              to={`/category/${category.slug}`}
              className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <h3 className="font-medium text-gray-900 dark:text-white">{category.name}</h3>
            </Link>
          ))}
        </div>
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
        ) : (
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
