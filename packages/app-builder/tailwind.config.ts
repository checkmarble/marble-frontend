import type { Config } from 'tailwindcss';

import sharedTailwindConfig from '../tailwind-preset/src/tailwind.config';

export default {
  presets: [sharedTailwindConfig],
  theme: {
    extend: {
      gridTemplateColumns: {
        'test-run': '28.38% 28.97% 11.59% 8.83% auto',
      },
    },
  },
  content: [
    './src/**/*.{ts,tsx,jsx,js}',
    '../ui-design-system/src/**/*.{ts,tsx,jsx,js}',
  ],
} satisfies Config;
