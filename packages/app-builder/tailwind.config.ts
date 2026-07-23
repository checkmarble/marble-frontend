import { gridAreas } from 'tailwindcss-grid-areas';

export default {
  content: ['./src/**/*.{ts,tsx,jsx,js}', '../ui-design-system/src/**/*.{ts,tsx,jsx,js}', '!.output/**', '!.nitro/**'],
  plugins: [gridAreas],

  theme: {
    extend: {
      screens: {
        'lg-analytics': '1200px',
      },
    },
  },
};
