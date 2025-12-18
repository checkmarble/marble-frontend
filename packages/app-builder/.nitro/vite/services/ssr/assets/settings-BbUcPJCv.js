import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { a1 as isAnalyst } from "./services-middleware-DR8Hua1Y.js";
import { g as getSettingsAccess } from "./settings-access-CTjlN6mt.js";
import { _ as createServerFn, x as redirect } from "../server.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "./feature-access-B8PIS8ad.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const settingsLoader_createServerFn_handler = createServerRpc({
  id: "20e27ce745bfa21d99c5049a732de6c906a0875b8c80d67d3c2cf4e7ba6179e2",
  name: "settingsLoader",
  filename: "src/routes/_app/_builder/settings.tsx"
}, (opts) => settingsLoader.__executeServer(opts));
const settingsLoader = createServerFn().middleware([authMiddleware]).handler(settingsLoader_createServerFn_handler, async function settingsLoader2({
  context
}) {
  const {
    user,
    entitlements,
    inbox
  } = context.authInfo;
  const appConfig = context.appConfig;
  if (isAnalyst(user)) {
    throw redirect({
      to: "/cases"
    });
  }
  const inboxes = await inbox.listInboxes();
  const sections = getSettingsAccess(user, appConfig, inboxes);
  if (appConfig.isManagedMarble) sections.screening_providers.settings = [];
  return {
    sections,
    entitlements
  };
});
export {
  settingsLoader_createServerFn_handler
};
