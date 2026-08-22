import { defineConfig } from 'tsdown'

export default defineConfig({
  // Specify your library entry point
  entry: {
    index: 'src',
  },
  // Output both ES Modules and CommonJS formats
  format: ['esm', 'cjs'],
  outDir: 'dist',
  // Automatically generate .d.ts and .d.cts files
  dts: true,

  // Clean the dist directory before building
  clean: true,

  // tsconfig: 'tsconfig.build.json',

  // Optional: Generate source maps for debugging
  sourcemap: true,
})
