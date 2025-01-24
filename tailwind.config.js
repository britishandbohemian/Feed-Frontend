/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'loading-bar': {
          '0%': { width: '0%' },
          '100%': { width: '100%' }
        }
      },
      animation: {
        'loading-bar': 'loading-bar 2s linear'
      }
    },
  },
  plugins: [],
  styles: {
    '.material-input': {
      '&:focus': {
        'border-bottom-width': '3px',
        'border-bottom-color': 'theme(colors.blue.500)',
      }
    }
  }
}