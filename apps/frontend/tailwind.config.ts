import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'rgba(255, 255, 255, 0.06)',
        input: 'rgba(255, 255, 255, 0.06)',
        ring: 'rgba(124, 106, 240, 0.4)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        serif: ['Source Serif Pro', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
