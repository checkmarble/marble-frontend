import react from '@vitejs/plugin-react';
import viteTsConfigPaths from 'vite-tsconfig-paths';
import { defineProject } from 'vitest/config';

export default defineProject({
  plugins: [react(), viteTsConfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['vitest-setup.ts'],
  },
});
