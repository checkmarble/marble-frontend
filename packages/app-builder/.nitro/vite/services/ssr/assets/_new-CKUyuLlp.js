import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { a1 as isAnalyst } from "./services-middleware-DR8Hua1Y.js";
import { d as dataModelFeatureAccessLoader } from "./data-model-feature-access-CnssG9vC.js";
import { o as object, s as string, g as fromSUUIDtoUUID } from "./short-uuid-MIi3jWzx.js";
import { _ as createServerFn } from "../server.js";
import "node:crypto";
import "./feature-access-B8PIS8ad.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const beforeLoadFn_createServerFn_handler = createServerRpc({
  id: "8d81d60bc69ddcecb83767f0588e917b9b1789d9c964349b5d1fec6ae2c91ed4",
  name: "beforeLoadFn",
  filename: "src/routes/_app/_builder/cases/_detail/s.$caseId/_new.tsx"
}, (opts) => beforeLoadFn.__executeServer(opts));
const beforeLoadFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  caseId: string().transform((shortuuid) => fromSUUIDtoUUID(shortuuid))
})).handler(beforeLoadFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const [caseDetail, dataModel, pivotObjects, client360Tables] = await Promise.all([await context.authInfo.cases.getCase({
    caseId: data.caseId
  }), await context.authInfo.dataModelRepository.getDataModel(), await context.authInfo.cases.listPivotObjects({
    caseId: data.caseId
  }), await context.authInfo.client360.getClient360Tables()]);
  const dataModelFeatureAccess = dataModelFeatureAccessLoader(context.authInfo.user, context.authInfo.entitlements);
  const userScoringAccess = isAnalyst(context.authInfo.user) ? "restricted" : context.authInfo.entitlements.userScoring;
  return {
    caseDetail,
    dataModel,
    dataModelFeatureAccess,
    pivotObjects: pivotObjects ?? [],
    client360Tables,
    userScoringAccess,
    entitlements: context.authInfo.entitlements
  };
});
export {
  beforeLoadFn_createServerFn_handler
};
