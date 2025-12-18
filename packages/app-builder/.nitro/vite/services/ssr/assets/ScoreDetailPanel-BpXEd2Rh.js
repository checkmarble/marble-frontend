import { r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { P as Panel } from "./Panel-kj8Z2GDk.js";
import { D as DataModelExplorerContext, d as DataModelExplorer } from "./DataModelExplorer-gjwcxdcr.js";
import { u as useTranslation, t as useFormatDateTime, T as Typo, j as Tag } from "./format-NPGUXq-g.js";
import { d as getScoringRulesetFn } from "./scoring-NycAI253.js";
import { u as useQuery } from "./useQuery-B7mL_evE.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { S as SCORING_LEVELS_COLORS, a as SCORING_LEVELS_LABEL_KEYS, s as scoringLevelEntries } from "./display-TKj7AN5a.js";
function DataExplorerPanel({ dataModel, open, onOpenChange }) {
  const { t } = useTranslation(["cases"]);
  const dataModelExplorerContext = DataModelExplorerContext.useValue();
  reactExports.useEffect(() => {
    if (!dataModelExplorerContext.explorerState) {
      onOpenChange(false);
    }
  }, [dataModelExplorerContext.explorerState]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Root, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Container, { size: "large", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Content, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Header, { children: t("cases:case_detail.pivot_panel.breadcrumb_explore") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "z-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DataModelExplorer, { dataModel }) })
  ] }) }) });
}
const useGetScoringRulesetQuery = (recordType) => {
  const getScoringRuleset = useServerFn(getScoringRulesetFn);
  return useQuery({
    queryKey: ["scoring", "ruleset", recordType],
    queryFn: () => getScoringRuleset({ data: { recordType } }),
    enabled: !!recordType
  });
};
function ScoreScale({ maxRiskLevel, currentLevel, thresholds }) {
  const colorMap = SCORING_LEVELS_COLORS[maxRiskLevel];
  const colorEntries = scoringLevelEntries(colorMap);
  const proportional = thresholds && thresholds.length === maxRiskLevel - 1 ? (() => {
    const minValue = thresholds[0] > 10 ? thresholds[0] - 10 : 0;
    const maxValue = thresholds[thresholds.length - 1] + 10;
    const totalRange = maxValue - minValue;
    const showZeroLabel = thresholds[0] !== 0;
    const zeroLabelPct = (0 - minValue) / totalRange * 100;
    const segmentWidths = colorEntries.map((_, i) => {
      const segStart2 = i === 0 ? minValue : thresholds[i - 1];
      const segEnd2 = i === thresholds.length ? maxValue : thresholds[i];
      return (segEnd2 - segStart2) / totalRange * 100;
    });
    const markerPositions = thresholds.map((v) => (v - minValue) / totalRange * 100);
    const segStart = currentLevel <= 1 ? minValue : thresholds[currentLevel - 2];
    const segEnd = currentLevel > thresholds.length ? maxValue : thresholds[currentLevel - 1];
    const markerPct = ((segStart + segEnd) / 2 - minValue) / totalRange * 100;
    const allLabels = [];
    if (showZeroLabel) {
      allLabels.push({ value: "0", pct: zeroLabelPct, staggered: false });
    }
    for (let i = 0; i < thresholds.length; i++) {
      allLabels.push({ value: String(thresholds[i]), pct: markerPositions[i], staggered: false });
    }
    allLabels.sort((a, b) => a.pct - b.pct);
    const minGap = 5;
    for (let i = 1; i < allLabels.length; i++) {
      if (allLabels[i].pct - allLabels[i - 1].pct < minGap) {
        allLabels[i].staggered = !allLabels[i - 1].staggered;
      }
    }
    return { segmentWidths, markerPositions, markerPct, showZeroLabel, zeroLabelPct, allLabels };
  })() : void 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex w-full overflow-hidden rounded-lg gap-px mt-sm", children: [
        colorEntries.map(([level, color], i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "h-2",
            style: {
              backgroundColor: color,
              ...proportional ? { width: `${proportional.segmentWidths[i]}%` } : { flex: 1 }
            }
          },
          level
        )),
        proportional?.showZeroLabel ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-y-0 w-px bg-white", style: { left: `${proportional.zeroLabelPct}%` } }) : null
      ] }),
      proportional ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "absolute top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white shadow-sm",
          style: {
            left: `${proportional.markerPct}%`,
            backgroundColor: colorMap[currentLevel]
          }
        }
      ) : null
    ] }),
    proportional ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative mt-xs", style: { height: proportional.allLabels.some((l) => l.staggered) ? 32 : 16 }, children: proportional.allLabels.map((label) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "absolute text-xs text-grey-secondary",
        style: {
          left: `${label.pct}%`,
          top: label.staggered ? 16 : 0,
          ...label.pct > 0 && { transform: "translateX(-50%)" }
        },
        children: label.value
      },
      label.value
    )) }) : null
  ] });
}
function ScoreDetailPanel({
  open,
  onOpenChange,
  objectType,
  activeScore,
  scoringSettings
}) {
  const { t } = useTranslation(["client360", "user-scoring"]);
  const formatDateTime = useFormatDateTime();
  const rulesetQuery = useGetScoringRulesetQuery(objectType);
  const thresholds = rulesetQuery.data?.ruleset.thresholds;
  const maxRiskLevel = scoringSettings.maxRiskLevel;
  const scoreColor = SCORING_LEVELS_COLORS[maxRiskLevel][activeScore.risk_level] ?? "inherit";
  const scoreLabel = t(
    SCORING_LEVELS_LABEL_KEYS[maxRiskLevel][activeScore.risk_level] ?? activeScore.risk_level.toString()
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Root, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Container, { size: "small", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Content, { className: "flex flex-col gap-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Header, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "title2", children: t("client360:client_detail.score_panel.title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "grey", children: objectType }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "grey", children: t("client360:client_detail.score_panel.last_computed", {
        date: formatDateTime(activeScore.created_at, { dateStyle: "medium" })
      }) })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex items-center gap-sm rounded-lg border p-md",
        style: { borderColor: scoreColor, backgroundColor: `${scoreColor}20` },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-4 shrink-0 rounded-full", style: { backgroundColor: scoreColor } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: scoreLabel }),
          activeScore.source === "override" && /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "grey", children: t("client360:client_detail.score_panel.source_override") })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm border border-grey-border rounded-md p-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-medium text-grey-primary", children: t("client360:client_detail.score_panel.score_scale") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ScoreScale, { maxRiskLevel, currentLevel: activeScore.risk_level, thresholds })
    ] })
  ] }) }) });
}
export {
  DataExplorerPanel as D,
  ScoreDetailPanel as S
};
