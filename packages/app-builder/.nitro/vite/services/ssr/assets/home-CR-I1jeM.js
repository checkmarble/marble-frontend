import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { N as isManualTriggerScenarioAvailable, b as isEditScenarioAvailable } from "./feature-access-B8PIS8ad.js";
import { f as fromParams } from "./short-uuid-MIi3jWzx.js";
import { _ as createServerFn } from "../server.js";
import "./services-middleware-DR8Hua1Y.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const homeLoader_createServerFn_handler = createServerRpc({
  id: "6c2d4274b8efb35e2bf7bcda438ff0aa337178dc081d76f95ef653851647b81d",
  name: "homeLoader",
  filename: "src/routes/_app/_builder/detection/scenarios/$scenarioId/home.tsx"
}, (opts) => homeLoader.__executeServer(opts));
const homeLoader = createServerFn().middleware([authMiddleware]).validator((input) => input).handler(homeLoader_createServerFn_handler, async function homeLoader2({
  data,
  context
}) {
  const {
    user,
    entitlements,
    decision,
    testRun: testRunRepository,
    scenario
  } = context.authInfo;
  const scenarioId = fromParams(data?.params ?? {}, "scenarioId");
  const currentScenario = await scenario.getScenario({
    scenarioId
  });
  const [scheduledExecutions, testRuns, liveIteration] = await Promise.all([decision.listScheduledExecutions({
    scenarioId
  }), testRunRepository.listTestRuns({
    scenarioId
  }), currentScenario.liveVersionId ? scenario.getScenarioIterationWithoutRules({
    iterationId: currentScenario.liveVersionId
  }) : Promise.resolve(null)]);
  return {
    featureAccess: {
      isEditScenarioAvailable: isEditScenarioAvailable(user),
      isManualTriggerScenarioAvailable: isManualTriggerScenarioAvailable(user),
      isWorkflowsAvailable: entitlements.workflows,
      isTestRunAvailable: entitlements.testRun
    },
    scheduledExecutions,
    testRuns,
    liveIterationSchedule: liveIteration?.schedule
  };
});
const triggerManualExecutionAction_createServerFn_handler = createServerRpc({
  id: "d070b3a7453d9a246e8b18cf318e8ca84bcf66985b248c4167766e8837922aaf",
  name: "triggerManualExecutionAction",
  filename: "src/routes/_app/_builder/detection/scenarios/$scenarioId/home.tsx"
}, (opts) => triggerManualExecutionAction.__executeServer(opts));
const triggerManualExecutionAction = createServerFn().middleware([authMiddleware]).validator((input) => input).handler(triggerManualExecutionAction_createServerFn_handler, async function triggerManualExecutionAction2({
  data,
  context
}) {
  const {
    scenario
  } = context.authInfo;
  await scenario.scheduleScenarioExecution({
    iterationId: data?.params?.["iterationId"]
  });
  return {
    status: "success"
  };
});
export {
  homeLoader_createServerFn_handler,
  triggerManualExecutionAction_createServerFn_handler
};
