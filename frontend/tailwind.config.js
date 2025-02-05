/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0A2647', // You can use any valid hex, rgb, or rgba value
      },
    },
  },
  plugins: [],
}
