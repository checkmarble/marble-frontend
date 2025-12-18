import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { c as caseDetailMiddleware } from "./case-detail-middleware-C3JS8Yme.js";
import { B as isAdmin } from "./services-middleware-DR8Hua1Y.js";
import { b as fromUUIDtoSUUID } from "./short-uuid-MIi3jWzx.js";
import { _ as createServerFn, x as redirect } from "../server.js";
import "./inboxes-D556s0BB.js";
import "./input-validation-CU_reV2S.js";
import "util";
import "./async-C3pYACua.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
const screeningCaseDetailLoader_createServerFn_handler = createServerRpc({
  id: "b7130ef00549d8fa7b6c392aa54b48f1b9ef9f4afe31fbf69bdb92ada74a5ec5",
  name: "screeningCaseDetailLoader",
  filename: "src/routes/_app/_builder/cases/_detail/m.$caseId.tsx"
}, (opts) => screeningCaseDetailLoader.__executeServer(opts));
const screeningCaseDetailLoader = createServerFn().middleware([authMiddleware, caseDetailMiddleware]).validator((input) => input).handler(screeningCaseDetailLoader_createServerFn_handler, async function screeningCaseDetailLoader2({
  context
}) {
  if (context.case.detail.type !== "continuous_screening") {
    throw redirect({
      to: "/cases/s/$caseId",
      params: {
        caseId: fromUUIDtoSUUID(context.case.detail.id)
      }
    });
  }
  const screening = context.case.detail.continuousScreenings[0];
  if (!screening) {
    throw redirect({
      to: "/cases/inboxes/$inboxId",
      params: {
        inboxId: context.case.inbox.id
      }
    });
  }
  const isUserAdmin = isAdmin(context.authInfo.user);
  return {
    caseDetail: context.case.detail,
    caseInbox: context.case.inbox,
    screening,
    isUserAdmin
  };
});
export {
  screeningCaseDetailLoader_createServerFn_handler
};
