/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
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
}// In your CSS or Tailwind config, you might want to add these custom styles:
