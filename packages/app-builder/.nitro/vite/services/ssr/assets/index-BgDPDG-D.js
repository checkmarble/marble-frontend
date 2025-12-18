import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { b as fromUUIDtoSUUID } from "./short-uuid-MIi3jWzx.js";
import { _ as createServerFn, x as redirect } from "../server.js";
import "./services-middleware-DR8Hua1Y.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const screeningIndexLoader_createServerFn_handler = createServerRpc({
  id: "fae90b50f659174fbb10c5c418df19bf152d84db7c54afb41783f3357caf76e7",
  name: "screeningIndexLoader",
  filename: "src/routes/_app/_builder/cases/$caseId/d/$decisionId/screenings/$screeningId/index.tsx"
}, (opts) => screeningIndexLoader.__executeServer(opts));
const screeningIndexLoader = createServerFn().middleware([authMiddleware]).validator((input) => input).handler(screeningIndexLoader_createServerFn_handler, async function screeningIndexLoader2({
  data
}) {
  const caseId = data?.params?.["caseId"];
  if (!caseId) {
    throw redirect({
      to: "/cases/inboxes"
    });
  }
  const decisionId = data?.params?.["decisionId"];
  const screeningId = data?.params?.["screeningId"];
  if (!decisionId || !screeningId) {
    throw redirect({
      to: "/cases/$caseId",
      params: {
        caseId: fromUUIDtoSUUID(caseId)
      }
    });
  }
  throw redirect({
    to: "/cases/$caseId/d/$decisionId/screenings/$screeningId/hits",
    params: {
      caseId: fromUUIDtoSUUID(caseId),
      decisionId: fromUUIDtoSUUID(decisionId),
      screeningId: fromUUIDtoSUUID(screeningId)
    }
  });
});
export {
  screeningIndexLoader_createServerFn_handler
};
