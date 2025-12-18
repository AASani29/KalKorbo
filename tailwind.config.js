/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdff',
          100: '#d4f7fe',
          200: '#b0f0fd',
          300: '#76e5fa',
          400: '#34d1f2',
          500: '#08b6d9',
          600: '#0694b3',
          700: '#0a7891',
          800: '#0f6276',
          900: '#115163',
          950: '#053543',
        },
      },
    },
  },
  plugins: [],
};
