import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { H as isNotFoundHttpError, h as setToast, v as n } from "./services-middleware-DR8Hua1Y.js";
import { p as parseParamsSafe, s as shortUUIDSchema } from "./input-validation-CU_reV2S.js";
import { _ as createServerFn, a4 as getRequest, x as redirect } from "../server.js";
import { o as object } from "./short-uuid-MIi3jWzx.js";
import { e } from "./isNonNullish-DgEqPJBU.js";
import "node:crypto";
import "util";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
const handleScreenings = async (screenings, screeningRepository) => {
  if (screenings.length === 0) {
    return [];
  }
  const {
    sections
  } = await screeningRepository.listDatasets();
  const datasets = new Map(sections?.flatMap(({
    datasets: datasets2
  }) => datasets2?.map(({
    name,
    title
  }) => [name, title]) ?? []) ?? []);
  const sanctionsDatasets = [...new Set(screenings.flatMap(({
    matches
  }) => matches.flatMap(({
    payload
  }) => payload.datasets)))];
  return screenings.map(({
    matches,
    ...rest
  }) => ({
    ...rest,
    matches: matches.map(({
      payload,
      ...rest2
    }) => ({
      ...rest2,
      payload: {
        ...payload,
        datasets: payload.datasets?.filter((dataset) => !sanctionsDatasets.includes(dataset)).map((dataset) => datasets.get(dataset) ?? dataset)
      }
    }))
  }));
};
const decisionLoader_createServerFn_handler = createServerRpc({
  id: "190e537a41b695e9074030a843c24f85222ff378bd328c6084ee189e8cf0869f",
  name: "decisionLoader",
  filename: "src/routes/_app/_builder/detection/decisions/$decisionId.tsx"
}, (opts) => decisionLoader.__executeServer(opts));
const decisionLoader = createServerFn().middleware([authMiddleware]).validator((input) => input).handler(decisionLoader_createServerFn_handler, async function decisionLoader2({
  context,
  data
}) {
  const request = getRequest();
  const {
    i18nextService: {
      getFixedT
    }
  } = context.services;
  const {
    decision,
    scenario,
    dataModelRepository,
    screening
  } = context.authInfo;
  const parsedParam = await parseParamsSafe(data?.params ?? {}, object({
    decisionId: shortUUIDSchema
  }));
  if (!parsedParam.success) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found"
    });
  }
  const t = await getFixedT(request, ["decisions"]);
  const currentDecision = await decision.getDecisionById(parsedParam.data.decisionId).catch(async (error) => {
    if (isNotFoundHttpError(error)) {
      await setToast({
        type: "error",
        message: t("decisions:errors.decision_not_found")
      });
      let redirectPath = "/detection/decisions";
      try {
        const referer = request.headers.get("Referer");
        if (referer) {
          const {
            pathname,
            search
          } = new URL(referer);
          if (pathname.startsWith("/detection/decisions")) {
            redirectPath = pathname + search;
          }
        }
      } catch {
      }
      throw redirect({
        href: redirectPath
      });
    }
    throw error;
  });
  const independentOperations = Promise.all([dataModelRepository.getDataModel().catch(() => []), dataModelRepository.listPivots({}), screening.listScreenings({
    decisionId: parsedParam.data.decisionId
  })]);
  const scenarioIteration = await scenario.getScenarioIteration({
    iterationId: currentDecision.scenario.scenarioIterationId
  });
  const scenarioRules = scenarioIteration.rules;
  const [dataModel, pivots, screeningResult] = await independentOperations;
  const pivotObjects = await Promise.all(currentDecision.pivotValues.map(async ({
    id,
    value
  }) => {
    if (!id || !value) return null;
    const pivot = pivots.find((p) => p.id === id);
    if (!pivot || pivot.type === "field") return null;
    const object2 = await dataModelRepository.getIngestedObject(pivot.pivotTable, value).catch(() => null);
    if (!object2) return null;
    return {
      pivotId: id,
      value,
      object: object2
    };
  })).then((results) => n(results, e));
  return {
    decision: currentDecision,
    scenarioRules,
    dataModel,
    pivots,
    pivotObjects,
    screening: await handleScreenings(screeningResult, screening),
    isIterationArchived: scenarioIteration.archived
  };
});
export {
  decisionLoader_createServerFn_handler
};
