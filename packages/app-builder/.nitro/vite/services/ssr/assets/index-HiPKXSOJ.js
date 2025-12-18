import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { b as isEditScenarioAvailable } from "./feature-access-B8PIS8ad.js";
import { _ as createServerFn } from "../server.js";
import "./services-middleware-DR8Hua1Y.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const scenariosLoader_createServerFn_handler = createServerRpc({
  id: "0acb523b5f97ff683b231261a0120f2ad490d294ede3b29b519c3173ddc98731",
  name: "scenariosLoader",
  filename: "src/routes/_app/_builder/detection/scenarios/index.tsx"
}, (opts) => scenariosLoader.__executeServer(opts));
const scenariosLoader = createServerFn().middleware([authMiddleware]).handler(scenariosLoader_createServerFn_handler, async function scenariosLoader2({
  context
}) {
  const scenarios = await context.authInfo.scenario.listScenarios();
  const iterationsMetadata = await Promise.all(scenarios.map((s) => context.authInfo.scenario.listScenarioIterationsMetadata({
    scenarioId: s.id
  })));
  const scenarioMetadataMap = Object.fromEntries(scenarios.map((s, i) => {
    const iterations = iterationsMetadata[i] ?? [];
    const versions = iterations.map((it) => it.version);
    return [s.id, {
      versions
    }];
  }));
  return {
    isEditScenarioAvailable: isEditScenarioAvailable(context.authInfo.user),
    scenarios,
    scenarioMetadataMap
  };
});
export {
  scenariosLoader_createServerFn_handler
};
