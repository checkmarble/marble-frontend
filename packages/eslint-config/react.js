/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['./default.js'],

  plugins: ['react-refresh'],

  rules: {
    'storybook/no-uninstalled-addons': 'error',
  },
  settings: {
    'jsx-a11y': {
      components: {
        Button: 'button',
      },
    },
  },

  overrides: [
    // React
    {
      files: ['**/*.{js,jsx,ts,tsx}'],
      plugins: ['react', 'jsx-a11y'],
      extends: [
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:react-hooks/recommended',
        'plugin:jsx-a11y/recommended',
        'plugin:storybook/recommended',
        'plugin:tailwindcss/recommended',
        'prettier',
      ],
      settings: {
        react: {
          version: 'detect',
        },
        formComponents: ['Form'],
        linkComponents: [
          { name: 'Link', linkAttribute: 'to' },
          { name: 'NavLink', linkAttribute: 'to' },
        ],
      },
      rules: {
        'react/prop-types': 'off',
        'react/jsx-no-leaked-render': [
          'warn',
          { validStrategies: ['ternary'] },
        ],
        'tailwindcss/classnames-order': 'off',
      },
    },

    // Typescript
    {
      files: ['**/*.{ts,tsx}'],
      rules: {
        'jsx-a11y/no-autofocus': [
          2,
          {
            ignoreNonDOM: true,
          },
        ],
      },
    },
  ],
};
