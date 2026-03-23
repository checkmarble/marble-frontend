import { sentryVitePlugin } from '@sentry/vite-plugin';
import { defineConfig, type PluginOption } from 'vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';

const isSentryConfigured = !!process.env['SENTRY_AUTH_TOKEN'];
const appDirectory = 'src';

const isVitest = !!process.env['VITEST'];

const plugins: PluginOption[] = [];

if (!isVitest) {
  const { vitePlugin: remix } = await import('@remix-run/dev');
  const { remixDevTools } = await import('remix-development-tools');
  const { flatRoutes } = await import('remix-flat-routes');

  plugins.push(
    remixDevTools({
      client: {
        maxHeight: 400,
        liveUrls: [
          { name: 'staging', url: 'https://app.staging.checkmarble.com' },
          { name: 'production', url: 'https://app.checkmarble.com' },
        ],
        routeBoundaryGradient: 'gotham',
        showBreakpointIndicator: false,
        requireUrlFlag: true,
        urlFlag: 'devTools',
      },
    }),
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
          ignoredRouteFiles: ['.*', '**/*.css', '**/*.test.{js,jsx,ts,tsx}', '**/__*.*'],
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
  ssr: {
    noExternal: ['country-flag-emojis'],
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
