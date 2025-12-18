import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { M as MY_INBOX_ID } from "./inboxes-D556s0BB.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { g as getPreferencesCookie } from "./preferences-cookie-read.server-uzB5Nz-e.js";
import { g as fromSUUIDtoUUID } from "./short-uuid-MIi3jWzx.js";
import { _ as createServerFn, a4 as getRequest, x as redirect } from "../server.js";
import "./services-middleware-DR8Hua1Y.js";
import "node:crypto";
import "./config-ut8rAdyo.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const casesInboxesIndexLoader_createServerFn_handler = createServerRpc({
  id: "657390759bf41fc09b64c2cb7e4f77389c9d27685c05d104e7d2f738d4daaacc",
  name: "casesInboxesIndexLoader",
  filename: "src/routes/_app/_builder/cases/inboxes/index.tsx"
}, (opts) => casesInboxesIndexLoader.__executeServer(opts));
const casesInboxesIndexLoader = createServerFn().middleware([authMiddleware]).handler(casesInboxesIndexLoader_createServerFn_handler, async function casesInboxesIndexLoader2({
  context
}) {
  const request = getRequest();
  const {
    inbox: inboxRepository
  } = context.authInfo;
  const favoriteInboxId = getPreferencesCookie(request, "favInbox");
  let targetInboxId = MY_INBOX_ID;
  if (favoriteInboxId && favoriteInboxId !== MY_INBOX_ID) {
    const inboxes = await inboxRepository.listInboxesWithCaseCount();
    const favoriteUUID = fromSUUIDtoUUID(favoriteInboxId);
    const inboxExists = inboxes.some((inbox) => inbox.id === favoriteUUID);
    if (inboxExists) {
      targetInboxId = favoriteInboxId;
    }
  } else if (favoriteInboxId === MY_INBOX_ID) {
    targetInboxId = MY_INBOX_ID;
  }
  throw redirect({
    to: "/cases/inboxes/$inboxId",
    params: {
      inboxId: targetInboxId
    }
  });
});
export {
  casesInboxesIndexLoader_createServerFn_handler
};
