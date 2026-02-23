import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig, type Plugin, PluginOption } from 'vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';

// Prevent Rollup from trying to parse native .node binaries (e.g. fsevents)
const externalNativeModules: Plugin = {
  name: 'external-native-modules',
  enforce: 'pre',
  resolveId(id) {
    if (id.endsWith('.node')) return { id, external: true };
  },
};

const config = defineConfig({
  plugins: [
    devtools(),
    nitro({ preset: 'bun' }) as PluginOption,
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
  ],
});

export default config;
