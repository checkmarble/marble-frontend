import { R as jsxRuntimeExports } from "../server.js";
import { S as ScoringSectionLayout } from "./ScoringSectionLayout-BdgAnb_C.js";
import { c as Route } from "./router-vb7i5euz.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./get-data-model-CAY4ZWaH.js";
import "./data-BFm2FCTm.js";
import "./createSsrRpc-ZXUHv2Er.js";
import "./auth-middleware-C4ap47rJ.js";
import "./services-middleware-DR8Hua1Y.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "./data-fdG1PpsD.js";
import "./useQuery-B7mL_evE.js";
import "./useBaseQuery-CMboOtTR.js";
import "./QueryClientProvider-DYTpkCko.js";
import "./useServerFn-CrqFKl7V.js";
import "./scoring-NycAI253.js";
import "./user-scoring-BwKPLq1i.js";
import "./ScoringLevelThresholds-bJ2AGLf_.js";
import "./useMutation-C5oG90Zs.js";
import "./format-NPGUXq-g.js";
import "./sharpstate.es-CeF1Mf5b.js";
import "./isNullish-B8pc8Ntu.js";
import "./use-callback-ref-DXzIzfqy.js";
import "./display-TKj7AN5a.js";
import "./form-D2XmDKeG.js";
import "./array-BFSjnO9c.js";
import "./useForm-BwABQKAs.js";
import "./CopyToClipboardButton-CJNJJful.js";
import "./Panel-kj8Z2GDk.js";
import "./Spinner-GK6cEAdR.js";
import "./security-headers.server-BdP3HrPp.js";
import "./ThemeContext-B40HQxfH.js";
import "./config-ut8rAdyo.js";
import "./i18n-instance-store-UssbGYOM.js";
import "./inboxes-D556s0BB.js";
import "./files-fO9wUXBf.js";
import "./case-detail-middleware-C3JS8Yme.js";
import "./input-validation-CU_reV2S.js";
import "./async-C3pYACua.js";
import "./decisions-B-2DmJW1.js";
import "./unique-CBeBxAXx.js";
import "./scenarios-8U74nJp4.js";
function UserScoringSectionLayout() {
  const {
    settings
  } = Route.useLoaderData();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ScoringSectionLayout, { maxRiskLevel: settings?.maxRiskLevel });
}
export {
  UserScoringSectionLayout as component
};
