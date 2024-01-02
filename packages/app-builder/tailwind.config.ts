import type { Config } from 'tailwindcss';

import sharedTailwindConfig from '../tailwind-preset/tailwind.config';

export default {
  presets: [sharedTailwindConfig],
  content: [
    './src/**/*.{ts,tsx,jsx,js}',
    '../ui-design-system/src/**/*.{ts,tsx,jsx,js}',
  ],
} satisfies Config;
