export default {
  content: ['./src/**/*.{ts,tsx,jsx,js}', '../ui-design-system/src/**/*.{ts,tsx,jsx,js}', '!.output/**', '!.nitro/**'],
  theme: {
    extend: {
      screens: {
        'lg-analytics': '1200px',
      },
    },
  },
};
