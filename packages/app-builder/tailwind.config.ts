import type { Config } from 'tailwindcss';

import sharedTailwindConfig from '../tailwind-preset/src/tailwind.config';

export default {
  presets: [sharedTailwindConfig],
  theme: {
    extend: {
      gridTemplateColumns: {
        'test-run': '30% 30% 8% auto',
        'ts-by-ds': '9% 40% 25% auto',
      },
    },
  },
  content: [
    './src/**/*.{ts,tsx,jsx,js}',
    '../ui-design-system/src/**/*.{ts,tsx,jsx,js}',
  ],
} satisfies Config;
