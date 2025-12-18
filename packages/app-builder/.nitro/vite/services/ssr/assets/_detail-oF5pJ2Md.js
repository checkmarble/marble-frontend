import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { c as caseDetailMiddleware } from "./case-detail-middleware-C3JS8Yme.js";
import { _ as createServerFn } from "../server.js";
import "./services-middleware-DR8Hua1Y.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "./inboxes-D556s0BB.js";
import "./input-validation-CU_reV2S.js";
import "util";
import "./async-C3pYACua.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
const beforeLoadFn_createServerFn_handler = createServerRpc({
  id: "14e7d5aa898d82c7977f719e8dd399a2a401db0c7f57634d9f4772dbc350ab28",
  name: "beforeLoadFn",
  filename: "src/routes/_app/_builder/cases/_detail.tsx"
}, (opts) => beforeLoadFn.__executeServer(opts));
const beforeLoadFn = createServerFn().middleware([authMiddleware]).handler(beforeLoadFn_createServerFn_handler, async ({
  context
}) => {
  return {
    inboxes: await context.authInfo.inbox.listInboxes()
  };
});
const caseDetailLayoutLoader_createServerFn_handler = createServerRpc({
  id: "ad3d01eeafa29cd4f2088158bee9026204a9de5c16c52683ac5449c13384cb30",
  name: "caseDetailLayoutLoader",
  filename: "src/routes/_app/_builder/cases/_detail.tsx"
}, (opts) => caseDetailLayoutLoader.__executeServer(opts));
const caseDetailLayoutLoader = createServerFn().middleware([authMiddleware, caseDetailMiddleware]).validator((input) => input).handler(caseDetailLayoutLoader_createServerFn_handler, async function caseDetailLayoutLoader2({
  context
}) {
  return {
    caseDetail: context.case.detail,
    caseInbox: context.case.inbox
  };
});
export {
  beforeLoadFn_createServerFn_handler,
  caseDetailLayoutLoader_createServerFn_handler
};
