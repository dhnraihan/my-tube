import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '../app/store';
import { fetchCategories, Category } from '../app/features/videos/videoSlice';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CategoriesPage: React.FC = () => {
  const dispatch = useDispatch();
  const { categories: categoriesData = [], isLoading, error } = useSelector(
    (state: RootState) => state.videos
  );

  // Ensure categories is always an array
  const categories: Category[] = Array.isArray(categoriesData) ? categoriesData : [];

  useEffect(() => {
    // Fetch categories if not already loaded
    if (categories.length === 0) {
      dispatch(fetchCategories() as any);
    }
  }, [dispatch, categories.length]);

  if (isLoading && categories.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">All Categories</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Categories</h1>
        <p className="text-red-500 mb-4">Failed to load categories: {error}</p>
        <button
          onClick={() => dispatch(fetchCategories() as any)}
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
      <h1 className="text-3xl font-bold mb-8">All Categories</h1>
      
      {categories.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex flex-col items-center justify-center h-32"
            >
              {category.icon && (
                <div className="text-2xl mb-2">{category.icon}</div>
              )}
              <h2 className="font-medium text-lg text-gray-900 dark:text-white">
                {category.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {category.video_count || 0} videos
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">No categories found</p>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
