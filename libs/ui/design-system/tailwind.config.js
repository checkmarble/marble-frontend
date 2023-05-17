const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const sharedTailwindConfig = require('../../tailwind-preset/tailwind.config');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [sharedTailwindConfig],
  content: [
    join(__dirname, './src/**/*.{ts,tsx,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
};
