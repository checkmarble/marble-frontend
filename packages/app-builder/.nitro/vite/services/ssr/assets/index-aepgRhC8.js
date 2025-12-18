import { R as jsxRuntimeExports, r as reactExports } from "../server.js";
import { aF as defaultSerializeError, aG as reactUse, aH as cancelTestRunFn, aI as Route, aq as useDetectionScenarioData, P as Page, B as BreadCrumbs } from "./router-vb7i5euz.js";
import { u as useTranslation, e4 as Modal, fv as RadioGroup, fw as RadioGroupItem, e as Icon, B as Button, b as clsx, q as useFormatLanguage, j as Tag, dA as formatNumber, eb as Collapsible, dz as Switch } from "./format-NPGUXq-g.js";
import { t as t$a } from "./mapToObj-wQ-uHOuD.js";
import { a as TestRunVersions, b as TestRunPeriod, T as TestRunStatus, t as t$b } from "./TestRunVersions-Czzs22SA.js";
import { C as Callout } from "./Callout-DX4NBXlG.js";
import { u as useLoaderRevalidator } from "./LoaderRevalidatorContext-C9s56i-l.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { t as t$1, _ as t$3, $ as t$4, p as t$6, cZ as t$8, df as t$9 } from "./services-middleware-DR8Hua1Y.js";
import { t as t$2 } from "./keys-CPbIGTB1.js";
import { t as t$5 } from "./sumBy-D8av3sKq.js";
import { n as n$1 } from "./unique-CBeBxAXx.js";
import { t as toggle } from "./array-BFSjnO9c.js";
import { n as n$3 } from "./flat-BPaRpdYE.js";
import { t as t$7 } from "./isDeepEqual-C0XXZLYo.js";
import { n as n$2 } from "./omit-ZO4dmkWK.js";
import { A as Avatar } from "./Avatar-DpA4jY60.js";
import { u as useOrganizationUsers } from "./organization-users-Bxl0ZW8k.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./QueryClientProvider-DYTpkCko.js";
import "./security-headers.server-BdP3HrPp.js";
import "./ThemeContext-B40HQxfH.js";
import "./config-ut8rAdyo.js";
import "./short-uuid-MIi3jWzx.js";
import "./createSsrRpc-ZXUHv2Er.js";
import "./i18n-instance-store-UssbGYOM.js";
import "./auth-middleware-C4ap47rJ.js";
import "./inboxes-D556s0BB.js";
import "./files-fO9wUXBf.js";
import "./case-detail-middleware-C3JS8Yme.js";
import "./input-validation-CU_reV2S.js";
import "./async-C3pYACua.js";
import "./decisions-B-2DmJW1.js";
import "./scenarios-8U74nJp4.js";
import "./sharpstate.es-CeF1Mf5b.js";
import "./isNullish-B8pc8Ntu.js";
import "./use-callback-ref-DXzIzfqy.js";
import "./Spinner-GK6cEAdR.js";
import "node:crypto";
import "./create-context-CYc8deix.js";
const TSR_DEFERRED_PROMISE = /* @__PURE__ */ Symbol.for("TSR_DEFERRED_PROMISE");
function defer(_promise, options) {
  const promise = _promise;
  if (promise[TSR_DEFERRED_PROMISE]) return promise;
  promise[TSR_DEFERRED_PROMISE] = { status: "pending" };
  promise.then((data) => {
    promise[TSR_DEFERRED_PROMISE].status = "success";
    promise[TSR_DEFERRED_PROMISE].data = data;
  }).catch((error) => {
    promise[TSR_DEFERRED_PROMISE].status = "error";
    promise[TSR_DEFERRED_PROMISE].error = {
      data: defaultSerializeError(error),
      __isServerError: true
    };
  });
  return promise;
}
function useAwaited({ promise: _promise }) {
  if (reactUse) return reactUse(_promise);
  const promise = defer(_promise);
  if (promise[TSR_DEFERRED_PROMISE].status === "pending") throw promise;
  if (promise[TSR_DEFERRED_PROMISE].status === "error") throw promise[TSR_DEFERRED_PROMISE].error;
  return promise[TSR_DEFERRED_PROMISE].data;
}
function Await(props) {
  const inner = /* @__PURE__ */ jsxRuntimeExports.jsx(AwaitInner, { ...props });
  if (props.fallback) return /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, {
    fallback: props.fallback,
    children: inner
  });
  return inner;
}
function AwaitInner(props) {
  const data = useAwaited(props);
  return props.children(data);
}
function t(...t2) {
  return t$1(n, t2);
}
function n(e, t2) {
  let n2 = { ...e };
  for (let [r, i] of Object.entries(n2)) t2(i, r, e) && delete n2[r];
  return n2;
}
const useCancelTestRunMutation = (scenarioId, testRunId) => {
  const cancelTestRun = useServerFn(cancelTestRunFn);
  return useMutation({
    mutationKey: ["scenarios", "testrun", "cancel", scenarioId, testRunId],
    mutationFn: async () => cancelTestRun({ data: { scenarioId, testRunId } })
  });
};
function CancelTestRun({
  children,
  currentScenario,
  testRunId
}) {
  const [open, setOpen] = reactExports.useState(false);
  const cancelTestRunMutation = useCancelTestRunMutation(currentScenario.id, testRunId);
  const { t: t2 } = useTranslation(["scenarios", "common"]);
  const revalidate = useLoaderRevalidator();
  const handleCancelScenario = () => {
    cancelTestRunMutation.mutateAsync().then(() => {
      revalidate();
    }).catch(() => {
      zt.error(t2("common:errors.unknown"));
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Content, { className: "overflow-visible", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t2("scenarios:testrun.cancel") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Description, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { variant: "outlined", className: "m-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap", children: t2("scenarios:testrun.cancel.callout") }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t2("common:cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Modal.FooterButton,
          {
            label: t2("scenarios:testrun.cancel"),
            onClick: handleCancelScenario,
            isLoading: cancelTestRunMutation.isPending
          }
        )
      ] })
    ] })
  ] });
}
function Hamburger({
  version,
  summary,
  type,
  legend,
  mapping
}) {
  const language = useFormatLanguage();
  const { t: t2 } = useTranslation(["common"]);
  const pairs = reactExports.useMemo(() => {
    const result = [];
    for (const status of legend) {
      if (summary[status] !== void 0) result.push([status, summary[status]]);
    }
    return result;
  }, [summary, legend]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex size-full flex-col items-center gap-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tag, { size: "big", color: "grey", className: "border-grey-border gap-xs border px-sm py-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary font-semibold", children: `V${version.value}` }),
      version.type === "live version" ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-purple-primary font-semibold", children: t2("common:live") }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex size-full flex-col gap-xs", children: pairs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-grey-border size-full rounded-lg border-2" }) : pairs.map(([status, count]) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        style: {
          flexBasis: `${Math.round(count * 100 / summary.total)}%`
        },
        className: clsx(
          "flex min-h-[24px] w-full shrink grow flex-row items-center justify-center rounded-[4px]",
          mapping[status].background
        ),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: clsx("text-s font-medium", mapping[status].text), children: type === "percentage" ? formatNumber(count * 100 / summary.total / 100, {
          language,
          style: "percent"
        }) : formatNumber(count, {
          language,
          compactDisplay: "short"
        }) })
      },
      status
    )) })
  ] });
}
function HamburgerChart({
  items,
  versions: { ref, test },
  mapping
}) {
  const { t: t$12 } = useTranslation(["scenarios", "decisions"]);
  const options = reactExports.useMemo(() => {
    const foundOptions = n$1(items.map((i) => i.option));
    const orderedOptions = [];
    for (const option of t$2(mapping)) {
      if (foundOptions.includes(option)) {
        orderedOptions.push(option);
      }
    }
    return orderedOptions;
  }, [items, mapping]);
  const [type, setType] = reactExports.useState("percentage");
  const [legend, updateLegend] = reactExports.useState(options);
  const summaryByVersions = reactExports.useMemo(() => {
    const result = {
      [ref.value]: {
        total: 0
      },
      [test.value]: {
        total: 0
      }
    };
    return {
      ...result,
      ...t$3(
        t$4(items, (i) => i.version),
        (itemsByVersion) => ({
          total: t$5(itemsByVersion, (d) => d.count),
          ...t(
            t$3(
              t$4(itemsByVersion, (d) => d.option),
              (itemsByOption) => t$5(itemsByOption, (d) => d.count)
            ),
            (count) => count === 0
          )
        })
      )
    };
  }, [items, ref, test]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(RadioGroup, { onValueChange: (type2) => setType(type2), value: type, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(RadioGroupItem, { value: "absolute", children: t$12("scenarios:testrun.distribution.absolute") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(RadioGroupItem, { value: "percentage", children: t$12("scenarios:testrun.distribution.percentage") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-60 w-full flex-row items-center justify-center gap-md px-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Hamburger,
        {
          type,
          legend,
          version: ref,
          summary: summaryByVersions[ref.value],
          mapping
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "arrow-forward", className: "text-grey-primary h-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Hamburger,
        {
          type,
          legend,
          version: test,
          summary: summaryByVersions[test.value],
          mapping
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-row justify-center gap-sm px-xs4", children: options.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        variant: "secondary",
        appearance: "link",
        className: "gap-md",
        onClick: () => updateLegend((prev) => {
          const newLegend = toggle(prev, option);
          const orderedOptions = [];
          for (const option2 of t$2(mapping)) {
            if (newLegend.includes(option2)) {
              orderedOptions.push(option2);
            }
          }
          return orderedOptions;
        }),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: clsx("size-4 rounded-[4px]", {
                [`${mapping[option].border} border-2`]: !legend.includes(option),
                [mapping[option].background]: legend.includes(option)
              })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary", children: mapping[option].name })
        ]
      },
      option
    )) })
  ] });
}
const DistributionOfDecisionChart = ({
  decisions,
  versions
}) => {
  const { t: t2 } = useTranslation(["scenarios", "decisions"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Collapsible.Container, { className: "bg-surface-card", defaultOpen: true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible.Title, { children: t2("scenarios:testrun.distribution") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible.Content, { children: decisions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary inline-block w-full text-center font-semibold", children: t2("scenarios:testrun.no_decisions") }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      HamburgerChart,
      {
        versions,
        items: decisions.filter((d) => d.count > 0).map((d) => ({
          version: d.version,
          count: d.count,
          option: d.outcome
        })),
        mapping: {
          approve: {
            background: "bg-green-primary",
            border: "border-green-primary",
            text: "text-grey-white",
            name: t2("decisions:outcome.approve")
          },
          decline: {
            background: "bg-red-primary",
            border: "border-red-primary",
            text: "text-grey-white",
            name: t2("decisions:outcome.decline")
          },
          block_and_review: {
            background: "bg-orange-primary",
            border: "border-orange-primary",
            text: "text-grey-white",
            name: t2("decisions:outcome.block_and_review")
          },
          review: {
            background: "bg-yellow-primary",
            border: "border-yellow-primary",
            text: "text-grey-primary",
            name: t2("decisions:outcome.review")
          }
        }
      }
    ) })
  ] });
};
const TestRunRuleName = ({
  rulesByVersion,
  versions: { ref, test }
}) => {
  const refRuleName = rulesByVersion[ref.value]?.[0]?.name;
  const testRuleName = rulesByVersion[test.value]?.[0]?.name;
  if (refRuleName !== void 0 && testRuleName !== void 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-normal", children: testRuleName }),
      refRuleName !== testRuleName ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-grey-secondary inline-flex flex-row items-center gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "arrow-top-left", className: "size-2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: refRuleName })
      ] }) : null
    ] });
  }
  if (refRuleName === void 0 && testRuleName !== void 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row items-baseline gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-normal", children: testRuleName }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-green-primary text-xs font-semibold", children: [
        "(",
        t$9("scenarios:testrun.rule.new"),
        ")"
      ] })
    ] });
  }
  if (refRuleName !== void 0 && testRuleName === void 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row items-baseline gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-normal", children: refRuleName }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-grey-disabled text-xs font-semibold", children: [
        "(",
        t$9("scenarios:testrun.rule.old"),
        ")"
      ] })
    ] });
  }
};
const TestRunRuleHitPercentage = ({
  rulesByVersion,
  versions: { ref, test }
}) => {
  const language = useFormatLanguage();
  const refRuleHitPercentage = reactExports.useMemo(() => {
    const refRuleTotal = rulesByVersion[ref.value]?.reduce((acc, rule) => acc + rule.total, 0);
    const refRuleHitTotal = rulesByVersion[ref.value]?.filter((r) => r.status === "hit").reduce((acc, rule) => acc + rule.total, 0);
    if (refRuleTotal === void 0 || refRuleHitTotal === void 0) {
      return void 0;
    }
    return refRuleTotal === 0 || refRuleHitTotal === 0 ? 0 : Math.round(refRuleHitTotal * 100 / refRuleTotal);
  }, [rulesByVersion, ref]);
  const testRuleHitPercentage = reactExports.useMemo(() => {
    const testRuleTotal = rulesByVersion[test.value]?.reduce((acc, rule) => acc + rule.total, 0);
    const testRuleHitTotal = rulesByVersion[test.value]?.filter((r) => r.status === "hit").reduce((acc, rule) => acc + rule.total, 0);
    if (testRuleTotal === void 0 || testRuleHitTotal === void 0) {
      return void 0;
    }
    return testRuleTotal === 0 || testRuleHitTotal === 0 ? 0 : Math.round(testRuleHitTotal * 100 / testRuleTotal);
  }, [rulesByVersion, test]);
  let direction = "equal";
  if (refRuleHitPercentage !== void 0 && testRuleHitPercentage !== void 0) {
    direction = refRuleHitPercentage - testRuleHitPercentage < 0 ? "up" : refRuleHitPercentage - testRuleHitPercentage > 0 ? "down" : "equal";
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row items-center gap-sm", children: [
    direction !== "equal" ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-secondary font-normal", children: formatNumber(refRuleHitPercentage / 100, {
      language,
      style: "percent"
    }) }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: clsx("flex flex-row items-center justify-center rounded-sm p-xs", {
          "bg-purple-background": direction === "up" || direction === "down",
          "bg-grey-background": direction === "equal"
        }),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Icon,
          {
            icon: direction === "up" || direction === "down" ? "arrow-forward" : "dash",
            className: clsx({
              "size-1.5": direction === "equal",
              "text-purple-primary size-2.5": direction === "up" || direction === "down",
              "rotate-90": direction === "down",
              "-rotate-90": direction === "up",
              "text-green-primary": direction === "equal"
            })
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-primary font-medium", children: formatNumber((testRuleHitPercentage !== void 0 ? testRuleHitPercentage : refRuleHitPercentage) / 100, {
      language,
      style: "percent"
    }) })
  ] });
};
const RuleExecution = ({
  rules,
  versions
}) => {
  const { t: t2 } = useTranslation(["decisions"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Collapsible.Container, { defaultOpen: false, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid w-full grid-cols-[9%_40%_25%_auto] items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible.Title, { size: "small" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TestRunRuleName, { rulesByVersion: rules, versions }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TestRunRuleHitPercentage, { rulesByVersion: rules, versions })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      HamburgerChart,
      {
        versions,
        items: n$3(t$8(rules)).map((r) => ({
          version: r.version,
          count: r.total,
          option: r.status
        })),
        mapping: {
          hit: {
            border: "border-green-border",
            background: "bg-green-background",
            text: "text-grey-primary",
            name: t2("decisions:rules.status.hit")
          },
          no_hit: {
            border: "border-grey-border",
            background: "bg-grey-border",
            text: "text-grey-primary",
            name: t2("decisions:rules.status.no_hit")
          },
          error: {
            border: "border-red-disabled",
            background: "bg-red-disabled",
            text: "text-grey-primary",
            name: t2("decisions:rules.status.error")
          },
          snoozed: {
            border: "border-[#AAA6CC]",
            background: "bg-[#AAA6CC]",
            text: "text-grey-white",
            name: t2("decisions:rules.status.snoozed")
          }
        }
      }
    ) })
  ] });
};
const FilterTransactionByDecision = ({
  rules,
  versions
}) => {
  const { t: t2 } = useTranslation(["scenarios"]);
  const [displayChangedRules, toggleChangedRulesDisplay] = reactExports.useState(true);
  const rulesByRuleId = reactExports.useMemo(() => {
    const rulesSummary = t$3(
      t$4(rules, ({ ruleId }) => ruleId ?? `random_${crypto.randomUUID()}`),
      (rulesByVersion) => t$4(rulesByVersion, ({ version }) => version)
    );
    return displayChangedRules ? t(
      rulesSummary,
      (rs) => t$7(
        rs[versions.ref.value]?.map((r) => n$2(r, ["version"])),
        rs[versions.test.value]?.map((r) => n$2(r, ["version"]))
      )
    ) : rulesSummary;
  }, [displayChangedRules, rules, versions]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Collapsible.Container, { className: "bg-surface-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible.Title, { children: t2("scenarios:testrun.transaction_by_decision") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible.Content, { children: rules.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary inline-block w-full text-center font-semibold", children: t2("scenarios:testrun.no_rules") }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full flex-row items-center justify-end gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-primary font-medium", children: t2("scenarios:testrun.show_rules_changes") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: displayChangedRules, onCheckedChange: toggleChangedRulesDisplay })
      ] }),
      t$2(rulesByRuleId).length ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-s grid w-full grid-cols-[9%_40%_25%_auto] font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2("scenarios:testrun.filters.rule_name") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2("testrun.filters.hit") })
        ] }),
        t$6(rulesByRuleId).map(([ruleId, rules2]) => /* @__PURE__ */ jsxRuntimeExports.jsx(RuleExecution, { rules: rules2, versions }, ruleId))
      ] }) : null
    ] }) })
  ] });
};
const DistributionOfDecisionChartSkeleton = () => {
  const { t: t2 } = useTranslation(["scenarios"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Collapsible.Container, { className: "bg-surface-card", defaultOpen: true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible.Title, { children: t2("scenarios:testrun.distribution") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-background w-48 animate-pulse rounded-lg p-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex space-x-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-24 rounded-md" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-border h-8 w-24 animate-pulse rounded-md" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex size-full flex-row items-center justify-center gap-2xl px-xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex size-full flex-col items-center gap-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-border size-6 animate-pulse rounded-md" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex size-full flex-col gap-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-green-background-light h-10 w-full animate-pulse rounded-md" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-background h-10 w-full animate-pulse rounded-md" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-orange-background-light h-10 w-full animate-pulse rounded-md" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-yellow-background h-10 w-full animate-pulse rounded-md" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-background h-6 w-16 animate-pulse rounded-md" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex size-full flex-col items-center gap-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-border size-6 animate-pulse rounded-md" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex size-full flex-col gap-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-green-background-light h-10 w-full animate-pulse rounded-md" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-background h-10 w-full animate-pulse rounded-md" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-orange-background-light h-10 w-full animate-pulse rounded-md" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-yellow-background h-10 w-full animate-pulse rounded-md" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row justify-center gap-md px-xs4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-border h-6 w-11 animate-pulse rounded-md" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-border h-6 w-16 animate-pulse rounded-md" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-border h-6 w-8 animate-pulse rounded-md" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-border h-6 w-24 animate-pulse rounded-md" })
      ] })
    ] }) })
  ] });
};
const FilterTransactionByDecisionSkeleton = () => {
  const { t: t2 } = useTranslation(["scenarios"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Collapsible.Container, { className: "bg-surface-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible.Title, { children: t2("scenarios:testrun.transaction_by_decision") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Collapsible.Content, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-lg flex items-center justify-end space-x-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-primary font-medium", children: t2("scenarios:testrun.show_rules_changes") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { id: "show-changes", disabled: true })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-md grid grid-cols-2 gap-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-border h-4 w-24 animate-pulse rounded-sm" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-border h-4 w-16 animate-pulse rounded-sm" })
        ] }),
        [1, 2, 3, 4].map((index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "border-grey-border grid grid-cols-2 gap-md rounded-lg border p-md transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-border size-4 animate-pulse rounded-sm" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-border h-4 w-32 animate-pulse rounded-sm" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-border h-4 w-16 animate-pulse rounded-sm" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-border size-4 animate-pulse rounded-sm" })
              ] })
            ]
          },
          index
        ))
      ] })
    ] })
  ] });
};
const TestRunDetails = ({
  refIterationId,
  testIterationId,
  startDate,
  status,
  endDate,
  iterations,
  creator
}) => {
  const { t: t2 } = useTranslation(["common", "scenarios"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface-card border-grey-border flex flex-row gap-2xl rounded-lg border p-xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary font-semibold", children: t2("scenarios:testrun.filters.version") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TestRunVersions, { iterations, refIterationId, testIterationId })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary font-semibold", children: t2("scenarios:testrun.filters.period") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TestRunPeriod, { className: "h-10", startDate, endDate })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary font-semibold", children: t2("scenarios:testrun.filters.creator") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row items-center gap-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { firstName: creator?.firstName, lastName: creator?.lastName, size: "m" }),
        creator ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-grey-primary text-s", children: [
          creator.firstName,
          " ",
          creator.lastName
        ] }) : null
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary font-semibold", children: t2("scenarios:testrun.filters.status") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-row items-center gap-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TestRunStatus, { status }) })
    ] })
  ] });
};
function TestRun() {
  const {
    run,
    decisionsPromise,
    rulesPromise
  } = Route.useLoaderData();
  const {
    currentScenario,
    scenarioIterations
  } = useDetectionScenarioData();
  const {
    orgUsers
  } = useOrganizationUsers();
  const {
    t: t2
  } = useTranslation(["scenarios"]);
  const iterations = reactExports.useMemo(() => t$a(scenarioIterations, (i) => [i.id, t$b(i, ["version", "type"])]), [scenarioIterations]);
  const versions = reactExports.useMemo(() => ({
    ref: {
      value: `${iterations[run.refIterationId].version}`,
      type: iterations[run.refIterationId].type
    },
    test: {
      value: `${iterations[run.testIterationId].version}`,
      type: iterations[run.testIterationId].type
    }
  }), [iterations, run.refIterationId, run.testIterationId]);
  const creator = reactExports.useMemo(() => orgUsers.find((u) => u.userId === run.creatorId), [orgUsers, run.creatorId]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Main, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Header, { className: "justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(BreadCrumbs, {}),
      run.status === "up" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CancelTestRun, { currentScenario, testRunId: run.id, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", className: "isolate h-10 w-fit", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "stop", className: "size-5" }),
        t2("scenarios:testrun.cancel")
      ] }) }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Content, { width: "form", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TestRunDetails, { ...run, iterations, creator }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Await, { promise: decisionsPromise, fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(DistributionOfDecisionChartSkeleton, {}), children: (decisions) => /* @__PURE__ */ jsxRuntimeExports.jsx(DistributionOfDecisionChart, { versions, decisions }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Await, { promise: rulesPromise, fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(FilterTransactionByDecisionSkeleton, {}), children: (rules) => /* @__PURE__ */ jsxRuntimeExports.jsx(FilterTransactionByDecision, { versions, rules }) })
    ] })
  ] });
}
export {
  TestRun as component
};
