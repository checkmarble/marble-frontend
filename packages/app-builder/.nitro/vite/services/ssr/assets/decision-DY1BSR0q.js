import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { o as object, n as number, f_ as record, s as string, t as treeifyError, f as fromParams } from "./short-uuid-MIi3jWzx.js";
import { _ as createServerFn, a4 as getRequest } from "../server.js";
import { n as number$1 } from "./services-middleware-DR8Hua1Y.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "node:crypto";
const MAX_THRESHOLD = 1e4;
function getFormSchema(t) {
  return object({
    scoreReviewThreshold: number$1({
      message: t("scenarios:validation.decision.score_threshold_missing")
    }).max(MAX_THRESHOLD, {
      message: t("scenarios:validation.decision.score_threshold_max", {
        replace: {
          max: MAX_THRESHOLD
        }
      })
    }).min(-MAX_THRESHOLD, {
      message: t("scenarios:validation.decision.score_threshold_min", {
        replace: {
          min: -MAX_THRESHOLD
        }
      })
    }).int(),
    scoreBlockAndReviewThreshold: number$1({
      message: t("scenarios:validation.decision.score_threshold_missing")
    }).max(MAX_THRESHOLD, {
      message: t("scenarios:validation.decision.score_threshold_max", {
        replace: {
          max: MAX_THRESHOLD
        }
      })
    }).min(-MAX_THRESHOLD, {
      message: t("scenarios:validation.decision.score_threshold_min", {
        replace: {
          min: -MAX_THRESHOLD
        }
      })
    }).int(),
    scoreDeclineThreshold: number$1({
      message: t("scenarios:validation.decision.score_threshold_missing")
    }).max(MAX_THRESHOLD, {
      message: t("scenarios:validation.decision.score_threshold_max", {
        replace: {
          max: MAX_THRESHOLD
        }
      })
    }).min(-MAX_THRESHOLD, {
      message: t("scenarios:validation.decision.score_threshold_min", {
        replace: {
          min: -MAX_THRESHOLD
        }
      })
    }).int()
  }).superRefine(({
    scoreReviewThreshold,
    scoreBlockAndReviewThreshold,
    scoreDeclineThreshold
  }, ctx) => {
    if (scoreBlockAndReviewThreshold < scoreReviewThreshold) {
      ctx.issues.push({
        code: "custom",
        path: ["scoreBlockAndReviewThreshold"],
        message: t("scenarios:validation.decision.score_threshold_min", {
          replace: {
            min: scoreReviewThreshold
          }
        }),
        input: ""
      });
    }
    if (scoreDeclineThreshold < scoreBlockAndReviewThreshold) {
      ctx.issues.push({
        code: "custom",
        path: ["scoreDeclineThreshold"],
        message: t("scenarios:validation.decision.score_threshold_min", {
          replace: {
            min: scoreBlockAndReviewThreshold
          }
        }),
        input: ""
      });
    }
  });
}
const saveDecisionInputSchema = object({
  params: record(string(), string()),
  scoreReviewThreshold: number(),
  scoreBlockAndReviewThreshold: number(),
  scoreDeclineThreshold: number()
});
const saveDecisionAction_createServerFn_handler = createServerRpc({
  id: "bdda9c0781c975539c593039fa8c7b3413d8e3550b1457c51cbe91dd66dbbb66",
  name: "saveDecisionAction",
  filename: "src/routes/_app/_builder/detection/scenarios/$scenarioId/i/$iterationId/_edit-view/decision.tsx"
}, (opts) => saveDecisionAction.__executeServer(opts));
const saveDecisionAction = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator((input) => saveDecisionInputSchema.parse(input)).handler(saveDecisionAction_createServerFn_handler, async function saveDecisionAction2({
  context,
  data
}) {
  const request = getRequest();
  const {
    i18nextService
  } = context.services;
  const {
    scenario
  } = context.authInfo;
  const t = await i18nextService.getFixedT(request, ["common", "scenarios"]);
  const {
    params,
    scoreReviewThreshold,
    scoreBlockAndReviewThreshold,
    scoreDeclineThreshold
  } = data;
  const result = getFormSchema(t).safeParse({
    scoreReviewThreshold,
    scoreBlockAndReviewThreshold,
    scoreDeclineThreshold
  });
  if (!result.success) {
    return {
      status: "error",
      errors: treeifyError(result.error)
    };
  }
  try {
    const iterationId = fromParams(params, "iterationId");
    await scenario.updateScenarioIteration(iterationId, result.data);
    return {
      status: "success",
      errors: []
    };
  } catch (_error) {
    return {
      status: "error",
      errors: []
    };
  }
});
export {
  saveDecisionAction_createServerFn_handler
};
