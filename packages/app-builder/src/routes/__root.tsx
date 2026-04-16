import tailwindStyles from '@app-builder/tailwind.css?url';
import { createRootRouteWithContext } from '@tanstack/react-router';
import { type i18n } from 'i18next';
import { ReactNode } from 'react';
import { iconsSVGSpriteHref, logosSVGSpriteHref } from 'ui-icons';

interface RouterContext {
  i18n: i18n;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width,initial-scale=1' },
      { title: 'Marble' },
    ],
    links: [
      { rel: 'preload', href: logosSVGSpriteHref, as: 'image' },
      { rel: 'preload', href: iconsSVGSpriteHref, as: 'image' },
      { rel: 'stylesheet', href: tailwindStyles },
      { rel: 'stylesheet', href: '/fonts/Inter/inter.css' },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/favicons/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicons/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicons/favicon-16x16.png',
      },
      { rel: 'manifest', href: '/site.webmanifest' },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  shellComponent: RootComponent,
});

function RootComponent({ children }: { children: ReactNode }) {
  return children;
}
