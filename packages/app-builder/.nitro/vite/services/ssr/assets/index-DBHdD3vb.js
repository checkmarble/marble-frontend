import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { b as fromUUIDtoSUUID } from "./short-uuid-MIi3jWzx.js";
import { _ as createServerFn, x as redirect } from "../server.js";
import "./services-middleware-DR8Hua1Y.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const analyticsIndexLoader_createServerFn_handler = createServerRpc({
  id: "1dda07efb7eddbc1a3c062ed5bae0127a4b92d7ed30c6c541cf160b40c6cd9ce",
  name: "analyticsIndexLoader",
  filename: "src/routes/_app/_builder/detection/analytics/index.tsx"
}, (opts) => analyticsIndexLoader.__executeServer(opts));
const analyticsIndexLoader = createServerFn().middleware([authMiddleware]).handler(analyticsIndexLoader_createServerFn_handler, async function analyticsIndexLoader2({
  context
}) {
  const {
    scenario
  } = context.authInfo;
  const scenarios = await scenario.listScenarios();
  const firstScenario = scenarios[0];
  if (firstScenario) {
    throw redirect({
      to: "/detection/analytics/$scenarioId",
      params: {
        scenarioId: fromUUIDtoSUUID(firstScenario.id)
      }
    });
  }
  throw redirect({
    to: "/detection/scenarios"
  });
});
export {
  analyticsIndexLoader_createServerFn_handler
};
