import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { s as servicesMiddleware, y as useAuthSession } from "./services-middleware-DR8Hua1Y.js";
import { _ as createServerFn, a4 as getRequest, x as redirect } from "../server.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const signInEmailLoader_createServerFn_handler = createServerRpc({
  id: "bf0a785a637f5f2a759fbb1e8081bc8508a66bcb98e6fac8cace8c3cf4b681c8",
  name: "signInEmailLoader",
  filename: "src/routes/_app/_auth/sign-in-email.tsx"
}, (opts) => signInEmailLoader.__executeServer(opts));
const signInEmailLoader = createServerFn().middleware([servicesMiddleware]).handler(signInEmailLoader_createServerFn_handler, async function signInEmailLoader2({
  context
}) {
  const request = getRequest();
  try {
    await context.services.authService.isAuthenticated(request, {
      successRedirect: "/app-router"
    });
  } catch (error) {
    if (error instanceof Response && error.status >= 300 && error.status < 400) {
      throw redirect({
        href: error.headers.get("Location"),
        statusCode: error.status
      });
    }
    throw error;
  }
  const appConfig = context.appConfig;
  if (appConfig?.auth.provider === "oidc") {
    throw redirect({
      to: "/sign-in"
    });
  }
  let authError;
  if (appConfig) {
    const authSession = await useAuthSession();
    const sessionError = authSession.data.authError;
    if (sessionError) {
      authError = sessionError.message;
      await authSession.update({
        authError: void 0
      });
    }
  }
  const url = new URL(request.url);
  const emailParam = url.searchParams.toString().match(/email=([^&]*)/)?.[1];
  const prefilledEmail = emailParam ? decodeURIComponent(emailParam.replace(/\+/g, "%2B")) : null;
  const redirectTo = url.searchParams.get("redirectTo");
  return {
    isSignupReady: appConfig ? appConfig.status.migrations && appConfig.status.hasOrg && appConfig.status.hasUser : false,
    didMigrationsRun: appConfig?.status.migrations ?? false,
    authError: authError ?? (!appConfig ? "BackendUnavailable" : void 0),
    isSsoEnabled: appConfig && appConfig.features.sso,
    isManagedMarble: appConfig?.isManagedMarble ?? false,
    prefilledEmail,
    redirectTo
  };
});
export {
  signInEmailLoader_createServerFn_handler
};
