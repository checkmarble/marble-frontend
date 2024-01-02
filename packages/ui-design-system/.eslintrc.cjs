const { join } = require('path');

/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ['@marble/eslint-config/react'],
  settings: {
    tailwindcss: {
      config: join(__dirname, 'tailwind.config.ts'),
    },
  },
};
