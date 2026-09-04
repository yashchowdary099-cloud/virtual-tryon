// FILE: frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fashion: {
          bg: '#FAF8F5',
          surface: '#FAF7F2',
          card: '#FFFFFF',
          border: '#E8E2D5',
          dark: '#1A1817',
          espresso: '#2D2A26',
          muted: '#6E675F',
          lightMuted: '#9E968B',
          gold: '#C59B27',
          bronze: '#8C6D3F',
          terracotta: '#B85C38',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        brand: ['Cormorant Garamond', 'serif'],
      }
    },
  },
  plugins: [],
}
