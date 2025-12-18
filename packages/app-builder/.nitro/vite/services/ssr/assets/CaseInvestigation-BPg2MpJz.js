import { R as jsxRuntimeExports } from "../server.js";
import { C as CaseEvents, A as AddComment } from "./escalate-case-CwnOzYrx.js";
import { u as useTranslation } from "./format-NPGUXq-g.js";
const CaseInvestigation = ({ caseId, events, root }) => {
  const { t } = useTranslation(["cases"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col justify-start gap-xs", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-default text-grey-primary px-2xs font-medium", children: t("cases:investigation") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-grey-border bg-surface-card flex flex-col rounded-lg border overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CaseEvents, { events, root }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AddComment, { caseId })
    ] })
  ] });
};
export {
  CaseInvestigation as C
};
