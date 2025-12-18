import { R as jsxRuntimeExports } from "../server.js";
import { L as Link } from "./router-vb7i5euz.js";
import { u as useTranslation, T as Typo, d_ as Tabs, d$ as tabClassName } from "./format-NPGUXq-g.js";
function CasesNavigationTabs({ actions }) {
  const { t } = useTranslation(["navigation", "cases"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "title1", children: t("navigation:case_manager") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/cases/overview", className: tabClassName, children: t("cases:overview.navigation.overview") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/cases/analytics", className: tabClassName, children: t("cases:overview.navigation.analytics") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/cases/inboxes", className: tabClassName, children: t("cases:overview.navigation.cases") })
      ] }),
      actions
    ] })
  ] });
}
export {
  CasesNavigationTabs as C
};
