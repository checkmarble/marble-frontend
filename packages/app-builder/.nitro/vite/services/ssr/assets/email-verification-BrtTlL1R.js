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
const emailVerificationLoader_createServerFn_handler = createServerRpc({
  id: "f6ade2d030bce8b55f721d90fa3d9327598258d26781c52971bd4ed5ea65533e",
  name: "emailVerificationLoader",
  filename: "src/routes/_app/_auth/email-verification.tsx"
}, (opts) => emailVerificationLoader.__executeServer(opts));
const emailVerificationLoader = createServerFn().middleware([servicesMiddleware]).handler(emailVerificationLoader_createServerFn_handler, async function emailVerificationLoader2({
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
  return null;
});
export {
  emailVerificationLoader_createServerFn_handler
};
