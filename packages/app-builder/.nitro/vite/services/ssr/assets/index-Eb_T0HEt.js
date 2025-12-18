import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { d as dataModelFeatureAccessLoader } from "./data-model-feature-access-CnssG9vC.js";
import { _ as createServerFn } from "../server.js";
import { o as object, s as string } from "./short-uuid-MIi3jWzx.js";
import "./services-middleware-DR8Hua1Y.js";
import "node:crypto";
import "./feature-access-B8PIS8ad.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const queryParams = object({
  table: string().optional(),
  terms: string().optional()
});
const getClientDetailFn_createServerFn_handler = createServerRpc({
  id: "318de7514267a3ed50ed84a75ae117487815eee16ca25aa6098d21129a219ebe",
  name: "getClientDetailFn",
  filename: "src/routes/_app/_builder/client-detail/index.tsx"
}, (opts) => getClientDetailFn.__executeServer(opts));
const getClientDetailFn = createServerFn().middleware([authMiddleware]).validator(queryParams).handler(getClientDetailFn_createServerFn_handler, async function clientDetailIndexLoader({
  context,
  data: {
    table,
    terms
  }
}) {
  const {
    client360,
    user,
    dataModelRepository,
    entitlements
  } = context.authInfo;
  const dataModel = await dataModelRepository.getDataModel();
  const dataModelFeatureAccess = dataModelFeatureAccessLoader(user, entitlements);
  const tables = await client360.getClient360Tables();
  const payload = table && terms ? {
    table,
    terms
  } : null;
  return {
    tables,
    payload,
    dataModel,
    dataModelFeatureAccess
  };
});
export {
  getClientDetailFn_createServerFn_handler
};
