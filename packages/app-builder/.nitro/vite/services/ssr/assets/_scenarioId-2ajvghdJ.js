import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { i as isAnalyticsAvailable } from "./feature-access-B8PIS8ad.js";
import { o as object, s as string, g as fromSUUIDtoUUID } from "./short-uuid-MIi3jWzx.js";
import { _ as createServerFn } from "../server.js";
import "./services-middleware-DR8Hua1Y.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const paramsSchema = object({
  scenarioId: string().transform((id) => fromSUUIDtoUUID(id))
});
const analyticsLoader_createServerFn_handler = createServerRpc({
  id: "05bb58e2b97b1cc2316fd5a122fc1baf8ed2ef60d1a52ae56a4f4402675f5a55",
  name: "analyticsLoader",
  filename: "src/routes/_app/_builder/detection/analytics/$scenarioId.tsx"
}, (opts) => analyticsLoader.__executeServer(opts));
const analyticsLoader = createServerFn().middleware([authMiddleware]).validator(paramsSchema).handler(analyticsLoader_createServerFn_handler, async function analyticsLoader2({
  data,
  context
}) {
  const {
    scenario,
    user,
    entitlements
  } = context.authInfo;
  const [scenarios, scenarioIterations] = await Promise.all([scenario.listScenarios(), scenario.listScenarioIterations({
    scenarioId: data.scenarioId
  })]);
  return {
    scenarioId: data.scenarioId,
    scenarios,
    scenarioVersions: scenarioIterations.filter(({
      version
    }) => version !== null).map(({
      version,
      createdAt
    }) => ({
      version,
      createdAt
    })),
    isAnalyticsAvailable: isAnalyticsAvailable(user, entitlements)
  };
});
export {
  analyticsLoader_createServerFn_handler
};
