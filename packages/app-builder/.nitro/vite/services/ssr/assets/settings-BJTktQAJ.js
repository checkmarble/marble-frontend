import { R as jsxRuntimeExports, a1 as useMatches, ae as Outlet } from "../server.js";
import { u as useTranslation, T as Typo, d_ as Tabs, d$ as tabClassName, d as cn } from "./format-NPGUXq-g.js";
import { L as Link, d as Route, P as Page, p as pageLayoutGutter } from "./router-vb7i5euz.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./services-middleware-DR8Hua1Y.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "./sharpstate.es-CeF1Mf5b.js";
import "./isNullish-B8pc8Ntu.js";
import "./use-callback-ref-DXzIzfqy.js";
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
const sectionTKeys = {
  api: "settings:api",
  users: "settings:users",
  scenarios: "settings:scenarios",
  case_manager: "settings:case_manager",
  audit: "settings:audit",
  ip_whitelisting: "settings:ip_whitelisting",
  screening_providers: "settings:screening_providers"
};
function SettingsNavigationTabs({ sections }) {
  const { t } = useTranslation(["navigation", "settings"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "title1", children: t("navigation:settings") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { children: Object.keys(sections).map((sectionKey) => {
      const { settings } = sections[sectionKey];
      if (settings.length === 0) return null;
      const firstSetting = settings[0];
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: firstSetting.to, className: tabClassName, children: t(sectionTKeys[sectionKey]) }, sectionKey);
    }) })
  ] });
}
function Settings() {
  const {
    sections
  } = Route.useLoaderData();
  const matches = useMatches();
  const hideTabs = matches.some((m) => m.staticData?.hideTabs);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Main, { children: [
    hideTabs ? null : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(pageLayoutGutter.paddingX, pageLayoutGutter.paddingTop, "pb-0"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsNavigationTabs, { sections }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {})
  ] });
}
export {
  Settings as component
};
