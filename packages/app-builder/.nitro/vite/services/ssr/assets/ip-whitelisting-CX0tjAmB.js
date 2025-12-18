import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { B as isAdmin } from "./services-middleware-DR8Hua1Y.js";
import { _ as createServerFn, x as redirect } from "../server.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const ipWhitelistingLoader_createServerFn_handler = createServerRpc({
  id: "afff74a332f61da07ae725d09d5dc8755e663effc4cc7c6dd4c465b5bb29b65b",
  name: "ipWhitelistingLoader",
  filename: "src/routes/_app/_builder/settings/ip-whitelisting.tsx"
}, (opts) => ipWhitelistingLoader.__executeServer(opts));
const ipWhitelistingLoader = createServerFn().middleware([authMiddleware]).handler(ipWhitelistingLoader_createServerFn_handler, async function ipWhitelistingLoader2({
  context
}) {
  const {
    organization: orgRepo,
    user
  } = context.authInfo;
  const {
    appConfig
  } = context;
  if (!isAdmin(user) || !appConfig.isManagedMarble) {
    throw redirect({
      to: "/"
    });
  }
  const organization = await orgRepo.getCurrentOrganization();
  return {
    allowedNetworks: organization.allowedNetworks,
    organizationId: organization.id
  };
});
export {
  ipWhitelistingLoader_createServerFn_handler
};
