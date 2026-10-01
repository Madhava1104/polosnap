/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        caveat: ['Caveat', 'cursive'],
        permanent: ['"Permanent Marker"', 'cursive'],
        indie: ['"Indie Flower"', 'cursive'],
        courier: ['"Courier Prime"', 'monospace'],
        dancing: ['"Dancing Script"', 'cursive'],
        shadows: ['"Shadows Into Light"', 'cursive'],
        vt323: ['VT323', 'monospace'],
        reenie: ['"Reenie Beanie"', 'cursive'],
        kalam: ['Kalam', 'cursive'],
        sans: ['Outfit', 'sans-serif'],
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-6px) rotate(0.5deg)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        }
      }
    },
  },
  plugins: [],
}
