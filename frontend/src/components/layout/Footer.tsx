import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* MyTube info */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">MyTube</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Share your videos with the world! MyTube is a video sharing platform where you can upload, view, and interact with videos.
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 bangla-text">
              বিশ্বের সাথে আপনার ভিডিও শেয়ার করুন! মাইটিউব একটি ভিডিও শেয়ারিং প্ল্যাটফর্ম যেখানে আপনি ভিডিও আপলোড, দেখতে এবং ইন্টারেক্ট করতে পারেন।
            </p>
          </div>
          
          {/* Links */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Links</h2>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/trending" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  Trending
                </Link>
              </li>
              <li>
                <Link to="/upload" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  Upload
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Help */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Help</h2>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Language selector */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Language</h2>
            <select 
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              aria-label="Select language"
              title="Language selector"
            >
              <option value="en">English</option>
              <option value="bn">বাংলা (Bangla)</option>
            </select>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} MyTube. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
