import './tailwind-imports.css';
import './public/fonts/Inter/inter.css';

import type { Preview } from '@storybook/react';
import { useEffect } from 'react';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  globalTypes: {
    theme: {
      description: 'Toggle light/dark mode',
      toolbar: {
        title: 'Theme',
        icon: 'contrast',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  decorators: [
    (Story, context) => {
      const isDark = context.globals['theme'] === 'dark';

      useEffect(() => {
        document.body.classList.toggle('dark', isDark);
        document.body.classList.toggle('bg-surface-page', isDark);
      }, [isDark]);

      return <Story />;
    },
  ],
};

export default preview;
