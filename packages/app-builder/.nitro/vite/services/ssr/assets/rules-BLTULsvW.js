import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { A as isAccessible, P as isAiRuleBuildingAvailable } from "./feature-access-B8PIS8ad.js";
import { _ as createServerFn } from "../server.js";
import "./services-middleware-DR8Hua1Y.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const rulesLoader_createServerFn_handler = createServerRpc({
  id: "896a1ecc11846a9461e21facf77adf667f611a1ae5b520fb3166be717fd06c95",
  name: "rulesLoader",
  filename: "src/routes/_app/_builder/detection/scenarios/$scenarioId/i/$iterationId/_edit-view/rules.tsx"
}, (opts) => rulesLoader.__executeServer(opts));
const rulesLoader = createServerFn().middleware([authMiddleware]).handler(rulesLoader_createServerFn_handler, async function rulesLoader2({
  context
}) {
  const {
    entitlements
  } = context.authInfo;
  return {
    isSanctionAvailable: entitlements.sanctions,
    isAiRuleDescriptionEnabled: isAiRuleBuildingAvailable(entitlements),
    isNameRecognitionAvailable: isAccessible(entitlements.nameRecognition)
  };
});
export {
  rulesLoader_createServerFn_handler
};
