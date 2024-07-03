import { vitePlugin as remix } from '@remix-run/dev';
import { installGlobals } from '@remix-run/node';
import { flatRoutes } from 'remix-flat-routes';
import { defineConfig } from 'vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';

installGlobals();

const appDirectory = 'src';

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    remix({
      serverModuleFormat: 'esm',
      appDirectory,
      ignoredRouteFiles: ['**/*'],
      future: {},
      presets: [],
      routes: (defineRoutes) => {
        return flatRoutes('routes', defineRoutes, {
          appDir: appDirectory,
          ignoredRouteFiles: [
            '.*',
            '**/*.css',
            '**/*.test.{js,jsx,ts,tsx}',
            '**/__*.*',
          ],
        });
      },
    }),
    viteTsConfigPaths(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
