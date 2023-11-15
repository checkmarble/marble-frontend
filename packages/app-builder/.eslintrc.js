const { join } = require('path');

module.exports = {
  extends: [
    '@remix-run/eslint-config',
    '@remix-run/eslint-config/node',
    '../../.eslintrc.json',
    'plugin:tailwindcss/recommended',
  ],
  settings: {
    tailwindcss: {
      config: join(__dirname, 'tailwind.config.js'),
    },
  },
  ignorePatterns: [
    '!**/*',
    '/node_modules/',
    '/.cache/',
    '/build/',
    '/public/build/',
  ],
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
      rules: {
        'tailwindcss/classnames-order': 'off',
        'no-restricted-properties': [
          'error',
          {
            object: 'process',
            property: 'env',
            message: 'Use getServerEnv(...) instead',
          },
        ],
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/restrict-template-expressions': [
          'error',
          {
            allowNumber: true,
            allowBoolean: true,
          },
        ],
        'jsx-a11y/no-autofocus': [
          2,
          {
            ignoreNonDOM: true,
          },
        ],
      },
    },
    {
      files: ['*.js', '*.jsx'],
      rules: {},
    },
    {
      files: ['*.jsx', '*.tsx'],
      rules: {
        'react/jsx-no-useless-fragment': ['error', { allowExpressions: true }],
      },
    },
  ],
};
