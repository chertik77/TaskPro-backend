import { defineConfig } from 'lint-staged/config'

export default defineConfig({
  '**/*.{ts,tsx}': [
    'prettier --write',
    'eslint -f mo',
    'bash -c tsc -p tsconfig.json --noEmit'
  ]
})
