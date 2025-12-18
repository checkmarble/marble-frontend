import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { a1 as isAnalyst } from "./services-middleware-DR8Hua1Y.js";
import { l as isScreeningSearchAvailable, k as isAutoAssignmentAvailable, i as isAnalyticsAvailable } from "./feature-access-B8PIS8ad.js";
import { g as getSettingsAccess } from "./settings-access-CTjlN6mt.js";
import { _ as createServerFn } from "../server.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const appBuilderLayoutLoader_createServerFn_handler = createServerRpc({
  id: "84eac02c9d8f666b46122a63a8c2d500f028fba6ad6fe0463043c6d76a73a221",
  name: "appBuilderLayoutLoader",
  filename: "src/routes/_app/_builder.tsx"
}, (opts) => appBuilderLayoutLoader.__executeServer(opts));
const appBuilderLayoutLoader = createServerFn().middleware([authMiddleware]).handler(appBuilderLayoutLoader_createServerFn_handler, async function appBuilderLayout({
  context
}) {
  const {
    user,
    inbox,
    organization,
    entitlements
  } = context.authInfo;
  const [organizationDetail, orgUsers, orgTags, orgObjectTags, inboxes] = await Promise.all([organization.getCurrentOrganization(), organization.listUsers(), organization.listTags(), organization.listTags({
    target: "object"
  }), inbox.listInboxes()]);
  const settingsSections = getSettingsAccess(user, context.appConfig, inboxes);
  const firstSetting = Object.values(settingsSections).find((s) => s.settings.length > 0)?.settings[0];
  return {
    user,
    orgUsers,
    organization: organizationDetail,
    orgTags,
    orgObjectTags,
    featuresAccess: {
      isAnalyticsAvailable: isAnalyticsAvailable(user, entitlements),
      analytics: entitlements.analytics,
      settings: !isAnalyst(user) && firstSetting !== void 0 ? {
        isAvailable: true,
        to: firstSetting.to
      } : {
        isAvailable: false
      },
      isAutoAssignmentAvailable: isAutoAssignmentAvailable(entitlements),
      continuousScreening: entitlements.continuousScreening,
      isScreeningSearchAvailable: isScreeningSearchAvailable(entitlements),
      userScoring: isAnalyst(user) ? "restricted" : entitlements.userScoring
    },
    authProvider: context.appConfig.auth.provider,
    sentryReplayEnabled: organizationDetail.sentryReplayEnabled
  };
});
export {
  appBuilderLayoutLoader_createServerFn_handler
};
