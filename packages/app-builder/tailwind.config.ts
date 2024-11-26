import type { Config } from 'tailwindcss';

import sharedTailwindConfig from '../tailwind-preset/src/tailwind.config';

export default {
  presets: [sharedTailwindConfig],
  theme: {
    extend: {
      gridTemplateColumns: {
        'test-run': '2.5fr 3fr 1fr 1fr 2fr',
      },
    },
  },
  content: [
    './src/**/*.{ts,tsx,jsx,js}',
    '../ui-design-system/src/**/*.{ts,tsx,jsx,js}',
  ],
} satisfies Config;
