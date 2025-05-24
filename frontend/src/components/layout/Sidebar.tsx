import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import AddCategory from '../categories/AddCategory';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { categories: categoriesData } = useSelector((state: RootState) => state.videos);
  
  // Ensure categories is always an array
  const categories = Array.isArray(categoriesData) ? categoriesData : [];
  
  // Main navigation items
  const navItems = [
    { name: 'Home', path: '/', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Trending', path: '/trending', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
    { name: 'Subscriptions', path: '/subscriptions', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { name: 'Library', path: '/library', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:block">
      <div className="h-full px-3 py-4 overflow-y-auto">
        <ul className="space-y-2 font-medium">
          {/* Main navigation */}
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`flex items-center p-2 rounded-lg ${
                  location.pathname === item.path
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
          
          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
          
          {/* Categories */}
          <li>
            <div className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
              <span className="flex-1 ml-3 whitespace-nowrap">Categories</span>
            </div>
            <ul className="ml-4 mt-1 space-y-1">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    to={`/category/${category.slug}`}
                    className="flex items-center p-2 text-gray-700 rounded-lg dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 group"
                  >
                    {category.icon && (
                      <span className="mr-2">
                        <i className={category.icon}></i>
                      </span>
                    )}
                    <span className="text-sm">{category.name}</span>
                  </Link>
                </li>
              ))}
              {/* Add Category Button */}
              <li className="mt-2">
                <AddCategory />
              </li>
            </ul>
          </li>
          
          {/* Divider for Bangla */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
          
          {/* Bangla Categories */}
          <div className="text-gray-500 dark:text-gray-400 uppercase text-sm font-bold ml-2 mb-2 bangla-text">
            ক্যাটাগরি
          </div>
          {categories.map((category) => (
            <li key={`bangla-${category.id}`}>
              <Link
                to={`/category/${category.slug}`}
                className="flex items-center p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg bangla-text"
              >
                <span>
                  {/* This would normally be the Bangla translation of the category name */}
                  {category.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
