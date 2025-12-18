import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { p as paginationSchema, d as decisionFiltersSchema } from "./decisions-B-2DmJW1.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { _ as createServerFn } from "../server.js";
import { c as intersection } from "./short-uuid-MIi3jWzx.js";
import "./services-middleware-DR8Hua1Y.js";
import "node:crypto";
import "./format-NPGUXq-g.js";
import "./sharpstate.es-CeF1Mf5b.js";
import "./isNullish-B8pc8Ntu.js";
import "./use-callback-ref-DXzIzfqy.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const decisionsListQueryParamsSchema = intersection(decisionFiltersSchema, paginationSchema);
const decisionsLoader_createServerFn_handler = createServerRpc({
  id: "5a205b441cdb9490a6f3958d7bbe458fad090ffd16d25ef9608aa14d156876a4",
  name: "decisionsLoader",
  filename: "src/routes/_app/_builder/detection/decisions/index.tsx"
}, (opts) => decisionsLoader.__executeServer(opts));
const decisionsLoader = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(decisionsListQueryParamsSchema).handler(decisionsLoader_createServerFn_handler, async function decisionsLoader2({
  context,
  data
}) {
  const {
    decision,
    scenario,
    dataModelRepository,
    inbox
  } = context.authInfo;
  const {
    outcomeAndReviewStatus,
    ...filters
  } = data;
  const [decisionsData, scenarios, pivots, inboxes] = await Promise.all([decision.listDecisions({
    outcome: outcomeAndReviewStatus?.outcome ? [outcomeAndReviewStatus.outcome] : [],
    reviewStatus: outcomeAndReviewStatus?.reviewStatus ? [outcomeAndReviewStatus.reviewStatus] : [],
    ...filters
  }), scenario.listScenarios(), dataModelRepository.listPivots({}), inbox.listInboxes()]);
  return {
    decisionsData,
    scenarios,
    filters: data,
    hasPivots: pivots.length > 0,
    inboxes
  };
});
export {
  decisionsLoader_createServerFn_handler
};
