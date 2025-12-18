import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig, PluginOption } from 'vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';

const config = defineConfig({
  plugins: [
    devtools(),
    nitro() as PluginOption,
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
