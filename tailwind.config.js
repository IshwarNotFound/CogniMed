/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: '#0d0e0f',
        surface: '#0d0e0f',
        'surface-variant': '#232629',
        'surface-container': '#181a1c',
        'surface-container-high': '#1d2022',
        'surface-bright': '#292d30',
        primary: '#00e1ab',
        'on-primary': '#004a36',
        secondary: '#589fff',
        'secondary-container': '#003b74',
        error: '#ee7d77',
        'on-surface': '#e3e5e9',
        'on-surface-variant': '#a9abaf',
        'outline-variant': '#45484b',
      },
      spacing: {
        '8': '2.75rem',
        '12': '3rem',
        '16': '4rem',
        '24': '8.5rem',
      }
    },
  },
  plugins: [],
}
