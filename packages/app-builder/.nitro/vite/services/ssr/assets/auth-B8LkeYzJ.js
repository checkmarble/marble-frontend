import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { s as servicesMiddleware } from "./services-middleware-DR8Hua1Y.js";
import { _ as createServerFn, a4 as getRequest, x as redirect } from "../server.js";
import { o as object, s as string } from "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
function safeRedirect(to, defaultRedirect) {
  if (!to || typeof to !== "string") return defaultRedirect;
  if (!to.startsWith("/") || to.startsWith("//")) return defaultRedirect;
  return to;
}
const signInPayload = object({
  idToken: string(),
  refreshToken: string().optional(),
  csrf: string(),
  redirectTo: string().optional()
});
const signInFn_createServerFn_handler = createServerRpc({
  id: "23078da067c0d054992a8f46ecb488d22fb36590eb3f3abe2bbb0f4b4b45f03b",
  name: "signInFn",
  filename: "src/server-fns/auth.ts"
}, (opts) => signInFn.__executeServer(opts));
const signInFn = createServerFn({
  method: "POST"
}).middleware([servicesMiddleware]).validator(signInPayload).handler(signInFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const request = getRequest();
  const successRedirect = safeRedirect(data.redirectTo ?? null, "/app-router");
  return context.services.authService.authenticate(request, {
    idToken: data.idToken,
    refreshToken: data.refreshToken,
    csrf: data.csrf
  }, {
    successRedirect,
    failureRedirect: "/sign-in"
  });
});
const signInEmailFn_createServerFn_handler = createServerRpc({
  id: "efcf4c4ade647ef10c5850f4903cb036ee9c9cc6425af6151a1469dd30578d49",
  name: "signInEmailFn",
  filename: "src/server-fns/auth.ts"
}, (opts) => signInEmailFn.__executeServer(opts));
const signInEmailFn = createServerFn({
  method: "POST"
}).middleware([servicesMiddleware]).validator(signInPayload).handler(signInEmailFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const request = getRequest();
  const successRedirect = safeRedirect(data.redirectTo ?? null, "/app-router");
  return context.services.authService.authenticate(request, {
    idToken: data.idToken,
    refreshToken: data.refreshToken,
    csrf: data.csrf
  }, {
    successRedirect,
    failureRedirect: "/sign-in-email"
  });
});
const logoutFn_createServerFn_handler = createServerRpc({
  id: "4d3bc23bbc393f0c22fb74aa313ecc4d1b221eb475ca56a220fd3b416d6ad25e",
  name: "logoutFn",
  filename: "src/server-fns/auth.ts"
}, (opts) => logoutFn.__executeServer(opts));
const logoutFn = createServerFn({
  method: "POST"
}).middleware([servicesMiddleware]).validator(object({
  redirectTo: string().optional()
})).handler(logoutFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const request = getRequest();
  const redirectTo = data.redirectTo ? `/sign-in?redirectTo=${encodeURIComponent(data.redirectTo)}` : "/sign-in";
  await context.services.authService.logout(request, {
    redirectTo
  });
  throw redirect({
    href: redirectTo
  });
});
const refreshTokenFn_createServerFn_handler = createServerRpc({
  id: "529c11e230cecc431623ebc64b78ad4822d0276b44fe54542de7db123b4ed455",
  name: "refreshTokenFn",
  filename: "src/server-fns/auth.ts"
}, (opts) => refreshTokenFn.__executeServer(opts));
const refreshTokenFn = createServerFn({
  method: "POST"
}).middleware([servicesMiddleware]).validator(object({
  idToken: string(),
  csrf: string()
})).handler(refreshTokenFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const request = getRequest();
  try {
    await context.services.authService.refresh(request, {
      idToken: data.idToken,
      csrf: data.csrf
    }, {
      failureRedirect: "/sign-in"
    });
  } catch (err) {
    if (err instanceof Response && err.status >= 300 && err.status < 400) {
      throw redirect({
        href: err.headers.get("Location"),
        statusCode: err.status
      });
    }
    throw err;
  }
});
export {
  logoutFn_createServerFn_handler,
  refreshTokenFn_createServerFn_handler,
  signInEmailFn_createServerFn_handler,
  signInFn_createServerFn_handler
};
