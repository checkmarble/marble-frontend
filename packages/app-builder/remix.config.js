import { flatRoutes } from 'remix-flat-routes';

const appDirectory = 'src';

/**
 * @type {import('@remix-run/dev').AppConfig}
 */
export default {
  serverModuleFormat: 'esm',
  serverDependenciesToBundle: [
    'remix-i18next',
    'accept-language-parser',
    'intl-parse-accept-language',
  ],
  serverPlatform: 'node',
  appDirectory,
  browserNodeBuiltinsPolyfill: {
    modules: {
      process: true,
      buffer: true,
      stream: true,
      util: true,
      crypto: true,
    },
  },
  ignoredRouteFiles: ['**/*'],
  watchPaths: [
    '../ui-design-system/**/*',
    '../tailwind-preset/**/*',
    '../@ui-icons/**/*',
    '../typescript-utils/**/*',
  ],
  future: {},
  tailwind: true,
  postcss: true,
  routes: async (defineRoutes) => {
    return flatRoutes('routes', defineRoutes, {
      appDir: appDirectory,
      ignoredRouteFiles: [
        '.*',
        '**/*.css',
        '**/*.test.{js,jsx,ts,tsx}',
        '**/__*.*',
      ],
    });
  },
};
