import { S as React, R as jsxRuntimeExports, ae as Outlet } from "../server.js";
import { u as useLocation, aq as useDetectionScenarioData, ax as getFormattedArchived, ay as getFormattedLive, _ as getFormattedVersion, az as ScenarioIterationMenu, aA as Route } from "./router-vb7i5euz.js";
import { E as EditorModeContextProvider } from "./editor-mode-BAuR_YJJ.js";
import { u as useTranslation, q as useFormatLanguage, r as formatDateRelative, M as MenuButton, e as Icon } from "./format-NPGUXq-g.js";
import { b as fromUUIDtoSUUID } from "./short-uuid-MIi3jWzx.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./QueryClientProvider-DYTpkCko.js";
import "./security-headers.server-BdP3HrPp.js";
import "./services-middleware-DR8Hua1Y.js";
import "node:crypto";
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
import "./create-context-CYc8deix.js";
import "./sharpstate.es-CeF1Mf5b.js";
import "./isNullish-B8pc8Ntu.js";
import "./use-callback-ref-DXzIzfqy.js";
function CurrentScenarioIterationProvider() {
  const {
    editorMode,
    scenarioIteration
  } = Route.useRouteContext();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(EditorModeContextProvider, { value: editorMode, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}, scenarioIteration.id) });
}
function VersionSelect({
  currentIteration,
  scenarioIterations
}) {
  const {
    t
  } = useTranslation(["scenarios"]);
  const location = useLocation();
  const language = useFormatLanguage();
  const {
    currentScenario
  } = useDetectionScenarioData();
  const labelledScenarioIteration = React.useMemo(() => scenarioIterations.map((si) => ({
    id: si.id,
    type: si.type,
    version: si.version,
    updatedAt: si.updatedAt,
    linkTo: location.pathname.replace(fromUUIDtoSUUID(currentIteration.id), fromUUIDtoSUUID(si.id)),
    formattedVersion: getFormattedVersion(si, t),
    formattedLive: getFormattedLive(si, t),
    formattedArchived: getFormattedArchived(si, t),
    formattedUpdatedAt: formatDateRelative(si.updatedAt, {
      language
    })
  })), [currentIteration.id, language, location.pathname, scenarioIterations, t]);
  const currentFormattedVersion = getFormattedVersion(currentIteration, t);
  const currentFormattedLive = getFormattedLive(currentIteration, t);
  const currentFormattedArchived = getFormattedArchived(currentIteration, t);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ScenarioIterationMenu, { labelledScenarioIteration, scenario: currentScenario, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuButton, { className: "text-s text-purple-primary border-purple-border focus:border-purple-primary flex items-center rounded-full border py-xs px-sm gap-xs outline-hidden font-normal", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex gap-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize", children: currentFormattedVersion }),
      currentFormattedLive ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-purple-primary capitalize font-bold", children: currentFormattedLive }) : null,
      currentFormattedArchived ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary capitalize", children: currentFormattedArchived }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { "aria-hidden": true, icon: "caret-down", className: "size-6 shrink-0" })
  ] }) });
}
export {
  VersionSelect,
  CurrentScenarioIterationProvider as component
};
