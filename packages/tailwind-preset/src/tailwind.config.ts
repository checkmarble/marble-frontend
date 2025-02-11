import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';
import { type PluginAPI } from 'tailwindcss/types/config';
import tailwindcssAnimate from 'tailwindcss-animate';
import tailwindcssRadix from 'tailwindcss-radix';

export default {
  content: [],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',

      // New figma values
      grey: {
        '00': 'oklch(0% 0 0)',
        '50': 'oklch(61.29% 0.024 288.54)',
        '80': 'oklch(81.1% 0.0112 291.9)',
        '90': 'oklch(92.58% 0.004 286.32)',
        '95': 'oklch(96.44% 0.0013 286.38)',
        '98': 'oklch(98.54% 0.0013 286.38)',
        '100': 'oklch(100% 0 0)',
      },
      purple: {
        '60': 'oklch(51.34% 0.2286 277.47)',
        '65': 'oklch(55.15% 0.2424 277.49)',
        '82': 'oklch(76.65% 0.1218 286.34)',
        '96': 'oklch(95.19% 0.0227 288.67)',
        '98': 'oklch(97.65% 0.011964760849213694 291.2928951486998)',
        '99': 'oklch(99.19% 0.003955633727212019 286.3274403025669)',
      },
      green: {
        '34': 'oklch(60.19% 0.1439 155.06)', // Not in DS but needed for hover
        '38': 'oklch(64.97% 0.1594 153.6)',
        '68': 'oklch(81.03% 0.0926 161.33)',
        '94': 'oklch(96.01% 0.0183 166.38)',
      },
      yellow: {
        '50': 'oklch(82.26% 0.1684 83.23)',
        '75': 'oklch(90.35% 0.1157 91.7)',
        '90': 'oklch(95.87% 0.0473 91.32)',
      },
      red: {
        '43': 'oklch(53.16% 0.1799 31.32)',
        '47': 'oklch(57.14% 0.1956 32.06)',
        '74': 'oklch(76.36% 0.0962 29.85)',
        '87': 'oklch(88% 0.045 28.28)', // Not in DS but needed for errors borders
        '95': 'oklch(95.19% 0.0179 30.27)',
      },
      blue: {
        '58': 'oklch(63.11% 0.19990007248114244 257.69061986426914)',
        '96': 'oklch(96.09% 0.018782499204383577 255.53286989477857)',
      },
      orange: {
        '50': 'oklch(69.58% 0.20425909529071523 43.49103689485837)',
        '87': 'oklch(88.69% 0.06019174087690467 32.301452587972335)', // Not in DS but needed for hover
        '95': 'oklch(95.66% 0.022279930128345612 38.33533240178478)',
      },
    },
    fontSize: {
      l: ['20px', '30px'],
      m: ['16px', '24px'],
      s: ['14px', '21px'],
      xs: ['12px', '18px'],
    },
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      keyframes: {
        'ping-slow': {
          '10%': {
            transform: 'scale(2)',
            opacity: '0',
          },
          '100%': {
            transform: 'scale(2)',
            opacity: '0',
          },
        },
        circleAnimation: {
          from: {
            transform: 'scale(0) rotate(45deg)',
            opacity: '0',
          },
          to: {
            transform: 'scale(1) rotate(45deg)',
            opacity: '1',
          },
        },
        firstLineAnimation: {
          from: {
            transform: 'scale(0)',
            opacity: '0',
          },
          to: {
            transform: 'scale(1)',
            opacity: '1',
          },
        },
        secondLineAnimation: {
          from: {
            transform: 'scale(0) rotate(90deg)',
            opacity: '0',
          },
          to: {
            transform: 'scale(1) rotate(90deg)',
            opacity: '1',
          },
        },
        checkmarkAnimation: {
          '0%': {
            height: '0',
            width: '0',
            opacity: '0',
          },
          '40%': {
            height: '0',
            width: '6px',
            opacity: '1',
          },
          '100%': {
            opacity: '1',
            height: '10px',
          },
        },
        overlayShow: {
          from: {
            opacity: '0',
          },
          to: {
            opacity: '1',
          },
        },
        slideLeftAndFadeIn: {
          from: {
            opacity: '0',
            transform: 'translate(-100%, 0)',
          },
          to: {
            opacity: '1',
            transform: 'translate(0, 0)',
          },
        },
        slideLeftAndFadeOut: {
          from: {
            opacity: '1',
            transform: 'translate(0, 0)',
          },
          to: {
            opacity: '0',
            transform: 'translate(-100%, 0)',
          },
        },
        slideRightAndFadeIn: {
          from: {
            opacity: '0',
            transform: 'translate(+100%, 0)',
          },
          to: {
            opacity: '1',
            transform: 'translate(0, 0)',
          },
        },
        slideRightAndFadeOut: {
          from: {
            opacity: '1',
            transform: 'translate(0, 0)',
          },
          to: {
            opacity: '0',
            transform: 'translate(+100%, 0)',
          },
        },
        slideUpAndFade: {
          from: {
            opacity: '0',
            transform: 'translateY(2px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        slideDown: {
          from: { height: '0' },
          to: { height: 'var(--radix-collapsible-content-height)' },
        },
        slideUp: {
          from: { height: 'var(--radix-collapsible-content-height)' },
          to: { height: '0' },
        },
        overflow: {
          '0%': {
            overflow: 'hidden',
          },
          '99%': {
            overflow: 'hidden',
          },
          '100%': {
            overflow: 'visible',
          },
        },
      },
      animation: {
        'ping-slow': 'ping-slow 5s ease infinite',
        slideUpAndFade: 'slideUpAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        circleAnimation:
          'circleAnimation 300ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        firstLineAnimation: 'firstLineAnimation 300ms ease-out forwards',
        secondLineAnimation: 'secondLineAnimation 300ms ease-out forwards',
        checkmarkAnimation: 'checkmarkAnimation  300ms ease-out forwards',
        overlayShow: 'overlayShow 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideLeftAndFadeIn:
          'slideLeftAndFadeIn 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideLeftAndFadeOut:
          'slideLeftAndFadeOut 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideRightAndFadeIn:
          'slideRightAndFadeIn 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideRightAndFadeOut:
          'slideRightAndFadeOut 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideDown: 'slideDown 200ms cubic-bezier(0.87, 0, 0.13, 1)',
        slideUp: 'slideUp 200ms cubic-bezier(0.87, 0, 0.13, 1)',
        overflow: 'overflow linear',
      },
    },
  },
  plugins: [
    tailwindcssRadix,
    tailwindcssAnimate,
    function ({ addVariant }: PluginAPI) {
      addVariant('not-last', '&>*:not(:last-child)');
    },
    function ({ addBase, addUtilities }: PluginAPI) {
      addBase({
        '*': {
          '--scrollbar-color-thumb': 'rgb(193, 192, 200)',
          '--scrollbar-color-track': 'transparent',
          '--scrollbar-width': '6px',
        },
        '@supports (scrollbar-width: auto)': {
          '*': {
            'scrollbar-color':
              'var(--scrollbar-color-thumb) var(--scrollbar-color-track)',
            'scrollbar-width': 'thin',
            '--scrollbar-width': '10px',
          },
        },
        '@supports selector(::-webkit-scrollbar)': {
          '*::-webkit-scrollbar-thumb': {
            background: 'var(--scrollbar-color-thumb)',
            'border-radius': '9999px',
          },
          '*::-webkit-scrollbar-track': {
            background: 'var(--scrollbar-color-track)',
          },
          '*::-webkit-scrollbar': {
            width: 'var(--scrollbar-width)',
            height: 'var(--scrollbar-width)',
          },
        },
      });

      addUtilities({
        '.scrollbar-gutter-stable': {
          'scrollbar-gutter': 'stable',
        },
        '.text-rtl': {
          direction: 'rtl',
        },
        '.text-ltr': {
          direction: 'ltr',
        },
      });
    },
  ],
} satisfies Config;
