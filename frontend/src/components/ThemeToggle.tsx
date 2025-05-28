import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { MdLightMode, MdDarkMode } from 'react-icons/md';

const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
      aria-label="Toggle theme"
    >
      {isDarkMode ? (
        <MdLightMode className="w-5 h-5 text-yellow-500" />
      ) : (
        <MdDarkMode className="w-5 h-5 text-gray-700" />
      )}
    </button>
  );
};

export default ThemeToggle; 