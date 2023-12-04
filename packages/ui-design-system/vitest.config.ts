import viteTsConfigPaths from 'vite-tsconfig-paths';
import { defineProject } from 'vitest/config';

export default defineProject({
  plugins: [viteTsConfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['vitest-setup.ts'],
  },
});
