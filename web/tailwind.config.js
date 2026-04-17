/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#eff0ff',
          100: '#dfe0ff',
          200: '#c5c5ff',
          300: '#a29bfe',
          400: '#8b83ff',
          500: '#6c63ff',
          600: '#5a50e8',
          700: '#4a40cc',
          800: '#3b33a3',
          900: '#2d257d',
        },
        dark: {
          900: '#0a0e1a',
          800: '#0f1322',
          700: '#141828',
          600: '#1a1f2e',
          500: '#212636',
          400: '#2a3044',
        },
      },
      backgroundImage: {
        'hero-glow': 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(108,99,255,0.25) 0%, transparent 70%)',
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 100%)',
      },
      boxShadow: {
        'glow-sm': '0 0 16px rgba(108,99,255,0.3)',
        'glow':    '0 0 32px rgba(108,99,255,0.4)',
        'glow-lg': '0 0 60px rgba(108,99,255,0.5)',
        'card':    '0 4px 32px rgba(0,0,0,0.4)',
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease both',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
