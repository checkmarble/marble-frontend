import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { M as MY_INBOX_ID } from "./inboxes-D556s0BB.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { B as isAdmin } from "./services-middleware-DR8Hua1Y.js";
import { c as isInboxAdmin } from "./feature-access-B8PIS8ad.js";
import { _ as createServerFn, x as redirect } from "../server.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const casesIndexLoader_createServerFn_handler = createServerRpc({
  id: "17ca890b622271b903097bbbed576a63389f3e45f0e5e1b1486d9f95d5f111f1",
  name: "casesIndexLoader",
  filename: "src/routes/_app/_builder/cases/index.tsx"
}, (opts) => casesIndexLoader.__executeServer(opts));
const casesIndexLoader = createServerFn().middleware([authMiddleware]).handler(casesIndexLoader_createServerFn_handler, async function casesIndexLoader2({
  context
}) {
  const {
    user,
    inbox: inboxRepository
  } = context.authInfo;
  const inboxes = await inboxRepository.listInboxes();
  if (isAdmin(user) || inboxes.some((inbox) => isInboxAdmin(user, inbox))) {
    throw redirect({
      to: "/cases/overview"
    });
  }
  throw redirect({
    to: "/cases/inboxes/$inboxId",
    params: {
      inboxId: MY_INBOX_ID
    }
  });
});
export {
  casesIndexLoader_createServerFn_handler
};
