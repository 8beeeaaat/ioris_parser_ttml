import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  eslint.configs.recommended,
  tseslint.configs.eslintRecommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: globals.browser },
    files: ['**/*.*js', '**/*.ts*'],
    ignores: ['**/node_modules/', '**/dist/'],
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
