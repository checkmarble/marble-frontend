const defaultTheme = require('tailwindcss/defaultTheme');
const colors = require('./src/lib/colors.json');
const fontSize = require('./src/lib/fontSize.json');

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    colors,
    fontSize,
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};
