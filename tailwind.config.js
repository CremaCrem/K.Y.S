/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        lato: ['Lato', 'sans-serif'],
      },
      colors: {
        'background': "rgba(var(--background))",
        'surface': "rgba(var(--surface))",
        'text-color': "rgba(var(--text-color))",
        'text-secondary': "rgba(var(--text-secondary))",
        'button': "rgba(var(--button))",
        'border-color': "rgba(var(--border-color))",
        'border-select': "rgba(var(--border-select))",
        'hover': "rgba(var(--hover))",
        'categoryGame': "rgba(var(--categoryGame))",
        'categoryEmail': "rgba(var(--categoryEmail))",
        'categorySocials': "rgba(var(--categorySocials))",
        'categoryApp': "rgba(var(--categoryApp))",
        'categoryBank': "rgba(var(--categoryBank))",
        'editButton': "rgba(var(--editButton))",
        'deleteButton': "rgba(var(--deleteButton))",
        'entryList': "rgba(var(--entryList))",
        'entryBar': "rgba(var(--entryBar))",
        'hover-text-color': "rgba(var(--hover-text-color))",
        'card-bg': "rgba(var(--card-bg))",
        'input-bg': "rgba(var(--input-bg))",
      },
      backgroundImage: {
        'alpha-wolf': "url('../public/assets/images/awooooo.jpg')"
      },
      boxShadow: {
        'soft': '0 2px 15px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 20px rgba(0, 0, 0, 0.12)',
        'strong': '0 10px 40px rgba(0, 0, 0, 0.15)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      }
    },
  },
  plugins: [],
}
