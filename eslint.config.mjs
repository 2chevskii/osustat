import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import globals from 'globals'

export default defineConfig([
  {
    ignores: ['**/coverage/**', '**/node_modules/**'],
  },
  {
    files: ['**/*.{js,mjs}'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  // Keep this last so ESLint never conflicts with Prettier's formatting rules.
  eslintConfigPrettier,
])
