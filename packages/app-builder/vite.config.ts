import { sentryVitePlugin } from '@sentry/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import type { PluginOption } from 'vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';
import { defineConfig, type Plugin } from 'vitest/config';

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

// Cast bridges vite@7 plugin types (used at runtime, required by @tanstack/react-start)
// to vite@6 types that vitest@3.0.9's `defineConfig` still expects.
const plugins = [
  ...(isTest
    ? []
    : [
        devtools(),
        tanstackStart(),
        nitro({
          config: {
            preset: 'node-server',
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
] as Plugin[];

export default defineConfig({
  plugins,
  server: {
    port: 3000,
  },
  // `qrcode.react` is only reached through a code-split route chunk (TwoFactorAuthSettings),
  // so Vite's startup scan misses it and discovers it at runtime — the resulting re-optimize
  // invalidates the already-served client entry chunk ("Outdated Optimize Dep") and breaks
  // hydration app-wide. Pin it so it is pre-bundled on startup.
  optimizeDeps: {
    include: ['qrcode.react'],
  },
  ssr: {
    // country-flag-emojis ships CJS; force Vite to bundle it for SSR
    noExternal: ['country-flag-emojis'],
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
