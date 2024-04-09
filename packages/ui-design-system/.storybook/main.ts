import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  docs: {
    autodocs: 'tag',
  },
  core: {
    disableTelemetry: true,
  },
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  staticDirs: ['./public'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
};

export default config;
