import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { H as isNotFoundHttpError } from "./services-middleware-DR8Hua1Y.js";
import { h as hasAnyEntitlement } from "./feature-access-B8PIS8ad.js";
import { _ as createServerFn, x as redirect } from "../server.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const scoringRulesetLoader_createServerFn_handler = createServerRpc({
  id: "18da7f26386e7ebb5a2edc840704787f306fb5982648e912fd5a034dc3e9f640",
  name: "scoringRulesetLoader",
  filename: "src/routes/_app/_builder/user-scoring/$recordType.$version.tsx"
}, (opts) => scoringRulesetLoader.__executeServer(opts));
const scoringRulesetLoader = createServerFn().middleware([authMiddleware]).validator((input) => input).handler(scoringRulesetLoader_createServerFn_handler, async function scoringRulesetLoader2({
  data,
  context
}) {
  const {
    userScoring,
    customListsRepository,
    entitlements
  } = context.authInfo;
  const recordType = data?.params?.["recordType"] ?? "";
  const version = data?.params?.["version"] ?? "";
  let ruleset = null;
  try {
    ruleset = await userScoring.getRulesetWithRules(recordType, version);
  } catch (err) {
    if (isNotFoundHttpError(err)) {
      throw redirect({
        to: "/user-scoring/overview"
      });
    }
    throw err;
  }
  const customLists = await customListsRepository.listCustomLists();
  let preparationStatus = null;
  if (ruleset.status === "draft") {
    preparationStatus = await userScoring.getRulesetPreparationStatus(recordType);
  }
  return {
    ruleset,
    customLists,
    preparationStatus,
    hasValidLicense: hasAnyEntitlement(entitlements)
  };
});
export {
  scoringRulesetLoader_createServerFn_handler
};
