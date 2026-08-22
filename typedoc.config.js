import packageJson from './package.json' with { type: 'json' }

/** @type {Partial<import("typedoc").TypeDocOptions>} */
export default {
  name: `${packageJson?.name ?? 'canonical-serialization.'} - API Reference (Users)`,
  entryPoints: ['src/index.ts'],
  out: 'docs/generated/api-reference',
  excludeInternal: true,
  excludePrivate: true,
  excludeProtected: true,
  exclude: ['dist', 'docs', '**/generated', 'node_modules'],
  skipErrorChecking: true,
  readme: './README.md',
}
