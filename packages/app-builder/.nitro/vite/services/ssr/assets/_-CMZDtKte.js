import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { _ as createServerFn, a4 as getRequest, x as redirect } from "../server.js";
import { s as servicesMiddleware } from "./services-middleware-DR8Hua1Y.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
const catchAllLoader_createServerFn_handler = createServerRpc({
  id: "1d24681fb4d9e54ee3acace0e37203e5829742ae19c4e9685f9dbc807c49ceff",
  name: "catchAllLoader",
  filename: "src/routes/$.tsx"
}, (opts) => catchAllLoader.__executeServer(opts));
const catchAllLoader = createServerFn().middleware([servicesMiddleware]).handler(catchAllLoader_createServerFn_handler, async function catchAllLoader2({
  context
}) {
  const request = getRequest();
  if (request.headers.get("x-referer-app") === "marble-frontend") {
    throw new Response("Detected marble app self call", {
      status: 500
    });
  }
  try {
    await context.services.authService.isAuthenticated(request, {
      successRedirect: "/app-router",
      failureRedirect: "/sign-in"
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
});
export {
  catchAllLoader_createServerFn_handler
};
