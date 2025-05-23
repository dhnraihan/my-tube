import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { searchVideos, fetchCategories, Video } from '../app/features/videos/videoSlice';

const SearchPage: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { searchResults, isLoading, categories } = useSelector((state: RootState) => state.videos);
  
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [filteredResults, setFilteredResults] = useState<Video[]>([]);
  const [sortBy, setSortBy] = useState('relevance');
  
  // Get search query from URL parameters
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q') || '';
  
  useEffect(() => {
    if (query) {
      dispatch(searchVideos(query) as any);
    }
    
    dispatch(fetchCategories() as any);
  }, [dispatch, query]);
  
  useEffect(() => {
    // Filter and sort search results based on active category and sort option
    let results = [...searchResults];
    
    // Filter by category if selected
    if (activeCategory !== null) {
      results = results.filter(video => video.category?.id === activeCategory);
    }
    
    // Sort results
    if (sortBy === 'date') {
      results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'views') {
      results.sort((a, b) => b.views - a.views);
    } else if (sortBy === 'rating') {
      results.sort((a, b) => (b.likes_count - b.dislikes_count) - (a.likes_count - a.dislikes_count));
    }
    
    setFilteredResults(results);
  }, [searchResults, activeCategory, sortBy]);
  
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
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} ${years === 1 ? 'year' : 'years'} ago`;
    }
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Search results for "{query}"
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Found {filteredResults.length} results
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
            <h2 className="font-medium text-gray-900 dark:text-white mb-4">Filters</h2>
            
            {/* Sort options */}
            <div className="mb-6">
              <h3 className="text-sm text-gray-600 dark:text-gray-400 uppercase mb-2">Sort by</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="sort"
                    value="relevance"
                    checked={sortBy === 'relevance'}
                    onChange={() => setSortBy('relevance')}
                    className="mr-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Relevance</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="sort"
                    value="date"
                    checked={sortBy === 'date'}
                    onChange={() => setSortBy('date')}
                    className="mr-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Upload date</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="sort"
                    value="views"
                    checked={sortBy === 'views'}
                    onChange={() => setSortBy('views')}
                    className="mr-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300">View count</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="sort"
                    value="rating"
                    checked={sortBy === 'rating'}
                    onChange={() => setSortBy('rating')}
                    className="mr-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Rating</span>
                </label>
              </div>
            </div>
            
            {/* Category filter */}
            <div>
              <h3 className="text-sm text-gray-600 dark:text-gray-400 uppercase mb-2">Categories</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    checked={activeCategory === null}
                    onChange={() => setActiveCategory(null)}
                    className="mr-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300">All Categories</span>
                </label>
                
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      checked={activeCategory === category.id}
                      onChange={() => setActiveCategory(category.id)}
                      className="mr-2"
                    />
                    <span className="text-gray-700 dark:text-gray-300">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Search Results */}
        <div className="lg:col-span-3">
          {isLoading ? (
            // Loading state
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm animate-pulse">
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-64 h-40 bg-gray-300 dark:bg-gray-700"></div>
                    <div className="p-4 flex-grow">
                      <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredResults.length > 0 ? (
            // Search results
            <div className="space-y-4">
              {filteredResults.map((video) => (
                <Link 
                  key={video.id} 
                  to={`/video/${video.slug}`}
                  className="block bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative sm:w-64 h-40">
                      <img 
                        src={video.thumbnail || `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`} 
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1 rounded">
                        {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 dark:text-white text-lg mb-1">{video.title}</h3>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                        <span>{formatViews(video.views)} views</span>
                        <span className="mx-1">•</span>
                        <span>{formatDate(video.created_at)}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {video.uploader.username}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                        {video.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            // No results
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                No videos found
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We couldn't find any videos matching your search criteria.
              </p>
              <p className="text-gray-600 dark:text-gray-400 bangla-text mb-6">
                আমরা আপনার অনুসন্ধান মাপদণ্ড মেলে এমন কোন ভিডিও খুঁজে পাইনি।
              </p>
              <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline">
                Back to home
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
