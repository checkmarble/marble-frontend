import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { s as servicesMiddleware } from "./services-middleware-DR8Hua1Y.js";
import { _ as createServerFn, a4 as getRequest, x as redirect } from "../server.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const authRedirectLoader_createServerFn_handler = createServerRpc({
  id: "e43e9eeaeb4c49ea457b7f8042a90611c35a760ccb59ce0e4665bdd220dc0283",
  name: "authRedirectLoader",
  filename: "src/routes/_app/_auth/auth-redirect.tsx"
}, (opts) => authRedirectLoader.__executeServer(opts));
const authRedirectLoader = createServerFn().middleware([servicesMiddleware]).handler(authRedirectLoader_createServerFn_handler, async function authRedirectLoader2({
  context
}) {
  const request = getRequest();
  if (context.appConfig.auth.provider !== "firebase") {
    throw redirect({
      to: "/sign-in"
    });
  }
  const authDomain = context.appConfig.auth.firebase.authDomain;
  if (!authDomain) {
    throw redirect({
      to: "/sign-in"
    });
  }
  const url = new URL(request.url);
  throw redirect({
    href: `https://${authDomain}/__/auth/action${url.search}`
  });
});
export {
  authRedirectLoader_createServerFn_handler
};
