import { sentryVitePlugin } from '@sentry/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { PluginOption } from 'vite';
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

export default defineConfig({
  plugins: [
    ...(isTest
      ? []
      : [
          nitro({
            config: {
              preset: 'node-server',
            },
          }),
          tanstackStart({
            // router: {
            //   routeFileIgnorePattern: '.*\\.test\\.tsx?$',
            // },
          }),
          ...(isSentryConfigured
            ? [
                sentryVitePlugin({
                  telemetry: false,
                  release: {
                    setCommits: { auto: true },
                  },
                  sourcemaps: {
                    filesToDeleteAfterUpload: ['./build/**/*.map'],
                  },
                }),
              ]
            : []),
        ]),
    externalNativeModules,
    tailwindcss(),
    viteTsConfigPaths(),
    viteReact(),
  ],
  server: {
    port: 3000,
  },
  ssr: {
    // country-flag-emojis ships CJS; force Vite to bundle it for SSR
    noExternal: ['country-flag-emojis'],
  },
  build: {
    sourcemap: isSentryConfigured,
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
