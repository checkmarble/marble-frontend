const { join } = require('path');

module.exports = {
  root: true,
  extends: ['@marble/eslint-config/react'],
  settings: {
    tailwindcss: {
      config: join(__dirname, 'tailwind.config.ts'),
    },
  },
  ignorePatterns: ['/node_modules/', '/.cache/', '/build/', '/public/build/'],
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
      rules: {
        'no-restricted-properties': [
          'error',
          {
            object: 'process',
            property: 'env',
            message: 'Use getServerEnv(...) instead',
          },
        ],
        // In Remix, throwing responses is a common pattern : https://remix.run/docs/en/main/guides/errors#error-sanitization
        '@typescript-eslint/only-throw-error': 'off',
      },
    },
  ],
};
