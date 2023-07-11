/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  serverModuleFormat: 'cjs',
  appDirectory: 'src',
  ignoredRouteFiles: ['**/.*'],
  watchPaths: [
    '../ui-design-system/**/*',
    '../tailwind-preset/**/*',
    '../@ui-icons/**/*',
    '../typescript-utils/**/*',
    '../marble-api/**/*',
  ],
  future: {
    v2_errorBoundary: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_routeConvention: false,
    v2_dev: true,
  },
  tailwind: true,
};
