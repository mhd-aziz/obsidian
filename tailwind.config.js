/** @type {import('tailwindcss').Config} */
module.exports = {
  // Nativewind: scan className di semua file TS/TSX project (pola resmi nativewind.dev)
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Dark theme "obsidian" (hitam mengkilap) — PRD.md
        obsidian: {
          DEFAULT: '#09090B',
          surface: '#18181B',
          accent: '#7C3AED',
        },
      },
    },
  },
  plugins: [],
};
