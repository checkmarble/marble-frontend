import { c as createSsrRpc } from "./createSsrRpc-ZXUHv2Er.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { l as listCasesInputSchema, m as massUpdateCasesPayloadSchema, p as caseReviewReactionSchema, n as listCaseDecisionsInputSchema, q as updateAutoAssignPayloadSchema, u as updateInboxEscalationPayloadSchema, t as updateInboxWorkflowPayloadSchema, e as escalateCasePayloadSchema, s as snoozeCasePayloadSchema, c as closeCasePayloadSchema, o as openCasePayloadSchema, d as editNamePayloadSchema, b as editInboxPayloadSchema, f as editTagsPayloadSchema, a as editAssigneePayloadSchema, k as addToCasePayloadSchema, j as reviewScreeningMatchPayloadSchema, i as addRuleSnoozePayloadSchema, r as reviewDecisionPayloadSchema } from "./cases-PZYcTUxr.js";
import { J as protectArray } from "./services-middleware-DR8Hua1Y.js";
import { _ as createServerFn } from "../server.js";
import { o as object, s as string, j as uuid } from "./short-uuid-MIi3jWzx.js";
const createCaseFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  name: string().min(1),
  inboxId: uuid()
})).handler(createSsrRpc("11e598f40e3c339bd47fba6cf665d373350c37e3b13fa68de8ff98eba6c21d45"));
const closeCaseFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(closeCasePayloadSchema).handler(createSsrRpc("aeb25831ddd4ebbae9b71adbb802ff454fa3049df29c01d8242dff7c101f760c"));
const openCaseFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(openCasePayloadSchema).handler(createSsrRpc("2227302e87f743feb0e67e5f03797a3ffb72d6c61a523caf5738aba781254d06"));
const escalateCaseFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(escalateCasePayloadSchema).handler(createSsrRpc("a761d2402c537f6119f0a5ca64f12931c80b8e766b7a69e364b5561d15156c3d"));
const snoozeCaseFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(snoozeCasePayloadSchema).handler(createSsrRpc("1e9b661682fb912830b1f3efeaf46a1f996053f19f1f6f1a33dbd3a86b87f594"));
const editAssigneeFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(editAssigneePayloadSchema).handler(createSsrRpc("1512977eb13f2e4b814a9d34bba714914509115fec399ac6cc34510c92286ab4"));
const editInboxFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(editInboxPayloadSchema).handler(createSsrRpc("831980953e257f0ca8cd51639d31164df1ab717173c5888527336df5f04bb689"));
const editNameFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(editNamePayloadSchema).handler(createSsrRpc("71b227037e9d2870a23391901108fa35fad4ad2916687fba8d82b11d83a3e0ff"));
const editTagsFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(editTagsPayloadSchema).handler(createSsrRpc("b0fc06ccceb6bbefac12913faef83bb4161aff5dc6c33399de4999681030364f"));
const editSuspicionFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator((data) => {
  if (!(data instanceof FormData)) throw new Error("Expected FormData");
  return data;
}).handler(createSsrRpc("2275538994b192abc19ce1c514973b6b313fe7aae4da2322f304af4da7b1dbc0"));
const listSuspicionActivityReportsFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  caseId: string()
})).handler(createSsrRpc("ded1573960426155c88bc40540df73cd6f691d9bbc236ec1cfed89b2e792d63a"));
const massUpdateCasesFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(massUpdateCasesPayloadSchema).handler(createSsrRpc("e519385a986a1399e4d45bf7103b63f45a1eca15ff4ac1f5690d58dbb323fc40"));
const addCommentFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator((data) => {
  if (!(data instanceof FormData)) throw new Error("Expected FormData");
  return data;
}).handler(createSsrRpc("589f847aaa1a3ef61540357f0aada39bc7f4543ff712b1eeeefaa030beba0ad5"));
const reviewDecisionFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(reviewDecisionPayloadSchema).handler(createSsrRpc("ed217e8bd8c1d51a0cd2a59be32b49e8fb2aee2d06075740a27474147bc64c21"));
const addRuleSnoozeFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(addRuleSnoozePayloadSchema).handler(createSsrRpc("717fe6d459f3c0141c67184aac743c50d7678af1c5599c4181484d9b0fda244b"));
const reviewScreeningMatchFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(reviewScreeningMatchPayloadSchema).handler(createSsrRpc("3f2cb24c490c45ed6617d17f08300a01526cd34abac3428fd6d0e6dd1ff2da74"));
const setAllMatchesToNoHitFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  matchIds: protectArray(string().array())
})).handler(createSsrRpc("41481bc58996e49712fcc004313b6edff90b1f458957f10bc239a3f0d968e681"));
const addToCaseFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(addToCasePayloadSchema).handler(createSsrRpc("49be5c9418ff167bfeb32f5f00109527dcf7263db92f78d4b7c5effa6203d294"));
const getAiSettingsFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).handler(createSsrRpc("eaf635be3a78a47c8689038767b8f9301a191d87399a6025d82e173bda71a6f3"));
const updateAiSettingsFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("adfc3f80bda8e9cd2aaa38540facec344ddfce65c5acce62ded2e403374ce950"));
const getInboxesFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).handler(createSsrRpc("ff3f275750e20031532404c4fa27e1be16278d0437a5907aeee79a0726aa8670"));
const getCaseDetailFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  caseId: string()
})).handler(createSsrRpc("638113da6a614e62eb9cfde6084f9a695ec0f455f864401e97cbf9680f4f58b9"));
const getCaseNameFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  caseId: string()
})).handler(createSsrRpc("414aee403d09219bd5b92225cb0dbcd1c444939c0987b5e50579c6c7495b151e"));
const getCasesFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(listCasesInputSchema).handler(createSsrRpc("6d86c7f155864d7d15da8da5213c501e2d5f184e15aca786db098a47b307800e"));
const getRelatedCasesByObjectFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  objectType: string(),
  objectId: string()
})).handler(createSsrRpc("9578f0945f70f45ec6b1514ebd9e2c58e82cea0a49e40bcdd2ec06401ff2260b"));
const getPivotRelatedCasesFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  pivotValue: string()
})).handler(createSsrRpc("a98fd3361b7ced97078a718642448473da394f6499cd5f725003946a4fb4d6ce"));
const listCaseDecisionsFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(listCaseDecisionsInputSchema).handler(createSsrRpc("59a7650a5227dc2800373a38230e6720a235df16dbcf1b12e55dcb573e0f3a19"));
const getRulesByPivotFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  caseId: string()
})).handler(createSsrRpc("282f535518ae8a27880adef26c748090828e7284eabdc7e963339dd9a086f594"));
const listCaseReviewsFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  caseId: string()
})).handler(createSsrRpc("e82e5e029e7551fe42617eac4de94cff4306ffdf6e7eb17491c10229cf7ce1fc"));
const getCaseReviewFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  caseId: string(),
  reviewId: string()
})).handler(createSsrRpc("a507f66df206343c0cbfa5cb1e2979f7807ec4b4075ed7bffc2845395c2f1389"));
const enqueueReviewFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  caseId: string()
})).handler(createSsrRpc("73d50d04b2d129e99c6df2d999e7261c56ca37cbc22971d21142d884f5129541"));
const addCaseReviewFeedbackFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  caseId: string(),
  reviewId: string(),
  reaction: caseReviewReactionSchema
})).handler(createSsrRpc("85a181416467a2a8d2e38f7c5f19dd32902af84a24705bb810477f7c5c63a1ad"));
const addReviewToCaseCommentsFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  caseId: string(),
  reviewId: string()
})).handler(createSsrRpc("a596d5a955719e10577b334de37fcc87ab4a008f47ea0fa506612b1d56199816"));
const enrichKycFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  caseId: string()
})).handler(createSsrRpc("0e2334bbb8b7b4da8996b3da2eeccc089d1a6bc709d1825f329d799946a18335"));
const updateInboxEscalationFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(updateInboxEscalationPayloadSchema).handler(createSsrRpc("239a100220ce69d029bfe6f709875485a9e1b81190f19996eca1e633a825bc01"));
const updateAutoAssignFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(updateAutoAssignPayloadSchema).handler(createSsrRpc("d1a13ae8f732eefdeea5228ea79db17342d620a69832401c049ee1c8308fff01"));
const updateInboxWorkflowFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(updateInboxWorkflowPayloadSchema).handler(createSsrRpc("e2260ee1da905a472c233d98f5e030021e4975dde185a2a2af9c7aa4e84372cd"));
const getNextUnassignedCaseFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  caseId: string()
})).handler(createSsrRpc("87fdcf7fcb5a7dfe1c2726c1e66ec7c76ecdff164f291ddb19f554e2d88b0a92"));
export {
  addCaseReviewFeedbackFn as A,
  listCaseDecisionsFn as B,
  reviewDecisionFn as C,
  setAllMatchesToNoHitFn as D,
  editSuspicionFn as E,
  snoozeCaseFn as F,
  getPivotRelatedCasesFn as G,
  enrichKycFn as H,
  listSuspicionActivityReportsFn as I,
  enqueueReviewFn as J,
  getCaseReviewFn as K,
  listCaseReviewsFn as L,
  getAiSettingsFn as a,
  updateAutoAssignFn as b,
  updateInboxEscalationFn as c,
  updateInboxWorkflowFn as d,
  addToCaseFn as e,
  getCaseDetailFn as f,
  getInboxesFn as g,
  getRelatedCasesByObjectFn as h,
  getCaseNameFn as i,
  getCasesFn as j,
  createCaseFn as k,
  editNameFn as l,
  massUpdateCasesFn as m,
  editAssigneeFn as n,
  editInboxFn as o,
  editTagsFn as p,
  escalateCaseFn as q,
  reviewScreeningMatchFn as r,
  closeCaseFn as s,
  openCaseFn as t,
  updateAiSettingsFn as u,
  addCommentFn as v,
  getNextUnassignedCaseFn as w,
  addRuleSnoozeFn as x,
  getRulesByPivotFn as y,
  addReviewToCaseCommentsFn as z
};
