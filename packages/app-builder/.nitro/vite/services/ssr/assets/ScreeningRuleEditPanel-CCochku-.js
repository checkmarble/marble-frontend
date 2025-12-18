import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { S as SEARCH_ENTITIES } from "./screening-entity-DVQtf50p.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { J as protectArray, a_ as NewUndefinedAstNode, C as pick } from "./services-middleware-DR8Hua1Y.js";
import { _ as createServerFn } from "../server.js";
import { o as object, s as string, p as boolean, n as number, d as any, f_ as record, _ as _enum, k as array } from "./short-uuid-MIi3jWzx.js";
import "./DataField-vckdVtrg.js";
import "./CopyToClipboardButton-CJNJJful.js";
import "./format-NPGUXq-g.js";
import "./sharpstate.es-CeF1Mf5b.js";
import "./isNullish-B8pc8Ntu.js";
import "./use-callback-ref-DXzIzfqy.js";
import "./Spinner-GK6cEAdR.js";
import "./data-BFm2FCTm.js";
import "./createSsrRpc-ZXUHv2Er.js";
import "./data-fdG1PpsD.js";
import "./useQuery-B7mL_evE.js";
import "./useBaseQuery-CMboOtTR.js";
import "./QueryClientProvider-DYTpkCko.js";
import "./useServerFn-CrqFKl7V.js";
import "./isNonNullish-DgEqPJBU.js";
import "./data-model-B-Bz1o1P.js";
import "./create-context-CYc8deix.js";
import "./dataTypeSchema-DvqJgdgd.js";
import "./mapToObj-wQ-uHOuD.js";
import "./omit-ZO4dmkWK.js";
import "./ExternalLink-CG_77QdX.js";
import "./screenings-CS8peAlI.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const editScreeningFormSchema = object({
  id: string().nonempty(),
  name: string().nonempty(),
  description: string().optional(),
  ruleGroup: string().optional(),
  datasets: protectArray(array(string())),
  threshold: number().optional(),
  forcedOutcome: _enum(["review", "decline", "block_and_review"]),
  triggerRule: any(),
  entityType: _enum(["Person", "Organization", "Vehicle", "Thing"]).optional(),
  query: record(string(), any()),
  counterPartyId: any().nullish(),
  preprocessing: object({
    useNer: boolean().optional(),
    nerIgnoreClassification: boolean().optional(),
    skipIfUnder: number().nullish(),
    removeNumbers: boolean().optional(),
    blacklistListId: string().nullish()
  }).optional()
});
const editScreeningConfigurationSchema = object({
  params: object({
    scenarioId: string(),
    iterationId: string(),
    screeningId: string()
  }),
  payload: editScreeningFormSchema
});
const clearQuery = (entityType, query) => entityType ? pick(query, SEARCH_ENTITIES[entityType].fields) : query;
const editScreeningAction_createServerFn_handler = createServerRpc({
  id: "bf56d34b66baeffb8e8738a9a75b1b5f0ca8916895407c31fadab20a997e6a3c",
  name: "editScreeningAction",
  filename: "src/components/Scenario/Rules/ScreeningRuleEditPanel.tsx"
}, (opts) => editScreeningAction.__executeServer(opts));
const editScreeningAction = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(editScreeningConfigurationSchema).handler(editScreeningAction_createServerFn_handler, async function editScreeningAction2({
  context,
  data: {
    params,
    payload
  }
}) {
  const {
    scenarioIterationScreeningRepository
  } = context.authInfo;
  return scenarioIterationScreeningRepository.updateScreeningConfig({
    iterationId: params.iterationId,
    screeningId: params.screeningId,
    changes: {
      ...payload,
      counterPartyId: payload.counterPartyId ?? NewUndefinedAstNode(),
      query: clearQuery(payload.entityType, payload.query),
      preprocessing: {
        ...payload.preprocessing,
        useNer: payload.entityType === "Thing" ? payload.preprocessing?.useNer : void 0,
        nerIgnoreClassification: payload.preprocessing?.useNer ? payload.preprocessing?.nerIgnoreClassification : void 0,
        skipIfUnder: payload.preprocessing?.skipIfUnder ?? void 0,
        blacklistListId: payload.preprocessing?.blacklistListId ?? void 0
      }
    }
  });
});
export {
  editScreeningAction_createServerFn_handler
};
