import { u as updateScoringRulesetFn } from "./scoring-NycAI253.js";
import { y as useQueryClient } from "./QueryClientProvider-DYTpkCko.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { R as jsxRuntimeExports } from "../server.js";
import { u as useTranslation, e0 as NumberInput, e1 as Input } from "./format-NPGUXq-g.js";
import { i as isMaxRiskLevelInRange, s as scoringLevelEntries, S as SCORING_LEVELS_COLORS, a as SCORING_LEVELS_LABEL_KEYS } from "./display-TKj7AN5a.js";
const useUpdateScoringRulesetMutation = () => {
  const updateScoringRuleset = useServerFn(updateScoringRulesetFn);
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["scoring", "update-ruleset"],
    mutationFn: async (payload) => {
      return updateScoringRuleset({ data: payload });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scoring"] });
    }
  });
};
function ScoringLevelThresholds({ maxRiskLevel, thresholds, onThresholdsChange }) {
  const { t } = useTranslation(["user-scoring"]);
  if (!isMaxRiskLevelInRange(maxRiskLevel)) {
    return null;
  }
  const colorEntries = scoringLevelEntries(SCORING_LEVELS_COLORS[maxRiskLevel]);
  const labelKeys = SCORING_LEVELS_LABEL_KEYS[maxRiskLevel];
  const handleChange = (index, value) => {
    const next = [...thresholds];
    next[index] = value;
    onThresholdsChange(next);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-medium text-grey-primary", children: t("user-scoring:thresholds.title") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface-card border border-grey-border rounded-md p-md flex flex-col gap-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-primary", children: t("user-scoring:thresholds.risk_levels") }),
      colorEntries.map(([level, color], i) => {
        const isFirst = i === 0;
        const isLast = i === colorEntries.length - 1;
        const upperThreshold = thresholds[i];
        const lowerBound = i > 0 ? (thresholds[i - 1] ?? 0) + 1 : void 0;
        const hasError = i > 0 && !isLast && (upperThreshold ?? 0) <= (thresholds[i - 1] ?? 0);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-xs h-10 w-[195px] shrink-0 border border-grey-border rounded-sm px-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-4 rounded-full shrink-0", style: { backgroundColor: color } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-medium flex-1 min-w-0 truncate", children: t(labelKeys[level] ?? "") })
          ] }),
          isFirst ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-medium w-[30px] shrink-0 text-right", children: "≤" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              NumberInput,
              {
                className: "flex-1",
                value: upperThreshold ?? 0,
                onChange: (value) => handleChange(i, value)
              }
            )
          ] }) : null,
          isLast ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-medium w-[30px] shrink-0 text-right", children: "≥" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "flex-1", value: lowerBound ?? "", readOnly: true })
          ] }) : null,
          !isFirst && !isLast ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-primary whitespace-nowrap shrink-0", children: t("user-scoring:thresholds.between") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "flex-1", value: lowerBound ?? "", readOnly: true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-primary whitespace-nowrap shrink-0", children: t("user-scoring:thresholds.and") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              NumberInput,
              {
                className: "flex-1",
                borderColor: hasError ? "redfigma-47" : "greyfigma-90",
                value: upperThreshold ?? 0,
                onChange: (value) => handleChange(i, value)
              }
            )
          ] }) : null
        ] }, level);
      })
    ] })
  ] });
}
export {
  ScoringLevelThresholds as S,
  useUpdateScoringRulesetMutation as u
};
