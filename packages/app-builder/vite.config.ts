import { vitePlugin as remix } from '@remix-run/dev';
import { installGlobals } from '@remix-run/node';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { flatRoutes } from 'remix-flat-routes';
import { defineConfig, type PluginOption } from 'vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';

installGlobals();

const isSentryConfigured = !!process.env['SENTRY_AUTH_TOKEN'];
const appDirectory = 'src';

const isVitest = !!process.env['VITEST'];

const plugins: PluginOption[] = [];

if (!isVitest) {
  plugins.push(
    remix({
      serverModuleFormat: 'esm',
      appDirectory,
      ignoredRouteFiles: ['**/*'],
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        unstable_optimizeDeps: true,
        v3_lazyRouteDiscovery: true,
        v3_singleFetch: true,
      },
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
  );
}
if (isSentryConfigured) {
  plugins.push(
    sentryVitePlugin({
      telemetry: false,
      release: {
        setCommits: {
          auto: true,
        },
      },
      sourcemaps: {
        filesToDeleteAfterUpload: ['./build/**/*.map'],
      },
    }),
  );
}

plugins.push(viteTsConfigPaths());

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins,
  test: {
    globals: true,
    environment: 'jsdom',
  },
  build: {
    sourcemap: isSentryConfigured,
  },
});
