import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['**/node_modules/', '**/dist/'],
  },
  eslint.configs.recommended,
  tseslint.configs.eslintRecommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.*js', '**/*.ts*'],
    languageOptions: { globals: globals.browser },
    linterOptions: {
      noInlineConfig: true
    },
    rules: {
      eqeqeq: 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'sort-imports': ['error', { ignoreDeclarationSort: true }],
      '@typescript-eslint/no-namespace': 'off',
      quotes: ['error', 'single'],
    },
  },
];
