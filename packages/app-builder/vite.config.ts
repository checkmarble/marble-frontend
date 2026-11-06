import { sentryVitePlugin } from '@sentry/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import type { PluginOption } from 'vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

const isSentryConfigured = !!process.env['SENTRY_AUTH_TOKEN'];
const isTest = !!process.env['VITEST'];

// Prevent Rollup from trying to parse native .node binaries (e.g. fsevents)
const externalNativeModules: PluginOption = {
  name: 'external-native-modules',
  enforce: 'pre',
  resolveId(id) {
    if (id.endsWith('.node')) return { id, external: true };
  },
};

const plugins = [
  ...(isTest
    ? []
    : [
        devtools(),
        tanstackStart(),
        nitro({
          config: {
            preset: 'node-server',
            // Rolldown must retain Nitro's side-effect import that installs SSR fetch routing.
            moduleSideEffects: ['\0virtual:#nitro-internal-pollyfills'],
            // Keep the CommonJS debug implementation used by Sentry's instrumentation.
            alias: { debug: 'debug' },
          },
        }),
        ...(isSentryConfigured
          ? sentryVitePlugin({
              telemetry: false,
              release: {
                // Associate commits explicitly via the SHA we already inject as
                // SENTRY_RELEASE. Avoids `auto: true`, which needs a local .git
                // (excluded from the Docker build).
                setCommits: {
                  auto: false,
                  repo: 'checkmarble/marble-frontend',
                  commit: process.env['SENTRY_RELEASE'] ?? '',
                },
              },
              sourcemaps: {
                filesToDeleteAfterUpload: ['./build/**/*.map'],
              },
              // Source-map upload is non-fatal by default; rethrow so a failed
              // upload fails the (CI-only) release build instead of passing silently.
              errorHandler: (err) => {
                throw err;
              },
            })
          : []),
      ]),
  externalNativeModules,
  tailwindcss(),
  viteTsConfigPaths(),
  viteReact(),
] satisfies PluginOption[];

export default defineConfig({
  plugins,
  server: {
    port: 3000,
  },
  // These dependencies are reached through code-split route chunks, so Vite's startup scan
  // can miss them. Pre-bundle them to avoid runtime re-optimization invalidating modules
  // already served to the browser ("Outdated Optimize Dep").
  optimizeDeps: {
    include: ['qrcode.react', 'ego-graph', 'ego-graph/dagre', 'ego-graph/fold', 'ego-graph/react-flow'],
  },
  ssr: {
    // country-flag-emojis ships CJS; force Vite to bundle it for SSR.
    // maplibre-gl is ESM-only in v6 — keep it bundled so SSR does not
    // try to resolve a missing CommonJS entry (TanStack Start / Vite).
    noExternal: ['country-flag-emojis', 'maplibre-gl'],
  },
  build: {
    sourcemap: isSentryConfigured,
  },
  environments: {
    client: {
      build: {
        assetsInlineLimit: (filePath) => (filePath.endsWith('.svg') ? false : undefined),
      },
    },
    ssr: {
      build: {
        assetsInlineLimit: (filePath) => (filePath.endsWith('.svg') ? false : undefined),
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
