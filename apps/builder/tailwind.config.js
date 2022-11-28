const { createGlobPatternsForDependencies } = require('@nrwl/react/tailwind');
const sharedTailwindConfig = require('../../libs/tailwind-preset/tailwind.config');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [sharedTailwindConfig],
  content: [
    join(__dirname, './app/**/*.{ts,tsx,jsx,js}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
};
