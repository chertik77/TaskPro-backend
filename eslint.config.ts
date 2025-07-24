import eslintPluginJs from '@eslint/js'
import globals from 'globals'
import eslintTypescript from 'typescript-eslint'

export default eslintTypescript.config(
  eslintPluginJs.configs.recommended,
  eslintTypescript.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.node },
      parser: eslintTypescript.parser,
      parserOptions: { warnOnUnsupportedTypeScriptVersion: false }
    }
  },
  {
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "ImportSpecifier[local.name='env'][parent.source.value='node:process']",
          message:
            "Importing env from 'node:process' is not allowed. Use env config instead."
        },
        {
          selector:
            "ImportSpecifier[local.name='env'][parent.source.value='process']",
          message:
            "Importing 'env' from 'process' is not allowed. Use env config instead."
        },
        {
          selector:
            "MemberExpression[object.name='process'][property.name='env']",
          message:
            "Accessing 'process.env' is not allowed. Use env config instead."
        }
      ],
      'newline-before-return': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' }
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/array-type': ['error', { default: 'array' }],
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'typeLike', format: ['PascalCase'] }
      ]
    }
  },
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/consistent-type-definitions': 'off'
    }
  }
)
