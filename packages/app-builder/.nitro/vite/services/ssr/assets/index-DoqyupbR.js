import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { h as hasAnyEntitlement, a0 as isCreateListAvailable } from "./feature-access-B8PIS8ad.js";
import { _ as createServerFn } from "../server.js";
import "./services-middleware-DR8Hua1Y.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const listsLoader_createServerFn_handler = createServerRpc({
  id: "ef0179542ce4f92a63bf12d039c8aac33a5d8d216e4258d8baa6b6d4cc611eed",
  name: "listsLoader",
  filename: "src/routes/_app/_builder/detection/lists/index.tsx"
}, (opts) => listsLoader.__executeServer(opts));
const listsLoader = createServerFn().middleware([authMiddleware]).handler(listsLoader_createServerFn_handler, async ({
  context
}) => {
  const {
    user,
    customListsRepository,
    entitlements
  } = context.authInfo;
  const customLists = await customListsRepository.listCustomLists();
  return {
    customLists,
    isCreateListAvailable: isCreateListAvailable(user),
    isIpGpsAvailable: hasAnyEntitlement(entitlements)
  };
});
export {
  listsLoader_createServerFn_handler
};
