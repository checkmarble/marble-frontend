import reactConfig from '@marble/eslint-config/react.mjs';
import storybookConfig from '@marble/eslint-config/storybook.mjs';
import tailwindcssConfig from '@marble/eslint-config/tailwindcss.mjs';
import { join } from 'path';

const tailwindConfigPath = join(import.meta.dirname, 'tailwind.config.ts');

export default [
  ...reactConfig,
  ...tailwindcssConfig(tailwindConfigPath),
  ...storybookConfig,
  { ignores: ['storybook-static/'] },
];
