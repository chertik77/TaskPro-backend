import { defineConfig } from 'lint-staged/config'

export default defineConfig({
  '*.{ts,tsx}': ['prettier --write', 'eslint --fix', 'eslint']
})
