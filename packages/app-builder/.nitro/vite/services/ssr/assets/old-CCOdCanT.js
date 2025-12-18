import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { c as caseDetailMiddleware } from "./case-detail-middleware-C3JS8Yme.js";
import { _ as createServerFn } from "../server.js";
import { u as t, o as t$1, v as n } from "./services-middleware-DR8Hua1Y.js";
import "./inboxes-D556s0BB.js";
import "./input-validation-CU_reV2S.js";
import "util";
import "./short-uuid-MIi3jWzx.js";
import "./async-C3pYACua.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "node:crypto";
const scenarioCaseDetailLoader_createServerFn_handler = createServerRpc({
  id: "749fc2cfb4693e85ee5f8ae5e2dce8038cc79455528884f28421b72fd049f498",
  name: "scenarioCaseDetailLoader",
  filename: "src/routes/_app/_builder/cases/_detail/s.$caseId/old.tsx"
}, (opts) => scenarioCaseDetailLoader.__executeServer(opts));
const scenarioCaseDetailLoader = createServerFn().middleware([authMiddleware, caseDetailMiddleware]).validator((input) => input).handler(scenarioCaseDetailLoader_createServerFn_handler, async function scenarioCaseDetailLoader2({
  context
}) {
  const {
    cases: caseRepository,
    dataModelRepository,
    aiAssistSettings,
    user,
    entitlements
  } = context.authInfo;
  const {
    detail: caseDetail,
    inbox: caseInbox
  } = context.case;
  const caseId = caseDetail.id;
  const [reports, pivotObjects, dataModel, pivots, mostRecentReviews, settings] = await Promise.all([caseRepository.listSuspiciousActivityReports({
    caseId
  }), caseRepository.listPivotObjects({
    caseId
  }), dataModelRepository.getDataModel(), dataModelRepository.listPivots({}), caseRepository.getMostRecentCaseReview({
    caseId
  }), aiAssistSettings.getAiAssistSettings()]);
  let review = null;
  if (mostRecentReviews.length > 0 && mostRecentReviews[0]) {
    const mostRecentReview = mostRecentReviews[0];
    const fetchedProofs = t(mostRecentReview.review.proofs, n((proof) => proof.origin === "data_model"), t$1((proof) => dataModelRepository.getIngestedObject(proof.type, proof.id).then((dataModelObject) => ({
      type: proof.type,
      object: dataModelObject
    }))));
    const proofsSettled = await Promise.allSettled(fetchedProofs);
    const proofs = t(proofsSettled, n((result) => result.status === "fulfilled"), t$1((result) => result.value));
    review = {
      ...mostRecentReview,
      proofs
    };
  }
  return {
    case: caseDetail,
    pivotObjects,
    dataModel,
    currentInbox: caseInbox,
    reports,
    currentUser: user,
    inboxes: context.inboxes,
    pivots,
    entitlements,
    mostRecentReview: review,
    isKycEnrichmentEnabled: settings.kycEnrichmentSetting.enabled
  };
});
export {
  scenarioCaseDetailLoader_createServerFn_handler
};
