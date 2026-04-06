/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#2a1a04',
          100: '#3a2408',
          200: '#4e3010',
          300: '#6b4010',
          400: '#855010',
          500: '#9a6510',
          600: '#a07010',
          700: '#b8860b',
          800: '#7a5208',
          900: '#5a3a06',
        },
        dark: {
          50: '#1a1a1a',
          100: '#141414',
          200: '#0f0f0f',
          300: '#0a0a0a',
          400: '#050505',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #7a5208 0%, #a07010 50%, #b8860b 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0a0a0a 0%, #1a1008 100%)',
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(160,112,16,0.2)' },
          '50%': { boxShadow: '0 0 25px rgba(160,112,16,0.4)' },
        },
      },
    },
  },
  plugins: [],
};
