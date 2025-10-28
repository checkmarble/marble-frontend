import type { Config } from 'tailwindcss';

import sharedTailwindConfig from '../tailwind-preset/src/tailwind.config';

export default {
  presets: [sharedTailwindConfig as unknown as Config],
  content: ['./src/**/*.{ts,tsx,html}'],
} satisfies Config;
