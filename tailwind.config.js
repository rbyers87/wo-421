/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Custom theme settings for dark and light mode
      colors: {
        darkBackground: '#121212', // Dark mode background
        lightBackground: '#ffffff', // Light mode background
        darkText: '#ffffff', // Dark mode text color
        lightText: '#000000', // Light mode text color
      },
    },
  },
  darkMode: 'class', // Enables dark mode based on the user's system preference
  plugins: [],
};
