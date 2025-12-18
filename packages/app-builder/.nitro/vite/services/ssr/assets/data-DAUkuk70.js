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
const dataLayoutLoader_createServerFn_handler = createServerRpc({
  id: "0e375d3bb3847f92ec1d82fa9791a13d9afc0aafdf4095f73e9c449e03486792",
  name: "dataLayoutLoader",
  filename: "src/routes/_app/_builder/data.tsx"
}, (opts) => dataLayoutLoader.__executeServer(opts));
const dataLayoutLoader = createServerFn().middleware([authMiddleware]).handler(dataLayoutLoader_createServerFn_handler, async function dataLayout({
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
  return {
    dataModel,
    dataModelFeatureAccess: dataModelFeatureAccessLoader(user, entitlements)
  };
});
export {
  dataLayoutLoader_createServerFn_handler
};
