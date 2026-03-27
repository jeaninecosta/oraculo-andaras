/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        mistico: {
          fundo:  '#0d0618',
          escuro: '#1a0a2e',
          medio:  '#2d1b69',
          claro:  '#6d28d9',
        },
        dourado: {
          DEFAULT: '#d4af37',
          claro:   '#f0d878',
          escuro:  '#a07820',
        },
        cristal: {
          DEFAULT: '#e8d5f5',
          claro:   '#f5eeff',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['"Inter"', 'sans-serif'],
      },
      animation: {
        flutuar: 'flutuar 3s ease-in-out infinite',
        brilhar: 'brilhar 2s ease-in-out infinite',
        revelar: 'revelar 0.6s ease-out forwards',
      },
      keyframes: {
        flutuar: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        brilhar: {
          '0%, 100%': { opacity: '0.7' },
          '50%':      { opacity: '1' },
        },
        revelar: {
          '0%':   { opacity: '0', transform: 'scale(0.8) rotateY(90deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotateY(0deg)' },
        },
      },
    },
  },
  plugins: [],
}
