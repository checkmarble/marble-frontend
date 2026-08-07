import { defineConfig } from 'tsdown';

export default defineConfig({
  // Named entries rather than a glob: three files called index.ts would
  // otherwise collide, and these names are the published subpaths.
  entry: {
    index: 'src/index.ts',
    fold: 'src/fold/index.ts',
    'react-flow': 'src/react-flow/index.ts',
  },
  // ESM only. Every consumer of a React Flow layout is running a bundler, and
  // dual-publishing buys compatibility nobody here needs at the cost of the
  // dual-package hazard.
  format: ['esm'],
  dts: true,
  clean: true,
  treeshake: true,
  // The one optional peer. Bundling it would defeat the point of keeping
  // polarPetal dependency-free.
  deps: { neverBundle: ['@dagrejs/dagre'] },
});
