import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto my-10 text-center">
      <div className="mb-8">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-24 w-24 mx-auto text-gray-400 dark:text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">404 - Page Not Found</h1>
      
      <p className="text-gray-600 dark:text-gray-400 mb-2">
        The page you are looking for doesn't exist or has been moved.
      </p>
      
      <p className="text-gray-600 dark:text-gray-400 mb-8 bangla-text">
        আপনি যে পৃষ্ঠাটি খুঁজছেন তা বিদ্যমান নেই বা সরিয়ে দেওয়া হয়েছে।
      </p>
      
      <Link
        to="/"
        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
      >
        Go to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
