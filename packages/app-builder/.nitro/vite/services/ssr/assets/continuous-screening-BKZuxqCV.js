import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { a1 as isAnalyst } from "./services-middleware-DR8Hua1Y.js";
import { a as isContinuousScreeningAvailable } from "./feature-access-B8PIS8ad.js";
import { _ as createServerFn, x as redirect } from "../server.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const continuousScreeningLayoutLoader_createServerFn_handler = createServerRpc({
  id: "9e373c98a7ca5a88e36577c19656bba7280c710ca1f4b629f115dca016dcf558",
  name: "continuousScreeningLayoutLoader",
  filename: "src/routes/_app/_builder/continuous-screening.tsx"
}, (opts) => continuousScreeningLayoutLoader.__executeServer(opts));
const continuousScreeningLayoutLoader = createServerFn().middleware([authMiddleware]).handler(continuousScreeningLayoutLoader_createServerFn_handler, async function continuousScreeningLayout({
  context
}) {
  const {
    user,
    entitlements
  } = context.authInfo;
  if (isAnalyst(user)) {
    throw redirect({
      to: "/cases"
    });
  }
  if (!isContinuousScreeningAvailable(entitlements)) {
    throw redirect({
      to: "/"
    });
  }
  return null;
});
export {
  continuousScreeningLayoutLoader_createServerFn_handler
};
