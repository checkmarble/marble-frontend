import { R as jsxRuntimeExports } from "../server.js";
import { u as useTranslation } from "./format-NPGUXq-g.js";
function ScoreOutcomeThresholds({
  scoreReviewThreshold = 0,
  scoreBlockAndReviewThreshold = 0,
  scoreDeclineThreshold = 0
}) {
  const { t } = useTranslation(["decisions"]);
  const showReviewOutcome = scoreBlockAndReviewThreshold > scoreReviewThreshold;
  const showBlockAndReviewOutcome = scoreDeclineThreshold > scoreBlockAndReviewThreshold;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex h-[70px] w-full flex-row", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-green-background-light border-b-green-primary isolate flex h-10 flex-1 items-center justify-center rounded-sm-md border-b-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-green-primary font-semibold", children: t("decisions:outcome.approve") }) }),
    showReviewOutcome ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface-card relative w-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary text-m absolute bottom-0 left-1/2 -translate-x-1/2 font-bold", children: scoreReviewThreshold }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-yellow-background flex h-10 flex-1 items-center justify-center border-b-4 border-b-yellow-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-semibold text-yellow-primary", children: t("decisions:outcome.review") }) })
    ] }) : null,
    showBlockAndReviewOutcome ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface-card relative w-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary text-m absolute bottom-0 left-1/2 -translate-x-1/2 font-bold", children: scoreBlockAndReviewThreshold }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-orange-background-light flex h-10 flex-1 items-center justify-center border-b-4 border-b-orange-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-semibold text-orange-primary", children: t("decisions:outcome.block_and_review") }) })
    ] }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface-card relative w-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary text-m absolute bottom-0 left-1/2 -translate-x-1/2 font-bold", children: scoreDeclineThreshold }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-background border-b-red-primary flex h-10 flex-1 items-center justify-center rounded-e-md border-b-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-red-primary font-semibold", children: t("decisions:outcome.decline") }) })
  ] });
}
export {
  ScoreOutcomeThresholds as S
};
