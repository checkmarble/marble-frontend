import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { a$ as adaptScenarioIterationSummaryWithType } from "./services-middleware-DR8Hua1Y.js";
import { f as fromParams } from "./short-uuid-MIi3jWzx.js";
import { _ as createServerFn } from "../server.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const scenarioData_createServerFn_handler = createServerRpc({
  id: "de490983d4997d232b884399c941d6395a6a47d83f1d2df248b24ed6ba673987",
  name: "scenarioData",
  filename: "src/routes/_app/_builder/detection/scenarios/$scenarioId.tsx"
}, (opts) => scenarioData.__executeServer(opts));
const scenarioData = createServerFn().middleware([authMiddleware]).validator((input) => input).handler(scenarioData_createServerFn_handler, async function scenarioLayoutLoader({
  data,
  context
}) {
  const scenarioId = fromParams(data?.params ?? {}, "scenarioId");
  const [currentScenario, scenarioIterations] = await Promise.all([context.authInfo.scenario.getScenario({
    scenarioId
  }), context.authInfo.scenario.listScenarioIterationsMetadata({
    scenarioId
  })]);
  return {
    currentScenario,
    scenarioIterations: scenarioIterations.map((dto) => adaptScenarioIterationSummaryWithType(dto, currentScenario.liveVersionId))
  };
});
export {
  scenarioData_createServerFn_handler
};
