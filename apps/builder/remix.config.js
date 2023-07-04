/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  serverModuleFormat: 'cjs',
  ignoredRouteFiles: ['**/.*'],
  watchPaths: ['../../libs'],
  future: {
    v2_errorBoundary: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_routeConvention: false,
    v2_dev: true,
  },
  tailwind: true,
};
