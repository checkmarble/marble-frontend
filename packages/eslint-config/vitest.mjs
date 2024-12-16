import eslintVitest from '@vitest/eslint-plugin';
import eslintTestingLibrary from 'eslint-plugin-testing-library';

/** @type {import('eslint').Linter.Config} */
export default [
  {
    files: ['*.test.{ts,tsx}'],
    plugins: {
      vitest: eslintVitest,
      'testing-library': eslintTestingLibrary,
    },
    rules: {
      ...eslintVitest.configs.recommended,
      ...eslintTestingLibrary.configs['flat/react'],
    },
  },
];
