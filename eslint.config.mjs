import globals from 'globals';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: globals.browser },
    ignores: ['node_modules/', '**/dist/**'],
    rules: {
      'sort-imports': ['error', { ignoreDeclarationSort: true }],
      '@typescript-eslint/no-namespace': 'off',
    },
  },
];
