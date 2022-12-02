const defaultTheme = require('tailwindcss/defaultTheme');
const colors = require('./src/lib/colors.json');

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    colors,
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};
