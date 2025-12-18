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
const scenariosLoader_createServerFn_handler = createServerRpc({
  id: "e82cb92e0a1421821b2b686ddfb11374aaf0f63a2e78c46cbf81f54b996fb5b9",
  name: "scenariosLoader",
  filename: "src/routes/_app/_builder/settings/scenarios.tsx"
}, (opts) => scenariosLoader.__executeServer(opts));
const scenariosLoader = createServerFn().middleware([authMiddleware]).handler(scenariosLoader_createServerFn_handler, async function scenariosLoader2({
  context
}) {
  const {
    organization: repository,
    user,
    entitlements
  } = context.authInfo;
  if (!isAdmin(user)) {
    throw redirect({
      to: "/"
    });
  }
  return {
    organization: await repository.getCurrentOrganization(),
    entitlements,
    user
  };
});
export {
  scenariosLoader_createServerFn_handler
};
