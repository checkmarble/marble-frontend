import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a1 as isAnalyst } from "./services-middleware-DR8Hua1Y.js";
import { _ as createServerFn, x as redirect } from "../server.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const appRouterLoader_createServerFn_handler = createServerRpc({
  id: "54f6369f93f640ea9ef7a8eef3570c00b16f7ed5b44f218829d97a325a705a4f",
  name: "appRouterLoader",
  filename: "src/routes/app-router.tsx"
}, (opts) => appRouterLoader.__executeServer(opts));
const appRouterLoader = createServerFn().middleware([authMiddleware]).handler(appRouterLoader_createServerFn_handler, async function appRouterLoader2({
  context
}) {
  if (isAnalyst(context.authInfo.user)) {
    throw redirect({
      to: "/cases"
    });
  }
  const dataModel = await context.authInfo.dataModelRepository.getDataModel();
  if (dataModel.length === 0) {
    throw redirect({
      to: "/data/list"
    });
  }
  throw redirect({
    to: "/detection"
  });
});
export {
  appRouterLoader_createServerFn_handler
};
