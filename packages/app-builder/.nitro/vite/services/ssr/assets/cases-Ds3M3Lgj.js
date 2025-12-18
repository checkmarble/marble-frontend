import { R as jsxRuntimeExports, ae as Outlet } from "../server.js";
import { D as DataModelContextProvider } from "./data-model-B-Bz1o1P.js";
import { f as Route } from "./router-vb7i5euz.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./create-context-CYc8deix.js";
import "./QueryClientProvider-DYTpkCko.js";
import "./security-headers.server-BdP3HrPp.js";
import "./services-middleware-DR8Hua1Y.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "./format-NPGUXq-g.js";
import "./sharpstate.es-CeF1Mf5b.js";
import "./isNullish-B8pc8Ntu.js";
import "./use-callback-ref-DXzIzfqy.js";
import "./ThemeContext-B40HQxfH.js";
import "./config-ut8rAdyo.js";
import "./createSsrRpc-ZXUHv2Er.js";
import "./i18n-instance-store-UssbGYOM.js";
import "./auth-middleware-C4ap47rJ.js";
import "./inboxes-D556s0BB.js";
import "./files-fO9wUXBf.js";
import "./CopyToClipboardButton-CJNJJful.js";
import "./case-detail-middleware-C3JS8Yme.js";
import "./input-validation-CU_reV2S.js";
import "./async-C3pYACua.js";
import "./decisions-B-2DmJW1.js";
import "./unique-CBeBxAXx.js";
import "./scenarios-8U74nJp4.js";
function CasesLayout() {
  const {
    dataModel,
    dataModelFeatureAccess
  } = Route.useLoaderData();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DataModelContextProvider, { dataModel, dataModelFeatureAccess, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) });
}
export {
  CasesLayout as component
};
