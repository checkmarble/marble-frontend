import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { F as isDeleteListAvailable, G as isEditListAvailable, H as isDeleteListValueAvailable, I as isCreateListValueAvailable } from "./feature-access-B8PIS8ad.js";
import { a as parseIdParamSafe } from "./input-validation-CU_reV2S.js";
import { _ as createServerFn } from "../server.js";
import "./services-middleware-DR8Hua1Y.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "util";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
const listLoader_createServerFn_handler = createServerRpc({
  id: "52068080343d82e992504e273fbeb1c82e4164eb84fe791f5411bab1c4a385dd",
  name: "listLoader",
  filename: "src/routes/_app/_builder/detection/lists/$listId.tsx"
}, (opts) => listLoader.__executeServer(opts));
const listLoader = createServerFn().middleware([authMiddleware]).validator((input) => input).handler(listLoader_createServerFn_handler, async function listLoader2({
  context,
  data
}) {
  const {
    user,
    customListsRepository
  } = context.authInfo;
  const parsedParams = await parseIdParamSafe(data?.params ?? {}, "listId");
  if (!parsedParams.success) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found"
    });
  }
  const customList = await customListsRepository.getCustomList(parsedParams.data.listId);
  return {
    customList,
    listFeatureAccess: {
      isCreateListValueAvailable: isCreateListValueAvailable(user),
      isDeleteListValueAvailable: isDeleteListValueAvailable(user),
      isEditListAvailable: isEditListAvailable(user),
      isDeleteListAvailable: isDeleteListAvailable(user)
    }
  };
});
export {
  listLoader_createServerFn_handler
};
