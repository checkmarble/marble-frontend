const defaultTheme = require('tailwindcss/defaultTheme');
const colors = require('./src/colors.json');
const fontSize = require('./src/fontSize.json');

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      ...colors,
    },
    fontSize,
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      keyframes: {
        maxWidth: {
          75: '75%',
        },
        'ping-slow': {
          '10%': {
            transform: 'scale(2)',
            opacity: 0,
          },
          '100%': {
            transform: 'scale(2)',
            opacity: 0,
          },
        },
        circleAnimation: {
          from: {
            transform: 'scale(0) rotate(45deg)',
            opacity: 0,
          },
          to: {
            transform: 'scale(1) rotate(45deg)',
            opacity: 1,
          },
        },
        firstLineAnimation: {
          from: {
            transform: 'scale(0)',
            opacity: 0,
          },
          to: {
            transform: 'scale(1)',
            opacity: 1,
          },
        },
        secondLineAnimation: {
          from: {
            transform: 'scale(0) rotate(90deg)',
            opacity: 0,
          },
          to: {
            transform: 'scale(1) rotate(90deg)',
            opacity: 1,
          },
        },
        checkmarkAnimation: {
          '0%': {
            height: 0,
            width: 0,
            opacity: 0,
          },
          '40%': {
            height: 0,
            width: '6px',
            opacity: 1,
          },
          '100%': {
            opacity: 1,
            height: '10px',
          },
        },
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
        slideDown: {
          from: { height: 0 },
          to: { height: 'var(--radix-collapsible-content-height)' },
        },
        slideUp: {
          from: { height: 'var(--radix-collapsible-content-height)' },
          to: { height: 0 },
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
    require('tailwindcss-radix')(),
    require('@headlessui/tailwindcss'),
    function ({ addVariant }) {
      addVariant('not-last', '&>*:not(:last-child)');
    },
  ],
};
