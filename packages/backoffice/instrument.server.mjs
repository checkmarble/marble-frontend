import * as Sentry from '@sentry/tanstackstart-react'
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  // Request headers and user IP are collected by default (`dataCollection`), for more info visit:
  // https://docs.sentry.io/platforms/javascript/configuration/options/#dataCollection
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 1.0,
  replaysOnErrorSampleRate: 1.0,
})
