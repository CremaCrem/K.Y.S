/** @type {import('tailwindcss').Config} */
// Colors, fonts, and radii point at the design tokens in src/index.css
// (see docs/design-system/), so light and dark switch with [data-theme].
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: 'var(--kys-font-sans)',
        mono: 'var(--kys-font-mono)',
        wordmark: 'var(--kys-font-wordmark)',
      },
      colors: {
        primary: 'var(--kys-primary)',
        'primary-text': 'var(--kys-primary-text)',
        bg: 'var(--kys-bg)',
        surface: 'var(--kys-surface)',
        'surface-muted': 'var(--kys-surface-muted)',
        'surface-sunken': 'var(--kys-surface-sunken)',
        border: 'var(--kys-border)',
        'border-strong': 'var(--kys-border-strong)',
        ink: 'var(--kys-text)',
        muted: 'var(--kys-text-muted)',
        subtle: 'var(--kys-text-subtle)',
        danger: 'var(--kys-danger)',
        success: 'var(--kys-success)',
      },
      borderRadius: {
        'kys-sm': 'var(--kys-radius-sm)',
        'kys-md': 'var(--kys-radius-md)',
        'kys-lg': 'var(--kys-radius-lg)',
        'kys-xl': 'var(--kys-radius-xl)',
      },
      boxShadow: {
        'kys-1': 'var(--kys-shadow-1)',
        'kys-3': 'var(--kys-shadow-3)',
      },
    },
  },
  plugins: [],
}
