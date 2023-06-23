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
      plugins: [viteTsConfigPaths()],
    });
  },
};

export default config;
