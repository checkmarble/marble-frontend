import eslintJs from '@eslint/js';
import eslintPrettier from 'eslint-config-prettier';
import eslintImport from 'eslint-plugin-import';
import eslintSimpleImportSort from 'eslint-plugin-simple-import-sort';

/** @type {import('eslint').Linter.Config} */
export default [
  { name: '@eslint/js', ...eslintJs.configs.recommended },
  { name: 'eslint-config-prettier', ...eslintPrettier },
  {
    name: 'eslint-simple-import-sort',
    plugins: {
      'simple-import-sort': eslintSimpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  {
    name: 'eslint-plugin-import',
    ...eslintImport.flatConfigs.recommended,
    ...eslintImport.flatConfigs.typescript, // This config is mainly used so the resolver can check "imports" and "exports" fields in package.json files
  },
];

// /** @type {import("eslint").Linter.Config} */
// module.exports = {
//   env: {
//     browser: true,
//     commonjs: true,
//     es6: true,
//   },
//   parserOptions: {
//     ecmaVersion: 'latest',
//     sourceType: 'module',
//     project: true,
//     ecmaFeatures: {
//       jsx: true,
//     },
//   },
//   extends: ['eslint:recommended'],
//   plugins: ['simple-import-sort'],

//   rules: {
//     'no-duplicate-imports': [
//       'error',
//       {
//         includeExports: true,
//       },
//     ],
//     'simple-import-sort/imports': 'error',
//     'simple-import-sort/exports': 'error',
//   },

//   overrides: [
//     // Config files
//     {
//       files: ['*.config.js', '*.eslintrc.js'],
//       extends: ['prettier'],
//       env: {
//         node: true,
//       },
//     },

//     // Typescript
//     {
//       files: ['*.{ts,tsx}'],
//       plugins: ['@typescript-eslint', 'import'],

//       parser: '@typescript-eslint/parser',

//       settings: {
//         'import/resolver': {
//           node: {
//             extensions: ['.js', '.jsx', '.ts', '.tsx'],
//           },
//           typescript: {
//             alwaysTryTypes: true,
//           },
//         },
//       },
//       extends: [
//         'plugin:@typescript-eslint/recommended',
//         'plugin:import/recommended',
//         'plugin:import/typescript',
//         'plugin:@typescript-eslint/recommended-requiring-type-checking',
//         'prettier',
//       ],
//       rules: {
//         'import/namespace': 'off',
//         'import/no-unresolved': 'off',
//         '@typescript-eslint/restrict-template-expressions': [
//           'error',
//           {
//             allowNumber: true,
//             allowBoolean: true,
//           },
//         ],
//         '@typescript-eslint/no-unsafe-return': 'off',
//         '@typescript-eslint/consistent-type-imports': [
//           'error',
//           {
//             fixStyle: 'inline-type-imports',
//           },
//         ],
//         '@typescript-eslint/no-unused-vars': [
//           'error',
//           {
//             argsIgnorePattern: '^_',
//             caughtErrors: 'none',
//             destructuredArrayIgnorePattern: '^_',
//             ignoreRestSiblings: true,
//           },
//         ],
//         '@typescript-eslint/no-empty-object-type': [
//           'error',
//           { allowWithName: 'Props$' },
//         ],
//       },
//     },

//     // Jest/Vitest
//     {
//       files: ['*.test.{js,jsx,ts,tsx}'],
//       plugins: ['jest', 'jest-dom', 'testing-library'],
//       extends: [
//         'plugin:jest/recommended',
//         'plugin:jest-dom/recommended',
//         'plugin:testing-library/react',
//         'prettier',
//       ],
//       env: {
//         'jest/globals': true,
//       },
//       settings: {
//         jest: {
//           // we're using vitest which has a very similar API to jest
//           // (so the linting plugins work nicely), but it means we have to explicitly
//           // set the jest version.
//           version: 28,
//         },
//       },
//     },
//   ],
// };
