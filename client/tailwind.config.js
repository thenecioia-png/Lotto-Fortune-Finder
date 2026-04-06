/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#fdf6e3',
          100: '#f5e6b0',
          200: '#e8cc78',
          300: '#d4b050',
          400: '#c4920a',
          500: '#b07a08',
          600: '#956408',
          700: '#7a5008',
          800: '#5e3c06',
          900: '#422a04',
        },
        dark: {
          50:  '#1a1a1a',
          100: '#141414',
          200: '#0f0f0f',
          300: '#0d0d0d',
          400: '#080808',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #8a6010 0%, #c4920a 50%, #d4a820 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0d0d0d 0%, #1a1008 100%)',
      },
      animation: {
        'shimmer':    'shimmer 2s linear infinite',
        'float':      'float 3s ease-in-out infinite',
        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(196,146,10,0.25)' },
          '50%':      { boxShadow: '0 0 28px rgba(196,146,10,0.45)' },
        },
      },
    },
  },
  plugins: [],
};
