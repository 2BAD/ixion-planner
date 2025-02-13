import { axiom } from '@2bad/axiom'

// biome-ignore lint/style/noDefaultExport: acceptable for this use case
export default [
  axiom(import.meta.dirname),
  {
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off'
    }
  }
].flat()
