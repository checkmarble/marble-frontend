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
