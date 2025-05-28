/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF0000',
          dark: '#CC0000',
        },
        background: {
          light: '#FFFFFF',
          dark: '#121212',
        },
        text: {
          light: '#1F2937',
          dark: '#F3F4F6',
        },
        card: {
          light: '#FFFFFF',
          dark: '#1F2937',
        },
        border: {
          light: '#E5E7EB',
          dark: '#374151',
        },
        hover: {
          light: '#F3F4F6',
          dark: '#374151',
        }
      },
    },
  },
  plugins: [],
}
