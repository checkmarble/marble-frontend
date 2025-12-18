import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { b as isEditScenarioAvailable } from "./feature-access-B8PIS8ad.js";
import { f as fromParams } from "./short-uuid-MIi3jWzx.js";
import { _ as createServerFn } from "../server.js";
import { e } from "./isNullish-B8pc8Ntu.js";
import "./services-middleware-DR8Hua1Y.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const iterationLayoutLoader_createServerFn_handler = createServerRpc({
  id: "fafa18929cdae382d01409ef2653af321d4e1509920f23eaf5ac11e8be1f519f",
  name: "iterationLayoutLoader",
  filename: "src/routes/_app/_builder/detection/scenarios/$scenarioId/i/$iterationId.tsx"
}, (opts) => iterationLayoutLoader.__executeServer(opts));
const iterationLayoutLoader = createServerFn().middleware([authMiddleware]).validator((input) => input).handler(iterationLayoutLoader_createServerFn_handler, async function iterationLayoutLoader2({
  data,
  context
}) {
  const {
    scenarioIterationRuleRepository,
    scenario,
    user
  } = context.authInfo;
  const iterationId = fromParams(data?.params ?? {}, "iterationId");
  const [scenarioIteration, scenarioValidation, rulesMetadata] = await Promise.all([scenario.getScenarioIterationWithoutRules({
    iterationId
  }), scenario.validate({
    iterationId
  }), scenarioIterationRuleRepository.listRulesMetadata({
    scenarioIterationId: iterationId
  })]);
  const editorMode = isEditScenarioAvailable(user) && e(scenarioIteration.version) && !scenarioIteration.archived ? "edit" : "view";
  const rulesList = [...rulesMetadata.map((r) => ({
    ...r,
    type: "rule"
  })), ...scenarioIteration.screeningConfigs.map((r) => ({
    ...r,
    type: "sanction"
  }))];
  return {
    editorMode,
    scenarioIteration,
    scenarioValidation,
    rulesMetadata,
    rulesList,
    screeningsConfigs: scenarioIteration.screeningConfigs
  };
});
export {
  iterationLayoutLoader_createServerFn_handler
};
