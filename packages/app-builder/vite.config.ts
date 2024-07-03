import { vitePlugin as remix } from '@remix-run/dev';
import { installGlobals } from '@remix-run/node';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { flatRoutes } from 'remix-flat-routes';
import { defineConfig } from 'vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';

installGlobals();

// eslint-disable-next-line no-restricted-properties
const isCI = process.env['CI'] === 'true';
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
    sentryVitePlugin({
      telemetry: false,
      disable: !isCI,
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
  },
  build: {
    sourcemap: isCI,
  },
});
