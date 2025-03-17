import reactConfig from '@marble/eslint-config/react.mjs';
import tailwindcssConfig from '@marble/eslint-config/tailwindcss.mjs';
import vitestConfig from '@marble/eslint-config/vitest.mjs';
import { join } from 'path';

const tailwindConfigPath = join(import.meta.dirname, 'tailwind.config.ts');

export default [
  ...reactConfig,
  ...tailwindcssConfig(tailwindConfigPath),
  ...vitestConfig,
  { ignores: ['build'] },
];
