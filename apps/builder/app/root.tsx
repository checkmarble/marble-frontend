import type { MetaFunction, LinksFunction } from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react';

import styles from './tailwind.css';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: styles },
  { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' },
  { rel: 'icon', href: '/favicon-32x32.png', sizes: '32x32' },
  { rel: 'icon', href: '/favicon-16x16.png', sizes: '16x16' },
  { rel: 'manifest', href: '/site.webmanifest' },
];

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Marble',
  viewport: 'width=device-width,initial-scale=1',
});

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
