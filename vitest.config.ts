import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    ui: process.env.CI === 'true' ? false : true,
    coverage: {
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
      include: ['src', 'packages'],
    },
  },
  resolve: {
    tsconfigPaths: true,

    alias: {
      // When TEST_PUBLISHED_PKG is true, resolve imports of your package name to the published package
      '@canonical-serialization':
        process.env.TEST_PUBLISHED_PKG === 'true'
          ? 'canonical-serialization-published'
          : './src',
    },
  },
})
