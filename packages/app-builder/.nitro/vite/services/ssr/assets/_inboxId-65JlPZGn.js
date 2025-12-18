import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { B as isAdmin } from "./services-middleware-DR8Hua1Y.js";
import { c as isInboxAdmin, Q as isDeleteInboxUserAvailable, R as isEditInboxUserAvailable, S as isCreateInboxUserAvailable, T as isDeleteInboxAvailable, U as isEditInboxAvailable, V as getInboxUserRoles, k as isAutoAssignmentAvailable } from "./feature-access-B8PIS8ad.js";
import { f as fromParams } from "./short-uuid-MIi3jWzx.js";
import { _ as createServerFn, x as redirect } from "../server.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const inboxDetailLoader_createServerFn_handler = createServerRpc({
  id: "8a7664c76b372de8d60a46557e4b07a41388d73db5069a7aab81083cfa29607f",
  name: "inboxDetailLoader",
  filename: "src/routes/_app/_builder/settings/inboxes/$inboxId.tsx"
}, (opts) => inboxDetailLoader.__executeServer(opts));
const inboxDetailLoader = createServerFn().middleware([authMiddleware]).validator((input) => input).handler(inboxDetailLoader_createServerFn_handler, async function inboxDetailLoader2({
  context,
  data
}) {
  const {
    user,
    inbox: inboxApi,
    entitlements
  } = context.authInfo;
  const inboxId = fromParams(data?.params ?? {}, "inboxId");
  const inboxesList = await inboxApi.listInboxesWithCaseCount();
  const inbox = inboxesList.find((inbox2) => inbox2.id === inboxId);
  if (!inbox) throw redirect({
    to: "/settings/inboxes"
  });
  if (!isAdmin(user) && !isInboxAdmin(user, inbox)) {
    throw redirect({
      to: "/"
    });
  }
  const escalationInboxes = await inboxApi.listInboxesMetadata();
  const result = {
    inbox,
    inboxesList,
    escalationInboxes,
    escalationInbox: inbox.escalationInboxId ? await inboxApi.getInboxMetadata(inbox.escalationInboxId) : null,
    caseCount: inbox.casesCount,
    entitlements,
    isAutoAssignmentAvailable: isAutoAssignmentAvailable(entitlements),
    inboxUserRoles: getInboxUserRoles(entitlements),
    isEditInboxAvailable: isEditInboxAvailable(user, inbox),
    isDeleteInboxAvailable: isDeleteInboxAvailable(user),
    isCreateInboxUserAvailable: isCreateInboxUserAvailable(user, inbox),
    isEditInboxUserAvailable: isEditInboxUserAvailable(user, inbox),
    isDeleteInboxUserAvailable: isDeleteInboxUserAvailable(user, inbox)
  };
  return result;
});
export {
  inboxDetailLoader_createServerFn_handler
};
