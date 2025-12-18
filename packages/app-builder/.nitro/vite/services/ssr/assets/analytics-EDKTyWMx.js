import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { B as isAdmin } from "./services-middleware-DR8Hua1Y.js";
import { c as isInboxAdmin, A as isAccessible } from "./feature-access-B8PIS8ad.js";
import { _ as createServerFn } from "../server.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const casesAnalyticsLoader_createServerFn_handler = createServerRpc({
  id: "35ab51f7cbac3061cb7d3973f74ba220112989bf839f06f7ada19addb0361183",
  name: "casesAnalyticsLoader",
  filename: "src/routes/_app/_builder/cases/analytics.tsx"
}, (opts) => casesAnalyticsLoader.__executeServer(opts));
const casesAnalyticsLoader = createServerFn().middleware([authMiddleware]).handler(casesAnalyticsLoader_createServerFn_handler, async function casesAnalyticsLoader2({
  context
}) {
  const {
    user,
    entitlements,
    inbox: inboxRepository,
    organization
  } = context.authInfo;
  const [inboxes, users] = await Promise.all([inboxRepository.listInboxes(), organization.listUsers()]);
  const canViewAdminSections = isAdmin(user) || inboxes.some((inbox) => isInboxAdmin(user, inbox));
  if (!canViewAdminSections) {
    throw new Response(null, {
      status: 403
    });
  }
  return {
    inboxes,
    users,
    isAnalyticsAvailable: isAccessible(entitlements.analytics)
  };
});
export {
  casesAnalyticsLoader_createServerFn_handler
};
