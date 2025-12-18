import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { g as getSettingsAccess } from "./settings-access-CTjlN6mt.js";
import { _ as createServerFn, x as redirect } from "../server.js";
import "./services-middleware-DR8Hua1Y.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "./feature-access-B8PIS8ad.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const settingsIndexLoader_createServerFn_handler = createServerRpc({
  id: "00f474f606094326aac4853c55df25d8ac5a87795e7d4c1cf0744ba261b351f7",
  name: "settingsIndexLoader",
  filename: "src/routes/_app/_builder/settings/index.tsx"
}, (opts) => settingsIndexLoader.__executeServer(opts));
const settingsIndexLoader = createServerFn().middleware([authMiddleware]).handler(settingsIndexLoader_createServerFn_handler, async function settingsIndexLoader2({
  context
}) {
  const {
    user,
    inbox
  } = context.authInfo;
  const appConfig = context.appConfig;
  const inboxes = await inbox.listInboxes();
  const settings = getSettingsAccess(user, appConfig, inboxes);
  const firstSetting = Object.values(settings).find((s) => s.settings.length > 0)?.settings[0];
  if (firstSetting) {
    throw redirect({
      to: firstSetting.to
    });
  }
  throw redirect({
    to: "/"
  });
});
export {
  settingsIndexLoader_createServerFn_handler
};
