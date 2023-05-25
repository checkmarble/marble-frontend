import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';

const config: StorybookConfig = {
  docs: {
    autodocs: true,
  },
  core: {
    disableTelemetry: true,
  },
  stories: ['../src/lib/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: ['@storybook/addon-essentials', 'storybook-addon-swc'],
  staticDirs: ['./public'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      // For now, this seems bugged with Storybook (so we need to specify manually resolve.alias)
      plugins: [viteTsConfigPaths()],
      resolve: {
        alias: {
          '@marble-front/ui/icons': 'libs/ui/icons/src/index.ts',
        },
      },
    });
  },
};

export default config;
