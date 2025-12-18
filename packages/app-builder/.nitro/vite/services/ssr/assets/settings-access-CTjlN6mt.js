import { B as isAdmin } from "./services-middleware-DR8Hua1Y.js";
import { m as canAccessInboxesSettings, d as isReadTagAvailable, n as isReadUserAvailable, o as isReadApiKeyAvailable } from "./feature-access-B8PIS8ad.js";
function getSettingsAccess(user, appConfig, inboxes) {
  const sections = {
    api: {
      icon: "world",
      settings: [
        ...isReadApiKeyAvailable(user) ? [{ title: "api", to: "/settings/api-keys" }] : [],
        ...user.permissions.canManageWebhooks ? [{ title: "webhooks", to: "/settings/webhooks" }] : []
      ]
    },
    users: {
      icon: "users",
      settings: [...isReadUserAvailable(user) ? [{ title: "users", to: "/settings/users" }] : []]
    },
    scenarios: {
      icon: "world",
      settings: [
        ...isAdmin(user) ? [{ title: "scenarios", to: "/settings/scenarios" }] : [],
        ...isAdmin(user) ? [{ title: "filters-settings", to: "/settings/analytics/filters" }] : []
      ]
    },
    case_manager: {
      icon: "case-manager",
      settings: [
        ...canAccessInboxesSettings(user, inboxes) || isReadTagAvailable(user) || isAdmin(user) ? [{ title: "case_manager", to: "/settings/inboxes" }] : []
      ]
    },
    audit: {
      icon: "history",
      settings: [...isAdmin(user) ? [{ title: "audit.audit_logs_section", to: "/settings/audit-logs" }] : []]
    },
    ip_whitelisting: {
      icon: "world",
      settings: [
        ...isAdmin(user) && appConfig.isManagedMarble ? [{ title: "ip_whitelisting", to: "/settings/ip-whitelisting" }] : []
      ]
    },
    screening_providers: {
      icon: "search",
      settings: [...isAdmin(user) ? [{ title: "screening_providers", to: "/settings/screening-providers" }] : []]
    }
  };
  return sections;
}
export {
  getSettingsAccess as g
};
