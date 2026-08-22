import prettier from 'eslint-config-prettier'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import { eslintJsConfig, eslintTsConfig } from './eslint-ts-and-js.config'

export default defineConfig([
  { ignores: ['dist', '**/generated'] },
  eslintJsConfig,
  eslintTsConfig,
  /**
   * Nodejs global variables.
   */
  [
    {
      files: [`**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}`],
      ignores: ['website/web-client/**'],
      languageOptions: {
        globals: {
          ...globals.nodeBuiltin,
        },
      },
    },
  ],
  prettier,
])
