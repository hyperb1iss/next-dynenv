import eslintJs from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';

export default [
  {
    ignores: [
      'node_modules/**',
      'build/**',
      'examples/**',
      '**/*.js',
      '!eslint.config.js',
    ],
  },
  eslintJs.configs.recommended,
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.jest,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      import: importPlugin,
      prettier: prettierPlugin,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...prettierConfig.rules,
      'eol-last': ['error', 'always'],
      'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
      'no-undef': 'off', // TypeScript handles this better
      'import/extensions': 'off',
      'import/order': 'off',
      'import/prefer-default-export': 'off',
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'prettier/prettier': 'error',
    },
  },
  {
    files: ['src/__mocks__/**/*', '**/*.spec.ts', '**/*.spec.tsx'],
    rules: {
      'import/no-extraneous-dependencies': [
        'error',
        { devDependencies: true },
      ],
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
];
