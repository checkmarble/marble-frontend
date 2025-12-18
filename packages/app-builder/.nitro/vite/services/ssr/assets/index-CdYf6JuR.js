import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { B as isAdmin } from "./services-middleware-DR8Hua1Y.js";
import { c as isInboxAdmin, d as isReadTagAvailable, e as isDeleteTagAvailable, f as isEditTagAvailable, g as isCreateTagAvailable, j as isCreateInboxAvailable, k as isAutoAssignmentAvailable } from "./feature-access-B8PIS8ad.js";
import { _ as createServerFn, x as redirect } from "../server.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const inboxesLoader_createServerFn_handler = createServerRpc({
  id: "17fe49fd9649a743daee9b2db7caa3d15a925dc14b9480bad78ab09d42f3167f",
  name: "inboxesLoader",
  filename: "src/routes/_app/_builder/settings/inboxes/index.tsx"
}, (opts) => inboxesLoader.__executeServer(opts));
const inboxesLoader = createServerFn().middleware([authMiddleware]).handler(inboxesLoader_createServerFn_handler, async function inboxesLoader2({
  context
}) {
  const {
    entitlements,
    inbox,
    user,
    organization
  } = context.authInfo;
  const [allInboxes, currentOrganization] = await Promise.all([inbox.listInboxesWithCaseCount(), organization.getCurrentOrganization()]);
  const inboxes = allInboxes.filter((inbox2) => isAdmin(user) || isInboxAdmin(user, inbox2));
  if (inboxes.length === 0 && !isAdmin(user)) {
    throw redirect({
      to: "/"
    });
  }
  const canReadTags = isReadTagAvailable(user);
  let tags = [];
  if (canReadTags) {
    const [caseTags, objectTags] = await Promise.all([organization.listTags({
      withCaseCount: true
    }).then((tags2) => tags2.map((t) => ({
      ...t,
      target: "case"
    }))), organization.listTags({
      target: "object"
    }).then((tags2) => tags2.map((t) => ({
      ...t,
      target: "object"
    })))]);
    tags = [...caseTags, ...objectTags];
  }
  return {
    isAutoAssignmentAvailable: isAutoAssignmentAvailable(entitlements),
    inboxes,
    organizationId: currentOrganization.id,
    isCreateInboxAvailable: isCreateInboxAvailable(user),
    autoAssignQueueLimit: currentOrganization.autoAssignQueueLimit ?? 0,
    canReadTags,
    tags,
    isCreateTagAvailable: canReadTags && isCreateTagAvailable(user),
    isEditTagAvailable: canReadTags && isEditTagAvailable(user),
    isDeleteTagAvailable: canReadTags && isDeleteTagAvailable(user)
  };
});
export {
  inboxesLoader_createServerFn_handler
};
