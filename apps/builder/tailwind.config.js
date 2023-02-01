const { createGlobPatternsForDependencies } = require('@nrwl/react/tailwind');
const sharedTailwindConfig = require('../../libs/tailwind-preset/tailwind.config');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [sharedTailwindConfig],
  content: [
    join(__dirname, './app/**/*.{ts,tsx,jsx,js}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      keyframes: {
        overlayShow: {
          from: {
            opacity: 0,
          },
          to: {
            opacity: 1,
          },
        },
        slideRightAndFadeIn: {
          from: {
            opacity: 0,
            transform: 'translate(+100%, 0)',
          },
          to: {
            opacity: 1,
            transform: 'translate(0, 0)',
          },
        },
        slideRightAndFadeOut: {
          from: {
            opacity: 1,
            transform: 'translate(0, 0)',
          },
          to: {
            opacity: 0,
            transform: 'translate(+100%, 0)',
          },
        },
        slideUpAndFade: {
          from: {
            opacity: 0,
            transform: 'translateY(2px)',
          },
          to: {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
      },
      animation: {
        slideUpAndFade: 'slideUpAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        overlayShow: 'overlayShow 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideRightAndFadeIn:
          'slideRightAndFadeIn 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideRightAndFadeOut:
          'slideRightAndFadeOut 200ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
};
