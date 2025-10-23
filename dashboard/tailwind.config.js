/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d6e0ff',
          300: '#b3c7ff',
          400: '#8ca3ff',
          500: '#667eea',
          600: '#4c5fd5',
          700: '#3847b0',
          800: '#2a3689',
          900: '#1f2968',
        },
        purple: {
          500: '#764ba2',
          600: '#653d8a',
          700: '#563272',
        }
      }
    },
  },
  plugins: [],
}

