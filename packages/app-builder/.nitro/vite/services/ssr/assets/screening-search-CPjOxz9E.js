import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { l as isScreeningSearchAvailable } from "./feature-access-B8PIS8ad.js";
import { _ as createServerFn, x as redirect } from "../server.js";
import "./services-middleware-DR8Hua1Y.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const screeningSearchLayoutLoader_createServerFn_handler = createServerRpc({
  id: "2d2244244a5c168d712065e928972a8ce0e9d423fb5e81e7fd9a076255d70447",
  name: "screeningSearchLayoutLoader",
  filename: "src/routes/_app/_builder/screening-search.tsx"
}, (opts) => screeningSearchLayoutLoader.__executeServer(opts));
const screeningSearchLayoutLoader = createServerFn().middleware([authMiddleware]).handler(screeningSearchLayoutLoader_createServerFn_handler, async function screeningSearchLayout({
  context
}) {
  const {
    entitlements
  } = context.authInfo;
  if (!isScreeningSearchAvailable(entitlements)) {
    throw redirect({
      to: "/"
    });
  }
  return null;
});
export {
  screeningSearchLayoutLoader_createServerFn_handler
};
