import type { Config } from 'tailwindcss';

import sharedTailwindConfig from '../tailwind-preset/tailwind.config';

export default {
  presets: [sharedTailwindConfig],
  content: ['./src/**/*.{ts,tsx,html}'],
} satisfies Config;
