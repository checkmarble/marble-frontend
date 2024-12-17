import eslintStorybook from 'eslint-plugin-storybook';

/** @type {import('eslint').Linter.Config} */
export default [
  {
    files: ['*.stories.{ts,tsx}'],
    plugins: {
      storybook: eslintStorybook,
    },
    rules: eslintStorybook.configs.recommended,
  },
];
