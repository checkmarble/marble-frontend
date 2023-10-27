const sharedTailwindConfig = require('../tailwind-preset/tailwind.config.js');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [sharedTailwindConfig],
  content: [
    join(__dirname, './src/**/*.{ts,tsx,jsx,js}'),
    join(__dirname, '../ui-design-system/src/**/*.{ts,tsx,jsx,js}'),
  ],
};
