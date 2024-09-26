/* eslint-disable @typescript-eslint/unbound-method */
import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';
import { type PluginAPI } from 'tailwindcss/types/config';
import tailwindcssRadix from 'tailwindcss-radix';

export default {
  content: [],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      purple: {
        '10': 'rgb(238, 237, 255)',
        '25': 'rgba(214, 211, 254)',
        '50': 'rgb(173, 167, 253)',
        '100': 'rgb(90, 80, 250)',
        '110': 'rgb(82, 72, 229)',
        '120': 'rgb(61, 53, 173)',
        '05': 'rgb(247, 246, 255)',
        '02': 'rgb(252, 252, 255)',
      },
      grey: {
        '10': 'rgb(230, 230, 233)',
        '25': 'rgb(193, 192, 200)',
        '50': 'rgb(131, 130, 146)',
        '100': 'rgb(8, 5, 37)',
        '05': 'rgb(243, 243, 244)',
        '00': 'rgb(255, 255, 255)',
        '02': 'rgb(250, 250, 251)',
      },
      green: {
        '10': 'rgb(231, 247, 239)',
        '50': 'rgb(137, 212, 175)',
        '100': 'rgb(20, 170, 95)',
        '110': 'rgb(19, 153, 89)',
        '120': 'rgb(16, 111, 74)',
        '05': 'rgb(243, 251, 247)',
      },
      yellow: {
        '10': 'rgb(253, 241, 206)',
        '50': 'rgb(251, 221, 129)',
        '100': 'rgb(248, 186, 3)',
        '110': 'rgb(218, 149, 11)',
        '120': 'rgb(161, 98, 15)',
        '05': 'rgb(255, 252, 242)',
      },
      red: {
        '10': 'rgb(251, 235, 232)',
        '25': 'rgb(244, 205, 199)',
        '50': 'rgb(233, 155, 142)',
        '100': 'rgb(210, 55, 30)',
        '110': 'rgb(190, 50, 31)',
        '120': 'rgb(138, 37, 32)',
        '05': 'rgb(253, 245, 244)',
      },
      orange: {
        '10': 'rgb(255, 236, 230)',
        '25': 'rgb(255, 204, 193)',
        '50': 'rgb(255, 153, 102)',
        '100': 'rgb(255, 102, 0)',
        '110': 'rgb(230, 92, 0)',
        '120': 'rgb(166, 64, 0)',
        '05': 'rgb(255, 247, 243)',
      },
      blue: {
        '10': 'rgb(234, 243, 255)',
        '50': 'rgb(149, 194, 255)',
        '100': 'rgb(42, 133, 255)',
        '110': 'rgb(39, 120, 233)',
        '120': 'rgb(30, 87, 176)',
        '05': 'rgb(244, 249, 255)',
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
        slideRightAndFadeIn:
          'slideRightAndFadeIn 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideRightAndFadeOut:
          'slideRightAndFadeOut 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideDown: 'slideDown 200ms cubic-bezier(0.87, 0, 0.13, 1)',
        slideUp: 'slideUp 200ms cubic-bezier(0.87, 0, 0.13, 1)',
      },
    },
  },
  plugins: [
    tailwindcssRadix,
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
      });
    },
  ],
} satisfies Config;
