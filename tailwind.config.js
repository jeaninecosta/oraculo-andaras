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
          DEFAULT: '#f0c040',
          claro:   '#ffe878',
          escuro:  '#c09030',
        },
        cristal: {
          DEFAULT: '#e8d5f5',
          claro:   '#f5eeff',
        },
      },
      fontFamily: {
        serif: ['"Cinzel"', 'Georgia', 'serif'],
        sans:  ['"Raleway"', 'sans-serif'],
      },
      animation: {
        flutuar:   'flutuar 3s ease-in-out infinite',
        brilhar:   'brilhar 2s ease-in-out infinite',
        revelar:   'revelar 0.6s ease-out forwards',
        cintillar: 'cintillar 3s ease-in-out infinite',
        'orb-1':   'orb1 22s ease-in-out infinite',
        'orb-2':   'orb2 28s ease-in-out infinite',
        'orb-3':   'orb3 18s ease-in-out infinite',
        'orb-4':   'orb4 35s ease-in-out infinite',
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
        cintillar: {
          '0%, 100%': { opacity: '0.15', transform: 'scale(1)' },
          '50%':      { opacity: '0.9',  transform: 'scale(1.6)' },
        },
      },
    },
  },
  plugins: [],
}
