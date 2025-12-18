import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { H as isNotFoundHttpError, h as setToast, W as isUnauthorizedHttpError, X as isForbiddenHttpError } from "./services-middleware-DR8Hua1Y.js";
import { d as dataModelFeatureAccessLoader } from "./data-model-feature-access-CnssG9vC.js";
import { _ as createServerFn, a4 as getRequest, x as redirect, a as isRedirect } from "../server.js";
import { o as object, s as string } from "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "./feature-access-B8PIS8ad.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
async function loadClientDetailObject(dataModelRepository, client360, objectType, objectId) {
  try {
    return await dataModelRepository.getIngestedObject(objectType, objectId);
  } catch (error) {
    if (!isNotFoundHttpError(error)) throw error;
    const searchResult = await client360.searchClient360({ table: objectType, terms: objectId });
    const item = searchResult.items.find((entry) => String(entry["object_id"]) === objectId);
    if (!item) throw error;
    return { data: item };
  }
}
const paramsSchema = object({
  objectType: string(),
  objectId: string()
});
const getDataFn_createServerFn_handler = createServerRpc({
  id: "62ebf56e36c69c039c1cc474de7eb5d971675bbdc2d6c91f69c807b1422a378b",
  name: "getDataFn",
  filename: "src/routes/_app/_builder/client-detail/$objectType.$objectId.tsx"
}, (opts) => getDataFn.__executeServer(opts));
const getDataFn = createServerFn().middleware([authMiddleware]).validator(paramsSchema).handler(getDataFn_createServerFn_handler, async ({
  context,
  data: {
    objectId,
    objectType
  }
}) => {
  try {
    const request = getRequest();
    const {
      i18nextService
    } = context.services;
    const t = await i18nextService.getFixedT(request, ["common", "client360"]);
    const {
      user,
      dataModelRepository,
      userScoring,
      client360,
      entitlements
    } = context.authInfo;
    const objectPromise = loadClientDetailObject(dataModelRepository, client360, objectType, objectId).catch(async (error) => {
      if (isNotFoundHttpError(error)) {
        await setToast({
          type: "error",
          message: t("client360:client_detail.no_object_found", {
            objectType
          })
        });
        throw redirect({
          to: "/client-detail"
        });
      }
      throw error;
    });
    const [objectDetails, scoringSettings, tables, dataModel] = await Promise.all([objectPromise, userScoring.getSettings(), client360.getClient360Tables(), dataModelRepository.getDataModel()]);
    let activeScore = null;
    try {
      activeScore = await userScoring.getScoreLatest(objectType, objectId) ?? null;
    } catch (error) {
      if (!isNotFoundHttpError(error) && !isUnauthorizedHttpError(error) && !isForbiddenHttpError(error)) throw error;
    }
    const tableMetadata = tables.find((table) => table.name === objectType);
    if (!tableMetadata) {
      throw redirect({
        to: "/client-detail"
      });
    }
    const dataModelFeatureAccess = dataModelFeatureAccessLoader(user, entitlements);
    return {
      objectType,
      objectId,
      objectDetails,
      metadata: tableMetadata,
      allMetadata: tables,
      dataModel,
      dataModelFeatureAccess,
      scoringSettings,
      activeScore,
      userScoringAccess: entitlements.userScoring
    };
  } catch (error) {
    if (isRedirect(error) || error instanceof Response) throw error;
    console.error("Failed to load client detail data", error);
    throw new Response("Internal Server Error", {
      status: 500,
      headers: {
        "Content-Type": "text/plain"
      }
    });
  }
});
export {
  getDataFn_createServerFn_handler
};
