import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { d as dataModelFeatureAccessLoader } from "./data-model-feature-access-CnssG9vC.js";
import { _ as createServerFn } from "../server.js";
import "./services-middleware-DR8Hua1Y.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "./feature-access-B8PIS8ad.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const casesLayoutLoader_createServerFn_handler = createServerRpc({
  id: "4cbe671987772f5e5209a26475aa49126a52dc94032d8df86778e6294fcc7c20",
  name: "casesLayoutLoader",
  filename: "src/routes/_app/_builder/cases.tsx"
}, (opts) => casesLayoutLoader.__executeServer(opts));
const casesLayoutLoader = createServerFn().middleware([authMiddleware]).handler(casesLayoutLoader_createServerFn_handler, async function casesLayoutLoader2({
  context
}) {
  const {
    user,
    dataModelRepository,
    entitlements
  } = context.authInfo;
  const dataModel = await dataModelRepository.getDataModel();
  const dataModelFeatureAccess = dataModelFeatureAccessLoader(user, entitlements);
  return {
    dataModel,
    dataModelFeatureAccess
  };
});
export {
  casesLayoutLoader_createServerFn_handler
};
