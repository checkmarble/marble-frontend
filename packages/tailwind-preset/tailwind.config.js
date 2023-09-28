const defaultTheme = require('tailwindcss/defaultTheme');
const colors = require('./src/colors.json');
const fontSize = require('./src/fontSize.json');

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      ...colors,
    },
    fontSize,
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [
    require('tailwindcss-radix')(),
    require('@headlessui/tailwindcss'),
    function ({ addVariant }) {
      addVariant('not-last', '&>*:not(:last-child)');
    },
  ],
};
