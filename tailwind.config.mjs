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
        accent: '#0f5c4c', // AA on light backgrounds (7.6:1 on cream)
        // Lighter brand green for text on dark sections — #0f5c4c fails there
        // (2.2:1); this passes AA (8.35:1 on ink) and matches the dark wordmark.
        'accent-dark': '#7FC1A6',
      },
      fontFamily: {
        // DM Sans (self-hosted, variable) site-wide; system stack as fallback.
        sans: [
          '"DM Sans"',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
      },
    },
  },
  plugins: [],
};
