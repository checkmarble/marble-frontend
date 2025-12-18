import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { B as isAdmin } from "./services-middleware-DR8Hua1Y.js";
import { c as isInboxAdmin } from "./feature-access-B8PIS8ad.js";
import { _ as createServerFn } from "../server.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const casesOverviewLoader_createServerFn_handler = createServerRpc({
  id: "bf5a68bbacfe67480da132d5c9fb36f5e78e973d9ade9e1c58238089302d1de2",
  name: "casesOverviewLoader",
  filename: "src/routes/_app/_builder/cases/overview.tsx"
}, (opts) => casesOverviewLoader.__executeServer(opts));
const casesOverviewLoader = createServerFn().middleware([authMiddleware]).handler(casesOverviewLoader_createServerFn_handler, async function casesOverviewLoader2({
  context
}) {
  const {
    user,
    entitlements,
    inbox: inboxRepository
  } = context.authInfo;
  const [inboxes, allInboxesMetadata] = await Promise.all([inboxRepository.listInboxes(), inboxRepository.listInboxesMetadata()]);
  const canViewAdminSections = isAdmin(user) || inboxes.some((inbox) => isInboxAdmin(user, inbox));
  return {
    currentUserId: user.actorIdentity.userId,
    isGlobalAdmin: isAdmin(user),
    canViewAdminSections,
    allInboxesMetadata,
    entitlements: {
      autoAssignment: entitlements.autoAssignment,
      aiAssist: entitlements.caseAiAssist
    }
  };
});
export {
  casesOverviewLoader_createServerFn_handler
};
