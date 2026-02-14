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
          DEFAULT: '#3A987D',
          50: '#E6F7F2',
          100: '#C6E4D9',
          600: '#3A987D',
          700: '#2E7D69',
          800: '#236454',
        },
        secondary: {
          DEFAULT: '#FFD166',
          hover: '#E0B85A',
        },
        background: '#F8FAF8',
        'text-dark': '#2C3E50',
        'soft-green': '#C6E4D9',
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}