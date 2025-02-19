import eslintPluginJs from '@eslint/js'
import globals from 'globals'
import eslintTypescript from 'typescript-eslint'

export default eslintTypescript.config(
  {
    languageOptions: {
      globals: { ...globals.node },
      parser: eslintTypescript.parser,
      ecmaVersion: 2018,
      sourceType: 'module',
      parserOptions: { warnOnUnsupportedTypeScriptVersion: false }
    }
  },
  eslintPluginJs.configs.recommended,
  eslintTypescript.configs.recommended,
  {
    rules: {
      'newline-before-return': 'error',
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
