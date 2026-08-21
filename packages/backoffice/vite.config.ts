import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig, type Plugin } from 'vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';

// Prevent Rollup from trying to parse native .node binaries (e.g. fsevents)
const externalNativeModules: Plugin = {
  name: 'external-native-modules',
  enforce: 'pre',
  resolveId(id) {
    if (id.endsWith('.node')) return { id, external: true };
  },
};

const plugins = [
  devtools(),
  tanstackStart(),
  nitro({
    config: {
      preset: 'node-server',
    },
  }),
  externalNativeModules,
  tailwindcss(),
  viteTsConfigPaths(),
  viteReact(),
] as Plugin[];

const config = defineConfig({
  plugins,
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      '@tanstack/history',
      '@tanstack/router-core',
      '@tanstack/router-core/isServer',
      '@tanstack/router-core/ssr/client',
      '@tanstack/router-core/ssr/server',
      'h3-v2',
      'seroval',
    ],
  },
  environments: {
    client: {
      resolve: {
        dedupe: ['react', 'react-dom'],
      },
      build: {
        assetsInlineLimit: (filePath) => (filePath.endsWith('.svg') ? false : undefined),
      },
    },
    ssr: {
      resolve: {
        dedupe: ['react', 'react-dom'],
      },
      optimizeDeps: {
        include: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
      },
      build: {
        assetsInlineLimit: (filePath) => (filePath.endsWith('.svg') ? false : undefined),
      },
    },
  },
});

export default config;
