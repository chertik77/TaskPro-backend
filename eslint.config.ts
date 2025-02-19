import eslintPluginJs from '@eslint/js'
import eslintTsParser from '@typescript-eslint/parser'
import eslintTypescript from 'typescript-eslint'

export default eslintTypescript.config(
  {
    languageOptions: {
      parser: eslintTsParser,
      ecmaVersion: 2018,
      sourceType: 'module',
      parserOptions: { warnOnUnsupportedTypeScriptVersion: false }
    }
  },
  eslintPluginJs.configs.recommended,
  eslintTypescript.configs.recommended,
  { rules: { 'newline-before-return': 'error' } },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' }
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/array-type': ['error', { default: 'array' }],
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'typeLike', format: ['PascalCase'] }
      ]
    }
  }
)
