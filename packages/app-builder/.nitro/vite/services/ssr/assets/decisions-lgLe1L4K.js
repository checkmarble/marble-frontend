import { c as createSsrRpc } from "./createSsrRpc-ZXUHv2Er.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { _ as createServerFn } from "../server.js";
import { o as object, s as string } from "./short-uuid-MIi3jWzx.js";
const getDecisionFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  decisionId: string()
})).handler(createSsrRpc("3a651c5d7543d6a0711d8deb740e72de4c2f5a2f33409e8a72e8e4da000dad69"));
const listScheduledExecutionsFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).handler(createSsrRpc("c6f2dde5ef292a65f4795cd0def69043a1a11bd2b7d87d95d19293ad131fd1a0"));
export {
  getDecisionFn as g,
  listScheduledExecutionsFn as l
};
