import eslintJsxA11y from 'eslint-plugin-jsx-a11y';
import eslintReact from 'eslint-plugin-react';
import eslintReactHooks from 'eslint-plugin-react-hooks';

import tsConfig from './typescript.mjs';

/** @type {import('eslint').Linter.Config} */
export default [
  ...tsConfig,
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  eslintReact.configs.flat.recommended,
  eslintReact.configs.flat['jsx-runtime'],
  {
    name: 'react-hooks',
    plugins: { 'react-hooks': eslintReactHooks },
    rules: eslintReactHooks.configs.recommended.rules,
  },
  { name: 'jsx-a11y', ...eslintJsxA11y.flatConfigs.recommended },
  {
    name: 'custom react rules',
    rules: {
      'react/prop-types': 'off',
      'react/jsx-no-leaked-render': ['warn', { validStrategies: ['ternary'] }],
      'jsx-a11y/no-autofocus': [
        'error',
        {
          ignoreNonDOM: true,
        },
      ],
    },
  },
];
