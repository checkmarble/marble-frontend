import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { _ as createServerFn } from "../server.js";
import { o as object, s as string } from "./short-uuid-MIi3jWzx.js";
import "./services-middleware-DR8Hua1Y.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const getDecisionFn_createServerFn_handler = createServerRpc({
  id: "3a651c5d7543d6a0711d8deb740e72de4c2f5a2f33409e8a72e8e4da000dad69",
  name: "getDecisionFn",
  filename: "src/server-fns/decisions.ts"
}, (opts) => getDecisionFn.__executeServer(opts));
const getDecisionFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  decisionId: string()
})).handler(getDecisionFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const decision = await context.authInfo.decision.getDecisionById(data.decisionId);
  return {
    decision
  };
});
const listScheduledExecutionsFn_createServerFn_handler = createServerRpc({
  id: "c6f2dde5ef292a65f4795cd0def69043a1a11bd2b7d87d95d19293ad131fd1a0",
  name: "listScheduledExecutionsFn",
  filename: "src/server-fns/decisions.ts"
}, (opts) => listScheduledExecutionsFn.__executeServer(opts));
const listScheduledExecutionsFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).handler(listScheduledExecutionsFn_createServerFn_handler, async ({
  context
}) => {
  const scheduledExecutions = await context.authInfo.decision.listScheduledExecutions();
  return {
    scheduledExecutions
  };
});
export {
  getDecisionFn_createServerFn_handler,
  listScheduledExecutionsFn_createServerFn_handler
};
