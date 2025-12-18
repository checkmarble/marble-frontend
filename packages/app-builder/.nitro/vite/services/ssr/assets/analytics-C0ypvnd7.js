import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { i as isAnalyticsAvailable } from "./feature-access-B8PIS8ad.js";
import { _ as createServerFn, x as redirect } from "../server.js";
import "./services-middleware-DR8Hua1Y.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const analyticsLayoutLoader_createServerFn_handler = createServerRpc({
  id: "be70655bf46ebde519b189f0f0a811452f0cf60518a6ffc381b86125323c6449",
  name: "analyticsLayoutLoader",
  filename: "src/routes/_app/_builder/detection/analytics.tsx"
}, (opts) => analyticsLayoutLoader.__executeServer(opts));
const analyticsLayoutLoader = createServerFn().middleware([authMiddleware]).handler(analyticsLayoutLoader_createServerFn_handler, async function analyticsLayout({
  context
}) {
  const {
    user,
    entitlements
  } = context.authInfo;
  if (!isAnalyticsAvailable(user, entitlements)) {
    throw redirect({
      to: "/detection"
    });
  }
  return null;
});
export {
  analyticsLayoutLoader_createServerFn_handler
};
