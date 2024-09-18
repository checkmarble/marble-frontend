/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ['@marble/eslint-config/default'],
  rules: {
    // Not applicable for Playwright
    'testing-library/prefer-screen-queries': 'off',
  },
};
