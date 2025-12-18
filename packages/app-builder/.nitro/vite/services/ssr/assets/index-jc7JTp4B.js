import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { c as caseDetailMiddleware } from "./case-detail-middleware-C3JS8Yme.js";
import { b as fromUUIDtoSUUID } from "./short-uuid-MIi3jWzx.js";
import { _ as createServerFn, x as redirect } from "../server.js";
import { z } from "./services-middleware-DR8Hua1Y.js";
import "./inboxes-D556s0BB.js";
import "./input-validation-CU_reV2S.js";
import "util";
import "./async-C3pYACua.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "node:crypto";
const caseDetailLoader_createServerFn_handler = createServerRpc({
  id: "8370bb112072e4230aaa7c77c7ba194d39985d69e4c9b7700b9e6ed1c051793d",
  name: "caseDetailLoader",
  filename: "src/routes/_app/_builder/cases/$caseId/index.tsx"
}, (opts) => caseDetailLoader.__executeServer(opts));
const caseDetailLoader = createServerFn().middleware([authMiddleware, caseDetailMiddleware]).validator(z.object({
  params: z.record(z.string(), z.string()).optional(),
  search: z.object({
    fromInbox: z.string().optional()
  }).optional()
})).handler(caseDetailLoader_createServerFn_handler, async function caseDetailLoader2({
  context,
  data
}) {
  const {
    detail: caseDetail
  } = context.case;
  const fromInbox = data.search?.fromInbox;
  const search = fromInbox ? {
    fromInbox
  } : void 0;
  if (caseDetail.type === "continuous_screening") {
    throw redirect({
      to: "/cases/m/$caseId",
      params: {
        caseId: fromUUIDtoSUUID(caseDetail.id)
      },
      search
    });
  }
  throw redirect({
    to: "/cases/s/$caseId",
    params: {
      caseId: fromUUIDtoSUUID(caseDetail.id)
    },
    search
  });
});
export {
  caseDetailLoader_createServerFn_handler
};
