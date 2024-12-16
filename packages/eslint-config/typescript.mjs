import tsEslint from 'typescript-eslint';

import defaultConfig from './default.mjs';

/** @type {import('eslint').Linter.Config} */
const config = tsEslint.config(defaultConfig, tsEslint.configs.recommended, {
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        caughtErrors: 'none',
        destructuredArrayIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    '@typescript-eslint/no-empty-object-type': [
      'error',
      { allowWithName: 'Props$' },
    ],
    '@typescript-eslint/no-empty-function': 'error',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        fixStyle: 'inline-type-imports',
      },
    ],
  },
});

export default config;
