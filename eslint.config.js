// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('@angular-eslint/eslint-plugin');
const angularTemplate = require('@angular-eslint/eslint-plugin-template');
const angularParser = require('@angular-eslint/template-parser');

module.exports = tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    plugins: {
      '@angular-eslint': angular,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.app.json'],
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      '@angular-eslint/prefer-standalone': 'warn',
      '@angular-eslint/use-lifecycle-interface': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    files: ['**/*.html'],
    plugins: {
      '@angular-eslint': angularTemplate,
    },
    languageOptions: {
      parser: angularParser,
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.app.json'],
      },
    },
    rules: {
      '@angular-eslint/template/no-call-expression': 'warn',
      '@angular-eslint/template/eqeqeq': 'warn',
    },
  }
);
