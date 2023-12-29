/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ['@marble/eslint-config/default'],
  ignorePatterns: ['/node_modules/', 'src/generated/'],
};
