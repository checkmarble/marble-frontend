import { R as jsxRuntimeExports, ae as Outlet } from "../server.js";
import { w as getPivotObjectKey } from "./services-middleware-DR8Hua1Y.js";
import { aT as Route, L as Link } from "./router-vb7i5euz.js";
import { u as useTranslation } from "./format-NPGUXq-g.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "./QueryClientProvider-DYTpkCko.js";
import "./security-headers.server-BdP3HrPp.js";
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
import "./sharpstate.es-CeF1Mf5b.js";
import "./isNullish-B8pc8Ntu.js";
import "./use-callback-ref-DXzIzfqy.js";
function RouteComponent() {
  const {
    pivotObjects
  } = Route.useRouteContext();
  const {
    t
  } = useTranslation(["cases"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    pivotObjects.length > 1 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-sm mb-lg", children: pivotObjects.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { className: "px-sm h-8 rounded-md border border-grey-border flex items-center aria-[current=page]:border-purple-primary", from: "/cases/s/$caseId/", to: "./clients/$pivotValue", params: {
      pivotValue: getPivotObjectKey(p)
    }, children: t("cases:case_manager.client_panel.label", {
      index: i + 1
    }) }, getPivotObjectKey(p))) }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {})
  ] });
}
export {
  RouteComponent as component
};
