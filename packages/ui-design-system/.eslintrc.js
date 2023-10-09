const { join } = require('path');

module.exports = {
  extends: ['../../.eslintrc.json', 'plugin:tailwindcss/recommended'],
  settings: {
    tailwindcss: {
      config: join(__dirname, 'tailwind.config.js'),
    },
  },
  ignorePatterns: ['!**/*', '/node_modules/'],
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
      rules: {
        'tailwindcss/classnames-order': 'off',
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      rules: {},
    },
    {
      files: ['*.js', '*.jsx'],
      rules: {},
    },
  ],
};
