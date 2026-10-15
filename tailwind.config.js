/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        primary: 'var(--primary)',
        'on-primary': 'var(--on-primary)',
        accent: 'var(--accent)',
        text: 'var(--text)',
        success: 'var(--success)',
        hint: 'var(--hint)',
        outline: 'var(--outline)',
      },
      fontFamily: {
        story: ['var(--font-story)', 'sans-serif'],
        ui: ['"Baloo 2"', 'system-ui', 'sans-serif'],
      },
      minWidth: { tap: '72px', big: '96px' },
      minHeight: { tap: '72px', big: '96px' },
      borderRadius: { blob: '2rem' },
    },
  },
  plugins: [],
};
