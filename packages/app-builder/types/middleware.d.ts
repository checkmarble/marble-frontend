declare module '@app-builder/core/middleware-config' {
  interface MiddlewareConfig {
    GlobalMiddlewares: typeof import('../src/global-middlewares').globalMiddlewares;
  }
}
