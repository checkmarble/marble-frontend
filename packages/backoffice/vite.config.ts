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
  nitro({
    config: {
      preset: 'node-server',
    },
  }),
  externalNativeModules,
  // this is the plugin that enables path aliases
  viteTsConfigPaths(),
  tailwindcss(),
  tanstackStart(),
  viteReact({
    // babel: {
    //   plugins: ['babel-plugin-react-compiler'],
    // },
  }),
] as Plugin[];

const config = defineConfig({
  plugins,
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
});

export default config;
