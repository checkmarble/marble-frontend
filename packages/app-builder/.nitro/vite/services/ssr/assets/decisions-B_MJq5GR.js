import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { a1 as isAnalyst } from "./services-middleware-DR8Hua1Y.js";
import { d as dataModelFeatureAccessLoader } from "./data-model-feature-access-CnssG9vC.js";
import { _ as createServerFn, x as redirect } from "../server.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "./feature-access-B8PIS8ad.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const decisionsLayoutLoader_createServerFn_handler = createServerRpc({
  id: "532d11a3a313e967206b28dfb4fe70321052b586d522af5bec2717900087a9a1",
  name: "decisionsLayoutLoader",
  filename: "src/routes/_app/_builder/detection/decisions.tsx"
}, (opts) => decisionsLayoutLoader.__executeServer(opts));
const decisionsLayoutLoader = createServerFn().middleware([authMiddleware]).handler(decisionsLayoutLoader_createServerFn_handler, async function dataLayout({
  context
}) {
  const {
    user,
    dataModelRepository,
    entitlements
  } = context.authInfo;
  if (isAnalyst(user)) {
    throw redirect({
      to: "/cases"
    });
  }
  const dataModel = await dataModelRepository.getDataModel();
  const dataModelFeatureAccess = dataModelFeatureAccessLoader(user, entitlements);
  return {
    dataModel,
    dataModelFeatureAccess
  };
});
export {
  decisionsLayoutLoader_createServerFn_handler
};
