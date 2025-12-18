import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { H as isNotFoundHttpError, W as isUnauthorizedHttpError, X as isForbiddenHttpError } from "./services-middleware-DR8Hua1Y.js";
import { u as updateScoringRulesetPayloadSchema, a as updateScoringSettingsPayloadSchema } from "./user-scoring-BwKPLq1i.js";
import { _ as createServerFn, x as redirect } from "../server.js";
import { o as object, s as string } from "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const commitScoringRulesetFn_createServerFn_handler = createServerRpc({
  id: "800d797038baf8d66ec1d637c90f597245b65a7eddb551ae33ef64f74f29ac44",
  name: "commitScoringRulesetFn",
  filename: "src/server-fns/scoring.ts"
}, (opts) => commitScoringRulesetFn.__executeServer(opts));
const commitScoringRulesetFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  recordType: string()
})).handler(commitScoringRulesetFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    const {
      recordType
    } = data;
    const ruleset = await context.authInfo.userScoring.commitScoringRuleset(recordType);
    if (!ruleset) {
      throw new Error("No ruleset returned");
    }
    throw redirect({
      to: "/user-scoring/$recordType/$version",
      params: {
        recordType,
        version: ruleset.version.toString()
      }
    });
  } catch (error) {
    if (error instanceof Response && error.status >= 300 && error.status < 400) throw error;
    throw new Error("Failed to commit ruleset");
  }
});
const listRulesetVersionsFn_createServerFn_handler = createServerRpc({
  id: "d6d738fdfcaabc026ee9a89bb634b70594e90146acb5a6d74919ce286495ffd1",
  name: "listRulesetVersionsFn",
  filename: "src/server-fns/scoring.ts"
}, (opts) => listRulesetVersionsFn.__executeServer(opts));
const listRulesetVersionsFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  recordType: string()
})).handler(listRulesetVersionsFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const versions = await context.authInfo.userScoring.listRulesetVersions(data.recordType);
  return {
    versions
  };
});
const listRulesetsFn_createServerFn_handler = createServerRpc({
  id: "08bc5d654d0807bad820723ab83cf6e710498caf8f694cb2f435d2611d4b69c9",
  name: "listRulesetsFn",
  filename: "src/server-fns/scoring.ts"
}, (opts) => listRulesetsFn.__executeServer(opts));
const listRulesetsFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).handler(listRulesetsFn_createServerFn_handler, async ({
  context
}) => {
  const rulesets = await context.authInfo.userScoring.listRulesets();
  return {
    rulesets
  };
});
const prepareScoringRulesetFn_createServerFn_handler = createServerRpc({
  id: "0c899cff78c3e6695fdb4d23a45413751555d22e51100f0f136c217b2420654f",
  name: "prepareScoringRulesetFn",
  filename: "src/server-fns/scoring.ts"
}, (opts) => prepareScoringRulesetFn.__executeServer(opts));
const prepareScoringRulesetFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  recordType: string()
})).handler(prepareScoringRulesetFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    await context.authInfo.userScoring.prepareScoringRuleset(data.recordType);
  } catch {
    throw new Error("Failed to prepare ruleset");
  }
});
const updateScoringRulesetFn_createServerFn_handler = createServerRpc({
  id: "1a7b160b47d11879791526a71a49fce3e62a6ae808d0b9ac803e7bcd5fd335b6",
  name: "updateScoringRulesetFn",
  filename: "src/server-fns/scoring.ts"
}, (opts) => updateScoringRulesetFn.__executeServer(opts));
const updateScoringRulesetFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(updateScoringRulesetPayloadSchema).handler(updateScoringRulesetFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    recordType,
    id: rulesetId,
    ...rulesetPayload
  } = data;
  const entityRulesets = await context.authInfo.userScoring.listRulesetVersions(recordType);
  rulesetPayload.name = `Scores ${recordType}`;
  const updatedRuleset = await context.authInfo.userScoring.updateScoringRuleset(recordType, rulesetPayload);
  if (!rulesetId) {
    throw redirect({
      to: "/user-scoring/$recordType/$version",
      params: {
        recordType,
        version: "draft"
      }
    });
  }
  const currentRuleset = entityRulesets.find((r) => r.id === rulesetId);
  if (!currentRuleset) {
    throw new Error("Non existing ruleset");
  }
  if (currentRuleset.status === "committed" && updatedRuleset.status === "draft") {
    return updatedRuleset;
  }
});
const updateScoringSettingsFn_createServerFn_handler = createServerRpc({
  id: "869f5d247e9a212cb4c13559fb791071613a77bbd6b823a7391a714e09347c62",
  name: "updateScoringSettingsFn",
  filename: "src/server-fns/scoring.ts"
}, (opts) => updateScoringSettingsFn.__executeServer(opts));
const updateScoringSettingsFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(updateScoringSettingsPayloadSchema).handler(updateScoringSettingsFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    await context.authInfo.userScoring.updateScoringSettings(data);
  } catch {
    throw new Error("Failed to update scoring settings");
  }
});
const getScoringRulesetFn_createServerFn_handler = createServerRpc({
  id: "ad8fbd389de7e5a455788904859e3b8f3702c9f52e81c52078f165263976b78b",
  name: "getScoringRulesetFn",
  filename: "src/server-fns/scoring.ts"
}, (opts) => getScoringRulesetFn.__executeServer(opts));
const getScoringRulesetFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  recordType: string()
})).handler(getScoringRulesetFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const ruleset = await context.authInfo.userScoring.getRulesetWithRules(data.recordType);
  return {
    ruleset
  };
});
const getScoreDistributionFn_createServerFn_handler = createServerRpc({
  id: "339ed5e5c8cda03774b6192da2290ac8d1bea31a91b9728c4194875f31477c01",
  name: "getScoreDistributionFn",
  filename: "src/server-fns/scoring.ts"
}, (opts) => getScoreDistributionFn.__executeServer(opts));
const getScoreDistributionFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  recordType: string()
})).handler(getScoreDistributionFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const distribution = await context.authInfo.userScoring.getScoreDistribution(data.recordType);
  return {
    distribution
  };
});
const getScoringSettingsFn_createServerFn_handler = createServerRpc({
  id: "eb80d39d041d4a500312cef62d9e84ae035bb19d48f065e3f80ea29ccb89081b",
  name: "getScoringSettingsFn",
  filename: "src/server-fns/scoring.ts"
}, (opts) => getScoringSettingsFn.__executeServer(opts));
const getScoringSettingsFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).handler(getScoringSettingsFn_createServerFn_handler, async ({
  context
}) => {
  const settings = await context.authInfo.userScoring.getSettings();
  return {
    settings: settings ?? null
  };
});
const getScoreLatestFn_createServerFn_handler = createServerRpc({
  id: "c936f761eda35384cd1c6d7aafa7b0037fb12f03b1e6eefafe382a6cdca4b8bf",
  name: "getScoreLatestFn",
  filename: "src/server-fns/scoring.ts"
}, (opts) => getScoreLatestFn.__executeServer(opts));
const getScoreLatestFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  objectType: string(),
  objectId: string()
})).handler(getScoreLatestFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    const score = await context.authInfo.userScoring.getScoreLatest(data.objectType, data.objectId);
    return {
      score: score ?? null
    };
  } catch (error) {
    if (isNotFoundHttpError(error) || isUnauthorizedHttpError(error) || isForbiddenHttpError(error)) {
      return {
        score: null
      };
    }
    throw error;
  }
});
export {
  commitScoringRulesetFn_createServerFn_handler,
  getScoreDistributionFn_createServerFn_handler,
  getScoreLatestFn_createServerFn_handler,
  getScoringRulesetFn_createServerFn_handler,
  getScoringSettingsFn_createServerFn_handler,
  listRulesetVersionsFn_createServerFn_handler,
  listRulesetsFn_createServerFn_handler,
  prepareScoringRulesetFn_createServerFn_handler,
  updateScoringRulesetFn_createServerFn_handler,
  updateScoringSettingsFn_createServerFn_handler
};
