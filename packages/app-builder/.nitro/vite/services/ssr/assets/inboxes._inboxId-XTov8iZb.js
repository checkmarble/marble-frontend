import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { M as MY_INBOX_ID } from "./inboxes-D556s0BB.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { n as number, D as DEFAULT_CASE_PAGINATION_SIZE, B as isAdmin } from "./services-middleware-DR8Hua1Y.js";
import { c as isInboxAdmin } from "./feature-access-B8PIS8ad.js";
import { g as getPreferencesCookie } from "./preferences-cookie-read.server-uzB5Nz-e.js";
import { o as object, _ as _enum, s as string, g as fromSUUIDtoUUID } from "./short-uuid-MIi3jWzx.js";
import { _ as createServerFn, a4 as getRequest } from "../server.js";
import "node:crypto";
import "./config-ut8rAdyo.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const pageQueryStringSchema = object({
  q: string().optional().default(""),
  limit: number().optional().default(DEFAULT_CASE_PAGINATION_SIZE),
  order: _enum(["ASC", "DESC"]).optional().default("DESC")
});
const casesInboxesLoaderSchema = object({
  params: object({
    inboxId: string().transform((id) => id === MY_INBOX_ID ? id : fromSUUIDtoUUID(id))
  }),
  query: pageQueryStringSchema
});
const casesInboxesLoader_createServerFn_handler = createServerRpc({
  id: "390480427159ce14e4675efd04896a7ca68c435f7c2dcb40fb7d839403ae4157",
  name: "casesInboxesLoader",
  filename: "src/routes/_app/_builder/cases/inboxes.$inboxId.tsx"
}, (opts) => casesInboxesLoader.__executeServer(opts));
const casesInboxesLoader = createServerFn().middleware([authMiddleware]).validator(casesInboxesLoaderSchema).handler(casesInboxesLoader_createServerFn_handler, async function casesInboxesLoader2({
  context,
  data: {
    params,
    query
  }
}) {
  const request = getRequest();
  const {
    user,
    inbox: inboxRepository
  } = context.authInfo;
  const inboxes = await inboxRepository.listInboxesWithCaseCount();
  const canViewNavigationTabs = isAdmin(user) || inboxes.some((inbox) => isInboxAdmin(user, inbox));
  let inboxUsersIds = [];
  let currentInbox = inboxes.find((inbox) => inbox.id === params.inboxId);
  if (currentInbox) {
    inboxUsersIds = currentInbox.users.map((user2) => user2.userId);
  }
  const favoriteInboxId = getPreferencesCookie(request, "favInbox") || void 0;
  return {
    inboxId: params.inboxId,
    currentInbox,
    inboxes,
    inboxUsersIds,
    canViewNavigationTabs,
    query: query.q,
    limit: query.limit,
    order: query.order,
    favoriteInboxId
  };
});
export {
  casesInboxesLoader_createServerFn_handler
};
