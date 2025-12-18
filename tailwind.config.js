/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f6fa',
          100: '#e9edf5',
          200: '#c8d2e6',
          300: '#a7b7d7',
          400: '#6581b9',
          500: '#3455a0',
          600: '#2e4c90',
          700: '#263f78',
          800: '#1e325f',
          900: '#19284d',
          950: '#111b33',
        },
        accent: {
          cyan: '#80dbe4',
          purple: '#593465',
        },
      },
    },
  },
  plugins: [],
};
