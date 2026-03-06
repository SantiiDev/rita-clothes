/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#000000',
        accent: '#D369CD',
        background: '#FFFFFF',
        surface: '#F5F5F5',
        textMain: '#000000',
        textDark: '#888888'
      },
      fontFamily: {
        heading: ['Inter', 'sans-serif'],
        drama: ['Playfair Display', 'serif'],
        data: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
