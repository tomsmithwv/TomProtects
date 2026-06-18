/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Checker status colors (ported from InboxTom, reused later)
        pass: '#10b981',
        warn: '#f59e0b',
        fail: '#ef4444',
        // Base brand palette (placeholder — calm/protective)
        ink: '#1a1a1a',
        cream: '#fdfaf3',
        accent: '#0f5c4c',
      },
    },
  },
  plugins: [],
};
