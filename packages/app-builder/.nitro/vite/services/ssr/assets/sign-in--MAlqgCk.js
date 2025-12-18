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
const signInLoader_createServerFn_handler = createServerRpc({
  id: "35a259fecdcb9b6f37e5d9af14cde2d19eb31c44df12758aaa353d284a9d912b",
  name: "signInLoader",
  filename: "src/routes/_app/_auth/sign-in.tsx"
}, (opts) => signInLoader.__executeServer(opts));
const signInLoader = createServerFn().middleware([servicesMiddleware]).handler(signInLoader_createServerFn_handler, async function signInLoader2({
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
  const url = new URL(request.url);
  const authProvider = (appConfig && appConfig.auth.provider) ?? "firebase";
  const isSsoEnabled = appConfig && appConfig.features.sso;
  const emailParam = url.searchParams.toString().match(/email=([^&]*)/)?.[1];
  const prefilledEmail = emailParam ? decodeURIComponent(emailParam.replace(/\+/g, "%2B")) : "";
  if (!isSsoEnabled || prefilledEmail) {
    throw redirect({
      href: `/sign-in-email?email=${encodeURIComponent(prefilledEmail)}`
    });
  }
  const redirectTo = url.searchParams.get("redirectTo");
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
  return {
    isSignupReady: appConfig ? appConfig.status.migrations && appConfig.status.hasOrg && appConfig.status.hasUser : false,
    authProvider,
    didMigrationsRun: appConfig?.status.migrations ?? false,
    authError: authError ?? (!appConfig ? "BackendUnavailable" : void 0),
    isManagedMarble: appConfig?.isManagedMarble ?? false,
    redirectTo
  };
});
export {
  signInLoader_createServerFn_handler
};
