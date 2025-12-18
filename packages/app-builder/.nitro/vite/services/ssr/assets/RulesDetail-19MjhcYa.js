import { R as jsxRuntimeExports, r as reactExports } from "../server.js";
import { u as useTranslation, q as useFormatLanguage, dA as formatNumber, b as clsx, d as cn, e as Icon, eb as Collapsible, s as Trans, dz as Switch } from "./format-NPGUXq-g.js";
import { a1 as decisionsI18n, ai as generateFlatEvaluation } from "./router-vb7i5euz.js";
import { P as Paper } from "./Paper-6W_X6MFt.js";
import { c_ as isRuleExecutionHit, c$ as isRuleExecutionError, d0 as isRuleExecutionSnoozed, d1 as NewNodeEvaluation } from "./services-middleware-DR8Hua1Y.js";
import { b as AstBuilder } from "./index-DCH5hwXA.js";
import { R as Root, T as Trigger, C as Content } from "./index-DhVP5FgH.js";
function RuleExecutionStatus({ ruleExecution }) {
  const { t } = useTranslation(decisionsI18n);
  const language = useFormatLanguage();
  const isHit = isRuleExecutionHit(ruleExecution);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex h-6 gap-xs", children: [
    isHit ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-purple-primary flex h-6 items-center justify-center rounded-full border border-purple-primary px-xs font-normal leading-none", children: formatNumber(ruleExecution.scoreModifier, {
      language,
      signDisplay: "exceptZero"
    }) }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        className: clsx(
          "text-s flex h-6 flex-1 items-center justify-center rounded-sm border px-xs font-medium capitalize leading-none shadow-sm",
          getRuleExecutionBadgeColor(ruleExecution)
        ),
        children: getRuleExecutionStatusLabel(t, ruleExecution)
      }
    )
  ] });
}
function getRuleExecutionBadgeColor(ruleExecution) {
  if (isRuleExecutionHit(ruleExecution)) return "border-red-primary text-red-primary";
  if (isRuleExecutionError(ruleExecution)) return "border-red-primary text-red-primary";
  if (isRuleExecutionSnoozed(ruleExecution)) return "border-purple-primary text-purple-primary";
  return "border-green-primary text-green-primary";
}
function getRuleExecutionStatusLabel(t, ruleExecution) {
  if (isRuleExecutionHit(ruleExecution)) {
    return t("decisions:rules.status.hit");
  }
  if (isRuleExecutionError(ruleExecution)) {
    return getRuleExecutionErrorLabel(t, ruleExecution);
  }
  if (isRuleExecutionSnoozed(ruleExecution)) {
    return t("decisions:rules.status.snoozed");
  }
  return t("decisions:rules.status.no_hit");
}
function getRuleExecutionErrorLabel(t, ruleExecution) {
  switch (ruleExecution.error.code) {
    case "division_by_zero":
      return t("decisions:rules.error.division_by_zero");
    case "null_value_found":
      return t("decisions:rules.error.null_value");
    default:
      return t("decisions:rules.status.error");
  }
}
function RulesExecutionsContainer({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("grid grid-cols-[max-content_1fr_max-content] gap-sm", className), ...props });
}
function RuleExecutionCollapsible({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Root, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: cn(
        "border-grey-border col-span-full grid grid-cols-subgrid gap-sm overflow-hidden rounded-lg border bg-surface-card p-sm",
        className
      ),
      ...props
    }
  ) });
}
function RuleExecutionTitle({ ruleExecution }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Trigger, { className: "group col-span-full grid grid-cols-subgrid items-center outline-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Icon,
      {
        icon: "smallarrow-up",
        "aria-hidden": true,
        className: "size-5 rotate-90 transition-transform duration-200 group-aria-expanded:rotate-180 rtl:-rotate-90 group-aria-expanded:rtl:-rotate-180"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s line-clamp-1 text-start font-semibold", children: ruleExecution.name }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(RuleExecutionStatus, { ruleExecution })
  ] });
}
function RuleExecutionContent({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Content, { className: "radix-state-open:animate-slide-down radix-state-closed:animate-slide-up col-span-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex flex-col gap-md p-sm", className), ...props }) });
}
function RuleExecutionDescription({ description }) {
  if (!description) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-purple-background-light border-purple-border flex flex-row gap-sm rounded-sm border p-sm dark:bg-transparent dark:border-purple-primary", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "tip", className: "text-purple-primary size-5 shrink-0" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-purple-primary font-normal", children: description })
  ] });
}
function RulesDetail({
  scenarioId,
  ruleExecutions,
  rules,
  isIterationArchived = false
}) {
  const { t } = useTranslation(decisionsI18n);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Collapsible.Container, { className: "bg-surface-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible.Title, { children: t("decisions:rules.title") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RulesExecutionsContainer, { children: ruleExecutions.map((ruleExecution) => {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(RuleExecutionCollapsible, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RuleExecutionTitle, { ruleExecution }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(RuleExecutionContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RuleExecutionDescription, { description: ruleExecution.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            RuleExecutionDetail,
            {
              scenarioId,
              ruleExecution,
              rules,
              isIterationArchived
            }
          )
        ] })
      ] }, ruleExecution.ruleId);
    }) }) })
  ] });
}
function RuleExecutionDetail({
  scenarioId,
  ruleExecution,
  rules,
  isIterationArchived = false
}) {
  const { t } = useTranslation(decisionsI18n);
  const language = useFormatLanguage();
  const currentRule = reactExports.useMemo(
    () => rules.find((rule) => rule.id === ruleExecution.ruleId),
    [rules, ruleExecution.ruleId]
  );
  const [showValues, setShowValues] = reactExports.useState(false);
  if (!currentRule || !currentRule.formula) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "bg-red-background text-s text-red-primary flex h-8 items-center justify-center rounded-sm px-xs py-2xs font-medium", children: t("decisions:rules.error.not_found") });
  }
  if (isIterationArchived) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full items-center gap-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-purple-background text-s text-purple-primary inline-flex h-8 w-fit shrink-0 items-center justify-center whitespace-pre rounded-sm border border-transparent px-xs font-normal dark:bg-transparent dark:border-purple-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Trans,
        {
          t,
          i18nKey: "scenarios:rules.consequence.score_modifier",
          components: {
            Score: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold" })
          },
          values: {
            score: formatNumber(currentRule.scoreModifier, {
              language,
              signDisplay: "always"
            })
          }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-grey-primary text-s", children: t("decisions:rules.archived_no_details") })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full items-center justify-between gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-purple-background text-s text-purple-primary inline-flex h-8 w-fit items-center justify-center whitespace-pre rounded-sm border border-transparent px-xs font-normal dark:bg-transparent dark:border-purple-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Trans,
        {
          t,
          i18nKey: "scenarios:rules.consequence.score_modifier",
          components: {
            Score: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold" })
          },
          values: {
            score: formatNumber(currentRule.scoreModifier, {
              language,
              signDisplay: "always"
            })
          }
        }
      ) }),
      ruleExecution.evaluation ? /* @__PURE__ */ jsxRuntimeExports.jsx(DisplayReturnValuesSwitch, { value: showValues, onChange: setShowValues }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      RuleFormula,
      {
        scenarioId,
        formula: currentRule.formula,
        evaluation: ruleExecution.evaluation,
        showValues
      }
    )
  ] });
}
function DisplayReturnValuesSwitch({ value, onChange }) {
  const { t } = useTranslation(decisionsI18n);
  const id = reactExports.useId();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row justify-between gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: id, className: "text-s select-none font-medium", children: t("decisions:rules.show_contextual_values") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { id, checked: value, onCheckedChange: onChange })
  ] });
}
function RuleFormula({
  scenarioId,
  formula,
  evaluation,
  showValues
}) {
  const validation = reactExports.useMemo(
    () => ({
      errors: [],
      evaluation: generateFlatEvaluation(formula, evaluation ?? NewNodeEvaluation())
    }),
    [formula, evaluation]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Paper.Container, { className: "bg-surface-card @container", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AstBuilder.Provider, { scenarioId, mode: "view", showValues, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AstBuilder.Root, { node: formula, validation }) }) });
}
export {
  RulesDetail as R,
  RulesExecutionsContainer as a,
  RuleExecutionCollapsible as b,
  RuleExecutionTitle as c,
  RuleExecutionContent as d,
  RuleExecutionDescription as e,
  RuleExecutionDetail as f
};
