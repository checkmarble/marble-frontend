import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { f as fromParams } from "./short-uuid-MIi3jWzx.js";
import { _ as createServerFn } from "../server.js";
import "./services-middleware-DR8Hua1Y.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const scheduledExecutionsLoader_createServerFn_handler = createServerRpc({
  id: "77f970bfcb5f2e16f137b6d50579e1eaca7df3471d314b70a928bd2fffd6e4da",
  name: "scheduledExecutionsLoader",
  filename: "src/routes/_app/_builder/detection/scenarios/$scenarioId/scheduled-executions.tsx"
}, (opts) => scheduledExecutionsLoader.__executeServer(opts));
const scheduledExecutionsLoader = createServerFn().middleware([authMiddleware]).validator((input) => input).handler(scheduledExecutionsLoader_createServerFn_handler, async function scheduledExecutionsLoader2({
  data,
  context
}) {
  const scenarioId = fromParams(data?.params ?? {}, "scenarioId");
  const scheduledExecutions = await context.authInfo.decision.listScheduledExecutions({
    scenarioId
  });
  return {
    scheduledExecutions
  };
});
export {
  scheduledExecutionsLoader_createServerFn_handler
};
